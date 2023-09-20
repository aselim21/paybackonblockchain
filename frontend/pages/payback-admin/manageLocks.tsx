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
import Partner from '../../public/data_structures';


export default function ManageLocks() {
    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);

    const [lockLoading, setLockLoading] = React.useState(false);
    const [releaseLoading, setReleaseLoading] = React.useState(false);
    const [reduceItemTokensLoading, setReduceItemTokensLoading] = React.useState(false);

    const [resNrItems, setResNrItems] = React.useState<number>(0);
    const [resItem, setResItem] = React.useState<{ releaseDate: number, amount: number }>({ amount: 0, releaseDate: 0 });


    const [epochHours, setEpochHours] = React.useState<number>(0);
    const [epochDays, setEpochDays] = React.useState<number>(0);
    const [epochWeeks, setEpochWeeks] = React.useState<number>(0);
    const [futureEpochRes, setFutureEpochRes] = React.useState<number>(0);

    const [rows_Locked, setRows_Locked] = React.useState<any[]>([]);
    let rowNr_Locked = 0;
    let allEvents_Locked: any[] = [];

    const [rows_Released, setRows_Released] = React.useState<any[]>([]);
    let rowNr_Released = 0;
    let allEvents_Released: any[] = [];

    const admin = new PBT_Admin();

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

    function getFutureEpochInUTC(_mins: number, _hours: number, _days: number, _weeks: number) : number {
        const now = Date.now(); // Unix timestamp in UTC in milliseconds
        const timeToAdd = (60000 * _mins) + (3600000 * _hours) + (86400000 * _days) + (604800000 * _weeks);
        const res = now + timeToAdd;
        setFutureEpochRes(res);
        return res;
    }

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
            setMessage(["Fehler beim Locken!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
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
                setMessage(["Fehler beim Locken!", `${req_data.amount} PBT konnten für ${req_data.receiver} bis ${req_data.unlockDate} nicht gelockt werden. Bitte überprüfe die Daten und versuche noch einmal.`]);
                setResultIs(false);
                setLockLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler beim Locken!", `${req_data.amount} PBT konnten für ${req_data.receiver} bis ${req_data.unlockDate} nicht gelockt werden.` + err.toString()]);
            setResultIs(false);
            setLockLoading(false);
            return;
        }
    };

    const handleRelease = async (event: React.FormEvent<HTMLFormElement>) => {
        setReleaseLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            locker: data.get("release_locker")?.toString(),
            receiver: data.get("release_receiver")?.toString(),
            id: Number(data.get("release_item_id")),
        }
        console.log(req_data)
        if (!!!req_data.locker || !!!req_data.receiver) {
            setMessage(["Fehler bei Releasing!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setReleaseLoading(false);
            return;
        }

        try {
            const res = await admin.releaseLock(req_data.locker, req_data.receiver, req_data.id);

            if (!!res.transactionHash) {
                setMessage(["Erfolg", `Locking Item mit Locker:${req_data.locker}, Receiver:${req_data.receiver} und ID: ${req_data.id} wurde erfolgreich released.`])
                setResultIs(true);
                setReleaseLoading(false);
                return;

            } else {
                setMessage(["Fehler bei Releasing!", `Freigeben von dem Item mit Locker:${req_data.locker}, Receiver:${req_data.receiver} und ID: ${req_data.id} ist fehlgeschlagen.`])
                setResultIs(false);
                setReleaseLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler bei Releasing!", `Freigeben von dem Item mit Locker:${req_data.locker}, Receiver:${req_data.receiver} und ID: ${req_data.id} ist fehlgeschlagen.` + err.toString()]);
            setResultIs(false);
            setReleaseLoading(false);
            return;
        }
    };

    const handleReduceItemTokens = async (event: React.FormEvent<HTMLFormElement>) => {
        setReduceItemTokensLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            receiver: data.get("reduceItemTokens_receiver")?.toString(),
            id: Number(data.get("reduceItemTokens_id")),
            amount: Number(data.get("reduceItemTokens_amount")),
        }
        console.log(req_data)
        if (!!!req_data.receiver) {
            setMessage(["Fehler bei Reducing Item Tokens!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setReduceItemTokensLoading(false);
            return;
        }

        try {
            const res = await admin.reduceItemTokens(req_data.receiver, req_data.id, req_data.amount);

            if (!!res.transactionHash) {
                setMessage(["Erfolg", `Reducing Item von Receiver:${req_data.receiver} mit ID: ${req_data.id} wurde erfolgreich auf ${req_data.amount} verringert.`])
                setResultIs(true);
                setReduceItemTokensLoading(false);
                return;

            } else {
                setMessage(["Fehler", `Reducing Item von Receiver:${req_data.receiver} mit ID: ${req_data.id} auf ${req_data.amount} ist fehlgeschlagen.`])
                setResultIs(false);
                setReduceItemTokensLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler bei Reducing Item Tokens!", `Reducing Item von Receiver:${req_data.receiver} mit ID: ${req_data.id} konnte auf ${req_data.amount} nicht verringert werden.` + err.toString()]);
            setResultIs(false);
            setReduceItemTokensLoading(false);
            return;
        }
    };
    const handleGetNrItems = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            locker: data.get("nrLockedItems_locker")?.toString(),
            receiver: data.get("nrLockedItems_receiver")?.toString(),
        }
        console.log(req_data)
        if (!!!req_data.locker || !!!req_data.receiver) return;
        const res = await admin.getNumberOfLockedItems(req_data.locker, req_data.receiver);
        console.log("Number of Locked Items are:", res);
        setResNrItems(res);
    };

    const handleGetLockedItem = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            locker: data.get("lockedItem_locker")?.toString(),
            receiver: data.get("lockedItem_receiver")?.toString(),
            id: Number(data.get("lockedItem_id"))
        }
        console.log(req_data)
        if (!!!req_data.locker || !!!req_data.receiver) return;
        const res = await admin.getLockedItem(req_data.locker, req_data.receiver, req_data.id);
        console.log("Locked Item is:", res);
        setResItem(res)

    };
    async function loadEvent(_eventName: string) {
        console.log("Accessing event")
        try {
            const eventHandler = admin.PayBackContract.events[_eventName]({
                fromBlock: 0, // The block number from which to start listening (optional)
                toBlock: 'latest', // The block number at which to stop listening (optional)
            });
            if (_eventName == "Locked") {
                eventHandler.on('data', (eventData: any) => {
                    // Handle the event data here
                    console.log(eventData)
                    allEvents_Locked.push({
                        nr: ++rowNr_Locked,
                        locker: eventData.returnValues.locker,
                        receiver: eventData.returnValues.receiver,
                        id: Number(eventData.returnValues.id)
                    })
                    // console.log(allEvents_Locked)
                    setRows_Locked(allEvents_Locked)
                });

            } else if (_eventName == "Released") {
                eventHandler.on('data', (eventData: any) => {
                    // Handle the event data here
                    allEvents_Released.push({
                        nr: ++rowNr_Released,
                        locker: eventData.returnValues.locker,
                        receiver: eventData.returnValues.receiver,
                        id: Number(eventData.returnValues.id)
                    })
                    // console.log(allEvents_Released)
                    setRows_Released(allEvents_Released)
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
        loadEvent("Locked");
        loadEvent("Released");

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

                        <Typography variant='body2' sx={{ mb: 2 }}>
                            Partners and owner can lock their tokens for a specific amount of time before sending them to their receiver.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} >
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
                                    onClick={() => getFutureEpochInUTC(0, epochHours!, epochDays!, epochWeeks!)}
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
                <Box
                    id="reduceItemTokens"
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
                        Reduce Item Tokens
                    </Typography>


                    <Box component="form" onSubmit={handleReduceItemTokens} sx={{ mt: 3 }}>

                        <Typography variant='body2' sx={{ mb: 2 }}>
                            The locker can change the locked amount of Tokens by reducing them. Tokens will be autmatically transferred back to the locker.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="reduceItemTokens_receiver"
                                    name="reduceItemTokens_receiver"
                                    label="Receiver (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="reduceItemTokens_id"
                                    name="reduceItemTokens_id"
                                    label="Item ID"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="reduceItemTokens_amount"
                                    name="reduceItemTokens_amount"
                                    label="with amount"
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={reduceItemTokensLoading}

                        >
                            Reduce Item Tokens
                        </LoadingButton>
                    </Box>
                </Box>

                <Box
                    id="release"
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
                        Release ausführen
                    </Typography>


                    <Box component="form" onSubmit={handleRelease} sx={{ mt: 3 }}>

                        <Typography variant='body2' sx={{ mb: 2 }}>
                            Owner can and must release all tokens, that have an expired release date.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="release_locker"
                                    name="release_locker"
                                    label="Locker (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="release_receiver"
                                    name="release_receiver"
                                    label="Release (address)"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="release_item_id"
                                    name="release_item_id"
                                    label="Item ID"
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={releaseLoading}

                        >
                            Release
                        </LoadingButton>
                    </Box>
                </Box>

                <Box
                    id="Locked-Event"
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
                        Locked Events
                    </Typography>
                    <Box component="form" onSubmit={handleGetNrItems} sx={{ mt: 3, width:1 }}>

                        <Typography variant='body1' sx={{ mb: 2 }}>
                            Get number of locked items: <strong>{resNrItems}</strong>
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    required
                                    fullWidth
                                    id="nrLockedItems_locker"
                                    name="nrLockedItems_locker"
                                    label="Locker (address)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    required
                                    fullWidth
                                    id="nrLockedItems_receiver"
                                    name="nrLockedItems_receiver"
                                    label="Receiver (address)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ 
                                        height: 1,
                                    }}>
                                    Get number
                                </Button>
                            </Grid>

                        </Grid>

                    </Box>

                    <Box component="form" onSubmit={handleGetLockedItem} sx={{ mt: 3, width:1 }}>

                        <Typography variant='body1' sx={{ mb: 2 }}>
                            Get the locked item:  Amount=<strong>{resItem.amount}</strong> ReleaseDate=<strong>{resItem.releaseDate}</strong> ToRelease=<strong>{resItem.releaseDate <= Date.now() ? "true" : "false"} </strong>
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_locker"
                                    name="lockedItem_locker"
                                    label="Locker (address)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_receiver"
                                    name="lockedItem_receiver"
                                    label="Receiver (address)"
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lockedItem_id"
                                    name="lockedItem_id"
                                    label="Item ID"
                                />
                            </Grid>

                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}

                        >
                            Get item
                        </Button>
                    </Box>

                    <TableContainer component={Paper} sx={{}}>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mt: 1,
                                ml: 1
                            }}
                            onClick={event => (loadEvent('Locked'))} />
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Locker</TableCell>
                                    <TableCell align="right">Recevier</TableCell>
                                    <TableCell align="right">ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_Locked.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.locker}</TableCell>
                                        <TableCell align="right">{row.receiver}</TableCell>
                                        <TableCell align="right">{row.id}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box
                    id="Released-Event"
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
                        Released Events
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mt: 1,
                                ml: 1
                            }}
                            onClick={event => (loadEvent('Released'))} />
                        <Table sx={{ minWidth: 750 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    <TableCell align="right">Locker</TableCell>
                                    <TableCell align="right">Recevier</TableCell>
                                    <TableCell align="right">ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_Released.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.locker}</TableCell>
                                        <TableCell align="right">{row.receiver}</TableCell>
                                        <TableCell align="right">{row.id}</TableCell>
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