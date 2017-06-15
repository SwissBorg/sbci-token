pragma solidity ^0.4.10;

contract SimpleTest {
    event MyEvent(string message);

    function myFunction() {
        MyEvent("My Event was triggered");
    }
}