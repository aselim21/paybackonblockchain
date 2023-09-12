import * as React from 'react';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import Divider from '@mui/material/Divider';
// import ListItemText from '@mui/material/ListItemText';
// import ListItemAvatar from '@mui/material/ListItemAvatar';
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
    ListItemAvatar,
    ListItemText,
    Divider,
    ListItem,
    List,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from "react";
import Web3 from "web3";
import PBT_partner from '../scripts/PBT_partner';

const PARTNER_ID = 1;



export default function ShoppingCart() {
    const partner = new PBT_partner();
    const [message, setMessage] = React.useState<string[]>(["", ""]);

    const [account, setAccount] = useState<string>("");
    let accounts: string[];

    const [totalValue, setTotalValue] = useState<number>(300.1);
    const [pointsToEarnRes, setPointsToEarnRes] = React.useState<number>(0);
    const [futureEpochRes, setFutureEpochRes] = React.useState<number>(0);
    const [futureEpochDate, setFutureEpochDate] = React.useState<string>("");


    async function handleConnectMetamask() {
        try {
            // window.ethereum.enable().then(async () => {
            const web3 = new Web3(window.ethereum);
            accounts = await web3.eth.getAccounts();
            // accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // userAddress = accounts[0];
            setAccount(accounts[0]);

            window.ethereum.on("accountsChanged", async (accounts: any) => {
                // handle account change
                accounts = await web3.eth.getAccounts();
                // accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                // userAddress = accounts[0];
                setAccount(accounts[0]);
            });

            window.ethereum.on("disconnect", () => {
                // handle metamask logout
                console.log("disconnect");
                setAccount("");
            });
            // });
        } catch (error: any) {
            if (error.message === "User denied account authorization") {
                // handle the case where the user denied the connection request
                console.log(error)
            } else if (error.message === "MetaMask is not enabled") {
                // handle the case where MetaMask is not available
                console.log(error)
            } else {
                // handle other errors
                console.log(error)
            }
        }
    }

    async function handleConnectPayback(): Promise<boolean> {
        //check if client
        const clientID = await checkClientID(account);
        if (clientID == 0) {
            setMessage(["Fehler!", `${account} ist nicht bei Payback angemeldet.`]);
            return false;
        }
        //if client

        //calc pbt zu verdienen
        const pbtToEarn = await checkPointsToEarn(totalValue, PARTNER_ID);
        setPointsToEarnRes(pbtToEarn);
        if (pbtToEarn == 0) {
            setMessage(["Sorry!", `Es sind keine Punkte zum Kaufen.`]);
            return false;
        }
        //calc date for freigabe
        const futureEpoch = getFutureEpochInUTCInMiliSec(0, 0, 0, 0); // 2 Minutes
        const germanTime = epochInUTC_GermanDate(futureEpoch);
        const futureEpoch_PBT = await getFutureEpochInUTC_PBT(0, 0, 0, 0);
        setFutureEpochRes(futureEpoch_PBT);
        setFutureEpochDate(germanTime)
        return true;
    }

    function epochInUTC_GermanDate(_epoch: number) {
        return new Date(_epoch).toLocaleString('de', { timeZone: 'Europe/Berlin', timeZoneName: 'long' });
    }

    async function checkClientID(_addr: string): Promise<Number> {
        if (!!!_addr) return 0;
        let clientID;
        try {
            clientID = await partner.getClientID(_addr);
        } catch (error) {
            setMessage(["Fehler!", `${_addr} ist nicht eine gültige Addresse.`])
        }
        return clientID;
    }

    async function checkPointsToEarn(_value: number, _partnerId: number) {
        if (!!!_value || !!!_partnerId) return;
        let res;
        try {
            res = await partner.getPointsToEarn(Math.round(_value), _partnerId);
        } catch (error) {
            setMessage(["Fehler!", `Es ist ein Fehler bei der Berechnung der Tokens aufgetreten.`])
        }
        return res;
    }
    function getFutureEpochInUTCInMiliSec(_mins: number, _hours: number, _days: number, _weeks: number): number {
        const now = Date.now(); // Unix timestamp in UTC in milliseconds
        const timeToAdd = (60000 * _mins) + (3600000 * _hours) + (86400000 * _days) + (604800000 * _weeks);
        return now + timeToAdd;
    }

    async function getFutureEpochInUTC_PBT(_mins: number, _hours: number, _days: number, _weeks: number): Promise<number> {
        const now = await partner.getCurrentTime();
        console.log("getFutureEpochInUTC_PBT- getCurrentTime", now)
        const timeToAdd = (60 * _mins) + (3600 * _hours) + (86400 * _days) + (604800 * _weeks);
        console.log("getFutureEpochInUTC_PBT- now+timeToAdd", now + timeToAdd)

        return now + timeToAdd;
    }

    async function kaufen(_locken: boolean) {
        //check if account is connected
        const clientID = await checkClientID(account);
        if (clientID == 0) {
            setMessage(["Fehler!", `Kein Payback-Account ist verknüpft.`]);
            return false;
        }
        const pbtToEarn = await checkPointsToEarn(totalValue, PARTNER_ID);
        if (_locken) {
            //should send tokens to locking address with locking
            try {
                await partner.lock(account, pbtToEarn, futureEpochRes);
                setMessage(["Erfolgreich!", `${pbtToEarn} Tokens wurden für Ihnen bis ${futureEpochDate} gesperrt.`]);
                return true;
            } catch (err) {
                setMessage(["Fehler!", `Es ist ein Fehler beim Locken aufgetreten. ${JSON.stringify(err)}`]);
                return false;
            }
        } else {
            //should sent tokens directly without locking to the client
            try {
                await partner.transfer(account, pbtToEarn);
                setMessage(["Erfolgreich!", `${pbtToEarn} Tokens wurden für Ihnen übertragen.`]);
                return true;
            } catch (err) {
                setMessage(["Fehler!", `Es ist ein Fehler beim Transfer aufgetreten.- ${JSON.stringify(err)}`]);
                return false;
            }
        }
    }

    return (
        <>
            <Typography variant='h2'>Mein Warenkorb</Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <List sx={{ width: '100%', maxWidth: 800 }}>
                    <ListItem alignItems="flex-start"
                        secondaryAction={
                            <React.Fragment>
                                <TextField
                                    id="standard-number"
                                    sx={{ width: 60 }}
                                    type="number"
                                    variant="outlined"
                                    defaultValue={1}
                                    inputProps={{ readOnly: true, inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
                                />
                            </React.Fragment>
                        }
                    >
                        <ListItemAvatar>
                            <CloseIcon />
                            <Avatar variant="rounded"
                                src="https://media.cdn.kaufland.de/product-images/1024x1024/f8658bffa82f00f0295fcd59858729c1.webp"
                                sx={{ width: 150, height: 150 }}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary=
                            {
                                <React.Fragment>
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: 18,
                                        }}
                                        component="span"
                                        variant="body1"
                                        color="text.primary"
                                    >
                                        Klarstein Hot & Hot Gasgrill Regen-Cover - Wetterschutz, Schutzhülle, perfekte Passform: 173 x 100 x 60 cm (BxHxT), Robustes & schweres 600D Canvas, reißfest, wasserfest,...
                                    </Typography>
                                    <br />
                                </React.Fragment>
                            }
                            secondary=
                            {
                                <React.Fragment>
                                    <br />
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                        }}
                                        component="span"
                                        variant="body1"
                                        color="text.primary"
                                    >
                                        245,20 €
                                    </Typography>
                                    <br />

                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: 16,
                                            color: "green"
                                        }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Kostenloser Versand
                                    </Typography>
                                    <br />
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Verkäufer: BBG
                                    </Typography>

                                </React.Fragment>
                            }
                        />
                    </ListItem>

                    <Divider variant="inset" component="li" />

                    <ListItem alignItems="flex-start"
                        secondaryAction={
                            <TextField
                                id="standard-number"
                                sx={{ width: 60 }}
                                type="number"
                                variant="outlined"
                                defaultValue={1}
                                inputProps={{ readOnly: true, inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
                            />
                        }
                    >
                        <ListItemAvatar>
                            <CloseIcon />
                            <Avatar variant="rounded"
                                src="https://media.cdn.kaufland.de/product-images/1024x1024/b4e9dcbdd46f8361591911ed0ee6f37a.webp"
                                sx={{ width: 150, height: 150 }}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary=
                            {
                                <React.Fragment>
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: 18,
                                        }}
                                        component="span"
                                        variant="body1"
                                        color="text.primary"
                                    >
                                        Flexot® F-2045 Koffer Reisekoffer Hartschale Hardcase Doppeltragegriff mit Zahlenschloss Gr. L Farbe Rose-Gold
                                    </Typography>
                                    <br />
                                </React.Fragment>
                            }
                            secondary=
                            {
                                <React.Fragment>
                                    <br />
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: 16,
                                        }}
                                        component="span"
                                        variant="body1"
                                        color="text.primary"
                                    >
                                        54,90 €
                                    </Typography>
                                    <br />
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: 16,
                                            color: "green"
                                        }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Kostenloser Versand
                                    </Typography>
                                    <br />
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Verkäufer: Daliya
                                    </Typography>

                                </React.Fragment>
                            }
                        />
                    </ListItem>
                    <Divider variant="inset" component="li" />

                    <Box sx={{ textAlign: 'right', mt: 3 }} >
                        <Typography
                            sx={{
                                fontSize: 16,
                            }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                        >
                            Zwischensumme: ${totalValue} €
                        </Typography>
                        <br />
                        <Typography
                            sx={{
                                fontSize: 16,
                            }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                        >
                            Versandkosten: Kostenlos
                        </Typography>
                        <br />
                        <Typography
                            sx={{
                                fontWeight: "bold",
                            }}
                            component="span"
                            variant="h6"
                        >
                            Gesamtsumme (inkl. MwSt.): {totalValue} €
                        </Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ my: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography>Bei online Bestellungen hat man 2 Wochen für eine Retoure. Deswegen werden Punkte/Tokens für diesen Zeitraum gesperrt.</Typography>
                            <Button variant="contained"
                                fullWidth
                                sx={{
                                    my: 2,
                                    color: 'white',
                                    bgcolor: "#e10915",
                                    // fontWeight: "bold",
                                    fontSize: 16,
                                    '&:hover': {
                                        // backgroundColor: '#fff',
                                        bgcolor: '#fff',
                                        color: "#e10915"
                                    },
                                }}
                                onClick={(ev) => { kaufen(true) }}
                            >
                                Online Bestellung abschließen
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography> Zusätzliche Option zum Testen : Bei normalen Einkäufe bekommt man die Punkte sofort auf seinem Konto/Wallet.</Typography>
                            <Button variant="contained"
                                fullWidth
                                sx={{
                                    my: 2,
                                    color: 'white',
                                    bgcolor: "#e10915",
                                    // fontWeight: "bold",
                                    fontSize: 16,
                                    '&:hover': {
                                        // backgroundColor: '#fff',
                                        bgcolor: '#fff',
                                        color: "#e10915"
                                    },
                                }}
                                onClick={(ev) => { kaufen(false) }}
                            >
                                Bestellung ohne Sperre abschließen
                            </Button>

                        </Grid>
                    </Grid>
                </List>
                <Container component="div" maxWidth='sm' sx={{ my: 4, }}>

                    <Box>
                        <Typography
                            sx={{
                            }}
                            component="span"
                            variant="h6"
                        >
                            Sammeln Sie Payback-Tokens?
                        </Typography>

                        <Grid container spacing={2} sx={{ my: 1 }}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    inputProps={{
                                        style: { color: '#4075c0' }
                                    }}

                                    fullWidth
                                    id="wallet_addr"
                                    name="wallet_addr"
                                    label="Wallet Adresse"
                                    value={account}
                                    onChange={(event: React.SyntheticEvent) => setAccount((event.target as HTMLInputElement).value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        height: 1
                                    }}
                                    onClick={(ev) => handleConnectMetamask()}
                                >
                                    Connect Metamask
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        // my: 2,
                                        color: 'white',
                                        bgcolor: "#003eb0",
                                        '&:hover': {
                                            bgcolor: "#003eb0",
                                        },
                                    }}
                                    onClick={(ev) => { handleConnectPayback() }}
                                >
                                    <Box
                                        component="img"
                                        sx={{
                                            width: "20%",
                                            mr: 1
                                        }}

                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Payback_Logo_2023.svg/1920px-Payback_Logo_2023.svg.png"
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: "12",
                                        }}
                                        component="span"
                                        variant="body1"
                                    >
                                        Verbinden
                                    </Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    variant="standard"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    fullWidth
                                    id="PBTzuVerdienen"
                                    name="PBTzuVerdienen"
                                    label="PBT zu verdienen"
                                    value={pointsToEarnRes}

                                />
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField
                                    variant="standard"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    fullWidth
                                    // id="Datum der Freigabe"
                                    // name="PBTzuVerdienen"
                                    label="Voraussichtlicher Zeitpunkt der Freigabe"
                                    value={futureEpochDate}
                                    helperText="Für Testzwecke ist das auf 0 Minuten eingestellt."

                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Container>

            </Box >
            <Dialog
                open={message[0] != ""}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {message[0]}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message[1]}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>

                    <Button onClick={() => { setMessage(["", ""]) }}>
                        Schließen
                    </Button>

                </DialogActions>
            </Dialog>
        </>
    );
}