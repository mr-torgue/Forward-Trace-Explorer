import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

/*
register participant 
*/
function Register() {
	const { state: { accounts, contractParticipantLookup } } = useEth();
  	const [participantName, setParticipantName] = useState("");
  	const [outputLabel, setOutputLabel] = useState("");

	function registerParticipant(e) {
		try {
			if(participantName === "") {
				setOutputLabel("Participant Name is not set!");
			}
			else {
				const deployContract = async () => {
					await contractParticipantLookup.methods.addParticipant(participantName).send({ from: accounts[0] });
					setOutputLabel("Executed!");
				}
				deployContract();
			}
		}
		catch(err) {
			setOutputLabel("Something went wrong: " + err);
		}
	}

    function handleNameChange(e) {
    	setParticipantName(e.target.value);
    }

	return (
		<form>
			<h2>Register Participant</h2>
				<div className="row">
				    <div className="col-25">
				      <label>Name</label>
				    </div>
				    <div className="col-75">
						<input type="text" id="participantName" name="participantName" value={participantName} onChange={handleNameChange} />
					</div>
				</div>
				<input type="button" id="register" value="Register" onClick={registerParticipant} /><br />
				<label id="address_output">{outputLabel}</label>
		</form>
	);
}

export default Register;
