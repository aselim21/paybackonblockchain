// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./2_PayBackPartnership.sol";
import "./3_PayBackClients.sol";

contract PayBackToken is IERC20, PayBackPartnership, PayBackClients {
    using SafeMath for uint256;

    //should be private?
    mapping(address => uint256) private _balances;
    //the owner->spender->amount
    mapping(address => mapping(address => uint256)) private _allowed;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint256 public _decimals;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 decimals_
    ) {
        _name = name_;
        _symbol = symbol_;
        _totalSupply = initialSupply_;
        _decimals = decimals_;

        _balances[_owner] = initialSupply_;
    }

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
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
        //there is no min or max value here
        //there are 2 cases!
        // check if the msg.sender is owner or partner
        Partner storage p_sender = addrToPartner[msg.sender];
        require(
            msg.sender == _owner || msg.sender == p_sender.walletAddr,
            "Only the owner or partners can transfer tokens."
        );

        //CASE 1: Contract Owner Payback wants to send his partner some tokens
        if (msg.sender == _owner) {
            Partner storage p_to = addrToPartner[_to];
            require(_to == p_to.walletAddr, "Owner can only send to partners.");
        }
        //CASE 2: Partner wants to sent his client some tokens
        else {
            //check if _to is a registered client
            require(_clientAddrToId[_to] != 0, "This address is not a client");
        }

        _transfer(msg.sender, _to, _amount);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal returns (bool) {
        _balances[_from] = _balances[_from].sub(_amount);
        _balances[_to] = _balances[_to].add(_amount);

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
        return _allowed[_owner][_spender];
    }

    
    function approve(address _spender, uint256 _amount) public isClient(msg.sender) returns (bool) {
      

        //the amount
        require(_amount != 0, "ERC20: Amount cannot be 0");
        require(
            _amount <= _balances[msg.sender],
            "Amount cannot be greater than balance"
        );
        //the owner is a client, means cannot be partner or contract owner
        //should never happen
        Partner storage p_sender = addrToPartner[msg.sender];
        assert(msg.sender != _owner && msg.sender != p_sender.walletAddr);

        //MAYBE : Spender can also be the contract owner? TO DECIDE WHO IS PAYING FOR THE TRANSACTIONS OF THE PARTNERS
        //the spender is partner, not contract owner
        Partner storage p_spender = addrToPartner[_spender];
        require(
            p_spender.walletAddr != address(0),
            "ERC20: the spender should be a partner"
        );
        //the amount should be 100, 200, 1000, 2000, 5000?
        //check if msg.sender is client?
        //check if spender is partner
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        //addresses are not zero
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");      

        //cannot create a new allowance before the existing is spent
        require(
            _allowed[owner][spender] == 0,
            "First spend the existing allowed amount."
        );

        _allowed[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {

        address spender = msg.sender;
 
        _spendAllowance(_from, spender, _amount);
        _transfer(_from, _to, _amount);
        
        return true;
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        //get the allowed amount and check if is allowed in the same time
        uint256 currentAllowance = _allowed[owner][spender];
        if (currentAllowance != type(uint256).max) {
            require(
                currentAllowance >= amount,
                "ERC20: insufficient allowance"
            );
            _allowed[owner][spender] = currentAllowance.sub(amount);
        }
    }

    //----------------------------------Additional functions----------------------------------

    function loadTotalSupply(uint256 _amount) public isOwner returns (bool) {
        //ACH ... there can be a max amout to load
        _balances[_owner] = _balances[_owner].add(_amount);
        return true;
    }
}
