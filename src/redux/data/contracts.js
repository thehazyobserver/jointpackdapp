// src/redux/data/contracts.js
import erc721Abi from '../blockchain/abis/erc721Abi.json'; // Ensure the ABI file is correctly imported

export const LootBoxNFT = {
  abi: erc721Abi,
  address: "", // Address will be set dynamically
};