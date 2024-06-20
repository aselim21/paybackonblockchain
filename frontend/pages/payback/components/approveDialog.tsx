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
import { useFormik } from 'formik';
import * as yup from 'yup';

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

const validationSchema = yup.object({
    spender_addr: yup
        .string()
        .required('Spender address is required')
        .matches(/^0x[a-fA-F0-9]{40}$/, 'Spender address is not valid'),
    amount: yup
        .number()
        .required('Amount is required')
        .positive('Amount must be positive')
        .integer('Amount must be an integer'),
});

export default function ApproveDialog() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const formik = useFormik({
        initialValues: {
            spender_addr: '',
            amount: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];
                const metamask_actor = new PBT_MetaMask(account);
                const res = await metamask_actor.approve(values.spender_addr, Number(values.amount));
                console.log(res);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        },
    });

    return (
        <ThemeProvider theme={ThemePayback}>
        <CssBaseline />
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        id="spender_addr"
                        name="spender_addr"
                        label="Spender Address"
                        value={formik.values.spender_addr}
                        onChange={formik.handleChange}
                        error={formik.touched.spender_addr && Boolean(formik.errors.spender_addr)}
                        helperText={formik.touched.spender_addr && formik.errors.spender_addr}
                    />
                </Grid>
                <Grid item xs={12} sm={12}>
                    <TextField
                        required
                        fullWidth
                        id="amount"
                        name="amount"
                        label="Amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        error={formik.touched.amount && Boolean(formik.errors.amount)}
                        helperText={formik.touched.amount && formik.errors.amount}
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
                Sign with MetaMask
            </LoadingButton>
        </Box>
    </ThemeProvider>
    );
}