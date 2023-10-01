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

export default function LockDialog() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [epochMinutes, setEpochMinutes] = React.useState<number>(0);
    const [epochHours, setEpochHours] = React.useState<number>(0);
    const [epochDays, setEpochDays] = React.useState<number>(0);
    const [epochWeeks, setEpochWeeks] = React.useState<number>(0);
    const [futureEpochRes, setFutureEpochRes] = React.useState<number>(0);

    const handleLock = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            receiver: data.get("receiver_addr")?.toString(),
            amount: data.get("amount")?.toString(),
            unlockDate: data.get("unlockDate")?.toString(),
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

            const gasEstimate: bigint = await contract.methods.lock(req_data.receiver, req_data.amount, req_data.unlockDate).estimateGas({ from: account });
            const gasPrice: bigint = await web3.eth.getGasPrice();

            const finalGasLimit: number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            const finalGasPrice: number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const result = await contract.methods.lock(rreq_data.receiver, req_data.amount, req_data.unlockDate).send({
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
    function getFutureEpochInUTC(_mins: number, _hours: number, _days: number, _weeks: number) : number {
        const now = Date.now(); // Unix timestamp in UTC in milliseconds
        const timeToAdd = (60000 * _mins) + (3600000 * _hours) + (86400000 * _days) + (604800000 * _weeks);
        const res = now + timeToAdd;
        setFutureEpochRes(res);
        return res;
    }

    return (
        <ThemeProvider theme={ThemePayback}>
            <CssBaseline />
            <Box component="form" onSubmit={handleLock} sx={{ mt: 3 }}>
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
                    <Grid item xs={12} >
                        <Typography>Berechne den Zeitpunkt in Epoch-Format:</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField label="Minuten" fullWidth variant="outlined" value={epochMinutes} size="small" onChange={(ev) => { setEpochMinutes(Number(ev.target.value)) }} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField label="Stunden" fullWidth variant="outlined" value={epochHours} size="small" onChange={(ev) => { setEpochHours(Number(ev.target.value)) }} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField label="Tage" fullWidth variant="outlined" value={epochDays} size="small" onChange={(ev) => { setEpochDays(Number(ev.target.value)) }} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField label="Wochen" fullWidth variant="outlined" value={epochWeeks} size="small" onChange={(ev) => { setEpochWeeks(Number(ev.target.value)) }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{
                                height: 1
                            }}
                            onClick={() => getFutureEpochInUTC(epochMinutes!, epochHours!, epochDays!, epochWeeks!)}
                        >
                            Berechnen
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="unlockDate"
                            name="unlockDate"
                            label="Zeit der Entsperrung"
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
                    loading={loading}
                >
                    Mit MetaMask signieren
                </LoadingButton>
            </Box>
        </ThemeProvider>
    );
}