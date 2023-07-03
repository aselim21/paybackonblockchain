const PayBackToken = artifacts.require("PayBackToken");
	
module.exports = function(deployer) {
    deployer.deploy(PayBackToken, "PayBackToken", "PBT", 100000000, 0); //100m
}