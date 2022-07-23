import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifactProductLookup, artifactParticipantLookup, artifactProduct) => {
      if (artifactProductLookup && artifactParticipantLookup && artifactProduct) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        let contractProductLookup, contractParticipantLookup;
        try {
            contractProductLookup = new web3.eth.Contract(artifactProductLookup.abi, artifactProductLookup.networks[networkID].address);
            contractParticipantLookup = new web3.eth.Contract(artifactParticipantLookup.abi, artifactParticipantLookup.networks[networkID].address);
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifactProductLookup, contractProductLookup, artifactParticipantLookup, contractParticipantLookup, artifactProduct, web3, accounts, networkID }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifactProduct = require("../../contracts/Product.json");
        const artifactProductLookup = require("../../contracts/ProductLookupTable.json");
        const artifactParticipantLookup = require("../../contracts/ParticipantLookupTable.json");
        init(artifactProductLookup, artifactParticipantLookup, artifactProduct);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
        init(state.artifactProductLookup, state.artifactParticipantLookup, state.artifactProduct);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifactProduct, state.artifactParticipantLookup, state.artifactProductLookup]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
