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
    Checkbox,
    FormControlLabel,
    FormGroup

} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Navbar from './components/navbar';
import PBT_basicReader from './scripts/PBT_basicReader';
import Partner from '../../public/data_structures';
import { useState, useEffect } from "react";
import Web3 from "web3";
import abi from '../../public/ABI_PayBackToken.json'


// import SyncIcon from '@mui/icons-material/Sync';




export default function Kunde() {
    const PBT_reader = new PBT_basicReader();
    const [account, setAccount] = useState<string>("");
    const [sign_w_Metamask, setSign_w_Metamask] = useState<Boolean>(false);
    let accounts: string[];

    // const emptyPartner = new Partner(0, "", "", "", 0);
    const [partners, setPartners] = React.useState<Partner[]>([]);

    const [message, setMessage] = React.useState<string[]>(["", ""]);
    const [resultIs, setResultIs] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(false);

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

    const getContractOwner = async () => {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(
            abi,
            process.env.CONTRACT_ADDRESS
        );

        const data = await contract.methods.getOwner().call();
        console.log(data);
    };
    const initiateTransac_addMeAsClient = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(
                abi,
                process.env.CONTRACT_ADDRESS
            );

            const gas = await contract.methods.addMeAsClient().estimateGas();
            const gasPrice = await web3.eth.getGasPrice();
            //   const nonce = await web3.eth.getTransactionCount(account);
            const data = contract.methods.addMeAsClient().encodeABI();

            const txObject = {
                from: account,
                to: process.env.CONTRACT_ADDRESS,
                gasPrice: gasPrice,
                gas: gas,
                // nonce: nonce,
                data: data,
            };
            await web3.eth.sendTransaction(txObject)
                // .on('sending', (hash) => {
                //     console.log(`sending: ${hash}`);
                //     setLoading(false);
                // })
                // .on('sent', (hash) => {

                //     console.log(`sent: ${hash}`);
                //     setLoading(false);
                // })
                .on('transactionHash', (hash) => {

                    console.log(`Transaction sent with hash: ${hash}`);
                    setLoading(false);
                })
                .on('receipt', (hash) => {

                    console.log(`receipt: ${hash}`);
                    setLoading(false);
                })
                .on('confirmation', (receipt: any) => {
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
                    setMessage(["Erfolg", `Der Kunde wurde erfolgreich angemeldet.`])
                    setResultIs(true);
                    setLoading(false);
                })
                .on('error', (error) => {
                    // alert(`Transaction failed with error: ${error.message}`);
                    console.log(error)
                    setMessage(["Fehler!", `Der Kunde konte nicht angemeldet werden. ` + error])
                    setResultIs(true);
                    setLoading(false);
                });

            // Send the transaction and wait for confirmation
            // const transactionHash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txObject] });
            // console.log(`Transaction sent with hash: ${transactionHash}`);

            // // Wait for the transaction to be mined (optional)
            // const receipt = await web3.eth.getTransactionReceipt(transactionHash);
            // console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        } catch (err:any) {
            console.log(err);
            setMessage(["Fehler!", `Der Kunde konte nicht angemeldet werden. ` + err.data.message])
            setResultIs(true);
            setLoading(false);
        }
    };

    const handleRegisterClient = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const req_data = {
            addr: data.get("wallet_addr")?.toString(),
            sign_w_Metamask: Boolean(data.get("sign_w_Metamask"))
        }
        console.log(req_data)
        if (!!!req_data.addr) {
            setMessage(["Fehler!", `Wallet Addresse ist verpfilchtend! Bitte überprüfe die Daten und versuche noch einmal.`])
            setResultIs(false);
            setLoading(false);
            return;
        }
        try {
            if (req_data.sign_w_Metamask) {
                initiateTransac_addMeAsClient()
            }
        } catch (err: any) {
            console.error(err)
            setMessage(["Fehler!", "Der Partner konnte nicht angemeldet werden. " + err.toString()]);
            setResultIs(false);
            setLoading(false);
            return;
        }
    };

    React.useEffect((): void => {
        //Runs only on the first render
        PBT_reader.getAllPartners().then(res => {
            setPartners(res);
        });


    }, []);



    return (
        <>
            <Navbar />
            {/* source https://github.com/mui/material-ui/blob/v5.14.2/docs/data/material/getting-started/templates/sign-up/SignUp.tsx */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    m: 1,
                    marginTop: 8,
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                }}>
                <Box
                    sx={{
                        maxWidth: 13 / 20,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2
                    }}>
                    <Typography component="h1" variant="h5">
                        Jetzt mit PAYBACK starten
                    </Typography>
                    <Box component="form" onSubmit={handleRegisterClient} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="partner"
                                    name="partner"
                                    select
                                    label="Partner"
                                    helperText="Bitte einen gewünschten Partner wählen"
                                // value={""}
                                >
                                    {partners.map((option) => (
                                        <MenuItem key={option.id} value={option.id} >
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    multiline
                                    inputProps={{
                                        style: { color: '#4075c0' }
                                    }}
                                    required
                                    fullWidth
                                    id="wallet_addr"
                                    name="wallet_addr"
                                    label="Wallet Adresse"
                                    value={account}

                                    InputProps={{
                                        readOnly: Boolean(sign_w_Metamask),
                                    }}
                                    onChange={(event: React.SyntheticEvent) => setAccount((event.target as HTMLInputElement).value)}
                                // defaultValue="0x93a6cbd8331b53e5276a86237bace339fc91e439"
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
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="true"
                                        id="sign_w_Metamask"
                                        name="sign_w_Metamask"
                                        control={<Checkbox />}
                                        label="Die Transaktion mit Metamask selbst signieren."
                                        labelPlacement="end"
                                        onChange={(event: React.SyntheticEvent) => setSign_w_Metamask(!sign_w_Metamask)}
                                    // onChange={(event: React.SyntheticEvent) => setSign_w_Metamask(Boolean((event.target as HTMLInputElement).value))}
                                    />
                                </FormGroup>
                            </Grid>




                            <Grid item xs={12} sm={6} >
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="E-Mail"
                                    defaultValue="achelia.selim@th-koeln.de"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    id="passwort"
                                    name="passwort"
                                    label="Passwort"
                                    defaultValue="blablabla"
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }} >
                                <Typography variant="body1">
                                    Persönliche Daten
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="vorname"
                                    name="vorname"
                                    label="Vorname"
                                    defaultValue="Achelia"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="nachname"
                                    name="nachname"
                                    label="Nachname"
                                    defaultValue="Selim"
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <TextField
                                    required
                                    fullWidth
                                    id="str_nr"
                                    name="str_nr"
                                    label="Straße und Haus­nummer"
                                    defaultValue="Deutzer Allee 4"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="plz"
                                    name="plz"
                                    label="PLZ"
                                    defaultValue="50679"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="ort"
                                    name="ort"
                                    label="Ort"
                                    defaultValue="Köln"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="land"
                                    name="land"
                                    label="Land"
                                    defaultValue="Deutschland"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="geburtsdatum"
                                    name="geburtsdatum"
                                    label="Geburtsdatum"
                                    defaultValue="21.12.2000"
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
                            Weiter
                        </LoadingButton>
                    </Box>
                </Box>


            </Box>

            <Dialog
                open={resultIs != null}
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
                    {resultIs ?
                        <div>
                            <Button onClick={event => window.location.href = 'dashboard'} autoFocus>
                                Zum Dashboard
                            </Button>
                            <Button onClick={() => { setResultIs(null) }}>
                                Schließen
                            </Button>
                        </div>
                        :
                        <Button autoFocus onClick={() => { setResultIs(null) }}>
                            Schließen
                        </Button>}
                </DialogActions>
            </Dialog>
        </>
    )
}