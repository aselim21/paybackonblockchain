import * as React from 'react';
import {
    Box,
    CssBaseline,
    Grid,
    TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Web3 from "web3";
import PBT_MetaMask from '../../../public/PBT_MetaMask';


const ThemePayback = createTheme({
    palette: {
        primary: {
            main: '#003eb0',
            light: '#4075c0',
            // dark: '',
            contrastText: '#fff',
        },
        secondary: {
            main: '#f2f6fb',
            light: '#fff',
            dark: '#e5ecf6',
            contrastText: '#000',
        },
        background: {
            default: "#f2f6fb",
        }
    }
});

export default function TransferFromDialog() {
    const [loading, setLoading] = React.useState<boolean>(false);


    const handleTransferFrom = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            from: data.get("from_addr")?.toString(),
            to: data.get("to_addr")?.toString(),
            amount: data.get("amount")
        }
        console.log(req_data);
        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            const metamask_actor = new PBT_MetaMask(account);
            const res = await metamask_actor.transferFrom(req_data.from!, req_data.to!, Number(req_data.amount));
            console.log(res);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={ThemePayback}>
            <CssBaseline />
            <Box component="form" onSubmit={handleTransferFrom} sx={{ mt: 3 }}>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="from_addr"
                            name="from_addr"
                            label="Von Adresse"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="to_addr"
                            name="to_addr"
                            label="Zu Adresse"
                        />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            required
                            fullWidth
                            id="amount"
                            name="amount"
                            label="Betrag"
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
                    Mit MetaMask signieren
                </LoadingButton>
            </Box>
        </ThemeProvider>
    );
}