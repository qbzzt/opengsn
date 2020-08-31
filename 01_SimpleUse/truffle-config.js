
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'wild render law slight strike seven close damp glory jaguar dawn scan';
var kovanUrl = "https://kovan.infura.io/v3/455c4353c93d4b0092c542f38cceed41";

module.exports = {
  networks: {
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, kovanUrl),
      network_id: 42
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.6.10"
   }
 }
};
