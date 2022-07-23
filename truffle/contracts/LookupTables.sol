// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


/*
A lookup table for products.
The key is the smart contract address for each product.
Each product has an owner.
*/
contract ProductLookupTable {

	struct Product{
		address addr;
		address owner;
		string name;
	}

	mapping (address => Product) private address2product;
	mapping (string => Product) private name2product;
	address[] private products;

	function addProduct(string memory name, address addr) public returns (bool) {
		// name and address should be empty
		require(bytes(address2product[addr].name).length == 0, "CANNOT REGISTER EXISTING ADDRESS");
		require(bytes(name2product[name].name).length == 0, "CANNOT REGISTER EXISTING PRODUCT NAME");
		require(bytes(name).length > 0, "CANNOT REGISTER WITHOUT PRODUCT NAME");
		products.push(addr);
		Product memory p = Product(addr, msg.sender, name);	
		address2product[addr] = p;
		name2product[name] = p;
		return true;
  	}

  	function removeProduct(address addr) public returns (bool) {
  		for(uint i=0; i < products.length; i++) {
  			if(products[i] == addr) {
  				require(msg.sender == address2product[addr].owner, "NOT AUTHORIZED, ADDRESS MISMATCH!");
  				delete name2product[address2product[addr].name];
  				delete address2product[addr];
  				products[i] = products[products.length-1];
  				products.pop();
  				return true;
  			} 
  		}
  		return false;
  	}

  	function getProduct(address addr) public view returns (Product memory) {
  		return address2product[addr];
  	}

  	function getProducts() public view returns (address[] memory) {
  		return products;
  	}
}

contract ParticipantLookupTable {
	
	struct Participant{
		address addr;
		string name;
	}

	mapping (address => Participant) private address2participant;
	mapping (string => Participant) private name2participant;
	address[] private participants;

	/*

	*/
	function addParticipant(string memory name) public returns (bool) {
		require(bytes(address2participant[msg.sender].name).length == 0, "CANNOT REGISTER EXISTING ADDRESS");
		require(bytes(name2participant[name].name).length == 0, "CANNOT REGISTER EXISTING PARTICIPANT NAME}");
		require(bytes(name).length > 0, "CANNOT REGISTER WITHOUT PARTICIPANT NAME");
		participants.push(msg.sender);
		Participant memory p = Participant(msg.sender, name);	
		address2participant[msg.sender] = p;
		name2participant[name] = p;
		return true;
  	}

  	/*
  	removes participant: msg.sender.
  	*/
  	function removeParticipant() public returns (bool) {
  		for(uint i=0; i < participants.length; i++) {
  			if(participants[i] == msg.sender) {
  				delete name2participant[address2participant[msg.sender].name];
  				delete address2participant[msg.sender];
  				participants[i] = participants[participants.length-1];
  				participants.pop();
  				return true;
  			} 
  		}
  		return false;
  	}

  	function getParticipant(address addr) public view returns (Participant memory) {
  		return address2participant[addr];
  	}

  	function getParticipants() public view returns (address[] memory) {
  		return participants;
  	}
}
