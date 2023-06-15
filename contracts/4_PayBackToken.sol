// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./3_StandardToken.sol";
import "./2_PayBackPartnership.sol";

contract PayBackToken is StandardToken, PayBackPartnership {
    constructor() StandardToken("PayBackToken", "PBT") {

    }
    //TODO andere Funktionen, die hier überschrieben werden sollen... für diesen Fall mit partnership!
}
