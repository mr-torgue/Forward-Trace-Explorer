const ParticipantLookupTable = artifacts.require("ParticipantLookupTable");
const ProductLookupTable = artifacts.require("ProductLookupTable");
const truffleAssert = require('truffle-assertions');

contract('ParticipantLookupTable', (accounts) => {

  let participantLookupTable, participants, participant, res;

  beforeEach(async() => {
    participantLookupTable = await ParticipantLookupTable.deployed();
    participants = await participantLookupTable.getParticipants.call();
    for(var i=0; i < participants.length; i++) {
      await participantLookupTable.removeParticipant({ from: participants[i] });
    }
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participants.length, 0, "length is not 0");
  });

  it("should test if duplicates are not allowed", async() => {
    // add a participant called test (accounts[0])
    res = await participantLookupTable.addParticipant("test",  { from: accounts[0] });
    participant = await participantLookupTable.getParticipant.call(accounts[0]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "test", "name mismatch");
    assert.equal(participant.addr, accounts[0], "address mismatch");
    assert.equal(participants.length, 1, "length is not 1");
    //assert.isTrue(res, "participant not added" + res);

    // add a participant called test2 for same accounts[0], should not work because accounts[0] is already registered
    await truffleAssert.reverts(participantLookupTable.addParticipant("test2",  { from: accounts[0] }),
      "CANNOT REGISTER EXISTING ADDRESS");
    participant = await participantLookupTable.getParticipant.call(accounts[0]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "test", "name mismatch");
    assert.equal(participant.addr, accounts[0], "address mismatch");
    assert.equal(participants.length, 1, "length is not 1");
    //assert.isFalse(res, "participant added");

    // add a participant called test for same accounts[1], should not work because test is already registered
    await truffleAssert.reverts(participantLookupTable.addParticipant("test",  { from: accounts[1] }),
      "CANNOT REGISTER EXISTING PARTICIPANT NAME");
    participant = await participantLookupTable.getParticipant.call(accounts[1]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participant.addr, "0x0000000000000000000000000000000000000000", "address mismatch");
    assert.equal(participants.length, 1, "length is not 1");
    //assert.isFalse(res, "participant added");
  });
  it("should add and remove participants", async () => {
    // add 5 participants
    for(var i=1; i <= 5; i++) {
      res = await participantLookupTable.addParticipant("participant " + i,  { from: accounts[i] });
      participant = await participantLookupTable.getParticipant.call(accounts[i]);
      participants = await participantLookupTable.getParticipants.call();
      assert.equal(participant.name, "participant " + i, "could not lookup entry");
      assert.equal(participant.addr, accounts[i], "address mismatch");
      assert.equal(participants.length, i, "length does not match");
      //assert.isTrue(res, "participant not added" + res);
    }

    // remove participant 1
    res = await participantLookupTable.removeParticipant({ from: accounts[1] });
    participant = await participantLookupTable.getParticipant.call(accounts[1]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participant.addr, "0x0000000000000000000000000000000000000000", "address mismatch");
    assert.equal(participants.length, 4, "length is not 4");
    //assert.isTrue(res, "participant not removed");

    // remove participant 7 - does not exist, nothing changes
    res = await participantLookupTable.removeParticipant({ from: accounts[7] });
    participant = await participantLookupTable.getParticipant.call(accounts[7]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participants.length, 4, "length is not 4");
    //assert.isFalse(res, "participant removed");
  });
  it("should return init values for lookup of non-existing participants", async () => {
    // look for non-existing user
    participant = await participantLookupTable.getParticipant.call(accounts[1]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participants.length, 0, "length is not 0");
    
    // add and remove xoryt
    await participantLookupTable.addParticipant("xoryt",  { from: accounts[0] });
    await participantLookupTable.removeParticipant({ from: accounts[0] });
    participant = await participantLookupTable.getParticipant.call(accounts[0]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participants.length, 0, "length is not 0");

  });
  it("should work if the same participant gets removed twice", async() => {
    // add and remove xoryt twice
    await participantLookupTable.addParticipant("xoryt",  { from: accounts[0] });
    await participantLookupTable.removeParticipant({ from: accounts[0] });
    await participantLookupTable.removeParticipant({ from: accounts[0] });
    participant = await participantLookupTable.getParticipant.call(accounts[0]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participants.length, 0, "length is not 0");
  });
  it("should work if a non-existing participant gets removed", async() => {
    // add xoryt for accounts[0] but remove non-existing accounts[2]
    await participantLookupTable.addParticipant("xoryt",  { from: accounts[0] });
    await participantLookupTable.removeParticipant({ from: accounts[2] });
    participant = await participantLookupTable.getParticipant.call(accounts[2]);
    participants = await participantLookupTable.getParticipants.call();
    assert.equal(participant.name, "", "could not lookup entry");
    assert.equal(participants.length, 1, "length is not 0");
    participant = await participantLookupTable.getParticipant.call(accounts[0]);
    assert.equal(participant.name, "xoryt", "could not lookup entry");
  });
});

