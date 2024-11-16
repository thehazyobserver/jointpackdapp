const initialState = {
  loading: false,
  account: null,
  nftContract: null, // To store the LootBoxNFT contract
  web3: null,
  errorMsg: "", // General error message for the connection
  openLootBoxErrorMsg: "", // Specific error message for opening loot boxes
  isOpeningLootBox: false, // Flag for loot box opening process
  networkId: null, // Added to track network ID, useful for ensuring correct network connection
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
        nftContract: action.payload.nftContract, // Storing the LootBoxNFT contract
        web3: action.payload.web3,
        networkId: action.payload.networkId, // Storing network ID to ensure correct network
        errorMsg: "", // Clear error messages on success
      };

    case "CONNECT_FAILED":
      return {
        ...state,
        loading: false,
        account: null, // Reset account if connection failed
        nftContract: null, // Clear the contract if connection failed
        web3: null, // Clear web3 on failure
        errorMsg: action.payload, // Set the error message for connection failure
      };

    case "OPEN_LOOTBOX_REQUEST":
      return {
        ...state,
        isOpeningLootBox: true,
        openLootBoxErrorMsg: "", // Clear any previous loot box opening errors
      };

    case "OPEN_LOOTBOX_SUCCESS":
      return {
        ...state,
        isOpeningLootBox: false,
        openLootBoxErrorMsg: "", // Clear loot box opening errors on success
      };

    case "OPEN_LOOTBOX_FAILED":
      return {
        ...state,
        isOpeningLootBox: false,
        openLootBoxErrorMsg: action.payload, // Set loot box opening error message on failure
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
