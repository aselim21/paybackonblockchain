const PayBackLocker = artifacts.require("PayBackLocker");
	
module.exports = function(deployer) {
    deployer.deploy(PayBackLocker);
}