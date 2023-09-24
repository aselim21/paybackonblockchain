// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./3_PaybackToken.sol";

//(https://www.payback.group/de/payback-group/ueber-payback/daten-und-fakten)
// Gesammelte Punkte im Wert von 500 Mio. EUR => 50 Mrd. Tokens

contract PaybackLocker is PaybackToken("PayBackToken", "PBT", 1000000, 0, 300) {
    struct Item {
        uint256 amount;
        uint256 unlockDate;
    }

    mapping(address => mapping(address => Item[]))
        private lockerToReceiverToItem;

    mapping(address => uint256) public lockedBalanceOf;

    event Locked(address locker, address receiver, uint256 id);
    event Released(address locker, address receiver, uint256 id);

    /**
     * @dev Transfers the _amount of tokens from the msg.senders account 
     * to this contract until the _unlockDate
     * @param _receiver - The address where tokens should be transferred 
     * after time is up.
     * 
     * locking is done by the contract owner or partner
     * @return A uint specifying the id of the locked item.
     */
    function lock(
        address _receiver,
        uint256 _amount,
        uint256 _unlockDate
    ) public returns (uint256) {
        require(
            addrToPartnerId[msg.sender] != 0 || msg.sender == _owner,
            "Locker: Only partners or owner can lock."
        );

        // case 1. sender is owner
        if (msg.sender == _owner) {
            require(
                addrToPartnerId[_receiver] != 0,
                "ERC20: Owner can only lock transactions to partners."
            );
        }
        //case 2. sender is partner
        else if (addrToPartnerId[msg.sender] != 0) {
            require(
                addrToClientId[_receiver] != 0 || _receiver == _owner,
                "ERC20: Partners can only lock transactions to clients and owner."
            );
        }
        _transfer(msg.sender, _contractAddr, _amount);

        Item memory newItem = Item(_amount, _unlockDate);
        lockerToReceiverToItem[msg.sender][_receiver].push(newItem);
        lockedBalanceOf[_receiver] += _amount;
        uint256 id = lockerToReceiverToItem[msg.sender][_receiver].length - 1;
        emit Locked(msg.sender, _receiver, id);

        return id;
    }

    // @dev Enables the contract owner to release locked items if their unlockDate allows
    function releaseLock(
        address _locker,
        address _receiver,
        uint256 _id
    ) public isOwner {
        //https://medium.com/coinmonks/solidity-storage-vs-memory-vs-calldata-8c7e8c38bce
        Item memory the_item = lockerToReceiverToItem[_locker][_receiver][_id];

        require(
            the_item.unlockDate <= block.timestamp,
            "Locker: It is early to release the tokens."
        );

        _transfer(_contractAddr, _receiver, the_item.amount);
        lockedBalanceOf[_receiver] -= the_item.amount;
        delete lockerToReceiverToItem[_locker][_receiver][_id];
        emit Released(_locker, _receiver, _id);
    }

    // @dev Lets the locker to alter the locked amount before the release Date is due.
    function reduceItemTokens(
        address _receiver,
        uint256 _id,
        uint256 _amount
    ) public {
        require(
            addrToPartnerId[msg.sender] != 0 || msg.sender == _owner,
            "Locker: Only partners or owner can alter a lock."
        );
        Item memory the_item = lockerToReceiverToItem[msg.sender][_receiver][
            _id
        ];

        require(the_item.amount > _amount, "Locker: Amount is too high.");

        require(
            the_item.unlockDate > block.timestamp,
            "Locker: Option reducing locked tokens is expired."
        );
        lockerToReceiverToItem[msg.sender][_receiver][_id].amount =
            the_item.amount -
            _amount;
        lockedBalanceOf[_receiver] -= _amount;
        _transfer(_contractAddr, msg.sender, _amount);
    }

    // @returns the current time in the blockchain in epoch seconds
    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }

    // @returns the number of locked items between 2 users
    function getNrLockedItems(address _locker, address _receiver)
        public
        view
        returns (uint256)
    {
        return lockerToReceiverToItem[_locker][_receiver].length;
    }

    // @returns the locked item between 2 users with specific id
    function getLockedItem(
        address _locker,
        address _receiver,
        uint256 _id
    ) public view returns (uint256, uint256) {
        Item memory the_item = lockerToReceiverToItem[_locker][_receiver][_id];
        return (the_item.amount, the_item.unlockDate);
    }
}
