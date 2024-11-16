import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import defaultImage from "./assets/images/JOINTPACK.jpg"; // Update the import path

// Utility Functions
const truncate = (input, len) => (input.length > len ? `${input.substring(0, len)}...` : input);

// Styled Components
const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  justify-items: center;
  margin-bottom: 20px;
`;

const NFTImage = styled.img`
  width: 100px;
  margin: 5px;
  border: ${({ selected }) => (selected ? "5px solid var(--accent)" : "none")};
  cursor: pointer;
`;

const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  font-weight: bold;
  color: var(--secondary-text);
  width: 150px;
  cursor: pointer;
  :hover {
    background-color: var(--accent);
  }
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const [nfts, setNfts] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [rewardMessage, setRewardMessage] = useState(""); // State to store reward message
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    SHOW_BACKGROUND: true,
  });

  useEffect(() => {
    getConfig();
  }, []);

  const fetchNFTs = useCallback(async () => {
    if (!blockchain.account || !blockchain.erc721Contract) {
      console.log("Blockchain account or contract not available");
      return;
    }

    try {
      const balance = await blockchain.erc721Contract.methods.balanceOf(blockchain.account).call();
      const nftData = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await blockchain.erc721Contract.methods.tokenOfOwnerByIndex(blockchain.account, i).call();
        nftData.push({ tokenId: tokenId.toString(), image: defaultImage }); // Convert BigInt to string and use the default image
      }
      console.log("Fetched NFTs:", nftData); // Log fetched NFTs
      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }, [blockchain.account, blockchain.erc721Contract]);

  useEffect(() => {
    if (blockchain.account && blockchain.erc721Contract) {
      fetchNFTs();
    }
  }, [blockchain.account, blockchain.erc721Contract, fetchNFTs]);

  // Fetch config.json data
  const getConfig = async () => {
    try {
      const configResponse = await fetch("/config/config.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const config = await configResponse.json();
      SET_CONFIG(config);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  // Open LootBox
  const openLootBox = async (tokenId) => {
    try {
      await blockchain.erc721Contract.methods.openLootBox(tokenId).send({ from: blockchain.account });
      setRewardMessage(`LootBox #${tokenId} opened successfully. Check your balance for rewards.`);
    } catch (error) {
      console.error("Error opening lootbox:", error);
      alert("Failed to open LootBox. Check console for details.");
    }
  };

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledButton
          onClick={() => {
            dispatch(connect(CONFIG));
          }}
        >
          {blockchain.account
            ? `Connected: ${truncate(blockchain.account, 15)}`
            : "Connect Wallet"}
        </StyledButton>

        {blockchain.account && blockchain.erc721Contract ? (
          <>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Your LootBoxes
            </s.TextTitle>
            {nfts.length > 0 ? (
              <NFTGrid>
                {nfts.map(({ tokenId, image }) => (
                  <div key={tokenId}>
                    <NFTImage
                      src={image}
                      alt={`LootBox ${tokenId}`}
                      selected={selectedToken === tokenId}
                      onClick={() => setSelectedToken(tokenId)}
                    />
                    <s.TextDescription style={{ textAlign: "center" }}>
                      {`Token ID: ${tokenId}`}
                    </s.TextDescription>
                    <StyledButton onClick={() => openLootBox(tokenId)}>
                      Open LootBox
                    </StyledButton>
                  </div>
                ))}
              </NFTGrid>
            ) : (
              <s.TextDescription style={{ textAlign: "center", fontSize: 20, color: "var(--accent-text)" }}>
                No $JOINT Packs found.
              </s.TextDescription>
            )}
            {rewardMessage && (
              <s.TextDescription
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "var(--accent-text)",
                }}
              >
                {rewardMessage}
              </s.TextDescription>
            )}
          </>
        ) : (
          <s.TextDescription
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "var(--accent-text)",
            }}
          >
            Please connect your wallet to view your LootBoxes.
          </s.TextDescription>
        )}
      </s.Container>
    </s.Screen>
  );
}

export default App;