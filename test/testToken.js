var TokenLogic = artifacts.require("./TokenLogic.sol");
var TokenData = artifacts.require("./TokenData.sol");
var Token = artifacts.require("./Token.sol");

contract('Token', function (accounts) {
  let data = undefined;
  let logic = undefined;
  let token = undefined;

  before(() => {
    return TokenLogic.deployed()
      .then(l => {
        logic = l;
        return logic.data()
      })
      .then(dataAddress => data = TokenData.at(dataAddress))
      .then(() => Token.deployed())
      .then(t => token = t)
  })


  it("has a reference to TokenLogic", () => {
    return Promise.all([logic.address, token.logic(), logic.owner()])
      .then(res => {
        assert.equal(res[0], res[1], "The token base is referenced");
        assert.equal(res[2], accounts[0], "accounts[0] is the owner");
      });
  });

  it("has a reference in TokenLogic", () => {
    return Promise.all([token.address, logic.token()])
      .then(res => assert.equal(res[0], res[1], "The token is referenced in token base"));
  });

  it("has accounts[0] as owner", () => {
    return token.owner()
      .then(owner => assert.equal(owner, accounts[0], "accounts[0] is the owner"))
  })

  it("mints 1000 new token when sent called from owner", () => {
    return token.mint(accounts[1], 3e20)
      .then(() => Promise.all([token.balanceOf(accounts[1]),
        token.totalSupply()]))
      .then(res => {
        assert.equal(res[0].toNumber(), 3e20, "3e20 tokens after mint");
        assert.equal(res[1].toNumber(), 3e20, "total supply after first mint");
      })
  });

  it("transfers tokens", () => {
    return token.transfer(accounts[2], 1e20, {from: accounts[1]})
      .then(() => Promise.all([token.balanceOf(accounts[1]), token.balanceOf(accounts[2])]))
      .then(res => {
        assert.equal(res[0].toNumber(), 2e20, "1e20 tokens were transfered 2e20 remaining")
        assert.equal(res[1].toNumber(), 1e20, "1e20 tokens were transfered")
      })
  })

  it("does not transfer ownership if called from the wrong account", () => {
    return token.setOwner(accounts[1], {from: accounts[2]})
      .then(() => assert.fail())
      .catch(function (error) {
        assert(
          error.message.indexOf("invalid opcode") >= 0,
          "throws when setOwner is called from another account then the owner"
        )
      });
  })

  it("transfers the owner of all 3 contracts and all the tokens", () => {
    let balance = 0;
    return token.balanceOf(accounts[0])
      .then(bal => balance = bal)
      .then(() => token.setOwner(accounts[9], {from: accounts[0]}))
      .then(() => token.owner())
      .then(owner => assert.equal(owner, accounts[9]))
      .then(() => logic.owner())
      .then(owner => assert.equal(owner, accounts[9]))
      .then(() => data.owner())
      .then(owner => assert.equal(owner, accounts[9]))
      .then(() => token.balanceOf(accounts[9]))
      .then(bal => assert.equal(bal.toNumber(), balance.toNumber()))
  })

})
