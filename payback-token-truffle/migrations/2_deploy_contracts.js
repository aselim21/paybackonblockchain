const PayBackToken = artifacts.require("PayBackToken");
	
module.exports = function(deployer) {
    deployer.deploy(PayBackToken, "PayBackToken", "PBT", 1000000, 0);
}