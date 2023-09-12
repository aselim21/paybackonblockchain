import * as React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    CssBaseline,
    Grid,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    FormControlLabel,
    FormGroup

} from '@mui/material';
import Navbar from './components/navbar';
import PBT_basicReader from './scripts/PBT_basicReader';
import { useState, useEffect } from "react";
import Web3 from "web3";


export default function KontoUebersicht() {
    const PBT_reader = new PBT_basicReader();
    const [account, setAccount] = useState<string>("");
    const [rows_Transfer, setRows_Transfer] = React.useState<any[]>([]);
    const [transferAccount, setTransferAccount] = useState<string>("");
    const [resItem, setResItem] = React.useState<{ amount: number, releaseDate: string }>({ amount: 0, releaseDate: "" });
    const [rows_MyDetailedLocks, setRows_MyDetailedLocks] = React.useState<any[]>([]);
    const [rows_MyLockedItemsDetailed, setRows_MyLockedItemsDetailed] = React.useState<any[]>([]);
    const [search_lockedItemLocker, setSearch_lockedItemLocker] = React.useState<string>("");
    const [search_lockedItemReceiver, setSearch_lockedItemReceiver] = React.useState<string>("");
    const [search_lockedItemID, setSearch_lockedItemID] = React.useState<string>("");


    let rowNr_Transfer = 0;
    let rowNr_MyDetailerLocks = 0;
    let rowNr_MyLockedItemsDetailed = 0;

    let allEvents_Transfer: any[] = [];
    let myDetailedLocks: any[] = [];
    let myLockedItemsDetailed: any[] = [];

    let accounts: string[];

    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);
    const [balance, setBalance] = React.useState<number>(0);
    const [lockedBalance, setLockedBalance] = React.useState<number>(0);

    async function handleConnectMetamask() {
        try {
            const web3 = new Web3(window.ethereum);
            accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            window.ethereum.on("accountsChanged", async (accounts: any) => {
                // handle account change
                accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
            });
            window.ethereum.on("disconnect", () => {
                // handle metamask logout
                console.log("disconnect");
                setAccount("");
            });
        } catch (error: any) {
            if (error.message === "User denied account authorization") {
                console.log(error)
            } else if (error.message === "MetaMask is not enabled") {
                console.log(error)
            } else {
                console.log(error)
            }
        }
    }

    async function handleDatenLaden() {
        //get balance
        const balance = await PBT_reader.getBalanceOf(account);
        setBalance(balance);

        //get locked items
        const lockedBalance = await PBT_reader.getLockedBalanceOf(account);
        setLockedBalance(lockedBalance);

        setRows_Transfer([]);
        setTransferAccount("");
        setRows_MyDetailedLocks([]);
        setRows_MyLockedItemsDetailed([]);
        setResItem({ amount: 0, releaseDate: "" });
        setSearch_lockedItemLocker("");
        setSearch_lockedItemReceiver("");
        setSearch_lockedItemID("");

        await loadMyTransfers(account);
        await loadALLLocksDetailed(account);
    }

    const handleGetLockedItem = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            locker: data.get("lockedItem_locker")?.toString(),
            receiver: data.get("lockedItem_receiver")?.toString(),
            id: Number(data.get("lockedItem_id"))
        }
        if (!!!req_data.locker || !!!req_data.receiver) return;
        const res = await PBT_reader.getLockedItem(req_data.locker, req_data.receiver, req_data.id);
        setResItem({ amount: res.amount, releaseDate: res.releaseDate == 0 ? "0": epochInUTC_GermanDate(res.releaseDate * 1000) })

    };

    async function loadMyTransfers(_addr: string) {
        try {
            setTransferAccount(_addr);
            const eventHandler = PBT_reader.PayBackContract.events["Transfer"]({
                fromBlock: 0, // The block number from which to start listening (optional)
                toBlock: 'latest', // The block number at which to stop listening (optional)
            });
            eventHandler.on('data', (eventData: any) => {
                // Handle the event data here
                if (eventData.returnValues.from.toLowerCase() == _addr.toLowerCase() || eventData.returnValues.to.toLowerCase() == _addr.toLowerCase()) {
                    allEvents_Transfer.push({
                        nr: ++rowNr_Transfer,
                        from: eventData.returnValues.from,
                        to: eventData.returnValues.to,
                        value: Number(eventData.returnValues.value)
                    })
                    setRows_Transfer(allEvents_Transfer)
                }
            });
            eventHandler.on('error', (error: any) => {
                // Handle errors here
                console.error('Error:', error);
            });
        } catch (err: any) {
            console.error("Couldn't subscribe", err);
            return err;
        }
    }

    async function loadALLLocksDetailed(_addr: string) {
        try {
            const eventHandler = PBT_reader.PayBackContract.events["Locked"]({
                fromBlock: 0, // The block number from which to start listening (optional)
                toBlock: 'latest', // The block number at which to stop listening (optional)
            });
            eventHandler.on('data', async (eventData: any) => {
                // Handle the event data here
                if (eventData.returnValues.locker.toLowerCase() == _addr.toLowerCase()) {
                    const lock = eventData.returnValues;
                    const item = await PBT_reader.getLockedItem(lock.locker, lock.receiver, Number(lock.id));

                    myDetailedLocks.push({
                        nr: ++rowNr_MyDetailerLocks,
                        locker: lock.locker,
                        receiver: lock.receiver,
                        itemID: Number(lock.id),
                        releaseTime: item.releaseDate == 0 ? 0 : epochInUTC_GermanDate(item.releaseDate * 1000),
                        amount: Number(item.amount)
                    })
                    setRows_MyDetailedLocks(myDetailedLocks);

                } else if (eventData.returnValues.receiver.toLowerCase() == _addr.toLowerCase()) {

                    const lock = eventData.returnValues;
                    const item = await PBT_reader.getLockedItem(lock.locker, lock.receiver, Number(lock.id));

                    myLockedItemsDetailed.push({
                        nr: ++rowNr_MyLockedItemsDetailed,
                        locker: lock.locker,
                        receiver: lock.receiver,
                        itemID: Number(lock.id),
                        releaseTime: item.releaseDate == 0 ? 0 : epochInUTC_GermanDate(item.releaseDate * 1000),
                        amount: Number(item.amount)
                    })
                    setRows_MyLockedItemsDetailed(myLockedItemsDetailed);
                }
            });
            eventHandler.on('error', (error: any) => {
                // Handle errors here
                console.error('Error:', error);
            });
        } catch (err: any) {
            console.error("Couldn't subscribe", err);
            return err;
        }
    }

    function epochInUTC_GermanDate(_epoch: number) {
        return new Date(_epoch).toLocaleString('de', { timeZone: 'Europe/Berlin', timeZoneName: 'long' });
    }

    React.useEffect((): void => {
        //Runs only on the first render

    }, []);

    return (
        <>
            <Navbar />
            {/* source https://github.com/mui/material-ui/blob/v5.14.2/docs/data/material/getting-started/templates/sign-up/SignUp.tsx */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    m: 1,
                    marginTop: 8,
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                }}>
                <Box
                    sx={{
                        maxWidth: 13 / 20,
                        minWidth: 8 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Übersicht für Kunden und Partner
                    </Typography>
                    <Box component="form" sx={{ mt: 3 }}>
                        <Grid container spacing={2}>


                            <Grid item xs={12} sm={8}>
                                <TextField
                                    // multiline
                                    inputProps={{
                                        style: { color: '#4075c0' }
                                    }}
                                    required
                                    fullWidth
                                    id="wallet_addr"
                                    name="wallet_addr"
                                    label="Wallet Adresse"
                                    value={account}
                                    onChange={(event: React.SyntheticEvent) => setAccount((event.target as HTMLInputElement).value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={(ev) => handleConnectMetamask()}
                                >
                                    Connect Metamask
                                </Button>
                            </Grid>
                            <Grid item xs={12} sx={{ mb: 5 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={(ev) => handleDatenLaden()}
                                >
                                    Daten laden
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} >
                                <Typography
                                    sx={{
                                        fontSize: '1.2rem',
                                        textAlign: 'center',
                                    }}>
                                    Kontostand
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '6rem',
                                        color: '#003eb0',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}>
                                    {balance}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography
                                    sx={{
                                        fontSize: '1.2rem',
                                        textAlign: 'center',
                                    }}>
                                    Gesperrte Tokens
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '6rem',
                                        color: '#4075c0',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}>
                                    {lockedBalance}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Box
                    id="Transfer-Event"
                    sx={{
                        width: 17/20,
                        // maxWidth: 20 / 20,
                        // minWidth: 15 / 20,

                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Meine Transfere
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">From</TableCell>
                                    <TableCell align="right">To</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_Transfer.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.from.toLowerCase() == transferAccount.toLowerCase() ? <Typography sx={{ color: "#003eb0" }}>{row.from}</Typography> : row.from}</TableCell>
                                        <TableCell align="right">{row.to.toLowerCase() == transferAccount.toLowerCase() ? <Typography sx={{ color: "#003eb0" }} variant="body1">{row.to}</Typography> : row.to}</TableCell>
                                        <TableCell align="right">{row.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box
                    id="MyLocks"
                    sx={{
                        // maxWidth: 20 / 20,
                        // minWidth: 15 / 20,
                        width: 17/20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Meine Locks
                    </Typography>
                    <Typography variant="body1">
                       für Kunden nicht vorhanden
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Sperrer</TableCell>
                                    <TableCell align="right">Empfänger</TableCell>
                                    <TableCell align="right">Gegenstand ID</TableCell>
                                    <TableCell align="right">Zeit der Entsperrung</TableCell>
                                    <TableCell align="right">Menge</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_MyDetailedLocks.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right"> <Typography sx={{ color: "#003eb0" }}>{row.locker}</Typography> </TableCell>
                                        <TableCell align="right">{row.receiver}</TableCell>
                                        <TableCell align="right">{row.itemID}</TableCell>
                                        <TableCell align="right">{row.releaseTime}</TableCell>
                                        <TableCell align="right">{row.amount}</TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box
                    id="MyLockedItems"
                    sx={{
                        // maxWidth: 20 / 20,
                        // minWidth: 15 / 20,
                        width: 17/20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Meine gelockte Tokens
                    </Typography>
                    <Box component="form" onSubmit={handleGetLockedItem} sx={{ my: 3, width: 1, padding: 1, border: 2, borderColor: '#e5ecf6' }}>

                        <Typography variant='h6' sx={{ mb: 2 }}>
                            Information über die Sperre abfragen
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_locker"
                                    name="lockedItem_locker"
                                    label="Sperrer (Adresse)"
                                    value={search_lockedItemLocker}
                                    onChange={(e) => {setSearch_lockedItemLocker(e.target.value)}}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_receiver"
                                    name="lockedItem_receiver"
                                    label="Empfänger (Adresse)"
                                    value={search_lockedItemReceiver}
                                    onChange={(e) => {setSearch_lockedItemReceiver(e.target.value)}}

                                    
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_id"
                                    name="lockedItem_id"
                                    label="Gegenstand ID"
                                    value={search_lockedItemID}
                                    onChange={(e) => {setSearch_lockedItemID(e.target.value)}}

                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  sx={{
                                      height: 1
                                  }}
                                    type="submit"
                                >
                                    Lesen
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    variant='standard'
                                    fullWidth
                                    id="lockedItem_releaseDate"
                                    name="lockedItem_releaseDate"
                                    label="Gesperrt bis"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    value={resItem.releaseDate}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    variant='standard'
                                    fullWidth
                                    id="lockedItem_amount"
                                    name="lockedItem_amount"
                                    label="Menge"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    value={resItem.amount}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <TableContainer component={Paper} sx={{}}>
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Sperrer</TableCell>
                                    <TableCell align="right">Empfänger</TableCell>
                                    <TableCell align="right">Gegenstand ID</TableCell>
                                    <TableCell align="right">Zeit der Entsperrung</TableCell>
                                    <TableCell align="right">Menge</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_MyLockedItemsDetailed.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.locker}</TableCell>
                                        <TableCell align="right"> <Typography sx={{ color: "#003eb0" }}>{row.receiver}</Typography></TableCell>
                                        <TableCell align="right">{row.itemID}</TableCell>
                                        <TableCell align="right">{row.releaseTime}</TableCell>
                                        <TableCell align="right">{row.amount}</TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>

            <Dialog
                open={resultIs != null}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {message[0]}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message[1]}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {resultIs ?
                        <div>
                            <Button onClick={event => window.location.href = 'dashboard'} autoFocus>
                                Zum Dashboard
                            </Button>
                            <Button onClick={() => { setResultIs(null) }}>
                                Schließen
                            </Button>
                        </div>
                        :
                        <Button autoFocus onClick={() => { setResultIs(null) }}>
                            Schließen
                        </Button>}
                </DialogActions>
            </Dialog>
        </>
    )
}