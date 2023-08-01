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

const pages = ['Dashboard', 'Partner verwalten', 'Anfragen'];
const settings = ['Einstellungen', 'Logout'];

export default function Payback() {
    return (
        <>
            <Navbar />
            <ThemeProvider theme={ThemePayback}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <AddPartnerForm />
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

function Navbar() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <ThemeProvider theme={ThemePayback}>
            <AppBar position="static" color="secondary">
                <Container maxWidth="xl">
                    <Toolbar disableGutters >
                        <Box
                            component="img"
                            sx={{
                                width: "10%",
                            }}
                            onClick={() => { }}
                            alt="Payback logo"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Payback_Logo_2023.svg/1920px-Payback_Logo_2023.svg.png"
                        />
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex'} }}>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block', ml:'1rem', backgroundColor: "primary.main"}}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Payback admin" src="/static/images/avatar/2.jpg" >P</Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </ThemeProvider>
    );
}

function AddPartnerForm() {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
    };
    return (
        // source https://github.com/mui/material-ui/blob/v5.14.2/docs/data/material/getting-started/templates/sign-up/SignUp.tsx
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
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
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
    )
}