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
import Navbar from './components/navbar';
import PBT_Admin from './scripts/PBT_admin';
const home = "/payback-admin";

export default function AddPartnerForm() {
    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            name: data.get("partner_name")?.toString(),
            addr: data.get("wallet_addr")?.toString(),
            curr: data.get("currency")?.toString(),
            valueForToken: Number(data.get("value_for_token")),
        }
        console.log(req_data)
        const admin = new PBT_Admin();
        try {
            const res = await admin.addPartner(req_data.name!, req_data.addr!, req_data.curr!, req_data.valueForToken!);
            if (res == true) {
                
                const id = await admin.getPartnerId(req_data.addr!);
                setMessage(["Partner was successfully created.", `Partner has ID ${id}. Now you can go to check the dashboard.`])
                setResultIs(true);
            } else {
                setMessage(["Couldn't create partner.", "Plase check entered data."]);
                setResultIs(false);
            }

        } catch (err: any) {
            console.error(err)
            setMessage(["Couldn't create partner.", err.toString()]);
            setResultIs(false);
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        anmelden
                    </Button>

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
                    {resultIs ? <Button href={`${home}/dashboard`} autoFocus>
                        Go to Dashboard
                    </Button> : <Button autoFocus onClick={() => {
                        setResultIs(null)
                    }}>
                        Try again
                    </Button>}
                </DialogActions>
            </Dialog>
        </>
    )
}