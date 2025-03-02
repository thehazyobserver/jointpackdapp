import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { initializeContract, fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles"; // if you have global styled stuff
import styled from "styled-components";
// import { Screen } from "./styles/globalStyles";

// Images
import defaultImage from "./assets/images/JOINTPACK.jpg";
import passTheJointImage from "./assets/images/PassTheJoint.gif";
import paintswapImage from "./assets/images/paintswap.png";
import telegramImage from "./assets/images/telegram.png";
import twitterImage from "./assets/images/x.png";
import bgImage from "./assets/images/bg.png"; // Adjust path if needed

// Utility function
const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

/* ------------------ Styled Components ------------------ */

// Fixed (sticky) header
const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #121212;
  display: flex;
  flex-wrap: wrap; /* allow wrapping if needed */
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  z-index: 999; /* keep above other elements */
`;

const LinksContainer = styled.div`
  display: flex;
  align-items: center;

  a {
    margin: 0 10px;
  }

  img {
    width: 40px;
    height: 40px;
    transition: transform 0.3s ease;
  }

  img:hover {
    transform: scale(1.1);
  }
`;

const StyledButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #0059d7;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #21a1f1;
  }
`;

const ConnectWalletButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #0059d7; /* Change the button color here */
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 20px;

  :hover {
    background-color: #0059d7; /* Change the hover color here */
  }
`;

const MoreJointPacksButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #ffffff; /* Change the button color here */
  font-weight: bold;
  color: #0059d7;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px; /* Added margin-top for spacing */
  margin-right: 20px;
  font-size: 16px; 

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Main content container (pushed down by fixed header)
const MainContent = styled.div`
  width: 100%;
  padding-top: 40px; /* space for the fixed header's height */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* -------- NFT Grid & Card Styles -------- */
const NFTGrid = styled.div`
  display: grid;
  /* Each column is at least 220px wide, or expands to fill space */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 35px; /* Adjusted gap for spacing between NFT boxes */
  justify-items: center;
  margin-bottom: 20px;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
`;

const NFTBox = styled.div`
  /* Use a fixed card size so the image can dominate */
  width: 220px;
  height: 300px;
  margin: 10px;
  padding: 16px;

  /* Center items in a column, distribute space between top & bottom */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background-color: #fff;
  text-align: center;
  border: 1px solid #ccc; /* softer border */
  border-radius: 8px; /* rounded corners */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NFTImage = styled.img`
  /* Let the image fill most of the card’s width, 
     maintaining aspect ratio */
  width: 100%;
  max-height: 70%;
  object-fit: cover;
  border-radius: 4px; /* optional: round image corners */
`;

const NFTText = styled(s.TextDescription)`
  text-align: center;
  display: block;
  width: 100%;
  margin-top: 10px; /* Added margin-top for spacing */
  font-weight: bold;
`;

const NFTButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 5px; /* Added margin-top for spacing */
`;

/* Container for a full-page background image (if not using s.Screen)
const BackgroundWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: url(${bgImage}) no-repeat center center;
  background-size: cover;
`; */

/* ------------------ Main App Component ------------------ */

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

      // Cleanup
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
        const events = await blockchain.LootBoxNFT.getPastEvents(
          "RewardClaimed",
          {
            filter: { user: blockchain.account, tokenId: tokenId },
            fromBlock: fromBlock,
            toBlock: "latest",
          }
        );

        if (events.length > 0) {
          const { amount } = events[0].returnValues;
          setRewardMessage(
            `YOU HAVE RECEIVED ${blockchain.web3.utils.fromWei(
              amount,
              "ether"
            )} $JOINT FROM $JOINT PACK #${tokenId}. THE $JOINT PACK IS NOW BURNT.`
          );
          dispatch(fetchData());
        } else if (Date.now() - startTime < pollTimeout) {
          setTimeout(poll, pollInterval);
        } else {
          setRewardMessage(
            "Reward not received within the expected time. Please check your wallet later."
          );
        }
      } catch (error) {
        console.error("Error polling for RewardClaimed event:", error);
        setRewardMessage(
          "An error occurred while fetching your reward. Please check your wallet later."
        );
      }
    };

    poll();
  };

  // Open LootBox
  const openLootBox = async (tokenId) => {
    try {
      setRewardMessage(`OPENING $JOINT PACK #${tokenId}...`);

      const tx = await blockchain.LootBoxNFT.methods
        .openLootBox(tokenId)
        .send({ from: blockchain.account, gas: CONFIG.GAS_LIMIT });

      console.log("Transaction Receipt:", tx);

      const transactionHash = tx.transactionHash;
      let fromBlock;

      if (tx.blockNumber) {
        fromBlock = tx.blockNumber;
      } else {
        // If blockNumber not present, fetch receipt
        const txReceipt = await blockchain.web3.eth.getTransactionReceipt(
          transactionHash
        );
        fromBlock = txReceipt.blockNumber;
      }

      setRewardMessage(
        `$JOINT PACK #${tokenId} OPENED SUCCESSFULLY. WAITING FOR REWARD....`
      );

      // Poll for RewardClaimed event
      pollForRewardClaimed(tokenId, fromBlock);
    } catch (error) {
      console.error("Error opening lootbox:", error);
      setRewardMessage("FAILED TO OPEN $JOINTPACK. CONTACT $JOINT");
    }
  };

  return (
    // <s.Screen> already supports a background image
    <s.Screen image={bgImage}>
      {/* HEADER */}
      <Header>
        <LinksContainer>
          <a
            href="https://paintswap.io/sonic/collections/0x9a303054c302b180772a96caded9858c7ab92e99/listings"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={paintswapImage} alt="PaintSwap" />
          </a>
          <a
            href="https://x.com/PassThe_JOINT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={twitterImage} alt="Twitter" />
          </a>
          <a
            href="https://t.me/jointonsonic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={telegramImage} alt="Telegram" />
          </a>
          <a
            href="https://passthejoint.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={passTheJointImage} alt="Pass the $JOINT" />
          </a>
        </LinksContainer>

        <ConnectWalletButton onClick={handleConnectWallet} disabled={!configLoaded}>
          {blockchain.account
            ? `CONNECTED: ${truncate(blockchain.account, 15)}`
            : "CONNECT WALLET"}
        </ConnectWalletButton>
      </Header>

      {/* MAIN CONTENT */}
      <MainContent>
        {blockchain.errorMsg !== "" && (
          <s.TextDescription
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "white",
              marginBottom: "20px", // Added margin-bottom for spacing
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
                color: "white",
                marginBottom: "10px", // Adjusted margin-bottom for spacing
              }}
            >
              YOUR $JOINT PACKS
            </s.TextTitle>
            <s.TextSubTitle
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                marginTop: "0px",
                marginBottom: "20px", // Added margin-bottom for spacing
              }}
            >
              OPEN TO RECEIVE 20,000 TO 1 MILLION $JOINT
            </s.TextSubTitle>
            <s.TextSubTitle
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                marginTop: "0px",
                marginBottom: "20px", // Added margin-bottom for spacing
              }}
            >
              PACKS CONTAIN ON AVERAGE 86,800 $JOINT
            </s.TextSubTitle>
            <MoreJointPacksButton 
              onClick={() => window.open("https://paintswap.io/sonic/collections/0x9a303054c302b180772a96caded9858c7ab92e99/listings", "_blank")}
            >
              GET MORE $JOINT PACKS
            </MoreJointPacksButton>
            {rewardMessage && (
              <s.TextDescription
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "white",
                  marginTop: "20px", // Added margin-top for spacing
                }}
              >
                {rewardMessage}
              </s.TextDescription>
            )}
            {data.nfts && data.nfts.length > 0 ? (
              <NFTGrid>
  {data.nfts.map(({ tokenId, image }) => (
    <NFTBox key={tokenId}>
      <NFTImage
        src={image || defaultImage}
        alt={`LootBox ${tokenId}`}
        selected={selectedToken === tokenId}
        onClick={() => setSelectedToken(tokenId)}
      />
      <NFTText>
        {`$JOINT PACK #${tokenId}`}
      </NFTText>
      <NFTButtonContainer>
        <StyledButton onClick={() => openLootBox(tokenId)}>
          OPEN $JOINT PACK
        </StyledButton>
      </NFTButtonContainer>
    </NFTBox>
  ))}
</NFTGrid>
            ) : (
              <s.TextDescription
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  color: "white",
                  marginTop: "20px", // Added margin-top for spacing
                }}
              >
                NO $JOINT PACKS FOUND. GET MORE $JOINT PACKS.
              </s.TextDescription>
            )}
          </>
        ) : (
          <s.TextDescription
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "white",
              marginTop: "40px", // Added margin-top for spacing
            }}
          >
            PLEASE CONNECT YOUR WALLET TO VIEW YOUR $JOINT PACKS.
          </s.TextDescription>
        )}
      </MainContent>
    </s.Screen>
  );
}

export default App;