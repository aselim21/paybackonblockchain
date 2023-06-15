// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../MyToken.sol";
import "hardhat/console.sol";

//A token on Ethereum is basically just a smart contract that follows some common rules CRYPTOZOMBIE

contract PayBackToken2 is ERC20, PayBackToken {
    constructor() ERC20("PayBackToken", "PBT") {}
}
