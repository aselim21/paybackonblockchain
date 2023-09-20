// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

/**
 * @title Owner
 * @dev Set owner
 */
contract Owner {
    address internal _owner;

    modifier isOwner() {
        require(msg.sender == _owner, "Owner: Caller is not owner");
        _;
    }
    modifier addrNotNull(address _addr) {
        require(_addr != address(0), "Entered address is null.");
        _;
    }

    /**
     * @dev Set contract deployer as owner
     */
    constructor() {
        _owner = msg.sender;
    }

    /**
     * @dev Return owner address
     * @return address of owner
     */
    function getOwner() external view returns (address) {
        return _owner;
    }
}
