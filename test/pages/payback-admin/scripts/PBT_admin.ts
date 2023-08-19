import { setTimeout } from 'timers/promises';
import abi from '../../../public/ABI_PayBackToken.json'
import Web3 from 'web3';

export default class PBT_Admin {
    private web3: any;
    private PayBackContract: any;

    public constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL!));
        this.web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY_PayBack}`);
        this.PayBackContract = new this.web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
    }

    public async getOwner(): Promise<string> {
        const res = await this.PayBackContract.methods.getOwner().call();
        return res;
    }
    public async addPartner(_name: string, _addr: string, _currency: string, _valueForOne: number): Promise<any> {

        const encoded_data = this.PayBackContract.methods.addPartner(_name, _addr, _currency, _valueForOne).encodeABI();

        var tx = {
            from: process.env.PUBLIC_KEY_PayBack,
            to: process.env.CONTRACT_ADDRESS,
            gas: this.web3.utils.toHex(545200), // 30400
            gasPrice: await this.web3.eth.getGasPrice(),//this.web3.eth.gasPrice(), //'0x9184e72a000', // 10000000000000
            // value: '', // 2441406250 web3.utils.toHex(web3.utils.toWei('0.1', 'ether'))
            data: encoded_data
        }
        try {
            const tx_signed = await this.web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY_PayBack);
            console.log(tx_signed);
            const tx_sent = await this.web3.eth.sendSignedTransaction(tx_signed.rawTransaction);
            return tx_sent;

        } catch (err) {
            console.error("Couldn't sign transaction.", err);
            return err;
        }
    }

    public async getPartnerId(_addr: string): Promise<number> {
        const res_bigInt = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
        const res_number = Number(res_bigInt);
        console.log(res_number)
        return res_number;
    }

    public async getContractInfo(): Promise<any> {
        try {
            const res = {
                name: await this.PayBackContract.methods.name().call(),
                symbol: await this.PayBackContract.methods.symbol().call(),
                totalSupply: Number(await this.PayBackContract.methods.totalSupply().call()),
            }
            return res;
        } catch (err: any) {
            console.error("Couldn't gather contract info.");
            return err;
        }
    }

    public async getCurrentTime():Promise<any>{
        try {
            const res = await this.PayBackContract.methods.getCurrentTime().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read current time.");
            return err;
        }
    }
    public async getNumPartners():Promise<any>{
        try {
            const res = await this.PayBackContract.methods.numPartner().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numPartner.");
            return err;
        }
    }
    public async getNumClients():Promise<any>{
        try {
            const res = await this.PayBackContract.methods.numClient().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numClients.");
            return err;
        }
    }
}