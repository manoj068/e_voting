var e_voting = artifacts.require("./e_voting.sol");

module.exports = function(deployer) {
  deployer.deploy(e_voting);
};