// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./2_PayBackPartnership.sol";

contract PayBackClients is PayBackPartnership {
    mapping(address => uint256) public addrToClientId;
    //Maybe: extra.. like this if you dont know the address they cannot see you. Which is a little bit of protection
    // mapping(address => bool) internal _clientAddrToActive;
    // address[] public clientAddresses;
    uint256 public numClient; //last id.. if 0, no clients

    event ClientRegistered(address indexed _addr);

    // event Transfer(address indexed from, address indexed to, uint256 value);
    constructor() {
        numClient = 0;
    }

    modifier isClient(address _addr) {
        require(
            addrToClientId[_addr] != 0,
            "Client: This address is not a client"
        );
        _;
    }

    //TODO : Fix in the frontend
    function addClient(address _addr)
        public
        isOwner
        addrNotNull(_addr)
        returns (uint256)
    {
        //is not partner
        require(
            addrToPartnerId[_addr] == 0,
            "Partner: The address is already a partner!"
        );
        //is not owner
        require(_addr != _owner, "Client: Contract owner cannot be a client");
        //check if client already exists
        require(addrToClientId[_addr] == 0, "Client: Client already exists");

        ++numClient;
        addrToClientId[_addr] = numClient;
 
        emit ClientRegistered(_addr);
        return numClient;
    }

    // function getClientId(address _addr) public view returns (uint256) {
    //     return clientAddrToId[_addr];
    // }
    //so that a user can be created in a non active state (which means that he can only gather points but not return them)
    // function getClientStatus(address _addr) public view isOwner returns (bool){
    //     return _clientAddrToActive[_addr];
    // }
    //Maybe: extra
    // function getClientAddr(uint256 _id) public view returns(address){
    //     return clientAddresses[_id];
    // }
}
