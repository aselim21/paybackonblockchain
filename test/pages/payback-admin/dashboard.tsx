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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Navbar from './components/navbar';
import PBT_Admin from './scripts/PBT_admin';
import Partner from './scripts/data_structures';
import SyncIcon from '@mui/icons-material/Sync';


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
    const [rows, setRows] = React.useState<Partner[]>([]);

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

        admin.getAllPartners().then(res=>{
            console.log(res);
            setRows(res);
        })
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
                <Box sx={{ width: 7 / 10 }} bgcolor="grey.300">
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
                        <Typography variant="body1" gutterBottom sx={{ mx: 1 }}>
                            Number of partners: {nrPartners}
                        </Typography>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer'
                            }}
                            onClick={event => updateNumberOfPartners()} />
                    </Box>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Name</TableCell>
                                    <TableCell align="right">Address</TableCell>
                                    <TableCell align="right">Currency</TableCell>
                                    <TableCell align="right">Value for token</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row : Partner) => (
                                    <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.id}
                                        </TableCell>
                                        <TableCell align="right">{row.name}</TableCell>
                                        <TableCell align="right">{row.address}</TableCell>
                                        <TableCell align="right">{row.currency}</TableCell>
                                        <TableCell align="right">{row.valueForToken}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ width: 2 / 10 }} bgcolor="grey.300">
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
                        <Typography variant="body1" gutterBottom sx={{ mx: 1 }}>
                            Number of clients: {nrClients}
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