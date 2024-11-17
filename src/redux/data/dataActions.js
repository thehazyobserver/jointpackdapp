// src/redux/data/dataActions.js
import { LootBoxNFT } from './contracts'; // Ensure the contract is imported correctly
import defaultImage from '../../assets/images/JOINTPACK.jpg'; // Ensure the default image is correctly imported

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

export const fetchData = () => {
  return async (dispatch, getState) => {
    try {
      const { account, LootBoxNFT } = getState().blockchain;
      if (!account || !LootBoxNFT) {
        throw new Error("Account or LootBoxNFT contract not found");
      }

      const balance = await LootBoxNFT.methods.balanceOf(account).call();
      const nftData = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await LootBoxNFT.methods.tokenOfOwnerByIndex(account, i).call();
        nftData.push({ tokenId: tokenId.toString(), image: defaultImage }); // Convert BigInt to string and use the default image
      }
      dispatch({ type: 'SET_NFTS', payload: nftData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
};