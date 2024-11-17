// src/redux/data/contracts.js
import erc721Abi from '../blockchain/abis/erc721Abi.json'; // Ensure the ABI file is correctly imported

export const LootBoxNFT = {
  abi: erc721Abi,
  address: "0xae11d8f81FacA865e79204574b9a101C05002d5b", // Use the address from your config.json
};