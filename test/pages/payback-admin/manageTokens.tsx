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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Navbar from './components/navbar';
import SyncIcon from '@mui/icons-material/Sync';
import PBT_Admin from './scripts/PBT_admin';

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

    const [epochHours, setEpochHours] = React.useState<number>(0);
    const [epochDays, setEpochDays] = React.useState<number>(0);
    const [epochWeeks, setEpochWeeks] = React.useState<number>(0);
    const [futureEpochRes, setFutureEpochRes] = React.useState<number>(0);

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
    async function checkFutureEpoch(_hours: number, _days: number, _weeks: number) {
        const now = Date.now(); // Unix timestamp in milliseconds
        console.log("Now epoch date in GMT:", now);
        const d = new Date(now * 1000);
        console.log("Now date in GMT", d)
        const timeToAdd = (3600 * _hours) + (86400 * _days) + (604800 * _weeks);
        const res = now + timeToAdd;
        console.log("Future epoch date in GMT is:", res);
        setFutureEpochRes(res);
        return res;
    }

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

    const handleLock = async (event: React.FormEvent<HTMLFormElement>) => {
        setLockLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            receiver: data.get("lock_receiver")?.toString(),
            amount: Number(data.get("lock_amount")),
            unlockDate: Number(data.get("lock_date")),
        }
        console.log(req_data)
        if (!!!req_data.receiver || !!!req_data.amount || !!!req_data.unlockDate) {
            setMessage(["Fehler beim Lock!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setLockLoading(false);
            return;
        }

        try {
            const res = await admin.lock(req_data.receiver, req_data.amount, req_data.unlockDate);

            if (!!res.transactionHash) {
                setMessage(["Erfolg", `${req_data.amount} PBT wurden erfolgreich für ${req_data.receiver} bis ${req_data.unlockDate} gelockt.`])
                setResultIs(true);
                setLockLoading(false);
                return;

            } else {
                setMessage(["Fehler beim Lock!", `${req_data.amount} PBT konnten für ${req_data.receiver} bis ${req_data.unlockDate} nicht gelockt werden. Bitte überprüfe die Daten und versuche noch einmal.`]);
                setResultIs(false);
                setLockLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler beim Lock!", `${req_data.amount} PBT konnten für ${req_data.receiver} bis ${req_data.unlockDate} nicht gelockt werden.` + err.toString()]);
            setResultIs(false);
            setLockLoading(false);
            return;
        }
    };
    React.useEffect((): void => {
        //Runs only on the first render
        updateOwnerBalance();
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
                                Your balance: {ownerBalance}
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
                    id="lock"
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
                        Lock ausführen
                    </Typography>

                    <Box component="form" onSubmit={handleLock} sx={{ mt: 3 }}>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lock_receiver"
                                    name="lock_receiver"
                                    label="Receiver (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="lock_amount"
                                    name="lock_amount"
                                    label="Token amount"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <Typography>Calculate future epoch date from now:</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Hours" fullWidth variant="outlined" value={epochHours} size="small" onChange={(ev) => { setEpochHours(Number(ev.target.value)) }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Days" fullWidth variant="outlined" value={epochDays} size="small" onChange={(ev) => { setEpochDays(Number(ev.target.value)) }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Weeks" fullWidth variant="outlined" value={epochWeeks} size="small" onChange={(ev) => { setEpochWeeks(Number(ev.target.value)) }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={() => checkFutureEpoch(epochHours!, epochDays!, epochWeeks!)}
                                >
                                    Calculate epoch
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lock_date"
                                    name="lock_date"
                                    label="Unlock Epoch Date"
                                    value={futureEpochRes}
                                    onChange={(ev) => { setFutureEpochRes(Number(ev.target.value)) }}
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={lockLoading}

                        >
                            Lock
                        </LoadingButton>
                    </Box>
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