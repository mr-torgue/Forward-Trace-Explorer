// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


/*
Represents the trace of a product.
Product is identified by productId.
Contains the path the product has to follow.
*/
contract Product {
	address public owner;
	address[] public path;
	Event[] public trace;
	string public name;

	struct Event {
		address actor;
		string data;
		string key;
		bytes32 hmac;
		uint8 v;
		bytes32 r;
		bytes32 s;
		uint timestamp;
	}

	constructor(string memory _name, address[] memory _path) {
		name = _name;
		owner = msg.sender;
		path = _path;
	}

    function uint2str(uint256 _i) internal pure returns (string memory) {
		if (_i == 0) {
			return "0";
		}
		uint256 j = _i;
		uint256 length;
		while (j != 0) {
			length++;
			j /= 10;
		}
		bytes memory bstr = new bytes(length);
		uint256 k = length;
		j = _i;
		while (j != 0) {
			bstr[--k] = bytes1(uint8(48 + j % 10));
			j /= 10;
		}
		return string(bstr);
	}

	/*
	verifies the trace against the path.
	*/
	function verify() view public returns(bool) {
		for(uint i = 0; i < trace.length; i++) {
			require(path[i] == trace[i].actor, "PATH DOES NOT MATCH TRACE");
		}
		return true;
	}

	/*
	update updates the trace if the sender is the next step. 
	Data is the plaintext data. It is public and will be stored. There is no standard.
	Key is the previous shared key. It is already been used.
	Hmac is the hash of data + a key. This key is not known yet. This key is on the tag and will be submitted when the next reader wants to update.
	_v, _r and _s represent the signature of the data. Hmac signing would be more efficient, but signing of data is more transparant.
	*/
	function update(string memory data, string memory previouskey, bytes32 hmac, uint8 _v, bytes32 _r, bytes32 _s) public returns(bool) {
		// necesarry? Because this action takes a lot of calculations.
		require(verify(), "INVALID");
		require(trace.length != path.length, "TRACE IS AT END");
		require(msg.sender == path[trace.length], "SENDER IS DIFFERENT");
		// test if data is signed
		bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes32 prefixedData = keccak256(abi.encodePacked(prefix, uint2str(bytes(data).length), data));
        address signer = ecrecover(prefixedData, _v, _r, _s);
   		require(signer != address(0), "INVALID SIGNATURE");
		require(signer == msg.sender, "SENDER DID NOT SIGN DATA");
		// test the previous data because we know the previouskey now
		if(trace.length > 0) {
			Event memory last = trace[trace.length - 1];
			bytes memory datakey = bytes(string.concat(last.data, previouskey));
			require(keccak256(abi.encodePacked(prefix, uint2str(datakey.length), datakey)) == last.hmac, "OLD HMAC IS INCORRECT");
		}
		trace.push(Event(msg.sender, data, previouskey, hmac, _v, _r, _s, block.timestamp));
		return true;
	}

	function getPath() public view returns (address[] memory) {
  		return path;
  	}

  	function getTrace() public view returns (Event[] memory) {
  		return trace;
  	}
}