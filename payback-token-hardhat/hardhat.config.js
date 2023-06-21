require("@nomicfoundation/hardhat-toolbox");
require("../payback-token-truffle/node_modules/dotenv/lib/main").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks:{
    goerli:{
      url:process.env.INFURA_GOERLI_ENDPOINT,
      accounts:[process.env.PRIVATE_KEY]
    },
    development:{
      host:"localhost",
      port:9545,
      network_id:"*"
  }
  }
};
