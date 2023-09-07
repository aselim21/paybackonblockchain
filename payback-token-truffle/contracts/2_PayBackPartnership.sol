// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./1_Owner.sol";

contract PayBackPartnership is Owner {
    //-------------------------Variables-------------------------
    uint256 public numPartner; // starting from 1

    struct Partner {
        string name;
        address payable walletAddr;
        string currency;
        uint256 valueForToken;
    }

    Partner[] public partners; // id is numPartner, 0 is Empty
    // mapping(uint256 => address) public partnerIdToAddr;
    // mapping(address => Partner) public addrToPartner;

    mapping(address => uint256) public addrToPartnerId;

    //-------------------------Constructor-------------------------
    constructor() {
        numPartner = 0;
        // first partner is Empty
        Partner memory newPartner = Partner("", payable(address(0)), "", 0);
        partners.push(newPartner);
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
        require(_addr != address(0), "Partner: Entered address is null.");
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
        // An address can be partner once
        require(
            addrToPartnerId[_addr] == 0,
            "Partner: The address is already a partner!"
        );

        require(_addr != _owner, "Partner: The owner cannot be a partner!");

        //check that the _valueForToken is minimum 1
        require(
            _valueForToken >= 1,
            "Partner: The value for a Token should be at least 1 in the currency."
        );

        //save the new Partner
        Partner memory newPartner = Partner(
            _name,
            _addr,
            _currency,
            _valueForToken
        );
        partners.push(newPartner);
        ++numPartner; //starts from 1
        addrToPartnerId[_addr] = numPartner;

        //verify that there is no error betweeen numPartner as id and array index
        assert(partners[numPartner].walletAddr == _addr);
        emit PartnerAdded(numPartner, _name);
        return true;
    }

    function calcPointsToEarn(uint256 _roundValue, uint256 _partnerId)
        public
        view
        returns (uint256)
    {
        //_roundValue is the value without the 2 decimals rounded
        Partner storage p = partners[_partnerId];
        //the devision doesn't consider the values after decimal :)
        uint256 tokens = _roundValue / p.valueForToken;
        return tokens;
    }

    function removePartner(uint256 _id) isOwner public virtual {
        //to remove the partner, the  partner should first transfer his tokens to the owner and then the owner can delete the entry.
        // what if the partner doesn't transfer all of his tokens??????
        // it should be okay that the admin leaves the tokens there...if he should not still hold assets to secure this tokens.
        // https://blog.cryptostars.is/stablecoin-development-8cb6329973b2
        // https://www.coindesk.com/price/tether/
        // also, payback should hold the total amout in the reserve. So this means that we should transfer the tokens back to us.
        
        Partner storage p = partners[_id];
        // get partner address.
        addrToPartnerId[p.walletAddr] = 0;
        delete partners[_id];
    }

    // function sendTokensToPartner(uint256 _partnerId) private {
    //     //TODO : check if there are enough available tokens from the token supply
    //     // require!
    //     Partner storage the_partner = IdToPartner[_partnerId];

    //     the_partner.
    // }
}
