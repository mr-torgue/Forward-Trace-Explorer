const Product = artifacts.require("Product");
const ProductLookupTable = artifacts.require("ProductLookupTable");
const ParticipantLookupTable = artifacts.require("ParticipantLookupTable");

module.exports = function (deployer) {
  deployer.deploy(ProductLookupTable);
  deployer.deploy(ParticipantLookupTable);
};
