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
import Copyright from '../../components/Copyright';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
const home = "/kaufland";
// const pages = [{ name: 'Kunde werden', link: `${home}/kunde` }, { name: 'Partner werden', link: 'https://www.payback.group/de/partner' }];
// const settings = ['Einstellungen', 'Logout'];

const ThemePayback = createTheme({
    palette: {
        primary: {
            dark: '#757575',
            light: '#fff',
            main: '#424242',
            contrastText: '#e10915',
        },
        secondary: {
            main: '#fff',
            // light: '#fff',
            // dark: '#e5ecf6',
            // contrastText: '#000',
        },
        background: {
            default: "#fff",
        }
    }
});

export default function Navbar() {
    const router = useRouter();

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    // const handleCloseNavMenu = () => {
    //     setAnchorElNav(null);
    // };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <ThemeProvider theme={ThemePayback}>
            <CssBaseline />
            <AppBar position="static" color="secondary">
                <Container maxWidth="xl">
                    <Toolbar disableGutters >

                        <Box
                            component="img"
                            sx={{
                                width: "5%",
                                cursor: 'pointer'
                            }}
                            onClick={() => router.push(home)}
                            alt="Kaufland logo"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/2048px-Kaufland_201x_logo.svg.png"
                        />
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <TextField
                                required
                                id="search-bar"
                                // label="Required"
                                // defaultValue=""
                                placeholder='Online-Marktplatz durchsuchen'
                                sx={{
                                    width: 2 / 3,
                                    ml: '5rem',
                                }}
                            />
                            <SearchIcon
                                color="secondary"
                                sx={{
                                    bgcolor: "primary.main",
                                    fontSize: "3.5rem",
                                    cursor: "pointer"
                                }}
                            />
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Warenkorb">
                                <IconButton sx={{ p: 0 }}>
                                    <ShoppingCartIcon color="primary" sx={{ fontSize: "3.5rem" }}/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </ThemeProvider>
    );
}