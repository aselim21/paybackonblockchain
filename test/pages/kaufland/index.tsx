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
import Copyright from '../components/Copyright';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import AddPartnerForm from './partnerSettings';
import Navbar from './components/navbar';
import ShoppingCart from './components/shoppingCart';



export default function Payback() {
    return (
        <>
            <Navbar />
            <ThemeProvider theme={ThemePayback}>

                <Container component="main" maxWidth='xl' sx={{my:4}}>
                <ShoppingCart/>
                    {/* <Box
                        component="img"
                        sx={{
                            width: "100%",
                            mt: '4rem'
                        }}
                        justifyContent="center"
                        alt="Payback add"
                        src=""
                    /> */}
                    <Copyright sx={{ mt: 5 }} />
                </Container>
            </ThemeProvider>

        </>
    )
}

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
            default: "#fff",
        }
    }
});
