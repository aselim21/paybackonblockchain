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
import abi from '../../../public/ABI_PayBackToken.json';

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

export default function TransferDialog() {
    const [loading, setLoading] = React.useState<boolean>(false);


    const handleTransfer = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            addr: data.get("receiver_addr")?.toString(),
            amount: data.get("amount")?.toString()
        }
        console.log(req_data);
        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            const contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);

            //calculate gas and gas price
            const gasLimitBuffer = 1.2; // 20% buffer
            const gasPriceBuffer = 1.5; // 50% buffer

            const gasEstimate : bigint = await contract.methods.transfer(req_data.addr, req_data.amount).estimateGas({ from: account });
            const gasPrice : bigint = await web3.eth.getGasPrice();
            
            const finalGasLimit : number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            const finalGasPrice : number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const result = await contract.methods.transfer(req_data.addr, req_data.amount).send({
                from: account,
                gas: finalGasLimit.toString(),
                gasPrice: finalGasPrice.toString(),
            });
            console.log('Transaction result:', result);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={ThemePayback}>
            <CssBaseline />
            <Box component="form" onSubmit={handleTransfer} sx={{ mt: 3 }}>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="receiver_addr"
                            name="receiver_addr"
                            label="Empfänger Adresse"
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