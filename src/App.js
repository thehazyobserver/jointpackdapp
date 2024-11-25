// App.js
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { initializeContract, fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import defaultImage from "./assets/images/JOINTPACK.jpg"; // Re-import the default image

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

const NFTBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 200px;
  margin: 5px;
  border: 5px solid black; /* Change border color to black */
  background-color: white; /* Change background color to white */
  text-align: center;
`;

const NFTImage = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
`;

const StyledButton = styled.button`
  padding: 10px;
  border-radius: 0; /* Make the button rectangular */
  border: none;
  background-color: black; /* Make the button black */
  font-weight: bold;
  color: white; /* Font color white */
  width: 100%; /* Make the button the width of the box */
  cursor: pointer;
  text-align: center;

  :hover {
    background-color: #444; /* Darker shade on hover */
  }
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [selectedToken, setSelectedToken] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [configLoaded, setConfigLoaded] = useState(false);
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
  const getConfig = useCallback(async () => {
    try {
      const configResponse = await fetch("/config/config.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const config = await configResponse.json();
      SET_CONFIG(config);
      setConfigLoaded(true);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  }, []);

  useEffect(() => {
    getConfig();
  }, [getConfig]);

  // Connect Wallet Handler
  const handleConnectWallet = () => {
    if (configLoaded) {
      dispatch(connect(CONFIG));
    } else {
      console.error("Config not loaded yet.");
    }
  };

  // Initialize contract when account and web3 are available
  useEffect(() => {
    if (blockchain.account && blockchain.web3 && CONFIG.CONTRACT_ADDRESS) {
      dispatch(initializeContract(CONFIG.CONTRACT_ADDRESS));
    }
  }, [blockchain.account, blockchain.web3, dispatch, CONFIG.CONTRACT_ADDRESS]);

  // Fetch data when contract is initialized
  useEffect(() => {
    if (blockchain.account && blockchain.LootBoxNFT) {
      dispatch(fetchData());
    }
  }, [blockchain.account, blockchain.LootBoxNFT, dispatch]);

  // Handle account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        dispatch({ type: "UPDATE_ACCOUNT", payload: { account: accounts[0] } });
        dispatch(initializeContract(CONFIG.CONTRACT_ADDRESS));
        dispatch(fetchData());
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup function
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [dispatch, CONFIG.CONTRACT_ADDRESS]);

  // Poll for RewardClaimed event
  const pollForRewardClaimed = async (tokenId, fromBlock) => {
    const pollInterval = 2000; // Poll every 2 seconds
    const pollTimeout = 60000; // Timeout after 60 seconds
    const startTime = Date.now();

    const poll = async () => {
      try {
        const events = await blockchain.LootBoxNFT.getPastEvents('RewardClaimed', {
          filter: { user: blockchain.account, tokenId: tokenId },
          fromBlock: fromBlock,
          toBlock: 'latest',
        });

        if (events.length > 0) {
          const { amount } = events[0].returnValues;
          setRewardMessage(
            `You have received ${blockchain.web3.utils.fromWei(amount, 'ether')} $JOINT from $JOINT PACK #${tokenId}. The $JOINT PACK is now burnt.`
          );
          dispatch(fetchData());
        } else if (Date.now() - startTime < pollTimeout) {
          setTimeout(poll, pollInterval);
        } else {
          setRewardMessage('Reward not received within the expected time. Please check your wallet later.');
        }
      } catch (error) {
        console.error('Error polling for RewardClaimed event:', error);
        setRewardMessage('An error occurred while fetching your reward. Please check your wallet later.');
      }
    };

    poll();
  };

  // Open LootBox
  const openLootBox = async (tokenId) => {
    try {
      setRewardMessage(`Opening LootBox #${tokenId}...`);

      const tx = await blockchain.LootBoxNFT.methods
        .openLootBox(tokenId)
        .send({ from: blockchain.account, gas: CONFIG.GAS_LIMIT });

      console.log('Transaction Receipt:', tx);

      const transactionHash = tx.transactionHash;

      let fromBlock;

      if (tx.blockNumber) {
        fromBlock = tx.blockNumber;
      } else {
        // Fetch the transaction receipt if blockNumber is not present
        const txReceipt = await blockchain.web3.eth.getTransactionReceipt(transactionHash);
        fromBlock = txReceipt.blockNumber;
      }

      setRewardMessage(
        `LootBox #${tokenId} opened successfully. Waiting for reward...`
      );

      // Poll for RewardClaimed event
      pollForRewardClaimed(tokenId, fromBlock);
    } catch (error) {
      console.error('Error opening lootbox:', error);
      setRewardMessage('Failed to open LootBox. Check console for details.');
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
        <StyledButton onClick={handleConnectWallet} disabled={!configLoaded}>
          {blockchain.account
            ? `Connected: ${truncate(blockchain.account, 15)}`
            : "Connect Wallet"}
        </StyledButton>

        {blockchain.errorMsg !== "" && (
          <s.TextDescription
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "var(--accent-text)",
            }}
          >
            {blockchain.errorMsg}
          </s.TextDescription>
        )}

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
                  <NFTBox key={tokenId}>
                    <NFTImage
                      src={image || defaultImage} // Use defaultImage if image is not provided
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
                  </NFTBox>
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