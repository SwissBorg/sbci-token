module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8585,
      network_id: "*" // Match any network id
    },

    testnet: {
      from: "0x0098BdDFdD1Ee59d517d5394BaF71A438dED5472",
      host: "localhost",
      port: 8545,
      gasPrice: 10000000000,
      network_id: "*" // Match any network id
    }
  }
};
