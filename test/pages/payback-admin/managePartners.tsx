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
import PBT_Admin from './scripts/PBT_admin';

export default function AddPartnerForm() {
    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(false);

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
        const admin = new PBT_Admin();
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
                }}>
                <Box
                    sx={{
                        width: 13 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
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
                        width: 5 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                    <Typography component="h1" variant="h5">
                        Partner entfernen
                    </Typography>
                    <Typography variant="body1">
                        First make sure that the partner doesn't own any tokens. Else these tokens will be lost.
                    </Typography>
                    <Box component="form" onSubmit={handleDeletePartner} sx={{ mt: 3 }}>

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
                            Nochmal veruschen
                        </Button>}
                </DialogActions>
            </Dialog>
        </>
    )
}