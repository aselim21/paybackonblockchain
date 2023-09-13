// https://blog.infura.io/post/getting-started-with-infura-28e41844cc89
const PayBackLocker = artifacts.require("PayBackLocker");

module.exports = async function (deployer) {
    try {
        await deployer.deploy(PayBackLocker);

        // Get the deployed instance
        const PayBackLockerInstance = await Donations.deployed(PayBackLocker);

        console.log("Donations contract deployed at:", PayBackLockerInstance.address);

    } catch (error) {

        console.error("Error deploying the contract:", error);
    }
};