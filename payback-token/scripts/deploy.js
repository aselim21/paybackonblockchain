const hre = require("hardhat");

async function main() {
  const PayBackToken = await hre.ethers.getContractFactory("PayBackToken");
                                                //Name, Symbol, InitialSupply, Decimals
  const payback_token = await PayBackToken.deploy("PayBackToken", "PBT", 1000, 0);

  await payback_token.deployed();

  console.log("PayBackToken deployed: ", payback_token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
