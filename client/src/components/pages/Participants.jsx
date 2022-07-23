import { useState, useEffect } from "react";
import AsyncSelect from 'react-select/async';
import useEth from "../../contexts/EthContext/useEth";

/*
this view shows all the participants and allows a user to register new products.
the flow is as follows:
- the user clicks a participant from the dropdown list
- Dapp shows the information for this participant
- the user can add the selected participant to the path
- the information panel will contain a view of the smart contract
- when submitted the Dapp will create a new product and register the product to the lookup table
- after submission the Dapp will show the information the user has to use (QR)
*/
function Participants() {
	const { state: { accounts, web3, artifactProduct, contractParticipantLookup, contractProductLookup } } = useEth();
  	const [path, setPath] = useState([]);
  	const [outputLabel, setOutputLabel] = useState("");
  	const [productName, setProductName] = useState("");
  	const [selectedAddress, setSelectedAddress] = useState();
  	const [addressInput, setAddressInput] = useState("");
  	const [participants, setParticipants] = useState([]);

  	const handleInputChange = e => {
		setProductName(e.target.value);
	};

	function addAddress(e) {
		if(selectedAddress) {
			setPath(previous => [...previous, selectedAddress]);
			setOutputLabel("Added " + selectedAddress.label + " to path!");
		}
		else {
			setOutputLabel("No participant selected!");
		}
	}

	function emptyAddresses(e) {
		try {
			setPath([]);
			setOutputLabel("Cleared path!");
		}
		catch(err) {
			setOutputLabel("Something went wrong!");
		}
	}

	function submitPath(e) {
		try {
			if(path.length === 0) {
				setOutputLabel("Path is empty!");
			}
			else if(productName === "") {
				setOutputLabel("Product Name is not set!");
			}
			else {
				console.log("Creating a new contract!");

				const deployContract = async () => {
					const pathAddresses = path.map(item => (item.value));
					const product = await new web3.eth.Contract(artifactProduct.abi).deploy({data : artifactProduct.bytecode, arguments: [productName, pathAddresses]}).send({ from: accounts[0] });
					const productAddress = product.options.address;
					await contractProductLookup.methods.addProduct(productName, productAddress).send({ from: accounts[0] });
					setOutputLabel("Executed!");
				}
				deployContract();
			}
		}
		catch(err) {
			setOutputLabel("Something went wrong: " + err);
		}
	}
	
	const loadOptions = (inputValue, callback) => {
		setTimeout(() => {
	      callback(participants.filter(item => item.label.toLowerCase().includes(inputValue.toLowerCase())));
	    }, 1000);
    };

    function handleAddressChange(selected) {
    	setSelectedAddress(selected);
    }

    function handleAddressInputChange(value) {
    	setAddressInput(value);
    }

    useEffect(() => {
	    const loadParticipants = async () => {
	      try {
	      	const newParticipants = [];
	        const participantsAddresses = await contractParticipantLookup.methods.getParticipants().call();
            for (var i=0; i < participantsAddresses.length; i++) {
              	newParticipants.push(await contractParticipantLookup.methods.getParticipant(participantsAddresses[i]).call());
            }
            setParticipants(newParticipants.map(item => ({"label": item.name, "value": item.addr })));
	      } catch (err) {
	        console.error(err);
	      }
	    };
	    if(contractParticipantLookup) { loadParticipants(); }
	  }, [contractParticipantLookup]);

	return (
		<form>
			<h2>Add product</h2>
			<div className="row">
			    <div className="col-25">
					<label>Participants</label>
				</div>
				<div className="col-75">
				    <AsyncSelect defaultOptions={participants} onChange={handleAddressChange} onInputChange={handleAddressInputChange} 
					    value={selectedAddress} loadOptions={loadOptions} placeholder="Select participant" isSearchable="true" />
				</div>
			</div>
			<div className="row">
				<input type="button" id="add_address" value="Add selected address to trace" onClick={addAddress} />
			</div>
			<div className="row">
				<div className="col-25">
					<label>Product name</label>
				</div>
				<div className="col-75">
					<input type="text" id="pid" name="pid" value={productName} onChange={handleInputChange} />
				</div>
			</div>
			<div className="row">
				<h2>Preview</h2>
			</div>
			<div id="address_list">
				<div className="row">
				    <div className="col-25">
						<label>Path</label>
					</div>
					<div className="col-75">
						<label>
							<ol>
								{path.map((item, i) => (<li key={i}>{item.label}</li>))}
							</ol>
						</label>
					</div>
				</div>
				<div className="row">
				    <div className="col-25">
						<label>Product Name</label>
					</div>
					<div className="col-75">
						<label>{productName}</label>
					</div>
				</div>
				<div className="row">
				    <div className="col-25">
						<label>Sender</label>
					</div>
					<div className="col-75">
						<label>{accounts[0]}</label>
					</div>
				</div>
			</div>
			<input type="button" id="empty_addresses" value="Clear Forward Trace" onClick={emptyAddresses} />
			<input type="button" id="submit_forward_trace" value="Submit Forward Trace" onClick={submitPath} /><br />
			<label id="address_output">{outputLabel}</label>
		</form>
	);
}

export default Participants;