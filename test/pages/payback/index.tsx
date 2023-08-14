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


export default function Payback() {
    return (
        <>
            <Navbar />
            <ThemeProvider theme={ThemePayback}>
                <Box
                    component="img"
                    sx={{
                        width: "60%",
                        mt: '4rem'
                    }}
                    justifyContent="center"
                    alt="Payback add"
                    src="https://www.payback.group/fileadmin/bilder_pl/220210_PB_DE_PR_Bonus_Award_Sieger_4Kategorien.jpg"
                />
                <Container component="main" maxWidth="xs">

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            p: 1,
                            m: 1,
                            // mt: 30,
                            // bgcolor: 'background.paper',
                            borderRadius: 1,
                        }}
                        color='primary.main'
                    >
                        {/* <Box  sx={{ mt: '4rem' }} > */}

                        <Button variant="contained">Client</Button>
                        <Button variant="contained">Administrator</Button>
                    </Box>

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
            default: "#f2f6fb",
        }
    }
});
