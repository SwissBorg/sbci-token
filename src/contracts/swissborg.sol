pragma solidity ^0.4.10;

import "./erc20.sol";

contract SwissBorgFund is ERC20{
    address public owner;
    uint256 public priceInWei;
    uint256 _totalSupply;
    mapping (address => uint256) _balances;
    mapping (address => bool) _buyers;
    mapping (address => mapping (address => uint256))  _approvals;

    string _name; 
    string _symbol;
    uint8 _decimals = 18;
    uint128 _unit = 1000000000000000000;

    /*constructor*/
    function SwissBorgFund(string name, string symbol, uint256 initialPriceInWei) {
        owner = msg.sender;
        _name = name;
        _symbol = symbol;
        priceInWei = initialPriceInWei;
    }

    event NewBuyer(address buyer);
    
    modifier ownerOnly() {
        assert(msg.sender == owner);
        _; //continue normal execution
    }
    
    function name() constant returns (string) {
        return _name;
    }

    function symbol() constant returns (string) {
        return _symbol;
    }

    function decimals() constant returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() constant returns (uint supply) {
        return _totalSupply;
    }

    function balanceOf(address src) constant returns (uint256) {
        return _balances[src];
    }

    function allowance(address src, address guy) constant returns (uint256) {
        return _approvals[src][guy];
    }
    
    function transfer(address dst, uint tokenAmount) returns (bool) {
        assert(_balances[msg.sender] >= tokenAmount);
        
        _balances[msg.sender] -= tokenAmount;
        _balances[dst] += tokenAmount;
        
        Transfer(msg.sender, dst, tokenAmount);
        
        return true;
    }
    
    function transferFrom(address src, address dst, uint tokenAmount) returns (bool) {
        assert(_balances[src] >= tokenAmount);
        assert(_approvals[src][msg.sender] >= tokenAmount);
        
        _approvals[src][msg.sender] -= tokenAmount;
        _balances[src] -= tokenAmount;
        _balances[dst] += tokenAmount;
        
        Transfer(src, dst, tokenAmount);
        
        return true;
    }
    
    function approve(address guy, uint256 tokenAmount) returns (bool) {
        _approvals[msg.sender][guy] = tokenAmount;
        
        Approval(msg.sender, guy, tokenAmount);
        
        return true;
    }

    function revoke(address guy) returns (bool) {
        return approve(guy, 0);
    }

    function setPrice(uint256 _priceInWei) ownerOnly returns(bool) {
        priceInWei = _priceInWei;
    }

    function buy() payable {
        uint256 tokens = (msg.value * _unit) / priceInWei;
        _balances[msg.sender] += tokens;
        _totalSupply += tokens;
        Transfer(this, msg.sender, tokens);

        if(!_buyers[msg.sender]) {
            NewBuyer(msg.sender);
            _buyers[msg.sender] = true;
        }
    }

    function() payable {
        buy();
    }

    function triggerTransferEvent() {
        Transfer(0x0, 0x0, 0);
    }

    /** get all the ETH that was sent to this contract*/
    function retrieveEther() ownerOnly {
        owner.transfer(this.balance);
    }

    function transferOwnership(address newOwner) ownerOnly returns(bool) {
        owner = newOwner;
    }

}
