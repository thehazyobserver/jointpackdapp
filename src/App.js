// App.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { initializeContract, fetchData } from "./redux/data/dataActions"; // Import actions
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import defaultImage from "./assets/images/JOINTPACK.jpg"; // Update the import path

// Utility Functions
const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

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
  height: 100px; // Ensure height is set
  margin: 5px;
  border: ${({ selected }) => (selected ? "5px solid var(--accent)" : "none")};
  cursor: pointer;
  display: block; // Ensure it's displayed
  z-index: 10; // Ensure it's above other elements
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
  const data = useSelector((state) => state.data); // Access data from Redux state
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

  useEffect(() => {
    getConfig();
  }, []);

  // Connect Wallet Handler
  const handleConnectWallet = () => {
    dispatch(connect());
  };

  // Initialize contract when account and web3 are available
  useEffect(() => {
    if (blockchain.account && blockchain.web3) {
      dispatch(initializeContract());
    }
  }, [blockchain.account, blockchain.web3, dispatch]);

  // Fetch data when contract is initialized
  useEffect(() => {
    if (blockchain.account && blockchain.LootBoxNFT) {
      dispatch(fetchData());
    }
  }, [blockchain.account, blockchain.LootBoxNFT, dispatch]);

  // Open LootBox
  const openLootBox = async (tokenId) => {
    try {
      await blockchain.LootBoxNFT.methods
        .openLootBox(tokenId)
        .send({ from: blockchain.account });
      setRewardMessage(
        `LootBox #${tokenId} opened successfully. Check your balance for rewards.`
      );
      // Refresh the NFT list after opening a LootBox
      dispatch(fetchData());
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
        <StyledButton onClick={handleConnectWallet}>
          {blockchain.account
            ? `Connected: ${truncate(blockchain.account, 15)}`
            : "Connect Wallet"}
        </StyledButton>

        {blockchain.account && blockchain.LootBoxNFT ? (
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
            {data.nfts && data.nfts.length > 0 ? (
              <NFTGrid>
                {data.nfts.map(({ tokenId, image }) => (
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
              <s.TextDescription
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  color: "var(--accent-text)",
                }}
              >
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