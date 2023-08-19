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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Navbar from './components/navbar';
import PBT_Admin from './scripts/PBT_admin';
const home = "/payback-admin";
import SyncIcon from '@mui/icons-material/Sync';

async function getData() {
    const admin = new PBT_Admin();
    const res = await admin.getContractInfo();
    return res;
}

export default function AddPartnerForm() {
    const admin = new PBT_Admin();

    const [contractInfo, setContractInfo] = React.useState({
        name: "",
        symbol: "",
        totalSupply: ""
    });
    const [owner, setOwner] = React.useState<string>("");
    const [currentTime, setCurrentTime] = React.useState<string>("");
    const [nrPartners, setNrPartners] = React.useState<number>(0);
    const [nrClients, setNrClients] = React.useState<number>(0);



    async function updateCurrentTimeAsDate() {
        const res = await admin.getCurrentTime();
        const d = new Date(res * 1000);
        const d_ger = d.toLocaleString('de', { timeZone: 'Europe/Berlin', timeZoneName: 'long' });
        console.log("Epoch:", res, "\nDate: ", d_ger);
        setCurrentTime(d_ger);
        return d_ger;
    }

    async function updateNumberOfPartners() {
        const res = await admin.getNumPartners();
        console.log("Number of partners:", res);
        setNrPartners(res);
        return res;
    }

    async function updateNumberOfClients() {
        const res = await admin.getNumClients();
        console.log("Number of clients:", res);
        setNrClients(res);
        return res;
    }

    React.useEffect((): void => {
        //Runs only on the first render
        admin.getContractInfo().then(res => {
            console.log(res);
            setContractInfo(res);
        });

        admin.getOwner().then(res => {
            console.log(res);
            setOwner(res);
        });

        updateCurrentTimeAsDate();

        updateNumberOfPartners();
        updateNumberOfClients();




    }, []);

    return (
        <>
            <Navbar />
            {/* source https://github.com/mui/material-ui/blob/v5.14.2/docs/data/material/getting-started/templates/sign-up/SignUp.tsx */}
            <Box
                component="form"
                sx={{
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',

                }}
                noValidate
                autoComplete="off"
            >
                <Typography variant="body1" gutterBottom>
                    {contractInfo.name} (total: {contractInfo.totalSupply} {contractInfo.symbol})
                </Typography>

                <Typography variant="body2" gutterBottom>
                    owner: {owner}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        // p: 1,
                        // m: 1,
                        // bgcolor: 'background.paper',
                        // borderRadius: 1,
                        alignItems: 'center',
                        alignContent: 'center'
                    }}>
                    <Typography variant="body2" gutterBottom sx={{ mr: 1 }}>
                        current Time: {currentTime}
                    </Typography>
                    <SyncIcon
                        sx={{
                            cursor: 'pointer'
                        }}
                        onClick={event => updateCurrentTimeAsDate()} />
                </Box>
                {/* <TextField
                    label="Name"
                    defaultValue=""
                    value={contractInfo.name}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant='standard'
                />
                <TextField
                    label="Symbol"
                    defaultValue=""
                    value={contractInfo.symbol}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant='standard'
                />
                <TextField
                    label="Total Supply"
                    defaultValue=""
                    value={contractInfo.totalSupply}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant='standard'
                /> */}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                }}
            >
                <Box sx={{ width: 3 / 7 }} bgcolor="grey.300">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            // p: 1,
                            // m: 1,
                            // bgcolor: 'background.paper',
                            // borderRadius: 1,
                            alignItems: 'center',
                            alignContent: 'center'
                        }}>
                        <Typography variant="body2" gutterBottom sx={{ mr: 1 }}>
                            number of partners: {nrPartners}
                        </Typography>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer'
                            }}
                            onClick={event => updateNumberOfPartners()} />
                    </Box>
                </Box>
                <Box sx={{ width: 3 / 7 }} bgcolor="grey.300">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            // p: 1,
                            // m: 1,
                            // bgcolor: 'background.paper',
                            // borderRadius: 1,
                            alignItems: 'center',
                            alignContent: 'center'
                        }}>
                        <Typography variant="body2" gutterBottom sx={{ mr: 1 }}>
                            number of clients: {nrClients}
                        </Typography>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer'
                            }}
                            onClick={event => updateNumberOfClients()} />
                    </Box>
                </Box>
            </Box>
        </>
    )
}