var Token = artifacts.require("./Token.sol");
var TokenLogic = artifacts.require("./TokenLogic.sol");

module.exports = function (deployer) {
  deployer.deploy(Token, "SwissBorb", "SBC").then(function () {
    console.log("deployment log Token address is", Token.address);
    return Token.address;
  }).then(function () {
    return deployer.deploy(TokenLogic, Token.address, 0)
  }).then(function () {
    return TokenLogic.at(TokenLogic.address);
  }).then(function (tokenLogic) {
    console.log("deployment log TokenLogic address is", tokenLogic.address);
    return tokenLogic.owner();
  }).then(function (owner) {
    console.log("deployment log TokenData owner is", owner)
    return Token.at(Token.address);
  }).then(function (token) {
    return token.setLogic(TokenLogic.address);
  });
};