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
import PBT_Admin from './scripts/PBT_admin';
import Partner from './scripts/data_structures';
import SyncIcon from '@mui/icons-material/Sync';


export default function ManagePartners() {
    const admin = new PBT_Admin();

    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(false);

    const [nrPartners, setNrPartners] = React.useState<number>(0);
    const [rows, setRows] = React.useState<Partner[]>([]);
    const [partnerAddr, setPartnerAddr] = React.useState<string>("");
    const [isPartnerResult, setIsPartnerResult] = React.useState<string>("");

    const [rows_PartnerAdded, setRows_PartnerAdded] = React.useState<Partner[]>([]);
    let rowNr_PartnerAdded = 0;
    let allEvents_PartnerAdded: any[] = [];

    async function updateNumberOfPartners() {
        const res = await admin.getNumPartners();
        console.log("Number of partners:", res);
        setNrPartners(res);
        return res;
    }

    async function checkPartnerID(_addr: string) {
        if (!!!_addr) return;
        const res = await admin.getPartnerID(_addr);
        console.log("Partner ID:", res);
        res == 0 ? setIsPartnerResult("not a partner") : setIsPartnerResult(res.toString());
        return res;
    }


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            name: data.get("partner_name")?.toString(),
            addr: data.get("wallet_addr")?.toString(),
            curr: data.get("currency")?.toString(),
            valueForToken: Number(data.get("value_for_token")),
        }
        if (!!!req_data.name || !!!req_data.addr || !!!req_data.curr || !!!req_data.valueForToken) {
            setMessage(["Fehler!", `Alle Felder sind verpflichend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setLoading(false);
            return;
        }

        try {
            const res = await admin.addPartner(req_data.name!, req_data.addr!, req_data.curr!, req_data.valueForToken!);

            if (!!res.transactionHash) {
                const id = await admin.getPartnerId(req_data.addr!);
                setMessage(["Erfolg", `Partner wurde erfolgreich angemeldet. Der neue Partner hat die ID ${id}.`])
                setResultIs(true);
                setLoading(false);
                return;

            } else {
                setMessage(["Fehler!", "Der Partner konnte nicht angemeldet werden. Bitte überprüfe die Daten und versuche noch einmal."]);
                setResultIs(false);
                setLoading(false);
                return;

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler!", "Der Partner konnte nicht angemeldet werden. " + err.toString()]);
            setResultIs(false);
            setLoading(false);
            return;
        }
    };

    const handleDeletePartner = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = Number(data.get("partner_id"));
        console.log("req_data", req_data)
        if (!!!req_data) {
            setMessage(["", `Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setLoading(false);
            return;
        }
        const admin = new PBT_Admin();
        try {
            const res = await admin.deletePartner(req_data);
            if (!!res.transactionHash) {
                setMessage(["Erfolg", `Der Partner mit ID ${req_data} wurde erfolgreich gelöscht.`])
                setResultIs(true);
                setLoading(false);
                return;

            } else {
                setMessage(["Fehler!", "Der Partner konnte nicht gelöscht werden. Bitte überprüfe die Daten und versuche noch einmal."]);
                setResultIs(false);
                setLoading(false);
                return;
            }
        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler!", "Der Partner konnte nicht gelöscht werden. " + err.toString()]);
            setResultIs(false);
            setLoading(false);
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
            if (_eventName == "PartnerAdded") {
                eventHandler.on('data', (eventData: any) => {
                    // Handle the event data here
                    console.log(eventData)
                    allEvents_PartnerAdded.push({
                        nr: ++rowNr_PartnerAdded,
                        partnerId: Number(eventData.returnValues.partnerId),
                        name: eventData.returnValues.name,
                    })
                    setRows_PartnerAdded(allEvents_PartnerAdded)
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
        updateNumberOfPartners();


        admin.getAllPartners().then(res => {
            console.log(res);
            setRows(res);
        });
        loadEvent("PartnerAdded")
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
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Einen neuen Partner anmelden
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="partner_name"
                                    name="partner_name"
                                    label="Name"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="wallet_addr"
                                    name="wallet_addr"
                                    label="Wallet Adresse"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="currency"
                                    name="currency"
                                    label="Währung"
                                    defaultValue="EUR"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="number"
                                    InputProps={{ inputProps: { min: 1 } }}
                                    defaultValue={2}
                                    required
                                    fullWidth
                                    id="value_for_token"
                                    name="value_for_token"
                                    label="Wert für ein Token"
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={loading}
                        >
                            anmelden
                        </LoadingButton>
                    </Box>
                </Box>

                <Box
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
                        Partner entfernen
                    </Typography>
                    <Typography variant="body1">
                        The Tokens that the partner owns will be transferred to the owner!
                    </Typography>
                    <Box component="form" onSubmit={handleDeletePartner} sx={{ mt: 3, width: 1 }}>

                        <TextField
                            required
                            fullWidth
                            id="partner_id"
                            name="partner_id"
                            label="Partner ID"
                        />
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            loading={loading}
                        >
                            Partner entfernen
                        </LoadingButton>
                    </Box>
                </Box>

                <Box
                    id="active-partners"
                    sx={{
                        maxWidth: 13 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        All active partners
                    </Typography>

                    <Box component="form" id="partner-checker" sx={{ width: 1, mb: 1 }}>

                        <Typography variant='body1' sx={{ mb: 1 }}>
                            Get partner ID: <strong>{isPartnerResult}</strong>
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Address"
                                    variant="outlined"
                                    value={partnerAddr}
                                    size="small"
                                    onChange={(ev) => { setPartnerAddr(ev.target.value) }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={{
                                        height: 1,
                                    }}
                                    onClick={() => checkPartnerID(partnerAddr)}>
                                    Go
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} sx={{ m: 1 }}>
                        <Box
                            id="nr-partners-checker"
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'strech',
                                alignContent: 'center',
                                ml: 1,
                                mt: 1

                            }}>
                            <SyncIcon
                                sx={{
                                    cursor: 'pointer',
                                    mr: 1
                                }}
                                // onClick={event => updateNumberOfPartners()} />
                                onClick={ event => admin.getAllPartners().then(res => {setRows(res)}) } />
                            {/* <Typography variant="body1" gutterBottom>
                                Number of partners: <strong>{nrPartners}</strong>
                            </Typography> */}

                        </Box>
                        <Table sx={{ minWidth: 800 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Name</TableCell>
                                    <TableCell align="right">Address</TableCell>
                                    <TableCell align="right">Currency</TableCell>
                                    <TableCell align="right">Value for token</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row: Partner) => (
                                    <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.id}
                                        </TableCell>
                                        <TableCell align="right">{row.name}</TableCell>
                                        <TableCell align="right">{row.address}</TableCell>
                                        <TableCell align="right">{row.currency}</TableCell>
                                        <TableCell align="right">{row.valueForToken}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box
                    id="AddedPartners-Event"
                    sx={{
                        maxWidth: 7 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        PartnerAdded Events
                    </Typography>
                    <TableContainer component={Paper} sx={{}}>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mt: 1,
                                ml: 1
                            }}
                            onClick={event => (loadEvent('PartnerAdded'))} />
                        <Table sx={{ minWidth: 400 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nr.</TableCell>
                                    {/* <TableCell align="right">Index</TableCell> */}
                                    <TableCell align="right">Partner ID</TableCell>
                                    <TableCell align="right">Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows_PartnerAdded.map((row: any) => (
                                    <TableRow
                                        key={row.nr}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.nr}
                                        </TableCell>
                                        <TableCell align="right">{row.partnerId}</TableCell>
                                        <TableCell align="right">{row.name}</TableCell>
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