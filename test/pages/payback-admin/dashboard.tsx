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
// import Partner from './scripts/data_structures';
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

    // const [nrPartners, setNrPartners] = React.useState<number>(0);
    const [nrClients, setNrClients] = React.useState<number>(0);

    // const [rows, setRows] = React.useState<Partner[]>([]);

    const [clientAddr, setClientAddr] = React.useState<string>("");
    const [isClientResult, setIsClientResult] = React.useState<string>("");

    // const [partnerAddr, setPartnerAddr] = React.useState<string>("");
    // const [isPartnerResult, setIsPartnerResult] = React.useState<string>("");

    const [checkBalanceAddr, setCheckBalanceAddr] = React.useState<string>("");
    const [balanceOfRes, setBalanceOfRes] = React.useState<number>();

    const [allowanceOwnerAddr, setAllowanceOwnerAddr] = React.useState<string>("");
    const [allowanceSpenderAddr, setAllowanceSpenderAddr] = React.useState<string>("");
    const [allowanceRes, setAllowanceRes] = React.useState<number>();

    const [pointsValue, setPointsValue] = React.useState<number>(0);
    const [pointsPartnerId, setPointsPartnerId] = React.useState<number>(0);
    const [pointsToEarnRes, setPointsToEarnRes] = React.useState<number>();

    const [epochHours, setEpochHours] = React.useState<number>(0);
    const [epochDays, setEpochDays] = React.useState<number>(0);
    const [epochWeeks, setEpochWeeks] = React.useState<number>(0);
    const [futureEpochRes, setFutureEpochRes] = React.useState<number>();

    async function updateCurrentTimeAsDateFromBlockchain() {
        const res = await admin.getCurrentTime();
        const d = new Date(res * 1000);
        const d_ger = d.toLocaleString('de', { timeZone: 'Europe/Berlin', timeZoneName: 'long' });
        console.log("Epoch:", res, "\nDate: ", d_ger);
        setCurrentTime("Epoch (GMT): " + res + ". " + "Local date: " + d_ger);
        return d_ger;
    }

    // async function updateNumberOfPartners() {
    //     const res = await admin.getNumPartners();
    //     console.log("Number of partners:", res);
    //     setNrPartners(res);
    //     return res;
    // }

    async function updateNumberOfClients() {
        const res = await admin.getNumClients();
        console.log("Number of clients:", res);
        setNrClients(res);
        return res;
    }

    async function checkClientID(_addr: string) {
        if (!!!_addr) return;
        const res = await admin.getClientID(_addr);
        console.log("Client ID:", res);
        res == 0 ? setIsClientResult("not a client") : setIsClientResult(res.toString());
        return res;
    }

    // async function checkPartnerID(_addr: string) {
    //     if (!!!_addr) return;
    //     const res = await admin.getPartnerID(_addr);
    //     console.log("Partner ID:", res);
    //     res == 0 ? setIsPartnerResult("not a partner") : setIsPartnerResult(res.toString());
    //     return res;
    // }

    async function checkBalanceOf(_addr: string) {
        if (!!!_addr) return;
        const res = await admin.getBalanceOf(_addr);
        console.log("Balance of:", res);
        setBalanceOfRes(res);
        return res;
    }

    async function checkAllowance(_ownerAddr: string, _spenderAddr: string) {
        if (!!!_ownerAddr || !!!_spenderAddr) return;
        const res = await admin.getAllowance(_ownerAddr, _spenderAddr);
        console.log("Allowance is:", res);
        setAllowanceRes(res);
        return res;
    }

    async function checkPointsToEarn(_value: number, _partnerId: number) {
        if (!!!_value || !!!_partnerId) return;
        const res = await admin.getPointsToEarn(_value, _partnerId);
        console.log("Points to earn are:", res);
        setPointsToEarnRes(res);
        return res;
    }

    async function checkFutureEpoch(_hours: number, _days: number, _weeks: number) {
        const now = Date.now(); // Unix timestamp in milliseconds
        console.log("Now epoch date in GMT:", now);
        const d = new Date(now * 1000);
        console.log("Now date in GMT", d)
        const timeToAdd = (3600 * _hours) + (86400 * _days) + (604800 * _weeks);
        const res = now + timeToAdd;
        console.log("Future epoch date in GMT is:", res);
        setFutureEpochRes(res);
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

        updateCurrentTimeAsDateFromBlockchain();

        // updateNumberOfPartners();
        updateNumberOfClients();

        // admin.getAllPartners().then(res => {
        //     console.log(res);
        //     setRows(res);
        // })
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
                    borderRadius: 2,

                }}
                noValidate
                autoComplete="off"
            >
                <Typography variant="h6" gutterBottom>
                    <strong>{contractInfo.name}</strong> (total: <strong>{contractInfo.totalSupply} {contractInfo.symbol}</strong>)
                </Typography>

                <Typography variant="body1" gutterBottom>
                    owner: <strong>{owner}</strong>
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'strech',
                        alignContent: 'center'
                    }}>
                    <Typography variant="body1" gutterBottom sx={{ mr: 1 }}>
                        current time in blockchain: <strong>{currentTime}</strong>
                    </Typography>
                    <SyncIcon
                        sx={{
                            cursor: 'pointer'
                        }}
                        onClick={ev => updateCurrentTimeAsDateFromBlockchain()} />
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    m: 1,
                }}>
                {/* <Box
                    sx={{
                        width: 13 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                    }}>
                    <Box
                        id="nr-partners-checker"

                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center'
                        }}>
                        <Typography variant="body1" gutterBottom sx={{ mx: 1 }}>
                            Number of partners: <strong>{nrPartners}</strong>
                        </Typography>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer'
                            }}
                            onClick={event => updateNumberOfPartners()} />
                    </Box>
                    <Box id="partner-checker" sx={{ m: 1 }}>
                        <Typography>Get partner ID: <strong>{isPartnerResult}</strong></Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Address" variant="outlined" value={partnerAddr} size="small" onChange={(ev) => { setPartnerAddr(ev.target.value) }} />
                            <Button size="small" variant="contained" onClick={() => checkPartnerID(partnerAddr)}>Go</Button>
                        </Box>
                    </Box>
                    <TableContainer component={Paper} sx={{}}>
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
                                {rows.map((row: Partner) => (
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
                </Box> */}
                {/* <Box
                    sx={{
                        width: 8 / 20,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                    }}> */}
                <Box
                    sx={{
                        maxWidth: 10 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        my: 1
                    }}>
                    <Box
                        id="nr-clients-checker"
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center'
                        }}>
                        <Typography variant="body1" gutterBottom >
                            Number of clients: <strong>{nrClients}</strong>
                        </Typography>
                        <SyncIcon
                            sx={{
                                cursor: 'pointer',
                                mx:1
                            }}
                            onClick={event => updateNumberOfClients()} />
                    </Box>
                    <Box id="client-checker" sx={{ my: 1 }}>
                        <Typography>Get client ID: <strong>{isClientResult}</strong> </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Address" variant="outlined" value={clientAddr} size="small" onChange={(ev) => { setClientAddr(ev.target.value) }} />
                            <Button size="small" variant="contained" sx={{ mx:1 }} onClick={() => checkClientID(clientAddr)}>Go</Button>
                        </Box>
                    </Box>
                    <Box id="balance-checker"
                        sx={{ my: 1 }}>
                        <Typography>Balance is: <strong>{balanceOfRes}</strong> </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Address" variant="outlined" value={checkBalanceAddr} size="small" onChange={(ev) => { setCheckBalanceAddr(ev.target.value) }} />
                            <Button size="small" variant="contained" sx={{ mx:1 }} onClick={() => checkBalanceOf(checkBalanceAddr)}>Go</Button>
                        </Box>
                    </Box>
                    <Box id="allowance-checker"
                        sx={{ my: 1 }}>
                        <Typography>Allowance is: <strong>{allowanceRes}</strong> </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Owner address" variant="outlined" sx={{ mr:1 }} value={allowanceOwnerAddr} size="small" onChange={(ev) => { setAllowanceOwnerAddr(ev.target.value) }} />
                            <TextField label="Spender address" variant="outlined" value={allowanceSpenderAddr} size="small" onChange={(ev) => { setAllowanceSpenderAddr(ev.target.value) }} />
                            <Button size="small" variant="contained" sx={{ mx:1 }} onClick={() => checkAllowance(allowanceOwnerAddr, allowanceSpenderAddr)}>Go</Button>
                        </Box>
                    </Box>
                    <Box id="pointsToEarn-checker"
                        sx={{ my: 1 }}>
                        <Typography>Points to earn are: <strong>{pointsToEarnRes}</strong></Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Round value" variant="outlined" sx={{ mr:1 }} value={pointsValue} size="small" onChange={(ev) => { setPointsValue(Number(ev.target.value)) }} />
                            <TextField label="Partner ID" variant="outlined" value={pointsPartnerId} size="small" onChange={(ev) => { setPointsPartnerId(Number(ev.target.value)) }} />
                            <Button size="small" variant="contained" sx={{ mx:1 }} onClick={() => checkPointsToEarn(pointsValue!, pointsPartnerId!)}>Go</Button>
                        </Box>
                    </Box>
                    <Box id="futureEpoch-checker"
                        sx={{ my: 1 }}>
                        <Typography>Future epoch value from now (in GMT) is: <strong>{futureEpochRes}</strong> </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'strech',
                            alignContent: 'center',
                            my: 1,
                        }}>
                            <TextField label="Hours" variant="outlined" sx={{ mr:1 }} value={epochHours} size="small" onChange={(ev) => { setEpochHours(Number(ev.target.value)) }} />
                            <TextField label="Days" variant="outlined" sx={{ mr:1 }} value={epochDays} size="small" onChange={(ev) => { setEpochDays(Number(ev.target.value)) }} />
                            <TextField label="Weeks" variant="outlined" value={epochWeeks} size="small" onChange={(ev) => { setEpochWeeks(Number(ev.target.value)) }} />

                            <Button size="small" variant="contained" sx={{ mx:1 }} onClick={() => checkFutureEpoch(epochHours!, epochDays!, epochWeeks!)}>Go</Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}