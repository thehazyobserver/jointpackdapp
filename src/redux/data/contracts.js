// src/redux/data/contracts.js
import erc721Abi from '../blockchain/abis/erc721Abi.json'; // Ensure the ABI file is correctly imported
import config from '../../config/config.json'; // Import your config.json

export const LootBoxNFT = {
  abi: erc721Abi,
  address: config.CONTRACT_ADDRESS, // Use the address from your config.json
};