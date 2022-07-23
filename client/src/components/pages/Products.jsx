import { useState, useEffect } from "react";
import AsyncSelect from 'react-select/async';
import useEth from "../../contexts/EthContext/useEth";

function Products() {
	const { state: { accounts, web3, artifactProduct, contractProductLookup, contractParticipantLookup } } = useEth();
  	const [outputLabel, setOutputLabel] = useState("");
  	const [productStateTable, setProductStateTable] = useState();
  	const [productInput, setProductInput] = useState("");
  	const [selectedProduct, setSelectedProduct] = useState("");
  	const [oldSharedKey, setOldSharedKey] = useState("");
  	const [data, setData] = useState("");
  	const [products, setProducts] = useState([]);
	
	function updateTrace(e) {
		const updateProduct = async () => {
			try {
				// generate new key
				let key = await web3.utils.randomHex(16);
				key = key.substring(2, key.length);
				console.log(data+key);
				// get SHA3 hash of data + oldSharedKey
				const hmac = await web3.eth.accounts.hashMessage(data + key);
				// sign data
				const signature = await web3.eth.personal.sign(data, accounts[0]);
				// get signature in right format (https://blog.chainsafe.io/how-to-verify-a-signed-message-in-solidity-6b3100277424)
				const r = signature.slice(0, 66);
			    const s = "0x" + signature.slice(66, 130);
			    const v = parseInt(signature.slice(130, 132), 16);
				// send update and hope it works
				await new web3.eth.Contract(artifactProduct.abi, selectedProduct.value).methods.update(data, oldSharedKey, hmac, v, r, s).send({ from: accounts[0] });
				setOutputLabel("Updated trace. Use this key for the next update: " + key);
			}
			catch(err) {
				setOutputLabel("Something went wrong: " + err);
			}
		}
		updateProduct();
	}

	function changeProduct(sel) {
		const getInfo = async () => {
			const product = new web3.eth.Contract(artifactProduct.abi, sel.value);
			const path = await product.methods.getPath().call();
			const trace = await product.methods.getTrace().call();
			setSelectedProduct(sel);
			setOutputLabel("Product changed to " + sel.label);
			constructPathTable(path, trace);
		}
		getInfo();
	}

	const getParticipantName = async(address) => {
		const participant = await contractParticipantLookup.methods.getParticipant(address).call();
		return participant.name !== "" ? participant.name : "PARTICIPANT NOT FOUND";
	}

	const constructPathTable = async(path, trace) => {
		const rows = [];
		for (var i=0; i < path.length; i++) {
			const pathName = await getParticipantName(path[i]);
			if(i < trace.length) {
				const traceName = await getParticipantName(trace[i].actor);
				rows.push(<tr>
						<td>
							{pathName}
							<div className="hidden"><b>Address</b><br />{path[i]}</div>
						</td>
						<td>
							{traceName}
							<div className="hidden"><b>Address</b><br />{trace[i].actor}</div>
						</td>
						<td>
							{trace[i].data}
							<div className="hidden">
								<b>Key</b><br />{trace[i].key} <br />
								<b>HMAC</b><br />{trace[i].hmac} <br />
								<b>Signature</b><br /> ({trace[i].v}, {trace[i].r}, {trace[i].s})
							</div>
						</td> 
						<td>{new Intl.DateTimeFormat('en-US', {dateStyle: 'full', timeStyle: 'long'}).format(trace[i].timestamp * 1000)}</td>
					</tr>);
			}
			else if(i === trace.length) {
				rows.push(<tr className="selected"><td><b><i>{pathName}</i></b><div className="hidden">Address: {path[i]}</div></td><td></td><td></td><td></td></tr>);
			}
			else {
				rows.push(<tr><td>{pathName}<div className="hidden">Address: {path[i]}</div></td><td></td><td></td><td></td></tr>);
			}
		}
		setProductStateTable(<table><thead><tr><th>Path</th><th>Verified by</th><th>Data</th><th>Timestamp</th></tr></thead><tbody>{rows}</tbody></table>);
	}

	const handleKeyChange = e => {
		setOldSharedKey(e.target.value);
	};

	const handleDataChange = e => {
		setData(e.target.value);
	};

	const loadOptions = (inputValue, callback) => {
		setTimeout(() => {
	      callback(products.filter(item => item.label.toLowerCase().includes(inputValue.toLowerCase())));
	    }, 1000);
    };

    function handleProductInputChange(value) {
    	setProductInput(value);
    }

    useEffect(() => {
	    const loadProducts = async () => {
	      try {
	      	const newProducts = [];
	        const productAddresses = await contractProductLookup.methods.getProducts().call();
            for (var i=0; i < productAddresses.length; i++) {
              	newProducts.push(await contractProductLookup.methods.getProduct(productAddresses[i]).call());
            }
            setProducts(newProducts.map(item => ({"label": item.name, "value": item.addr })));
	      } catch (err) {
	        console.error(err);
	      }
	    };
	    if(contractProductLookup) { loadProducts(); }
	  }, [contractProductLookup]);

  	return (
  		<div className="column">
			<form>
				<h2>Products</h2>
				<div className="row">
			    	<div className="col-25">
			    		<label>Products</label>
					</div>
					<div className="col-75">
						<AsyncSelect defaultOptions={products} onChange={changeProduct} onInputChange={handleProductInputChange} 
						 	value={selectedProduct} key={selectedProduct.value} loadOptions={loadOptions} placeholder="Select product" isSearchable="true" />
					</div>
				</div>
				<div className="row">
					<h2>Product Information</h2>
				</div>
				<div id="product_information">
					<div className="row">
				    	<div className="col-25">
							<label>Name</label>
						</div>
						<div className="col-75">
							<label>{selectedProduct.label}</label>
						</div>
					</div>
					<div className="row">
						<h2>Product Path</h2>
					</div>
					<div className="row">
						<label>{productStateTable}</label>
					</div>
				</div>
				<div className="row">
			    	<div className="col-25">
						<label id="data_label">Data record</label>
					</div>
					<div className="col-75">
						<textarea id="data" name="data" value={data} onChange={handleDataChange} />
					</div>
				</div>
				<div className="row">
			    	<div className="col-25">
						<label id="shared_key">Old shared key</label>
					</div>
					<div className="col-75">		
						<input type="password" id="secretkey" name="secretkey" value={oldSharedKey} onChange={handleKeyChange} />
					</div>
				</div>
				<input type="button" id="product_update" value="Update trace for product" onClick={updateTrace} />
				<label id="product_output">{outputLabel}</label>
			</form>
		</div>
  );
}

export default Products;
