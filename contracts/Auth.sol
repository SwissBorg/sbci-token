/// auth.sol -- widely-used access control pattern for Ethereum

// Copyright (C) 2015, 2016, 2017  DappHub, LLC

// Licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.13;


contract Authority {
    function canCall(address src, address dst, bytes4 sig) constant returns (bool);
}


contract AuthEvents {
    event LogSetAuthority (address indexed authority);

    event LogSetOwner     (address indexed owner);

    event UnauthorizedAccess (address caller, bytes4 sig);
}


contract Auth is AuthEvents {
    Authority  public  authority;

    address public owner;

    function Auth() {
        owner = msg.sender;
        LogSetOwner(msg.sender);
    }

    function setOwner(address owner_) auth {
        owner = owner_;
        LogSetOwner(owner);
    }

    function setAuthority(Authority authority_) auth {
        authority = authority_;
        LogSetAuthority(authority);
    }

    modifier auth {
        require(isAuthorized(msg.sender, msg.sig));
        _;
    }

    function isAuthorized(address src, bytes4 sig) internal returns (bool) {
        if (src == address(this)) {
            return true;
        }
        else if (src == owner && authority == Authority(0)) {
            /*the owner has privileges only as long as no Authority has been defined*/
            return true;
        }
        else if (authority == Authority(0)) {
            UnauthorizedAccess(src, sig);
            return false;
        }
        else {
            return authority.canCall(src, this, sig);
        }
    }
}
