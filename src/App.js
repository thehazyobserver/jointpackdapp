import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

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

  useEffect(() => {
    if (blockchain.account && blockchain.erc721Contract) {
      fetchNFTs();
    }
  }, [blockchain.account, blockchain.erc721Contract]);

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

  // Fetch NFTs
  const fetchNFTs = async () => {
    try {
      const balance = await blockchain.erc721Contract.methods.balanceOf(blockchain.account).call();
      const nftData = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await blockchain.erc721Contract.methods.tokenOfOwnerByIndex(blockchain.account, i).call();
        const tokenURI = await blockchain.erc721Contract.methods.tokenURI(tokenId).call();
        const metadata = await fetch(tokenURI).then((res) => res.json());
        nftData.push({ tokenId, metadata });
      }
      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
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
                {nfts.map(({ tokenId, metadata }) => (
                  <div key={tokenId}>
                    <NFTImage
                      src={metadata.image}
                      alt={`LootBox ${tokenId}`}
                      selected={selectedToken === tokenId}
                      onClick={() => setSelectedToken(tokenId)}
                    />
                    <s.TextDescription style={{ textAlign: "center" }}>
                      {metadata.name || `Token ID: ${tokenId}`}
                    </s.TextDescription>
                    <StyledButton onClick={() => openLootBox(tokenId)}>
                      Open LootBox
                    </StyledButton>
                  </div>
                ))}
              </NFTGrid>
            ) : (
              <s.TextDescription style={{ textAlign: "center", fontSize: 20, color: "var(--accent-text)" }}>
                No LootBoxes found in your wallet.
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
