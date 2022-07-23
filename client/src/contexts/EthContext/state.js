const actions = {
  init: "INIT",
};

const initialState = {
  artifactProductLookup: null,
  contractProductLookup: null,
  artifactParticipantLookup: null,
  contractParticipantLookup: null,
  artifactProduct: null,
  web3: null,
  accounts: [],
  networkID: null,
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
