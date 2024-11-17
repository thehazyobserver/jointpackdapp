// src/redux/data/dataActions.js
import { LootBoxNFT } from './contracts'; // Ensure the contract is imported correctly

export const initializeContract = () => {
  return async (dispatch, getState) => {
    try {
      const { web3, account } = getState().blockchain;
      if (!web3 || !account) {
        throw new Error("Web3 or account not found");
      }

      const lootBoxNFT = new web3.eth.Contract(LootBoxNFT.abi, LootBoxNFT.address);
      dispatch({ type: 'SET_LOOTBOXNFT_CONTRACT', payload: lootBoxNFT });
    } catch (error) {
      console.error("Error initializing LootBoxNFT contract:", error);
    }
  };
};