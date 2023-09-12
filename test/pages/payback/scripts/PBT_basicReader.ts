import { setTimeout } from 'timers/promises';
import abi from '../../../public/ABI_PayBackToken.json'
import Web3 from 'web3';
import Partner from '../../../public/data_structures';


export default class PBT_basicReader {
    private web3: any;
    public PayBackContract: any;
    // private PRIVATE_KEY = process.env.PRIVATE_KEY_PayBack;
    // private PUBLIC_KEY = process.env.PUBLIC_KEY_PayBack;

    public constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL!));
        // this.web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY_PayBack}`);
        this.PayBackContract = new this.web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
    }

    public async getOwner(): Promise<string> {
        const res = await this.PayBackContract.methods.getOwner().call();
        return res;
    }

    public async getPartnerId(_addr: string): Promise<number> {
        try {
            const res_bigInt = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            const res_number = Number(res_bigInt);
            return res_number;
        } catch (err: any) {
            console.error("Couldn't get partner id of addr:", _addr);
            return err;
        }
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

    public async getCurrentTime(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.getCurrentTime().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read current time.");
            return err;
        }
    }
    public async getNumPartners(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.numPartner().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numPartner.");
            return err;
        }
    }
    public async getNumClients(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.numClient().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numClients.");
            return err;
        }
    }

    public async getPartner(_id: number): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.partners(_id).call();
            // console.log(res);
            return new Partner(_id, res.name, res.walletAddr, res.currency, Number(res.valueForToken));
        } catch (err: any) {
            console.error("Couldn't get partner with id: ", _id);
            return err;
        }
    }

    public async getAllPartners(): Promise<Partner[]> {
        let arr: Partner[] = [];
        try {
            const nr = await this.getNumPartners();
            for (let i = 1; i <= nr; i++) {
                const p = await this.getPartner(i);
                arr.push(p);
            }
            return arr;
        } catch (err: any) {
            console.error("Couldn't get partners.");
            return err;
        }
    }

    public async getPartnerID(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            return res;
        } catch (err: any) {
            console.error("Couldn't get partner with addr: ", _addr);
            return err;
        }
    }
    public async getClientID(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.addrToClientId(_addr).call();
            return res;
        } catch (err: any) {
            console.error("Couldn't get client with addr: ", _addr);
            return err;
        }
    }
    public async getBalanceOf(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.balanceOf(_addr).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get balance of: ", _addr);
            return err;
        }
    }
    public async getLockedBalanceOf(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.lockedBalanceOf(_addr).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get locked balance of: ", _addr);
            return err;
        }
    }

    public async getAllowance(_owner: string, _spender: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.allowance(_owner, _spender).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get allowance of owner: ", _owner, " and spender: ", _spender);
            return err;
        }
    }

    public async getTransferredFromAllowance(_owner: string, _spender: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.transferredFromAllowance(_owner, _spender).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get transferred of allowance of owner: ", _owner, " and spender: ", _spender);
            return err;
        }
    }

    public async getPointsToEarn(_roundValue: number, _partnerId: number): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.calcPointsToEarn(_roundValue, _partnerId).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get points to earn of round value: ", _roundValue, " and partnerID: ", _partnerId);
            return err;
        }
    }

      

    public async getNumberOfLockedItems(_locker: string, _receiver: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.getNrLockedItems(_locker, _receiver).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get number of locked items for locker:", _locker, " and receiver: ", _receiver);
            return err;
        }
    }

    public async getLockedItem(_locker: string, _receiver: string, _id: number): Promise<{amount:number, releaseDate:number}> {
        try {
            console.log("calling")
            const res = await this.PayBackContract.methods.getLockedItem(_locker, _receiver, _id).call();
            return {amount: Number(res[0]), releaseDate: Number(res[1])};
        } catch (err: any) {
            console.error("Couldn't get the locked item with id:", _id, " for locker:", _locker, " and receiver: ", _receiver);
            return err;
        }
    }
}