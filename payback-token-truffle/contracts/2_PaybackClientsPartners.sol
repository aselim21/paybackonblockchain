// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./1_Owner.sol";

contract PaybackClientsPartners is Owner {

    struct Partner {
        string name;
        address payable walletAddr;
        string currency;
        uint256 valueForToken;
    }

    uint256 public numPartner; // starting from 1
    Partner[] public partners; // id is numPartner, 0 is Empty
    mapping(address => uint256) public addrToPartnerId;

    mapping(address => uint256) public addrToClientId;
    uint256 public numClient; //last client id.. if 0, no clients

    constructor() {
        numPartner = 0;
        numClient = 0;
        // first partner is empty
        Partner memory newPartner = Partner("", payable(address(0)), "", 0);
        partners.push(newPartner);
    }

    event PartnerAdded(uint256 partnerId, string name);

    function addPartner(
        string memory _name,
        address payable _addr,
        string memory _currency,
        uint256 _valueForToken
    ) public isOwner addrNotNull(_addr) returns (bool) {
        
        // Every partner should have a unique address
        require(
            addrToPartnerId[_addr] == 0,
            "Partner: The address is already a partner."
        );

        require(_addr != _owner, "Partner: The owner cannot be a partner.");

        require(
            addrToClientId[_addr] == 0,
            "Partner: A client cannot be a partner."
        );

        //check that the _valueForToken is at least 1
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

        //reasure that there is no error betweeen numPartner as id and array index
        assert(partners[numPartner].walletAddr == _addr);
        emit PartnerAdded(numPartner, _name);

        return true;
    }

    function calcPointsToEarn(uint256 _roundValue, uint256 _partnerId)
        public
        view
        returns (uint256)
    {
        Partner storage p = partners[_partnerId];
        //the devision doesn't consider the values after decimal
        uint256 tokens = _roundValue / p.valueForToken;
        return tokens;
    }

    function removePartner(uint256 _id) public virtual isOwner {
        Partner storage p = partners[_id];
        addrToPartnerId[p.walletAddr] = 0;
        delete partners[_id];
    }

    /**
     * @dev Owner can add new clients
     * @return new client id
     */
    function addClient(address _addr)
        public
        isOwner
        addrNotNull(_addr)
        returns (uint256)
    {
        //check if client already exists
        require(addrToClientId[_addr] == 0, "Client: Client already exists");

        //shouldn't be a partner
        require(
            addrToPartnerId[_addr] == 0,
            "Client: The address is already a partner!"
        );
        //shouldn't be the owner
        require(_addr != _owner, "Client: Contract owner cannot be a client");

        //register client
        ++numClient;
        addrToClientId[_addr] = numClient;

        return numClient;
    }
}
