const PayBackToken = artifacts.require("3_PayBackToken");
	
module.export = function(deployer) {
    deployer.deploy(PayBackToken);
}
