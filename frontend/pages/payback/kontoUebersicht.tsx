import * as React from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import Navbar from './components/navbar';
import TransferDialog from './components/transferDialog';
import TransferFromDialog from './components/transferFromDialog';
import ApproveDialog from './components/approveDialog';
import LockDialog from './components/lockDialog';
import PBT_basicReader from '../../public/PBT_basicReader';
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
    const [user, setUser] = useState<any>("...");
    const [openDialog, setOpenDialog] = useState<string | null>(null);

    const delayLoading = 1500;

    let rowNr_Transfer = 0;
    let rowNr_MyDetailerLocks = 0;
    let rowNr_MyLockedItemsDetailed = 0;

    let allEvents_Transfer: any[] = [];
    let myDetailedLocks: any[] = [];
    let myLockedItemsDetailed: any[] = [];

    let accounts: string[];


    const [balance, setBalance] = React.useState<number>(0);
    const [lockedBalance, setLockedBalance] = React.useState<number>(0);

    async function handleConnectMetamask() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
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

        //get usertype
        const user = await getUserDetail(account);
        setUser(user);


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
        setResItem({ amount: res.amount, releaseDate: res.releaseDate == 0 ? "0" : epochInUTC_GermanDate(res.releaseDate * 1000) })

    };
    async function getUserDetail(_addr: string): Promise<{ type: string, details: { name: string, currency: string, valueForToken: string } }> {
        //check if its partner
        console.log("checking for user", _addr)
        const isPartner = await PBT_reader.getPartnerId(_addr);
        if (isPartner) {
            console.log(isPartner + "Is partner" + _addr)
            const partnerDetails = await PBT_reader.getPartner(isPartner);
            return { type: "Partner", details: { name: partnerDetails.name, currency: partnerDetails.currency, valueForToken: partnerDetails.valueForToken } }
        }
        const isClient = !isPartner && await PBT_reader.getClientID(_addr);
        if (isClient) {
            console.log(isClient + "Is client" + _addr)

            return { type: "Kunde", details: { name: "", currency: "", valueForToken: "" } }
        }
        const owner = !isClient && !isPartner && await PBT_reader.getOwner();
        if (owner != false && owner.toLowerCase() == _addr.toLowerCase()) {
            console.log(owner + "Is owner" + _addr)

            return { type: "Vertragseigentümer", details: { name: "", currency: "", valueForToken: "" } }
        }
        return { type: "nicht erkannt", details: { name: "", currency: "", valueForToken: "" } }
    }

    async function loadMyTransfers(_addr: string) {
        try {
            setTransferAccount(_addr);
            const eventHandler = PBT_reader.PayBackContract.events["Transfer"]({
                fromBlock: 0, // The block number from which to start listening (optional)
                toBlock: 'latest', // The block number at which to stop listening (optional)
            });
            eventHandler.on('data', async (eventData: any) => {
                console.log("These are all the transfer events")
                console.log("from" + eventData.returnValues.from + "to" + eventData.returnValues.to)

                //if i am _from => check who is _to
                if (eventData.returnValues.from.toLowerCase() == _addr.toLowerCase()) {
                    console.log("I am the from address")
                    console.log("Checking who is the to")
                    const _to = await getUserDetail(eventData.returnValues.to);
                    if (_to.type != "nicht erkannt") {
                        allEvents_Transfer.push({
                            nr: ++rowNr_Transfer,
                            from: eventData.returnValues.from,
                            from_info: "",
                            to: eventData.returnValues.to,
                            to_info: _to,
                            value: Number(eventData.returnValues.value)
                        })
                        // setRows_Transfer(allEvents_Transfer)
                    }
                }
                //if i am _to => check who is _from
                else if (eventData.returnValues.to.toLowerCase() == _addr.toLowerCase()) {
                    const _from = await getUserDetail(eventData.returnValues.from);
                    if (_from.type != "nicht erkannt") {
                        allEvents_Transfer.push({
                            nr: ++rowNr_Transfer,
                            from: eventData.returnValues.from,
                            from_info: _from,
                            to: eventData.returnValues.to,
                            to_info: "",
                            value: Number(eventData.returnValues.value)
                        })
                        // setRows_Transfer(allEvents_Transfer)
                    }
                }
            });
            eventHandler.on('error', (error: any) => {
                // Handle errors here
                console.error('Error:', error);
            });
            setTimeout(() => {
                setRows_Transfer(allEvents_Transfer)
            }, delayLoading);
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
                console.log(eventData.returnValues)
                // Handle the event data here
                // I locked tokens:
                if (eventData.returnValues.locker.toLowerCase() == _addr.toLowerCase()) {
                    const lock = eventData.returnValues;
                    const item = await PBT_reader.getLockedItem(lock.locker, lock.receiver, Number(lock.id));
                    //check who is the receiver
                    const userInfo = await getUserDetail(lock.receiver);
                    myDetailedLocks.push({
                        nr: ++rowNr_MyDetailerLocks,
                        locker: lock.locker,
                        receiver: lock.receiver,
                        receiver_info: userInfo,
                        itemID: Number(lock.id),
                        releaseTime: item.releaseDate == 0 ? 0 : epochInUTC_GermanDate(item.releaseDate * 1000),
                        amount: Number(item.amount)
                    })
                    // setRows_MyDetailedLocks(myDetailedLocks);

                } //my locked tokens:
                else if (eventData.returnValues.receiver.toLowerCase() == _addr.toLowerCase()) {

                    const lock = eventData.returnValues;
                    const item = await PBT_reader.getLockedItem(lock.locker, lock.receiver, Number(lock.id));

                    const userInfo = await getUserDetail(lock.locker);

                    myLockedItemsDetailed.push({
                        nr: ++rowNr_MyLockedItemsDetailed,
                        locker: lock.locker,
                        locker_info: userInfo,
                        receiver: lock.receiver,
                        itemID: Number(lock.id),
                        releaseTime: item.releaseDate == 0 ? 0 : epochInUTC_GermanDate(item.releaseDate * 1000),
                        amount: Number(item.amount)
                    })
                    // setRows_MyLockedItemsDetailed(myLockedItemsDetailed);
                }
            });
            eventHandler.on('error', (error: any) => {
                // Handle errors here
                console.error('Error:', error);
            });
            setTimeout(() => {
                setRows_MyLockedItemsDetailed(myLockedItemsDetailed);
                setRows_MyDetailedLocks(myDetailedLocks);
            }, delayLoading);
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
                        mb: 2,
                    }}>
                    <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                        Kontoübersicht
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
                            <Grid item xs={12}  >
                                <Typography
                                    sx={{
                                        fontSize: '1.2rem',
                                        textAlign: 'center',
                                        mb: 1
                                    }}>
                                    Benutzertyp
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '1.5rem',
                                        color: '#003eb0',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}>

                                    {user.type}
                                </Typography>
                                {user.type == "Partner" ?
                                    <Typography
                                        sx={{
                                            fontSize: '1.1rem',
                                            color: '#003eb0',
                                            // fontWeight: '',
                                            textAlign: 'center',
                                        }}>

                                        {user.details.name + " - " + user.details.currency + " - " + user.details.valueForToken}
                                    </Typography> : null}
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
                            <Grid item xs={12} sm={3} alignSelf="end">
                                <Typography textAlign="center">{
                                    user.type == "Kunde" ? "Der Kunde kann PBT an andere Kunden senden, nur wenn sein Kontostand kleiner als 300 ist." :
                                        user.type == "Partner" ? "Der Partner kann PBT an Kunden oder den Vertragseigentümer senden." :
                                            ""
                                } </Typography>
                                <Button
                                    disabled={user.type == null || user.type == "nicht erkannt"}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: "3rem",
                                        bgcolor: "#f68614",
                                    }}
                                    onClick={(ev) => setOpenDialog("Transfer")}
                                >
                                    Transfer Tokens
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={3} alignSelf="end">
                                <Typography textAlign="center">{
                                    user.type == "Kunde" ? "Jeder kann Spender werden." :
                                        user.type == "Partner" ? "Jeder kann Spender werden." :
                                            ""
                                } </Typography>
                                <Button
                                    disabled={user.type == null || user.type == "nicht erkannt"}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: "3rem",
                                        bgcolor: "#f68614",
                                    }}
                                    onClick={(ev) => setOpenDialog("Approve")}
                                >
                                    Approve
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={3} alignSelf="end">
                                <Typography textAlign="center">{
                                    user.type == "Kunde" ? "Möglich nur wenn der Kunde eine Zulassung hat." :
                                        user.type == "Partner" ? "Möglich nur wenn der Partner eine Zulassung hat." :
                                        user.type == null ? "":
                                        "Möglich nur wenn diese Addresse eine Zulassung hat."
                                } </Typography>
                                <Button
                                    disabled={user.type == null}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: "3rem",
                                        bgcolor: "#f68614"
                                    }}
                                    onClick={(ev) => setOpenDialog("TransferFrom")}
                                >
                                    Transfer Tokens From
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={3} alignSelf="end">
                                <Typography textAlign="center">{
                                    user.type == "Kunde" ? "Der Kunde kann seine Tokens nicht sperren." :
                                        user.type == "Partner" ? "Nur der Partner und der Vertragseigentümer können ihre Tokens sperren." :
                                            ""
                                } </Typography>
                                <Button
                                    disabled={user.type == null || user.type == "nicht erkannt" || user.type == "Kunde"}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        height: "3rem",
                                        bgcolor: "#f68614"
                                    }}
                                    onClick={(ev) => setOpenDialog("Lock")}
                                >
                                    Lock Tokens
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Box
                    id="Transfer-Event"
                    sx={{
                        width: 17 / 20,
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
                                        <TableCell align="right">{row.from.toLowerCase() == transferAccount.toLowerCase() ? <Typography sx={{ color: "#003eb0" }}>{row.from}</Typography> : <Typography> {row.from_info.type + ": " + row.from_info.details.name} <Typography variant="subtitle2">{row.from}</Typography> </Typography>}</TableCell>
                                        <TableCell align="right">{row.to.toLowerCase() == transferAccount.toLowerCase() ? <Typography sx={{ color: "#003eb0" }} variant="body1">{row.to}</Typography> : <div><Typography>{row.to_info.type + ": " + row.to_info.details.name}</Typography> <Typography variant="subtitle2">{row.to}</Typography></div>}</TableCell>
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
                        width: 17 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Meine Sperren
                    </Typography>
                    <Typography variant="body1">
                        für Kunden nicht vorhanden
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Sperrer (dieses Konto)</TableCell>
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
                                        <TableCell align="right"><div><Typography>{row.receiver_info.type + ": " + row.receiver_info.details.name}</Typography> <Typography variant="subtitle2">{row.receiver}</Typography></div></TableCell>
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
                        width: 17 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Meine gesperrte Tokens
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
                                    onChange={(e) => { setSearch_lockedItemLocker(e.target.value) }}
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
                                    onChange={(e) => { setSearch_lockedItemReceiver(e.target.value) }}


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
                                    onChange={(e) => { setSearch_lockedItemID(e.target.value) }}

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
                                    <TableCell align="right">Empfänger (dieses Konto)</TableCell>
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
                                        <TableCell align="right"><div><Typography>{row.locker_info.type + ": " + row.locker_info.details.name}</Typography> <Typography variant="subtitle2">{row.locker}</Typography></div></TableCell>
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
                open={openDialog != null}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {openDialog}
                </DialogTitle>
                <DialogContent>
                    {
                        openDialog == "Transfer" ? <TransferDialog /> :
                            openDialog == "Approve" ? <ApproveDialog /> :
                                openDialog == "Lock" ? <LockDialog /> :
                                    openDialog == "TransferFrom" ? <TransferFromDialog /> :
                                        "Diese Funktionalität ist noch nicht vorhanden."
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(null) }}>
                        Schließen
                    </Button>

                </DialogActions>
            </Dialog>
        </>
    )
}