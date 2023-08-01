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
} from '@mui/material';
import Navbar from './components/navbar';


export default function AddPartnerForm() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
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
                                label="Name"
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                required
                                fullWidth
                                id="wallet_addr"
                                label="Wallet Adresse"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="currency"
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
        </>
    )
}