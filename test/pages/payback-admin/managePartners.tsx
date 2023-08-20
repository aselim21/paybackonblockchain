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
const home = "/payback-admin";

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
        const admin = new PBT_Admin();
        try {
            const res = await admin.addPartner(req_data.name!, req_data.addr!, req_data.curr!, req_data.valueForToken!);

            if (!!res.transactionHash) {
                const id = await admin.getPartnerId(req_data.addr!);
                setMessage(["Partner wurde erfolgreich angemeldet", `Der neue Partner hat die ID ${id}.`])
                setResultIs(true);
                setLoading(false);

            } else {
                setMessage(["Der Partner konnte nicht angemeldet werden.", "Bitte überprüfe die Daten und versuche noch einmal."]);
                setResultIs(false);
                setLoading(false);

            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Der Partner konnte nicht angemeldet werden.", err.toString()]);
            setResultIs(false);
            setLoading(false);

        }
    };
    return (
        <>
            <Navbar />
            {/* source https://github.com/mui/material-ui/blob/v5.14.2/docs/data/material/getting-started/templates/sign-up/SignUp.tsx */}
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Einen neuen Partner anmelden
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
            <Box sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Typography variant="h5">Accounts for testing purposes:</Typography>
                <Typography variant="body1">
                    (0) 0x358aae4923ff466f70ed16eedc348ac0306d8bf4 <br />
                    (1) 0xeed4e440b4b4e170737b7c803173afcd9a08a1c3 <br />
                    (2) 0x4a2a9a297c8a3b9fc58c22ea93bf3ff95db956fe <br />
                    (3) 0x24660fe3d9dece8fff3b64ce548b4565157936a2 <br />
                    (4) 0xf8a00bb5aaaa4e781ba99e3b3832d1a66eb002ea <br />
                    (5) 0x5be309e4e9d26231931d43d8d3ddee140339d933 <br />
                    (6) 0xc474d3441a4c203c316e729123dc4f15a05098a4 <br />
                    (7) 0x76702dbe4c79868e3bec377a03ed3e923aacc352 <br />
                    (8) 0x60c13ce2090581ab3411a9d5c8d933f388eba537 <br />
                    (9) 0x93a6cbd8331b53e5276a86237bace339fc91e439 <br />
                </Typography>
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
                                Weitere Partner anmelden
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