contract('ProductLookupTable', (accounts) => {

  let productLookupTable, product, products, res;

  /*
  BeforeEach empties the lookup table before each test run
  */
  beforeEach(async() => {
    productLookupTable = await ProductLookupTable.deployed();
    products = await productLookupTable.getProducts.call();
    for(var i=0; i < products.length; i++) {
      product = await productLookupTable.getProduct.call(products[i]);
      await productLookupTable.removeProduct(product.addr, { from: product.owner });
    }
    products = await productLookupTable.getProducts.call();
    assert.equal(products.length, 0, "length is not 0");
  });
  /*
  test duplicates. Both name and contract address should be unique. Same owner is fine.
  */
  it("should test if duplicates are not allowed", async() => {
    res = await productLookupTable.addProduct("test", "0x0000000000000000000000000000000000000012", { from: accounts[0] });
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000012");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "test", "name mismatch");
    assert.equal(product.addr, "0x0000000000000000000000000000000000000012", "address mismatch");
    assert.equal(products.length, 1, "length is not 1");
    //assert.isTrue(res, "product not added" + res);

    await truffleAssert.reverts(productLookupTable.addProduct("test2", "0x0000000000000000000000000000000000000012", { from: accounts[2] }), 
      "CANNOT REGISTER EXISTING ADDRESS");
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000012");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "test", "name mismatch");
    assert.equal(product.addr, "0x0000000000000000000000000000000000000012", "address mismatch");
    assert.equal(products.length, 1, "length is not 1");
    //assert.isFalse(res, "product added");

    // should not work, name already exists
    await truffleAssert.reverts(productLookupTable.addProduct("test", "0x0000000000000000000000000000000000000001", { from: accounts[1] }), 
      "CANNOT REGISTER EXISTING PRODUCT NAME");
    product = await productLookupTable.getProduct.call(accounts[1]);
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(product.addr, "0x0000000000000000000000000000000000000000", "address mismatch");
    //assert.equal(products.length, 1, "length is not 1");
    //assert.isFalse(res, "product added");
  });
  it("should add and remove products", async () => {
    // add 5 products
    for(var i=1; i <= 5; i++) {
      res = await productLookupTable.addProduct("product " + i, "0x000000000000000000000000000000000000000" + i, { from: accounts[i] });
      product = await productLookupTable.getProduct.call("0x000000000000000000000000000000000000000" + i);
      products = await productLookupTable.getProducts.call();
      assert.equal(product.name, "product " + i, "could not lookup entry");
      assert.equal(product.addr, "0x000000000000000000000000000000000000000" + i, "address mismatch");
      assert.equal(products.length, i, "length does not match");
      //assert.isTrue(res, "product not added" + res);
    }

    // remove product 1
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000001");
    res = await productLookupTable.removeProduct(product.addr, { from: product.owner });
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000001");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(product.addr, "0x0000000000000000000000000000000000000000", "address mismatch");
    assert.equal(products.length, 4, "length is not 4");
    //assert.isTrue(res, "product not removed");

    // remove product 7 - does not exist, nothing changes
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000007");
    res = await productLookupTable.removeProduct(product.addr, { from: accounts[0] });
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000000000007");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 4, "length is not 4");
    //assert.isFalse(res, "product removed");
  });
  it("should return init values for lookup of non-existing products", async () => {
    // look for non-existing user
    product = await productLookupTable.getProduct.call("0x0000000000000000000000000000000ff0000007");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 0, "length is not 0");
    
    // add and remove xoryt
    await productLookupTable.addProduct("xoryt", "0x000000000000000000000000000000aa00000007", { from: accounts[0] });
    await productLookupTable.removeProduct("0x000000000000000000000000000000aa00000007", { from: accounts[0] });
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000007");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 0, "length is not 0");

  });
  it("should work if the same product gets removed twice", async() => {
    // add and remove xoryt twice
    await productLookupTable.addProduct("xoryt", "0x000000000000000000000000000000aa00000010",  { from: accounts[0] });
    await productLookupTable.removeProduct("0x000000000000000000000000000000aa00000010", { from: accounts[0] });
    await productLookupTable.removeProduct("0x000000000000000000000000000000aa00000010", { from: accounts[0] });
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000010");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 0, "length is not 0");
  });
  it("should work if a non-existing product gets removed", async() => {
    // add xoryt for accounts[0] but remove non-existing accounts[2]
    await productLookupTable.addProduct("xoryt", "0x000000000000000000000000000000aa00000011", { from: accounts[0] });
    await productLookupTable.removeProduct("0x000000000000000000000000000000aa00000012", { from: accounts[2] });
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000012");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 1, "length is not 0");
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000011");
    assert.equal(product.name, "xoryt", "could not lookup entry");
  });
  it("should fail if sender is not the owner", async() => {
    // add xoryt for accounts[0] but remove non-existing accounts[2]
    await productLookupTable.addProduct("xoryt", "0x000000000000000000000000000000aa00000011", { from: accounts[0] });
    await productLookupTable.removeProduct("0x000000000000000000000000000000aa00000012", { from: accounts[2] });
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000012");
    products = await productLookupTable.getProducts.call();
    assert.equal(product.name, "", "could not lookup entry");
    assert.equal(products.length, 1, "length is not 0");
    product = await productLookupTable.getProduct.call("0x000000000000000000000000000000aa00000011");
    assert.equal(product.name, "xoryt", "could not lookup entry");
  });
});
