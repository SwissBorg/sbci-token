/// base.sol -- basic ERC20 implementation

// Copyright (C) 2015, 2016, 2017  DappHub, LLC

// Licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.13;


import "./ERC20.sol";
import "./Stoppable.sol";
import "./Math.sol";
import "./Token.sol";
import "./TokenData.sol";


contract TokenLogic is ERC20Events, Math, Stoppable {

    struct Contribution {
    address contributor;
    uint amount;
    bool settled;
    }

    event ReceivedContribution(uint contributionNum, address contributor, uint amount);

    event ContributionSettled(uint contributionNum, address contributor, uint amount);

    uint public contributionCount;

    uint public lastSettled;

    mapping (uint => Contribution) contributions;

    TokenData public data;

    Token public token;

    function TokenLogic(Token token_, TokenData data_) {
        require(token_ != Token(0x0));

        if (data_ == address(0x0)) {
            data = new TokenData(this, 0, msg.sender);
        }
        else {
            data = data_;
        }
        token = token_;
    }

    modifier tokenOnly {
        assert(msg.sender == address(token) || msg.sender == address(this));
        _;
    }

    function setOwner(address owner_) tokenOnly {
        owner = owner_;
        LogSetOwner(owner);
        data.setOwner(owner);
    }

    function setToken(Token token_) auth {
        token = token_;
    }

    function totalSupply() constant returns (uint256) {
        return data.supply();
    }

    function balanceOf(address src) constant returns (uint256) {
        return data.balances(src);
    }

    function allowance(address src, address guy) constant returns (uint256) {
        return data.approvals(src, guy);
    }

    function transfer(address src, address dst, uint wad) tokenOnly returns (bool) {
        require(balanceOf(src) >= wad);

        data.setBalances(src, sub(data.balances(src), wad));
        data.setBalances(dst, add(data.balances(dst), wad));

        return true;
    }

    function transferFrom(address src, address dst, uint wad) tokenOnly returns (bool) {
        require(data.balances(src) >= wad);
        require(data.approvals(src, dst) >= wad);

        data.setApprovals(src, dst, sub(data.approvals(src, dst), wad));
        data.setBalances(src, sub(data.balances(src), wad));
        data.setBalances(dst, add(data.balances(dst), wad));

        return true;
    }

    function approve(address src, address guy, uint256 wad) tokenOnly returns (bool) {
        data.setApprovals(src, guy, wad);
        Approval(src, guy, wad);
        return true;
    }

    function mint(address dst, uint wad) tokenOnly {
        mint_(dst, wad);
    }

    function mint_(address dst, uint wad) internal {
        data.setBalances(dst, add(data.balances(dst), wad));
        data.setSupply(add(data.supply(), wad));
        token.triggerTransferEvent(this, dst, wad);
    }

    function burn(address src, uint wad) tokenOnly {
        data.setBalances(src, sub(data.balances(src), wad));
        data.setSupply(sub(data.supply(), wad));
    }

    function settleContribution(uint idx, uint tokensPerWei) internal returns (bool){
        Contribution storage contribution = contributions[idx];
        if (!contribution.settled) {
            contribution.settled = true;

            uint wad = mul(tokensPerWei, contribution.amount);
            mint_(contribution.contributor, wad);
            ContributionSettled(idx, contribution.contributor, wad);
            return true;
        }
        return false;
    }

    function assignTokens(uint tokensPerWei) auth {
        require(tokensPerWei > 0);
        require(lastSettled < contributionCount);
        uint limit = 50;
        /*it settles all the contributions but 50 at most because of gas issues*/
        while (lastSettled < contributionCount && limit-- > 0) {
            settleContribution(lastSettled++, tokensPerWei);
        }
    }

    function handlePayment(address src) payable tokenOnly {
        Contribution memory contribution;
        contribution.amount = msg.value;
        contribution.contributor = src;
        contribution.settled = false;
        contributions[contributionCount++] = contribution;
        ReceivedContribution(contributionCount, src, msg.value);
    }

    function payout(address dst) auth {
        require(dst != address(0));
        dst.transfer(this.balance);
    }

}
