import React from 'react';
import abi from './ABI_PayBackToken.json'
import Web3 from 'web3';
import Partner from './data_structures';

class PBT_partner{
    web3;
    PayBackContract;
    PRIVATE_KEY = process.env.PRIVATE_KEY_Partner1;
    PUBLIC_KEY = process.env.PUBLIC_KEY_Partner1;

    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL));
        this.web3.eth.accounts.privateKeyToAccount(`0x${this.PRIVATE_KEY}`);
        this.PayBackContract = new this.web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
    }

    async getOwner() {
        const res = await this.PayBackContract.methods.getOwner().call();
        console.log(res)
        return res;
    }

    async getPartnerId(_addr) {
        try {
            const res_bigInt = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            const res_number = Number(res_bigInt);
            return res_number;
        } catch (err) {
            console.error("Couldn't get partner id of addr:", _addr);
            throw err;
        }
    }

    async getContractInfo() {
        try {
            const res = {
                name: await this.PayBackContract.methods.name().call(),
                symbol: await this.PayBackContract.methods.symbol().call(),
                totalSupply: Number(await this.PayBackContract.methods.totalSupply().call()),
            }
            return res;
        } catch (err) {
            console.error("Couldn't gather contract info.");
            throw err;
        }
    }

    async getCurrentTime() {
        try {
            const res = await this.PayBackContract.methods.getCurrentTime().call();
            return Number(res);
        } catch (err) {
            console.error("Couldn't read current time.");
            throw err;
        }
    }

    async getPartner(_id) {
        try {
            const res = await this.PayBackContract.methods.partners(_id).call();
            console.log(res);
            return new Partner(_id, res.name, res.walletAddr, res.currency, Number(res.valueForToken));
        } catch (err) {
            console.error("Couldn't get partner with id: ", _id);
            throw err;
        }
    }



    async getPartnerID(_addr) {
        try {
            const res = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            return res;
        } catch (err) {
            console.error("Couldn't get partner with addr: ", _addr);
            throw err;
        }
    }
    async getClientID(_addr) {
        try {
            const res = await this.PayBackContract.methods.addrToClientId(_addr).call();
            return res;
        } catch (err) {
            console.error("Couldn't get client with addr: ", _addr);
            throw err;
        }
    }
    async getBalanceOf(_addr) {
        try {
            const res = await this.PayBackContract.methods.balanceOf(_addr).call();
            return Number(res);
        } catch (err) {
            console.error("Couldn't get balance of: ", _addr);
            throw err;
        }
    }

    async getPointsToEarn(_roundValue, _partnerId) {
        try {
            const res = await this.PayBackContract.methods.calcPointsToEarn(_roundValue, _partnerId).call();
            return Number(res);
        } catch (err) {
            console.error("Couldn't get points to earn of round value: ", _roundValue, " and partnerID: ", _partnerId);
            throw err;
        }
    }

    async transfer(_to, _amount) {

        const encoded_data = this.PayBackContract.methods.transfer(_to, _amount).encodeABI();
        var tx = {
            from: this.PUBLIC_KEY,
            to: process.env.CONTRACT_ADDRESS,
            gas: this.web3.utils.toHex(545200), // 30400
            gasPrice: await this.web3.eth.getGasPrice(),//this.web3.eth.gasPrice(), //'0x9184e72a000', // 10000000000000
            // value: '', // 2441406250 web3.utils.toHex(web3.utils.toWei('0.1', 'ether'))
            data: encoded_data
        }
        console.log(tx)
        try {
            const tx_signed = await this.web3.eth.accounts.signTransaction(tx, this.PRIVATE_KEY);
            console.log(tx_signed);
            const tx_sent = await this.web3.eth.sendSignedTransaction(tx_signed.rawTransaction);
            // console.log(tx_sent)
            return tx_sent;
        } catch (err) {
            console.error("Couldn't sign transaction.", err);
            throw err;
        }
    }



    async lock(_receiver, _amount, _unlockEpochDateInSec) {

        const encoded_data = this.PayBackContract.methods.lock(_receiver, _amount, _unlockEpochDateInSec).encodeABI();

        var tx = {
            from: this.PUBLIC_KEY,
            to: process.env.CONTRACT_ADDRESS,
            gas: this.web3.utils.toHex(545200), // 30400
            gasPrice: await this.web3.eth.getGasPrice(),//this.web3.eth.gasPrice(), //'0x9184e72a000', // 10000000000000
            // value: '', // 2441406250 web3.utils.toHex(web3.utils.toWei('0.1', 'ether'))
            data: encoded_data
        }
        try {
            const tx_signed = await this.web3.eth.accounts.signTransaction(tx, this.PRIVATE_KEY);
            console.log(tx_signed);
            const tx_sent = await this.web3.eth.sendSignedTransaction(tx_signed.rawTransaction);
            return tx_sent;
        } catch (err) {
            console.error("Couldn't sign transaction.", err);
            throw err;
        }
    }
}

export {PBT_partner};