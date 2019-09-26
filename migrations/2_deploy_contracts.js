const Productos = artifacts.require("Productos");

module.exports = function(deployer) {
  deployer.deploy(Productos);
};
