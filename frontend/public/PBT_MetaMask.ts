import abi from './ABI_PayBackToken.json'
import Web3 from 'web3';
import Partner from './data_structures';

export default class PBT_MetaMask {
    private web3: any;
    public PayBackContract: any;
    private account: string;

    public constructor(_addr: string) {
        this.web3 = new Web3(window.ethereum);
        this.account = _addr;
        this.PayBackContract = new this.web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
    }

    public async getOwner(): Promise<string> {
        const res = await this.PayBackContract.methods.getOwner().call();
        console.log(res)
        return res;
    }


    public async getPartnerId(_addr: string): Promise<number> {
        try {
            const res_bigInt = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            const res_number = Number(res_bigInt);
            return res_number;
        } catch (err: any) {
            console.error("Couldn't get partner id of addr:", _addr);
            throw err;
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
            throw err;
        }
    }

    public async getCurrentTime(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.getCurrentTime().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read current time.");
            throw err;
        }
    }
    public async getNumPartners(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.numPartner().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numPartner.");
            throw err;
        }
    }
    public async getNumClients(): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.numClient().call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't read numClients.");
            throw err;
        }
    }

    public async getPartner(_id: number): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.partners(_id).call();
            console.log(res);
            return new Partner(_id, res.name, res.walletAddr, res.currency, Number(res.valueForToken));
        } catch (err: any) {
            console.error("Couldn't get partner with id: ", _id);
            throw err;
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
            throw err;
        }
    }

    public async getPartnerID(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.addrToPartnerId(_addr).call();
            return res;
        } catch (err: any) {
            console.error("Couldn't get partner with addr: ", _addr);
            throw err;
        }
    }
    public async getClientID(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.addrToClientId(_addr).call();
            return res;
        } catch (err: any) {
            console.error("Couldn't get client with addr: ", _addr);
            throw err;
        }
    }
    public async getBalanceOf(_addr: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.balanceOf(_addr).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get balance of: ", _addr);
            throw err;
        }
    }

    public async getAllowance(_owner: string, _spender: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.allowance(_owner, _spender).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get allowance of owner: ", _owner, " and spender: ", _spender);
            throw err;
        }
    }

    public async getTransferredFromAllowance(_owner: string, _spender: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.transferredFromAllowance(_owner, _spender).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get transferred of allowance of owner: ", _owner, " and spender: ", _spender);
            throw err;
        }
    }

    public async getPointsToEarn(_roundValue: number, _partnerId: number): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.calcPointsToEarn(_roundValue, _partnerId).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get points to earn of round value: ", _roundValue, " and partnerID: ", _partnerId);
            throw err;
        }
    }

    public async transfer(_to: string, _amount: number): Promise<any> {

        try {
            // ---------------------------Working Metamask!--------------------------
            //calculate gas and gas price
            // const gasLimitBuffer = 1.2; // 20% buffer
            // const gasPriceBuffer = 1.5; // 50% buffer

            const gasEstimate = await this.PayBackContract.methods.transfer(_to, _amount).estimateGas({ from: this.account });
            const gasPrice = await this.web3.eth.getGasPrice();

            // const finalGasLimit: number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            // const finalGasPrice: number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const data = this.PayBackContract.methods.transfer(_to, _amount).encodeABI();
            const txObject = {
                from: this.account,
                to: process.env.CONTRACT_ADDRESS,
                gasPrice: gasPrice,
                gas: Number(gasEstimate),
                // nonce: nonce,
                data: data,
            };
            await this.web3.eth.sendTransaction(txObject)
                .on('sending', (hash:any) => {
                    console.log(`sending: ${hash}`);
                })
                .on('sent', (hash:any) => {

                    console.log(`sent: ${hash}`);
                })
                .on('transactionHash', (hash: any) => {

                    console.log(`Transaction sent with hash: ${hash}`);
                })
                .on('receipt', (hash: any) => {

                    console.log(`receipt: ${hash}`);
                })
                .on('confirmation', (receipt: any) => {
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
           
                })
                .on('error', (error: any) => {
                    console.log(error)
                });
        } catch (error) {
            console.error(error);
            return error;

        }
    }

    public async transferFrom(_from: string, _to: string, _amount: number): Promise<any> {
        
        try {
            // ---------------------------Working Metamask!--------------------------
            //calculate gas and gas price
            // const gasLimitBuffer = 1.2; // 20% buffer
            // const gasPriceBuffer = 1.5; // 50% buffer

            const gasEstimate = await this.PayBackContract.methods.transferFrom(_from, _to, _amount).estimateGas({ from: this.account });
            const gasPrice = await this.web3.eth.getGasPrice();

            // const finalGasLimit: number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            // const finalGasPrice: number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const data = this.PayBackContract.methods.transferFrom(_from, _to, _amount).encodeABI();
            const txObject = {
                from: this.account,
                to: process.env.CONTRACT_ADDRESS,
                gasPrice: Number(gasPrice),
                gas: Number(gasEstimate),
                // nonce: nonce,
                data: data,
            };
            await this.web3.eth.sendTransaction(txObject)
                .on('sending', (hash:any) => {
                    console.log(`sending: ${hash}`);
                })
                .on('sent', (hash:any) => {

                    console.log(`sent: ${hash}`);
                })
                .on('transactionHash', (hash: any) => {

                    console.log(`Transaction sent with hash: ${hash}`);
                })
                .on('receipt', (hash: any) => {

                    console.log(`receipt: ${hash}`);
                })
                .on('confirmation', (receipt: any) => {
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
           
                })
                .on('error', (error: any) => {
                    console.log(error)
                });
        } catch (error) {
            console.error(error);
            return error;

        }
    }


    public async lock(_receiver: string, _amount: number, _unlockEpochDateInSec: number): Promise<any> {
        try {
            // ---------------------------Working Metamask!--------------------------
            //calculate gas and gas price
            // const gasLimitBuffer = 1.2; // 20% buffer
            // const gasPriceBuffer = 1.5; // 50% buffer

            const gasEstimate = await this.PayBackContract.methods.lock(_receiver, _amount, _unlockEpochDateInSec).estimateGas({ from: this.account });
            const gasPrice = await this.web3.eth.getGasPrice();

            // const finalGasLimit: number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            // const finalGasPrice: number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const data = this.PayBackContract.methods.lock(_receiver, _amount, _unlockEpochDateInSec).encodeABI();
            const txObject = {
                from: this.account,
                to: process.env.CONTRACT_ADDRESS,
                gasPrice: Number(gasPrice),
                gas: Number(gasEstimate),
                // nonce: nonce,
                data: data,
            };
            await this.web3.eth.sendTransaction(txObject)
                .on('sending', (hash:any) => {
                    console.log(`sending: ${hash}`);
                })
                .on('sent', (hash:any) => {

                    console.log(`sent: ${hash}`);
                })
                .on('transactionHash', (hash: any) => {

                    console.log(`Transaction sent with hash: ${hash}`);
                })
                .on('receipt', (hash: any) => {

                    console.log(`receipt: ${hash}`);
                })
                .on('confirmation', (receipt: any) => {
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
           
                })
                .on('error', (error: any) => {
                    console.log(error)
                });
        } catch (error) {
            console.error(error);
            return error;

        }
    }
    public async approve(_spender: string, _amount: number): Promise<any> {
        try {
            // ---------------------------Working Metamask!--------------------------
            //calculate gas and gas price
            // const gasLimitBuffer = 1.2; // 20% buffer
            // const gasPriceBuffer = 1.5; // 50% buffer

            const gasEstimate = await this.PayBackContract.methods.approve(_spender, _amount).estimateGas({ from: this.account });
            const gasPrice = await this.web3.eth.getGasPrice();

            // const finalGasLimit: number = Math.ceil(Number(gasEstimate) * gasLimitBuffer);
            // const finalGasPrice: number = Math.ceil(Number(gasPrice) * gasPriceBuffer);

            const data = this.PayBackContract.methods.approve(_spender, _amount).encodeABI();
            const txObject = {
                from: this.account,
                to: process.env.CONTRACT_ADDRESS,
                gasPrice: Number(gasPrice),
                gas: Number(gasEstimate),
                // nonce: nonce,
                data: data,
            };
            await this.web3.eth.sendTransaction(txObject)
                .on('sending', (hash:any) => {
                    console.log(`sending: ${hash}`);
                })
                .on('sent', (hash:any) => {

                    console.log(`sent: ${hash}`);
                })
                .on('transactionHash', (hash: any) => {

                    console.log(`Transaction sent with hash: ${hash}`);
                })
                .on('receipt', (hash: any) => {

                    console.log(`receipt: ${hash}`);
                })
                .on('confirmation', (receipt: any) => {
                    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
           
                })
                .on('error', (error: any) => {
                    console.log(error)
                });
        } catch (error) {
            console.error(error);
            return error;

        }
    }

   
    // public async reduceItemTokens(_receiver: string, _id: number, _amount: number): Promise<any> {
    //     const encoded_data = this.PayBackContract.methods.reduceItemTokens(_receiver, _id, _amount).encodeABI();

    //     var tx = {
    //         from: process.env.PUBLIC_KEY_PayBack,
    //         to: process.env.CONTRACT_ADDRESS,
    //         gas: this.web3.utils.toHex(545200), // 30400
    //         gasPrice: await this.web3.eth.getGasPrice(),//this.web3.eth.gasPrice(), //'0x9184e72a000', // 10000000000000
    //         // value: '', // 2441406250 web3.utils.toHex(web3.utils.toWei('0.1', 'ether'))
    //         data: encoded_data
    //     }
    //     try {
    //         const tx_signed = await this.web3.eth.accounts.signTransaction(tx, this.PRIVATE_KEY);
    //         console.log(tx_signed);
    //         const tx_sent = await this.web3.eth.sendSignedTransaction(tx_signed.rawTransaction);
    //         return tx_sent;
    //     } catch (err) {
    //         console.error("Couldn't sign transaction.", err);
    //         throw err;
    //     }
    // }

    public async getNumberOfLockedItems(_locker: string, _receiver: string): Promise<any> {
        try {
            const res = await this.PayBackContract.methods.getNrLockedItems(_locker, _receiver).call();
            return Number(res);
        } catch (err: any) {
            console.error("Couldn't get number of locked items for locker:", _locker, " and receiver: ", _receiver);
            throw err;
        }
    }

    public async getLockedItem(_locker: string, _receiver: string, _id: number): Promise<{ amount: number, releaseDate: number }> {
        try {
            console.log("calling")
            const res = await this.PayBackContract.methods.getLockedItem(_locker, _receiver, _id).call();
            return { amount: Number(res[0]), releaseDate: Number(res[1]) };
        } catch (err: any) {
            console.error("Couldn't get the locked item with id:", _id, " for locker:", _locker, " and receiver: ", _receiver);
            throw err;
        }
    }
}
