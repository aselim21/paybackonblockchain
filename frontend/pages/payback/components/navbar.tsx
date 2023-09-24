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
const home = "/payback"
const pages = [{ name: 'Kunde werden', link: `${home}/kundeWerden` }, { name: 'Partner werden', link: 'https://www.payback.group/de/partner' }, { name: 'Kontoübersicht', link: `${home}/kontoUebersicht` }];
// const settings = ['Einstellungen', 'Logout'];

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
            <AppBar position="static" color="primary">
                <Container maxWidth="xl">
                    <Toolbar disableGutters >

                        <Box
                            component="img"
                            sx={{
                                width: "10%",
                                cursor: 'pointer'
                            }}
                            onClick={() => router.push(home)}
                            alt="Payback logo"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Payback_Logo_2023.svg/1920px-Payback_Logo_2023.svg.png"
                        />
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.name}
                                    sx={{ my: 2, color: 'white', display: 'block', ml: '1rem', backgroundColor: "primary.main" }}
                                    href={page.link}
                                >
                                    {page.name}
                                </Button>
                            ))}
                        </Box>

                        {/* <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Payback admin" sx={{ bgcolor: "primary.light" }}>A</Avatar>
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
                        </Box> */}
                    </Toolbar>
                </Container>
            </AppBar>
        </ThemeProvider>
    );
}