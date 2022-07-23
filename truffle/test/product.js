const ParticipantLookupTable = artifacts.require("ParticipantLookupTable");
const ProductLookupTable = artifacts.require("ProductLookupTable");
const Product = artifacts.require("Product");
const truffleAssert = require('truffle-assertions');

contract('Product', (accounts) => {

  let privkeys, participantLookupTable, productLookupTable, participants, participant, res, product1, product2, product3, key, hmac, signature, r, s, v, data, trace;

  before(async() => {
    // initialize lookup tables
    participantLookupTable = await ParticipantLookupTable.deployed();
    productLookupTable = await ProductLookupTable.deployed();
    // very bad look for other way in future
    privkeys = ["debf6a8aba9462cf646df706fae646bfb029b5f12e3d651abe7f9597623de7e5", "e062ac1895f4f90c76b703ddb2764d54abbbc442094bd25e54e131e57843b0e9", 
    "25194d8b8fba3c205f262b95551633772f1bd74d24a764ae062045d288ca6831", "5d8346079042d7bef029cd3110bc4bacf9956c4ee7d4da51fb04481d57cbc596",
    "882dd6215196242e8bf677a9b399c9b189ddc2c5345acdd36e705c2c9d8b0b82", "f694e4934850600bb92c352f84ac0f311502ebe15d21b3aca2d99677531e91d2",
    "0f7e43ceae29fdebcf58b1f71351466bf59f9bf4925562f563f451417dcd5e9e", "57681d06be21bfb387cc5f4e078fd84a3b3fdb2a20a591d0f1ee27af1d0c9496",
    "df4ee55dc191f7d8fc388176f35778287f8921d7ea754f06a0dce6b5733d2be2", "d6a17d2b6ca4e121adbc39e2d7cba59f0b34cd31b20483abd30896d4c6998de2"]
    // add 10 participants
    for(var i = 0; i < 10; i++) {
      participantLookupTable.addParticipant("participant " + i, { from: accounts[i] });
    }
  });
  beforeEach(async() => {
    // empty products
    products = await productLookupTable.getProducts.call();
    for(var i=0; i < products.length; i++) {
      product = await productLookupTable.getProduct.call(products[i]);
      await productLookupTable.removeProduct(product.addr, { from: product.owner });
    }
    products = await productLookupTable.getProducts.call();
    assert.equal(products.length, 0, "length is not 0");
    // create a few products
    // product 1 follows 7->3->5->1
    product1 = await Product.new("product 1", [accounts[7], accounts[3], accounts[5], accounts[1]]);
    productLookupTable.addProduct("product 1", product1.address, { from: accounts[0] });
    // product 2 follows 8->2->3->8->1->0
    product2 = await Product.new("product 2", [accounts[8], accounts[2], accounts[3], accounts[8], accounts[1], accounts[0]]);
    productLookupTable.addProduct("product 2", product2.address, { from: accounts[1] });
    // product 3 follows 0->1
    product3 = await Product.new("product 3", [accounts[0], accounts[1]]);
    productLookupTable.addProduct("product 3", product3.address, { from: accounts[2] });
  });
  it("should test successful update of product 1", async() => {
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key1");
    signature = await web3.eth.accounts.sign(data, privkeys[7]);
    res = await product1.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[7] });
    trace = await product1.getTrace.call();
    assert.equal(trace.length, 1, "length not equal to 1");
    assert.equal(trace[trace.length-1].actor, accounts[7], "last event does not match accounts[7]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "sdfdsfds";
    hmac = await web3.eth.accounts.hashMessage(data + "key2");
    signature = await web3.eth.accounts.sign(data, privkeys[3]);
    res = await product1.update(data, "key1", hmac, signature.v, signature.r, signature.s, { from: accounts[3] });
    trace = await product1.getTrace.call();
    assert.equal(trace.length, 2, "length not equal to 2");
    assert.equal(trace[trace.length-1].actor, accounts[3], "last event does not match accounts[3]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "wedss";
    hmac = await web3.eth.accounts.hashMessage(data + "key3");
    signature = await web3.eth.accounts.sign(data, privkeys[5]);
    res = await product1.update(data, "key2", hmac, signature.v, signature.r, signature.s, { from: accounts[5] });
    trace = await product1.getTrace.call();
    assert.equal(trace.length, 3, "length not equal to 3");
    assert.equal(trace[trace.length-1].actor, accounts[5], "last event does not match accounts[5]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "sdfsd sdfsf";
    hmac = await web3.eth.accounts.hashMessage(data + "key4");
    signature = await web3.eth.accounts.sign(data, privkeys[1]);
    res = await product1.update(data, "key3", hmac, signature.v, signature.r, signature.s, { from: accounts[1] });
    trace = await product1.getTrace.call();
    assert.equal(trace.length, 4, "length not equal to 4");
    assert.equal(trace[trace.length-1].actor, accounts[1], "last event does not match accounts[1]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");
  });
  it("should test if update fails if signed by another participant", async() => {
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key");
    signature = await web3.eth.accounts.sign(data, privkeys[0]);
    await truffleAssert.reverts(product1.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[0] }), 
      "SENDER IS DIFFERENT");
  });
  it("should test if update fails if signature is incorrect", async() => {
    // wrong private key
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key");
    signature = await web3.eth.accounts.sign(data, privkeys[0]);
    await truffleAssert.reverts(product1.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[7] }), 
      "SENDER DID NOT SIGN DATA");

    // wrong data
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key");
    signature = await web3.eth.accounts.sign("wrongdata", privkeys[1]);
    await truffleAssert.reverts(product1.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[1] }), 
      "SENDER IS DIFFERENT");
  });
  it("should test if update fails if hmac is incorrect", async() => {
    // add 1 step first
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key1");
    signature = await web3.eth.accounts.sign(data, privkeys[7]);
    res = await product1.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[7] });
    trace = await product1.getTrace.call();
    assert.equal(trace.length, 1, "length not equal to 1");
    assert.equal(trace[trace.length-1].actor, accounts[7], "last event does not match accounts[7]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "key");
    signature = await web3.eth.accounts.sign(data, privkeys[3]);
    await truffleAssert.reverts(product1.update(data, "wrongkey", hmac, signature.v, signature.r, signature.s, { from: accounts[3] }), 
      "OLD HMAC IS INCORRECT");
  });
  it("should test if update fails if trace is complete", async() => {
    // add 1 step first
    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "abcd");
    signature = await web3.eth.accounts.sign(data, privkeys[0]);
    res = await product3.update(data, "", hmac, signature.v, signature.r, signature.s, { from: accounts[0] });
    trace = await product3.getTrace.call();
    assert.equal(trace.length, 1, "length not equal to 1");
    assert.equal(trace[trace.length-1].actor, accounts[0], "last event does not match accounts[0]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "abcdef");
    signature = await web3.eth.accounts.sign(data, privkeys[1]);
    res = await product3.update(data, "abcd", hmac, signature.v, signature.r, signature.s, { from: accounts[1] });
    trace = await product3.getTrace.call();
    assert.equal(trace.length, 2, "length not equal to 2");
    assert.equal(trace[trace.length-1].actor, accounts[1], "last event does not match accounts[1]");
    assert.equal(trace[trace.length-1].data, data, "data does not match");

    data = "data";
    hmac = await web3.eth.accounts.hashMessage(data + "abcdefg");
    signature = await web3.eth.accounts.sign(data, privkeys[1]);
    await truffleAssert.reverts(product3.update(data, "abcdef", hmac, signature.v, signature.r, signature.s, { from: accounts[1] }), 
      "TRACE IS AT END");
    trace = await product3.getTrace.call();
  });
});
