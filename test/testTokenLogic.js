var TokenLogic = artifacts.require("./TokenLogic.sol");
var TokenData = artifacts.require("./TokenData.sol");
var Token = artifacts.require("./Token.sol");

contract('TokenLogic', function (accounts) {
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

  it("has accounts[0] as owner", () => {
    return logic.owner()
      .then(owner => assert.equal(owner, accounts[0], "accounts[0] is the owner"))
  })

  it("has a TokenData contract for which it is the owner", () => {
    return data.owner()
      .then(owner => {
        assert.equal(accounts[0], owner, "accounts[0] is the Account's owner");
      })
  })

  it("data has a a linked Token contract", () => {
    return data.token()
      .then(token => assert.notEqual(token, "0x0000000000000000000000000000000000000000", "the token address must be defined"));
  })

  it("setlles the purchase when called from the owner", () => {
    let owner = undefined
    return token.owner()
      .then(o => owner = o)
      .then(() => Promise.all([
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(10, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(10, "ether"), gas: 200000})
      ]))
      .then(() => Promise.all([logic.contributionCount(), logic.lastSettled()]))
      .then(res => {
        assert.equal(res[0].toNumber(), 2, "there were 2 contributions")
        assert.equal(res[1].toNumber(), 0, "there has been no settlement yet")
      })
      .then(() => logic.assignTokens(1000, {from: owner}))
      .then(() => Promise.all([token.balanceOf(accounts[1]), token.balanceOf(accounts[2]), logic.lastSettled()]))
      .then(res => {
        assert.equal(res[2].toNumber(), 2, "there were 2 settlements")
        assert.equal(res[0].toNumber(), 1e22, "10'000 tokens for 10 ether")
        assert.equal(res[1].toNumber(), 1e22, "10'000 tokens for 10 ether")
      })
  })

  it("setlles the purchase for the first 50 contributions when called from the owner", () => {
    let owner = undefined
    return token.owner()
      .then(o => owner = o)
      .then(() => Promise.all([logic.contributionCount(), logic.lastSettled()]))
      .then(res => {
        assert.equal(res[0].toNumber(), 2, "there were 2 contributions")
        assert.equal(res[1].toNumber(), 2, "there has been no settlement yet")
      })
      .then(() => Promise.all([
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[1], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
        web3.eth.sendTransaction({from: accounts[2], to: token.address, value: web3.toWei(1, "ether"), gas: 200000}),
      ]))
      .then(() => Promise.all([logic.contributionCount(), logic.lastSettled()]))
      .then(res => {
        assert.equal(res[0].toNumber(), 62, "there were 2 contributions")
        assert.equal(res[1].toNumber(), 2, "there has been no settlement yet")
      })
      .then(() => logic.assignTokens(1000, {from: owner}))
      .then(() => Promise.all([token.balanceOf(accounts[1]), token.balanceOf(accounts[2]), logic.lastSettled()]))
      .then(res => {
        assert.equal(res[2].toNumber(), 52, "there were 50 settlements")
        assert.equal(res[0].toNumber(), 3.5e22, "10'000 tokens for 10 ether")
        assert.equal(res[1].toNumber(), 3.5e22, "10'000 tokens for 10 ether")
        /*call from other than owner and expect to fail*/
        return logic.assignTokens(1000, {from: accounts[1]})
      })
      .then(() => assert.fail())
      .catch(function (error) {
        assert(
          error.message.indexOf("invalid opcode") >= 0,
          "throws when assignTokens is called from another account then the owner"
        )
      });
  })

  it("continues assigning token for the last 10", () => {
    return logic.assignTokens(1000, {from: accounts[0]})
      .then(() => Promise.all([token.balanceOf(accounts[1]), token.balanceOf(accounts[2]), logic.lastSettled(), token.totalSupply()]))
      .then(res => {
        assert.equal(res[0].toNumber(), 4e22, "40'000 tokens for 10 ether")
        assert.equal(res[1].toNumber(), 4e22, "40'000 tokens for 10 ether")
        assert.equal(res[2].toNumber(), 62, "there were 50 settlements")
        assert.equal(res[3].toNumber(), 8e22, "80'000 tokens total supply")
      })
  })

  it("throws when payout is called from another account than the owner", () => {
    return logic.payout(accounts[1], {from: accounts[2]})
      .then(() => assert.fail())
      .catch(function (error) {
        assert(
          error.message.indexOf("invalid opcode") >= 0,
          "throws when payout is called from another account then the owner"
        )
      });
  })

  it("pays 20 ETH to the designated account", () => {
    let balance = 0;
    let recipient = accounts[8]
    return Promise.all([web3.eth.getBalance(recipient)])
      .then(bal => balance = bal)
      .then(() => logic.payout(recipient))
      .then(() => Promise.all([web3.eth.getBalance(recipient), web3.eth.getBalance(logic.address)]))
      .then(res => {
        assert.equal(res[0].minus(balance).toNumber(), 8e19, "80 ETH additional balance for recipient");
        assert.equal(res[1].toNumber(), 0, "0 ETH balance in the contract");

      });
  });


})