# Running Smart Contracts with Truffle

1. Create a folder "payback-token-truffle" and navigate there.
2. Install Truffle
```npm i truffle -g```
3. Create initial project
```truffle init```
4. Place your smart contracts in /contracts. If you want to use ERC standards run ```npm i @openzeppelin/contracts```
5. Compile your code
```truffle compile```
6. Update the truffle-config.js by adding this part under "networks":
```  development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 9545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },```
7. Run ```truffle develop```
8. In order to deploy create a "deployment.js" under "/migrations"
```const PayBackToken = artifacts.require("3_PayBackToken");
	
module.export = function(deployer) {
    deployer.deploy(PayBackToken);
}
```
9. Run ```truffle migrate --network development```
10. To run tests ```truffle test```