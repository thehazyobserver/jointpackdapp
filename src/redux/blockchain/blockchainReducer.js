// src/redux/blockchain/blockchainReducer.js

const initialState = {
  loading: false,
  account: null,
  web3: null,
  LootBoxNFT: null, // Store the LootBoxNFT contract
  errorMsg: "", // General error message for the connection
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CONNECT_REQUEST":
      return {
        ...state,
        loading: true,
        errorMsg: "", // Clear any previous connection errors
      };

    case "CONNECT_SUCCESS":
      return {
        ...state,
        loading: false,
        account: action.payload.account,
        web3: action.payload.web3,
        errorMsg: "", // Clear error messages on success
      };

    case "CONNECT_FAILED":
      return {
        ...state,
        loading: false,
        account: null, // Reset account if connection failed
        web3: null, // Clear web3 on failure
        errorMsg: action.payload, // Set the error message for connection failure
      };

    case "SET_LOOTBOXNFT_CONTRACT":
      return {
        ...state,
        LootBoxNFT: action.payload, // Store the LootBoxNFT contract
      };

    case "UPDATE_ACCOUNT":
      return {
        ...state,
        account: action.payload.account,
        errorMsg: "", // Clear general error on account update
      };

    default:
      return state;
  }
};

export default blockchainReducer;