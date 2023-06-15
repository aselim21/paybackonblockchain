// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./1_Owner.sol";

contract PayBackPartnership is Owner{

    //-------------------------Variables-------------------------
    uint256 public numPartner; // starting from 1 ? Maybe fix?

    struct Partner {
        string name;
        address payable walletAddr;
        uint256 tokens_nr;
        bool tokensSent;
    }

    Partner[] public partners; // starting from 0
    mapping(address => Partner) public addrToPartner;
    mapping(uint256 => Partner) private _IdToPartner;

    //-------------------------Constructor-------------------------
    constructor() {
        numPartner = 0;
    }

    //-------------------------Modifiers-------------------------

    modifier isNotPartner(address _addr) {
        Partner storage p = addrToPartner[_addr];
        require(
            p.walletAddr == address(0),
            "Requested address is already a partner!"
        );
        _;
    }

    modifier validatePartnerAddr(address _addr) {
        require(_addr != address(0), "Requested address is empty.");
        _;
    }

    //-------------------------Events-------------------------

    event PartnerAdded(uint256 partnerId, string name, uint256 tokens_nr);

    //-------------------------Functions-------------------------


    // modifier isPartner(address _addr) {
    //     // address emptyAddr;
    //     Partner memory p = addrToPartner[_addr];

    //     require(p != Partner("", 0, address(0x0000000000000000000000000000000000000000)), "Requested address is not a partner!");
    //     _;
    // }

    // modifier isNotPartner(address _addr) {
    //     Partner memory p = addrToPartner[_addr];
    //     require(p == Partner("", 0, "0x0000000000000000000000000000000000000000"), "Requested address is already a partner!");
    //     _;
    // }

    function addPartner(
        string memory _name,
        address payable _addr,
        uint256 _tokens
    ) public isOwner returns (bool) {
        //search for existing partner
        Partner storage p = addrToPartner[_addr];

        //check if the address is already a partner
        require(
            p.walletAddr == address(0),
            "Requested address is already a partner!"
        );

        //check that the address is not the owner
        require(
            _addr != _owner,
            "Requested address is not valid, its the owner!"
        );

        //check that the address is valid
        require(_addr != address(0), "Requested address is empty.");

        //check if requested tokens are more than 100?
        require(_tokens >= 100, "The requested tokens do not correspond with the minimum requirement 100.");

        //save the new Partner
        Partner memory newPartner = Partner(_name, _addr, _tokens, false);
        partners.push(newPartner);

        //increase the numbers/id of the partners
        //first id is 1
        numPartner++;

        //fix the mappings
        addrToPartner[_addr] = newPartner;
        _IdToPartner[numPartner] = newPartner;

        //TODO: Send tokens
        // sendTokensToPartner(numPartner);?
        emit PartnerAdded(numPartner, _name, _tokens);
        return true;
    }

    // function sendTokensToPartner(uint256 _partnerId) private {
    //     //TODO : check if there are enough available tokens from the token supply
    //     // require!
    //     Partner storage the_partner = IdToPartner[_partnerId];

    //     the_partner.
    // }
}
