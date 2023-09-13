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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Navbar from './components/navbar';
import SyncIcon from '@mui/icons-material/Sync';
import PBT_Admin from '../../public/PBT_admin';

export default function ManageTokens() {
    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);
    const [ownerBalance, setOwnerBalance] = React.useState<number>();
    const [transferLoading, setTransferLoading] = React.useState(false);
    const [transferFromLoading, setTransferFromLoading] = React.useState(false);
    const [lockLoading, setLockLoading] = React.useState(false);


    const [ownersAllowance, setOwnersAllowance] = React.useState<number>(0);
    const [ownersTransferredOfAllowance, setOwnersTransferredOfAllowance] = React.useState<number>(0);
    const [calcLeftAllowance, setCalcLeftAllowance] = React.useState<number>(0);

    const [transferFrom_From, setTransferFrom_From] = React.useState<string>("");

    // const [epochHours, setEpochHours] = React.useState<number>(0);
    // const [epochDays, setEpochDays] = React.useState<number>(0);
    // const [epochWeeks, setEpochWeeks] = React.useState<number>(0);
    // const [futureEpochRes, setFutureEpochRes] = React.useState<number>(0);

    const [rows_Approval, setRows_Approval] = React.useState<any[]>([]);
    let rowNr_Approval = 0;
    let allEvents_Approval: any[] = [];

    const [rows_Transfer, setRows_Transfer] = React.useState<any[]>([]);
    let rowNr_Transfer = 0;
    let allEvents_Transfer: any[] = [];

    const admin = new PBT_Admin();

    async function updateOwnerBalance() {
        const contractOwner = await admin.getOwner();
        const res = await admin.getBalanceOf(contractOwner);
        console.log("Balance of owner is:", res);
        setOwnerBalance(res);
        return res;
    }
    async function checkOwnersAllowance(_ownerAddr: string) {
        if (!!!_ownerAddr) return;
        const contractOwner = await admin.getOwner();
        const res = await admin.getAllowance(_ownerAddr, contractOwner);
        console.log("Owner's allowance is:", res);
        setOwnersAllowance(res);
        return res;
    }
    async function checkOwnersTransferredOfAllowance(_ownerAddr: string) {
        if (!!!_ownerAddr) return;
        const contractOwner = await admin.getOwner();
        const res = await admin.getTransferredFromAllowance(_ownerAddr, contractOwner);
        console.log("Owner's transferred of allowance is:", res);
        setOwnersTransferredOfAllowance(res);
        return res;
    }
    function calcLeftAmountToTransferFromAllowance(_allowance: number, _transferred: number): number {
        const res = _allowance - _transferred;
        console.log("Calculated left allowance is ", res);
        setCalcLeftAllowance(res);
        return res;
    }
    // async function checkFutureEpoch(_hours: number, _days: number, _weeks: number) {
    //     const now = Date.now(); // Unix timestamp in milliseconds
    //     console.log("Now epoch date in GMT:", now);
    //     const d = new Date(now * 1000);
    //     console.log("Now date in GMT", d)
    //     const timeToAdd = (3600 * _hours) + (86400 * _days) + (604800 * _weeks);
    //     const res = now + timeToAdd;
    //     console.log("Future epoch date in GMT is:", res);
    //     setFutureEpochRes(res);
    //     return res;
    // }

    const handleTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
        setTransferLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            to: data.get("transfer_to")?.toString(),
            amount: Number(data.get("transfer_amount")),
        }
        if (!!!req_data.to || !!!req_data.amount) {
            setMessage(["Fehler beim Transfer!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setTransferLoading(false);
            return;
        }

        try {
            const res = await admin.transfer(req_data.to, req_data.amount);

            if (!!res.transactionHash) {
                // const id = await admin.getPartnerId(req_data.addr!);
                setMessage(["Erfolg", `${req_data.amount} PBT wurden erfolgreich an ${req_data.to} übertragen.`])
                setResultIs(true);
                setTransferLoading(false);
                return;

            } else {
                setMessage(["Fehler beim Transfer!", `${req_data.amount} PBT konten an ${req_data.to} nicht übertragen werden. Bitte überprüfe die Daten und versuche noch einmal.`]);
                setResultIs(false);
                setTransferLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler beim Transfer!", `${req_data.amount} PBT konten an ${req_data.to} nicht übertragen werden.` + err.toString()]);
            setResultIs(false);
            setTransferLoading(false);
            return;
        }
    };

    const handleTransferFrom = async (event: React.FormEvent<HTMLFormElement>) => {
        setTransferFromLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            from: data.get("transferFrom_from")?.toString(),
            to: data.get("transferFrom_to")?.toString(),
            amount: Number(data.get("transferFrom_amount")),
        }
        console.log(req_data)
        if (!!!req_data.from || !!!req_data.to || !!!req_data.amount) {
            setMessage(["Fehler beim TransferFrom!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setTransferFromLoading(false);
            return;
        }

        try {
            const res = await admin.transferFrom(req_data.from, req_data.to, req_data.amount);

            if (!!res.transactionHash) {
                // const id = await admin.getPartnerId(req_data.addr!);
                setMessage(["Erfolg", `${req_data.amount} PBT wurden erfolgreich von ${req_data.from} an ${req_data.to} übertragen.`])
                setResultIs(true);
                setTransferFromLoading(false);
                return;

            } else {
                setMessage(["Fehler beim TransferFrom!", `${req_data.amount} PBT konten von ${req_data.from} an ${req_data.to} nicht übertragen werden. Bitte überprüfe die Daten und versuche noch einmal.`]);
                setResultIs(false);
                setTransferFromLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler beim TransferFrom!", `${req_data.amount} PBT konten von ${req_data.from} an ${req_data.to} nicht übertragen werden.` + err.toString()]);
            setResultIs(false);
            setTransferFromLoading(false);
            return;
        }
    };

    async function loadEvent(_eventName: string) {
        console.log("Accessing event")
        try {
            const eventHandler = admin.PayBackContract.events[_eventName]({
                fromBlock: 0, // The block number from which to start listening (optional)
                toBlock: 'latest', // The block number at which to stop listening (optional)
            });
            if (_eventName == "Transfer") {
                eventHandler.on('data', (eventData: any) => {
                    // Handle the event data here
                    allEvents_Transfer.push({
                        nr: ++rowNr_Transfer,
                        from: eventData.returnValues.from,
                        to: eventData.returnValues.to,
                        value: Number(eventData.returnValues.value)
                    })
                    setRows_Transfer(allEvents_Transfer)

                });

            } else if (_eventName == "Approval") {
                eventHandler.on('data', (eventData: any) => {
                    // Handle the event data here
                    allEvents_Approval.push({
                        nr: ++rowNr_Approval,
                        owner: eventData.returnValues.owner,
                        spender: eventData.returnValues.spender,
                        value: Number(eventData.returnValues.value)
                    })
                    setRows_Approval(allEvents_Approval)
                });
            }
            eventHandler.on('error', (error: any) => {
                // Handle errors here
                console.error('Error:', error);
            });
        } catch (err: any) {
            console.error("Couldn't subscribe", err);
            return err;
        }
    }


    React.useEffect((): void => {
        //Runs only on the first render
        updateOwnerBalance();

        loadEvent("Transfer");
        loadEvent("Approval");
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
                    flexDirection: 'row'
                }}>
                <Box
                    id="transfer"
                    sx={{
                        maxWidth: 5 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Transfer ausführen
                    </Typography>
                    <Typography variant="body2">
                        Can only transfer to partners.
                    </Typography>

                    <Box component="form" onSubmit={handleTransfer} sx={{ mt: 3 }}>
                        <Box
                            id="balanceOfOwner-checker"

                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'strech',
                                alignContent: 'center'
                            }}>
                            <Typography variant="body1" gutterBottom sx={{ mx: 1 }}>
                                Your balance: <strong>{ownerBalance}</strong>
                            </Typography>
                            <SyncIcon
                                sx={{
                                    cursor: 'pointer'
                                }}
                                onClick={event => updateOwnerBalance()} />
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="transfer_to"
                                    name="transfer_to"
                                    label="To (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="transfer_amount"
                                    name="transfer_amount"
                                    label="Token amount"
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={transferLoading}
                        >
                            Transfer
                        </LoadingButton>
                    </Box>
                </Box>

                <Box
                    id="transferFrom"
                    sx={{
                        maxWidth: 6 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        TransferFrom ausführen
                    </Typography>
                    <Typography variant="body2">
                        Can only transfer if approved as a spender.
                    </Typography>

                    <Box component="form" onSubmit={handleTransferFrom} sx={{ mt: 3 }}>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="transferFrom_from"
                                    name="transferFrom_from"
                                    label="From (address)"
                                    value={transferFrom_From}
                                    onChange={(ev) => { setTransferFrom_From(ev.target.value) }}

                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={() => checkOwnersAllowance(transferFrom_From)}
                                >
                                    Check my allowance
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Allowance"
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    value={ownersAllowance}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={() => checkOwnersTransferredOfAllowance(transferFrom_From)}
                                >
                                    Check my transferred
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Transferred of allowance"
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    value={calcLeftAllowance}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={() => calcLeftAmountToTransferFromAllowance(ownersAllowance, ownersTransferredOfAllowance)}
                                >
                                    Calculate left allowance
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Left tokens to transfer from allowance"
                                    fullWidth
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    value={ownersAllowance}
                                />
                            </Grid>

                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="transferFrom_to"
                                    name="transferFrom_to"
                                    label="To (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="transferFrom_amount"
                                    name="transferFrom_amount"
                                    label="Token amount"
                                />
                            </Grid>

                        </Grid>
                        <LoadingButton
                            sx={{ my: 2 }}
                            type="submit"
                            fullWidth
                            variant="contained"
                            loading={transferFromLoading}
                        >
                            Transfer From
                        </LoadingButton>
                    </Box>
                </Box>             

                <Box
                    id="Transfer-Event"
                    sx={{
                        maxWidth: 10 / 20,

                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Transfer Events
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mt: 1,
                                ml: 1
                            }}
                            onClick={event => (loadEvent('Transfer'))} />
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
                                        <TableCell align="right">{row.from}</TableCell>
                                        <TableCell align="right">{row.to}</TableCell>
                                        <TableCell align="right">{row.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box
                    id="Approval-Event"
                    sx={{
                        maxWidth: 10 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Approval Events
                    </Typography>

                    <TableContainer component={Paper} sx={{}}>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mt: 1,
                                ml: 1
                            }}
                            onClick={event => (loadEvent('Approval'))} />
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Owner</TableCell>
                                    <TableCell align="right">Spender</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_Approval.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.owner}</TableCell>
                                        <TableCell align="right">{row.spender}</TableCell>
                                        <TableCell align="right">{row.value}</TableCell>
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