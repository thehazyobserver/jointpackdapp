// src/redux/data/dataReducer.js

const initialState = {
  nfts: [],       // Array to store NFT data
  loading: false,
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_NFTS":
      return {
        ...state,
        nfts: action.payload, // Update the nfts array with fetched data
        loading: false,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        error: false,
        errorMsg: "",
        // You can remove lootBoxTokenIds and lootBoxTokenURIs if no longer needed
      };
    case "CHECK_DATA_FAILED":
      return {
        ...state,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;