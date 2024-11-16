import store from "../store";

// Action creators for fetch requests
const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

// Helper function to fetch token URIs
const fetchTokenURIs = async (contract, tokenIds) => {
  try {
    const tokenURIs = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const uri = await contract.methods.tokenURI(tokenId).call();
        return uri || `URI not available for tokenId: ${tokenId}`; // Fallback if URI is not available
      })
    );
    return tokenURIs;
  } catch (error) {
    console.error("Error fetching token URIs:", error);
    return []; // Return an empty array if there's an issue
  }
};

// Fetch token data (LootBoxes)
export const fetchData = (account) => {
  return async (dispatch, getState) => {
    dispatch(fetchDataRequest());

    try {
      const { blockchain } = getState(); // Access blockchain state
      const { nftContract } = blockchain; // Use nftContract for LootBoxNFT interaction

      // Check if contract is initialized before making calls
      if (!nftContract) {
        console.error("LootBoxNFT contract is not initialized.");
        throw new Error("LootBoxNFT contract is not initialized.");
      }

      // Fetch the user's ERC721 LootBoxes
      const lootBoxBalance = await nftContract.methods.balanceOf(account).call();
      const lootBoxTokenIds = [];
      for (let i = 0; i < lootBoxBalance; i++) {
        const tokenId = await nftContract.methods.tokenOfOwnerByIndex(account, i).call();
        lootBoxTokenIds.push(tokenId);
      }
      console.log("Fetched LootBox token IDs:", lootBoxTokenIds);

      const lootBoxTokenURIs = lootBoxTokenIds.length > 0
        ? await fetchTokenURIs(nftContract, lootBoxTokenIds)
        : [];

      // Dispatch the fetched data to the state
      dispatch(
        fetchDataSuccess({
          lootBoxTokenIds, // LootBox token IDs
          lootBoxTokenURIs, // LootBox token URIs
        })
      );
    } catch (err) {
      console.error("Error fetching data from blockchain:", err);
      dispatch(fetchDataFailed("Could not load data from the contract."));
    }
  };
};
