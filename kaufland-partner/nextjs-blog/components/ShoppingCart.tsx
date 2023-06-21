import * as React from 'react';
// import TrendingUp from '@mui/icons-material/TrendingUp';
import {
    Box,
    Button,
    Typography,
    Avatar,
    CssBaseline,
    ThemeProvider,
    Grid,
    Paper,
    Grow,
    Popper,
    MenuItem,
    MenuList,
    ClickAwayListener
} from '@mui/material';


import Web3 from "web3";

export function ShoppingCart() {

    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_LINK));
    const contractAddr = "0x43c8954D7672a6DF67586745F6257fbe78Ff0204";

    const connectWallet = () => {
        console.log("Click")
    };
    
    return (
        <>
        <Button onClick={connectWallet}> Click to connect Wallet</Button>
        </>
    );
}