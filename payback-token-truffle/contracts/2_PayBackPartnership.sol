// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./1_Owner.sol";

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract PayBackPartnership is Owner{

    using SafeMath for uint256;
    //-------------------------Variables-------------------------
    uint256 public numPartner; // starting from 1 ? Maybe fix?

    struct Partner {
        string name;
        address payable walletAddr;
        string currency;
        uint256 valueForToken;
    }

    Partner[] public partners; // starting from 0
    mapping(address => Partner) public addrToPartner;
    // mapping(uint256 => Partner) private _IdToPartner;

    //-------------------------Constructor-------------------------
    constructor() {
        numPartner = 0;
    }

    //-------------------------Modifiers-------------------------

    // modifier isNotPartner(address _addr) {
    //     Partner storage p = addrToPartner[_addr];
    //     require(
    //         p.walletAddr == address(0),
    //         "Requested address is already a partner!"
    //     );
    //     _;
    // }

    modifier addrNotNull(address _addr) {
        require(_addr != address(0), "Entered address is null.");
        _;
    }
    // modifier addrIsPartner(address _addr) {
    //     Partner storage p = addrToPartner[_addr];
    //     require(p.walletAddr != address(0), "Entered address is not a partner!");
    //     _;
    // }

    //-------------------------Events-------------------------

    event PartnerAdded(uint256 partnerId, string name);

    //-------------------------Functions-------------------------

    function addPartner(
        string memory _name,
        address payable _addr,
        string memory _currency,
        uint256 _valueForToken
    ) public isOwner addrNotNull(_addr) returns (bool) {
        //search for existing partner
        Partner storage p = addrToPartner[_addr];

        //check if the address is already not a partner
        require(
            p.walletAddr == address(0),
            "Entered address is already a partner!"
        );

        //check that the address is not the owner
        require(
            _addr != _owner,
            "The owner cannot be a partner!"
        );

         //check that the _valueForToken is minimum 1
        require(
            _valueForToken >= 1,
            "The value for a Token should be at least 1 in the currency."
        );

        //check if requested tokens are more than 100?
        // require(_tokens >= 100, "The requested tokens do not correspond with the minimum requirement 100.");

        //save the new Partner
        Partner memory newPartner = Partner(_name, _addr, _currency, _valueForToken);
        partners.push(newPartner);

        //increase the numbers/id of the partners
        //first id is 1
        numPartner.add(1);

        //fix the mappings
        addrToPartner[_addr] = newPartner;
        // _IdToPartner[numPartner] = newPartner;

        //TODO: Send tokens
        // sendTokensToPartner(numPartner);?
        emit PartnerAdded(numPartner, _name);
        return true;
    }

    function calcPointsToEarn(uint256 _roundValue, uint256 _partnerId) public view returns (uint256){
        //_roundValue is the value without the 2 decimals rounded
        Partner storage p = partners[_partnerId];
        //the devision doesn't consider the values after decimal :)
        uint256 tokens = _roundValue.div(p.valueForToken);
        return tokens;
    }



    // function sendTokensToPartner(uint256 _partnerId) private {
    //     //TODO : check if there are enough available tokens from the token supply
    //     // require!
    //     Partner storage the_partner = IdToPartner[_partnerId];

    //     the_partner.
    // }
}
