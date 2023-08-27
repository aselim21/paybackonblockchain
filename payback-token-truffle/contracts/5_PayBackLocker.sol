// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./4_PayBackToken.sol";

contract PayBackLocker is PayBackToken("PayBackToken", "PBT", 1000000, 0, 300) {
    struct Item {
        uint256 amount;
        uint256 unlockDate;
    }
    mapping(address => mapping(address => Item[]))
        private lockerToReceiverToItem;
    address private _contractAddr = address(this);

    //-------------------------Events-------------------------

    event Locked(address locker, address receiver, uint256 id);
    event Released(address locker, address receiver, uint256 id);

    //locking is done by the ownerAddr, should be a partner or owner...
    // this is an intermal functionality, provided by the owner to support and ease the job of its partners.
    // partners instead of sending tokens to the client, can just lock them.
    // If an item is returned, they can change also the amount
    function lock(
        address _receiver,
        uint256 _amount,
        uint256 _unlockDate
    ) public returns (uint256) {
        //transfer tokens to this contract addr
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
        uint256 id = lockerToReceiverToItem[msg.sender][_receiver].length-1;

        emit Locked(msg.sender, _receiver, id);

        return id;
    }

    function releaseLock(
        address _locker,
        address _receiver,
        uint256 _id
    ) public isOwner {
        //https://medium.com/coinmonks/solidity-storage-vs-memory-vs-calldata-8c7e8c38bce
        Item memory the_item = lockerToReceiverToItem[_locker][_receiver][_id];
        //check if date is okay
        require(
            the_item.unlockDate >= block.timestamp,
            "Locker: It is early to release the tokens."
        );

        _transfer(_contractAddr, _receiver, the_item.amount);

        delete lockerToReceiverToItem[_locker][_receiver][_id];
        emit Released(_locker, _receiver, _id);
    }

    // when part of the purchase is returned, some of the tokens should also be returned back to the owner
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
            "Locker: Option reducing tokens is expired."
        );
        lockerToReceiverToItem[msg.sender][_receiver][_id].amount =
            the_item.amount -
            _amount;

        //     //ich weiss nicht wa passiert wenn die Waren nicht rechtzeitig bei dem Kaufer ankommen. Gilt die Retoure oder nicht mehr...
        //     //also hier ist die Zeit fest.
        //     // Nachdem die Zeit abgelaufen ist, koennen die Tokens nur an der Kunde geschickt werden. und das macht automatisch der Owner.
    }

    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }

    function getNrLockedItems(address _locker, address _receiver)
        public
        view
        returns (uint256)
    {
        return lockerToReceiverToItem[_locker][_receiver].length;
    }

    function getLockedItem(
        address _locker,
        address _receiver,
        uint256 _id
    ) public view returns (uint256, uint256) {
        Item memory the_item = lockerToReceiverToItem[_locker][_receiver][_id];
        return (the_item.amount, the_item.unlockDate);
    }

    //dont need because not accurate like this
    //     function calcFutureEpoch(
    //         uint256 _hours,
    //         uint256 _days,
    //         uint256 _weeks
    //     ) public view returns (uint256) {
    //         uint256 givenEpoch = (3600 * _hours) +
    //             (86400 * _days) +
    //             (604800 * _weeks);
    //         return block.timestamp + givenEpoch;
    //     }
}
