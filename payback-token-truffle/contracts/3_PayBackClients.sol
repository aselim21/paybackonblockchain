// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./2_PayBackPartnership.sol";

contract PayBackClients is PayBackPartnership {
    using SafeMath for uint256;

    mapping(address => uint256) internal _clientAddrToId;
    //Maybe: extra
    // address[] public clientAddresses;
    uint256 public numClient; //last id.. if 0, no clients

    event ClientCreated(address indexed _addr);

    // event Transfer(address indexed from, address indexed to, uint256 value);
    constructor() {
        numClient = 0;
    }

    modifier isClient(address _addr) {
        require(
            _clientAddrToId[_addr] != 0,
            "This address is not a client"
        );
        _;
    }

    function addClient(address _addr)
        public
        isOwner
        addrNotNull(_addr)
        returns (uint256)
    {
        //is not partner
        Partner storage p = addrToPartner[_addr];
        require(p.walletAddr == address(0), "Partner cannot be a client");
        //is not owner
        require(_addr != _owner, "Contract owner cannot be a client");
        //check if client already exists
        require(_clientAddrToId[_addr] == 0, "Client already exists");

        numClient = numClient.add(1);

        _clientAddrToId[_addr] = numClient;
        emit ClientCreated(_addr);
        //Maybe: extra
        // clientAddresses[numClient]=_addr;

        return numClient;
    }

    function getClientId(address _addr) public view returns (uint256) {
        return _clientAddrToId[_addr];
    }
    //Maybe: extra
    // function getClientAddr(uint256 _id) public view returns(address){
    //     return clientAddresses[_id];
    // }
}
