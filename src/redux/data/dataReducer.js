const initialState = {
  loading: false,
  lootBoxTokenIds: [],          // LootBox token IDs
  lootBoxTokenURIs: [],         // LootBox token URIs
  cost: 0,                      // Optional cost, if needed
  error: false,
  errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,               // Keep current data while loading
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,               // Preserve existing data unless overwritten
        loading: false,
        lootBoxTokenIds: action.payload.lootBoxTokenIds,         // LootBox token IDs
        lootBoxTokenURIs: action.payload.lootBoxTokenURIs,       // LootBox token URIs
        // Optional handling if 'cost' is provided:
        // cost: action.payload.cost || state.cost,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...state,               // Keep previous data in case of failure
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
