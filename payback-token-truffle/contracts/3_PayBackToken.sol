// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./2_PayBackPartnership.sol";

contract PayBackToken is IERC20, PayBackPartnership {
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
        //there are 2 cases!
        // check if the msg.sender is owner or partner
        Partner storage p = addrToPartner[msg.sender];
        require(
            msg.sender == _owner || msg.sender == p.walletAddr,
            "Only the owner or partners can transfer tokens."
        );

        //CASE 1: Contract Owner Payback wants to send his partner some tokens
        //CASE 2: Partner wants to sent his client some tokens
        _balances[msg.sender] = _balances[msg.sender].sub(_amount);
        _balances[_to] = _balances[_to].add(_amount);

        emit Transfer(msg.sender, _to, _amount);

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

    //
    function approve(address _spender, uint256 _amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, _spender, _amount);
        return true;
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowed[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        //you allow someone to spend your tokens
        //
        //TODO who can start this function????

        //check if the amount they want to send is real
        require(
            _balances[_from] >= _amount,
            "The address doesn't have enough balance to send the amount."
        );

        Partner storage p_sender = addrToPartner[_from];

        if (p_sender.walletAddr != address(0)) {
            // if the sender is a partner, he can send tokens
            _balances[_from] = _balances[_from].sub(_amount);
            _balances[_to] = _balances[_to].add(_amount);
        } else {
            //if the sender is not a partner check if the receiver is partner
            Partner storage p_receiver = addrToPartner[_to];
            require(
                p_receiver.walletAddr == address(0),
                "The receiver address is not a partner."
            );

            if (p_receiver.walletAddr != address(0)) {
                // sending to partner
                // check if the amount is round?
                _balances[_from] = _balances[_from].sub(_amount);
                _balances[_to] = _balances[_to].add(_amount);
            }
        }
        //if the from is a partner.. then its okay to send
        //else if the from is a normal user.. he can only send to partner
        //check if the amount is above

        return true;
    }

    //----------------------------------Additional functions----------------------------------

    function loadTotalSupply(uint256 _amount) public isOwner returns (bool) {
        //ACH ... there can be a max amout to load
        _balances[_owner] = _balances[_owner].add(_amount);
        return true;
    }

    // TODO : Implement all other functions,
    // make the specific function for out Token virtual and external? override?
}
