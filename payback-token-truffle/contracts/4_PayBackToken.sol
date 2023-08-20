// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./2_PayBackPartnership.sol";
import "./3_PayBackClients.sol";

contract PayBackToken is IERC20, PayBackPartnership, PayBackClients {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply; //Returns the amount of tokens in existence.

    uint256 public minTokensToRedeem;

    mapping(address => uint256) private _balances;

    //the owner->spender->amount
    mapping(address => mapping(address => uint256)) private _allowance;
    mapping(address => mapping(address => uint256)) private _transferred;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory _name, // PayBackToken
        string memory _symbol, // PBT
        uint256 _initialSupply, // 1000000 . How many points in circulation? Gesammelte Punkte im Wert von 500 Mio. EUR (https://www.payback.group/de/payback-group/ueber-payback/daten-und-fakten) 1 Token = 1 Cent => 50 Mrd. -> wir machen sie zuerst 1 Mio. dann kann man neue minten. Auch Collaterall einfügen.. :)
        uint8 _decimals, // 0
        uint256 _minTokensToRedeem // 300
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        decimals = _decimals;
        minTokensToRedeem = _minTokensToRedeem;

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
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */

    function transfer(address _to, uint256 _amount)
        public
        addrNotNull(_to)
        returns (bool)
    {
        // -------- Closed ecosystem for posession of Tokens --------
        // external adresses(not owner, partner or client) cannot own tokens

        // Client can transfer to Owner/Partner > 500
        // Clients can transfer to Clients or Other address only < 500

        // Partners can transfer only to clients and owner

        // Owner can transfer only to partners // if wants to open a store should register himself as a partner]

        // others cannot transfer to themselves, unless it is a smart contract

        //Owner can trans

        // Possbile scenations:
        // Client -> Owner || Partner
        // Partner -> Client
        // Owner -> Partner
        // Partner -> Owner
        // Client -> Client (if balance of sender < 500)
        // Client -> Owner || Partner (if balance of spender >= 500)

        // Forbidden
        // 1) Partner -> Partner // when new partner registers and they fail...  just send them back to the owner!
        // 2) Client -> Client when balance of sender >= 500
        // 3) Client -> Partner || Owner when balance of sender < 500
        // 4) Owner -> Client. only to partner!

        // case 1. sender is owner
        if (msg.sender == _owner) {
            require(
                addrToPartnerId[_to] != 0,
                "ERC20: Owner can only send to partners."
            );
        }
        //case 2. sender is partner
        else if (addrToPartnerId[msg.sender] != 0) {
            require(
                addrToClientId[_to] != 0 || _to == _owner,
                "ERC20: Partners can only send to clients and owner."
            );
        }
        //case 3. sender is client
        else if (addrToClientId[msg.sender] != 0) {
            // receiver is another client
            if (addrToClientId[_to] != 0) {
                require(
                    _balances[msg.sender] < minTokensToRedeem,
                    "ERC20: Clients with a balance higher than minTokensToRedeem cannot send to another client."
                );
            }
            //receiver is owner or partner
            else if (_to == _owner || addrToPartnerId[_to] != 0) {
                require(
                    _balances[msg.sender] >= minTokensToRedeem,
                    "ERC20: Clients with a balance lower than minTokensToRedeem cannot redeem tokens."
                );
            }
        } else {
            return false;
        }

        // Note from ERC20 Standard: Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
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

        //The allowence is not blocking the transfer?, no because they are not blocked.. it is just an allowance. It doesn't matter if the tokens are there or not

        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens than an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256)
    {
        //the owner is the owner of the tokens that allows someone else to transfer the amount for him
        return _allowance[_owner][_spender];
    }

    function transferredFromAllowance(address _owner, address _spender)
        public
        view
        returns (uint256)
    {
        //the owner is the owner of the tokens that allows someone else to transfer the amount for him
        return _transferred[_owner][_spender];
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        // partners and clients can allow addresses or smart contracts to manage their tokens, even the owner is allowed to be the spender

        require(
            addrToPartnerId[msg.sender] != 0 || addrToClientId[msg.sender] != 0,
            "Only partners and cliens can approve spenders."
        );
        require(_amount != 0, "ERC20: Amount cannot be 0");
        require(
            _balances[msg.sender] >= _amount,
            "ERC20: Amount cannot be greater than balance"
        );

        _approve(msg.sender, _spender, _amount);
        return true;
    }

    //https://www.researchgate.net/publication/334161350_Resolving_the_Multiple_Withdrawal_Attack_on_ERC20_Tokens
    function _approve(
        address _owner,
        address _spender,
        uint256 _amount
    ) internal virtual {
        //addresses are not zero
        assert(_owner != address(0));
        require(_spender != address(0), "ERC20: approve to the zero address.");
        // uint256 newAllowance = 0;
        // uint256 transferred = _transferred[_owner][_spender]; 100
        // uint256 allowed = _allowance[_owner][_spender]; 50

        // increasing allowance
        // The allowance can be smaller than the transferred amount.
        // if (_amount > allowed) {
        //     newAllowance = _amount;
        //     // this is not working in that case....
        //     // uint256 newAllowanceRest = _amount - transferred;
        //     // newAllowance = transferred + newAllowanceRest;
        // }
        // // reducing allowance
        // else if (_amount < allowed) {

        //     // uint256 newAllowanceRest = 0;
        //     // if (_amount < transferred) {
        //     //     newAllowance = 0;
        //     // } else {
        //     //     newAllowance = _amount;
        //     // }
        // }
        _allowance[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        address spender = msg.sender;

        bool spending = _spendAllowance(_from, spender, _amount);
        if (spending == true) {
            _transfer(_from, _to, _amount);
        } else {
            return false;
        }
        return true;
    }

    function _spendAllowance(
        address _spender,
        address _owner,
        uint256 _amount
    ) private returns (bool) {
        uint256 transferred = _transferred[_owner][_spender];
        uint256 allowed = _allowance[_owner][_spender];
        uint256 spendingRest = 0;

        if (transferred < allowed) {
            spendingRest = allowed - transferred;
        }
        if (_amount <= spendingRest) {
            _transferred[_owner][_spender] = transferred + _amount;
            return true;
        }
        return false;
    }

    // function _spendAllowance(
    //     address owner,
    //     address spender,
    //     uint256 amount
    // ) internal virtual {
    //     //get the allowed amount and check if is allowed in the same time
    //     uint256 currentAllowance = allowance[owner][spender]; //10
    //     if (currentAllowance != type(uint256).max) {
    //         require(
    //             currentAllowance >= amount, //10 >= 5
    //             "ERC20: insufficient allowance"
    //         );
    //         _allowed[owner][spender] = currentAllowance - amount;
    //     }
    // }

    //----------------------------------Additional functions----------------------------------

    function loadTotalSupply(uint256 _amount) public isOwner returns (bool) {
        totalSupply = totalSupply + _amount;
        _balances[_owner] = _balances[_owner] + _amount;
        return true;
    }
}
