import Web3 from "web3";
import { fetchData } from "../data/dataActions";
import erc721Abi from "./abis/erc721Abi.json"; // ERC721 contract ABI

// Action Types
export const CONNECT_REQUEST = "CONNECT_REQUEST";
export const CONNECT_SUCCESS = "CONNECT_SUCCESS";
export const CONNECT_FAILED = "CONNECT_FAILED";
export const OPEN_LOOTBOX_REQUEST = "OPEN_LOOTBOX_REQUEST";
export const OPEN_LOOTBOX_SUCCESS = "OPEN_LOOTBOX_SUCCESS";
export const OPEN_LOOTBOX_FAILED = "OPEN_LOOTBOX_FAILED";

// Connect to the blockchain
export const connect = (CONFIG) => {
  return async (dispatch) => {
    dispatch({ type: CONNECT_REQUEST });

    if (!CONFIG) {
      console.error("CONFIG data is missing.");
      dispatch({
        type: CONNECT_FAILED,
        payload: "Configuration data is missing.",
      });
      return;
    }

    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await window.ethereum.request({
          method: "net_version",
        });

        // Check if connected to the correct network
        if (networkId === CONFIG.NETWORK.ID.toString()) {
          console.log("ERC721 ABI:", erc721Abi);
          console.log("Contract Address:", CONFIG.CONTRACT_ADDRESS);

          // Initialize the LootBoxNFT contract
          const nftContract = new web3.eth.Contract(
            erc721Abi,
            CONFIG.CONTRACT_ADDRESS
          );

          console.log("NFT Contract Initialized:", nftContract);

          // Dispatch connection success
          dispatch({
            type: CONNECT_SUCCESS,
            payload: {
              account: accounts[0],
              web3,
              nftContract,
              networkId,
            },
          });

          // Fetch data for the connected account
          dispatch(fetchData(accounts[0]));
        } else {
          console.error("Wrong network. Please switch to the correct network.");
          dispatch({
            type: CONNECT_FAILED,
            payload: `Please connect to the ${CONFIG.NETWORK.NAME} Mainnet.`,
          });
        }
      } catch (err) {
        console.error("Failed to connect to the blockchain:", err);
        dispatch({
          type: CONNECT_FAILED,
          payload: "Failed to connect to the blockchain.",
        });
      }
    } else {
      console.error("MetaMask or other Web3 wallet not detected.");
      dispatch({
        type: CONNECT_FAILED,
        payload: "Please install a Web3 wallet like MetaMask.",
      });
    }
  };
};

// Open a loot box
export const openLootBox = (tokenId) => {
  return async (dispatch, getState) => {
    dispatch({ type: OPEN_LOOTBOX_REQUEST });

    const state = getState();
    const { account, web3, nftContract } = state.blockchain;

    if (!account || !web3 || !nftContract) {
      dispatch({
        type: OPEN_LOOTBOX_FAILED,
        payload: "Please connect your wallet first.",
      });
      return;
    }

    try {
      // Send the transaction to open the loot box
      await nftContract.methods.openLootBox(tokenId).send({ from: account });

      console.log(`LootBox #${tokenId} opened successfully.`);
      dispatch({
        type: OPEN_LOOTBOX_SUCCESS,
        payload: `LootBox #${tokenId} opened successfully.`,
      });

      // Fetch updated data after opening the loot box
      dispatch(fetchData(account));
    } catch (err) {
      console.error("Failed to open the loot box:", err);
      dispatch({
        type: OPEN_LOOTBOX_FAILED,
        payload: "Failed to open the loot box. Check the console for details.",
      });
    }
  };
};
