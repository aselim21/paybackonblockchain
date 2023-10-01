// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts
// /token/ERC20/IERC20.sol

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./2_PaybackClientsPartners.sol";

contract PaybackToken is PaybackClientsPartners, IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply; //Returns the amount of tokens in existence.
    uint256 public minTokensToRedeem;

    address internal _contractAddr = address(this);

    mapping(address => uint256) internal _balances;
    //the owner->spender->amount
    mapping(address => mapping(address => uint256)) private _allowance;
    mapping(address => mapping(address => uint256)) private _spentAllowance;

    /**
     * @dev Sets the values for {name}, {symbol}, {initialSupply},
     * {decimals} and {minTokensToRedeem}
     *
     * All two of these values except for {initialSupply} are immutable:
     * they can only be set once during construction.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint8 _decimals,
        uint256 _minTokensToRedeem
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        decimals = _decimals;
        minTokensToRedeem = _minTokensToRedeem;
        //contract owner owns all the initial tokens
        _balances[_owner] = _initialSupply;
    }

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    /**
     * @dev Requirements:
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     * - transfers of 0 values MUST be treated as normal
     * transfers and fire the Transfer event.
     */

    function transfer(
        address _to,
        uint256 _amount
    ) public addrNotNull(_to) returns (bool) {
        if (msg.sender == _owner) {
            require(
                addrToPartnerId[_to] != 0,
                "ERC20: Owner can only send to partners."
            );
        }
        //case 2. sender is partner -> can only send to clients and the owner
        else if (addrToPartnerId[msg.sender] != 0) {
            require(
                addrToClientId[_to] != 0 || _to == _owner,
                "ERC20: Partners can only send to clients and owner."
            );
        }
        //case 3. sender is client - can send to another client
        // if he has less than the required amount,
        //else he can only redeem them by sending them to a partner or owner
        else if (addrToClientId[msg.sender] != 0) {
            // receiver is another client
            if (addrToClientId[_to] != 0) {
                require(
                    _balances[msg.sender] < minTokensToRedeem,
                    "ERC20: Clients balance is higher than minTokensToRedeem."
                );
            }
            //receiver is owner or partner
            else if (_to == _owner || addrToPartnerId[_to] != 0) {
                require(
                    _balances[msg.sender] >= minTokensToRedeem,
                    "ERC20: Clients balance is lower than minTokensToRedeem."
                );
            }
        } else {
            return false;
        }

        _transfer(msg.sender, _to, _amount);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal returns (bool) {
        _balances[_from] = _balances[_from] - _amount;
        _balances[_to] = _balances[_to] + _amount;

        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @dev Function to check the total amount of
     * tokens than an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint specifying the total amount of tokens that
     * the spender is allowed to spend.
     */
    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return _allowance[_owner][_spender];
    }

    /**
     * @dev Function to check the amount of tokens actually
     * transferred from an owner to a spender.
     * this separation is needed to avoid the Multiple Withdrawal Attack
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint specifying the amount of tokens that
     * the spender actually has spend.
     */
    function transferredFromAllowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return _spentAllowance[_owner][_spender];
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     * Partners and clients can allow accounts or
     * smart contracts to manage their tokens.
     * The owner is also allowed to be the spender.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits an {Approval} event.
     */
    function approve(address _spender, uint256 _amount) public returns (bool) {
        require(
            addrToPartnerId[msg.sender] != 0 || addrToClientId[msg.sender] != 0,
            "ERC20: Only partners and cliens can approve spenders."
        );

        _approve(msg.sender, _spender, _amount);
        return true;
    }

    // https://www.researchgate.net/publication/
    // 334161350_Resolving_the_Multiple_Withdrawal_Attack_on_ERC20_Tokens
    function _approve(
        address _owner,
        address _spender,
        uint256 _amount
    ) internal virtual addrNotNull(_spender) {
        //addresses cannot be 0
        assert(_owner != address(0));
        _allowance[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the allowance mechanism.
     * `amount` is then deducted from the caller's allowance.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        address spender = msg.sender;

        // case 1. _from is owner -> can only send to partners
        if (_from == _owner) {
            require(
                addrToPartnerId[_to] != 0,
                "ERC20: Owner can only send to partners."
            );
        }
        //case 2. _from is partner -> can only send to clients and the owner
        else if (addrToPartnerId[_from] != 0) {
            require(
                addrToClientId[_to] != 0 || _to == _owner,
                "ERC20: Partners can only send to clients and owner."
            );
        }
        //case 3. _from is client - can send to another client
        // if he has less than the required amount,
        //else he can only redeem them by sending them to a partner or owner
        else if (addrToClientId[_from] != 0) {
            // receiver is another client
            if (addrToClientId[_to] != 0) {
                require(
                    _balances[_from] < minTokensToRedeem,
                    "ERC20: Clients balance is higher than minTokensToRedeem."
                );
            }
            //receiver is owner or partner
            else if (_to == _owner || addrToPartnerId[_to] != 0) {
                require(
                    _balances[_from] >= minTokensToRedeem,
                    "ERC20: Clients balance is lower than minTokensToRedeem."
                );
            }
        } else {
            return false;
        }

        _spendAllowance(_from, spender, _amount);
        _transfer(_from, _to, _amount);
        return true;
    }

    function _spendAllowance(
        address _owner,
        address _spender,
        uint256 _amount
    ) private {
        uint256 transferred = _spentAllowance[_owner][_spender];
        uint256 allowed = _allowance[_owner][_spender];
        uint256 spendingRest = 0;

        if (transferred < allowed) {
            spendingRest = allowed - transferred;
        }
        require(
            spendingRest >= _amount,
            "ERC20: amount is higher than the spending rest allowed."
        );
        require(
            _balances[_owner] >= _amount,
            "ERC20: the owner doesn't have enough tokens to be spent."
        );

        _spentAllowance[_owner][_spender] = transferred + _amount;
    }

    //-----------------------Additional functions-------------------------

    function loadTotalSupply(uint256 _amount) public isOwner returns (bool) {
        totalSupply = totalSupply + _amount;
        _balances[_owner] = _balances[_owner] + _amount;
        return true;
    }

    function removePartner(uint256 _id) public override isOwner {
        // payback should hold the total amout in the reserve for security.
        // This means that when deliting a partner his tokens
        // should be transferred back to the admin.
        Partner storage p = partners[_id];
        _transfer(p.walletAddr, _owner, _balances[p.walletAddr]);
        addrToPartnerId[p.walletAddr] = 0;
        delete partners[_id];
    }

    /**
     * @dev Moves all the amount of tokens from contract's address to the contract owner.
     * Emits a {Transfer} event.
     */
    function withdrawTokens() public isOwner {
        _transfer(_contractAddr, _owner, _balances[_contractAddr]);
    }

    /**
     * @dev Moves all the amount of ether from contract's address to the contract owner.
     */
    function withdraw() public isOwner {
        payable(_owner).transfer(address(this).balance);
    }
}
