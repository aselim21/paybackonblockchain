# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Running Smart Contracts with Truffle

1. Create a folder "payback-token-hardhat" and navigate there.
2. Run ```npm init```
3. To install hardhat run 
```npm i --save-dev hardhat```
4. To create a hardhat project run 
```npx hardhat```
5. If recomenden from the previous step run this and others:
```npm install --save-dev "hardhat@^2.15.0" "@nomicfoundation/hardhat-toolbox@^3.0.0"```
6. If you need install the ERC Smart Contracts from OpenZeppelin
```npm i @openzeppelin/contracts```
7.  Place your smart contracts in /contracts.
8. Go to hardhat.config.js and fix the solidity vesion, so its the same everywhere
9. To compile your code run 
```npx hardhat compile```

## To deploy to the Goerli Testnet:
1. create .env file
```shell
PRIVATE_KEY=0119...
INFURA_GOERLI_ENDPOINT=https://goerli.infura.io/v3/e626...
```
2. Install dotenv
```npm i dotenv```
3. Go to /scripts/deploy.js and change the file:
```shell
const hre = require("hardhat");

async function main() {
  const PayBackToken = await hre.ethers.getContractFactory("PayBackToken");
                                                //Name, Symbol, InitialSupply, Decimals
  const payback_token = await PayBackToken.deploy("PayBackToken", "PBT", 1000, 0);

  await payback_token.deployed();

  console.log("PayBackToken deployed: ", payback_token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
4. Go to hardhat.config.js and update it by adding this part under "networks":
```shell
goerli:{
      url:process.env.INFURA_GOERLI_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY]
    }
```
5. To deploy run 
```npx hardhat run --network goerli scripts/deploy.js```
