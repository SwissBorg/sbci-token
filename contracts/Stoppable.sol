/// stop.sol -- mixin for enable/disable functionality

// Copyright (C) 2017  DappHub, LLC

// Licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.13;


import "./Auth.sol";
import "./Note.sol";


contract Stoppable is Auth, Note {

    bool public stopped;

    modifier stoppable {
        require(!stopped);
        _;
    }
    function stop() auth note {
        stopped = true;
    }

    function start() auth note {
        stopped = false;
    }

}