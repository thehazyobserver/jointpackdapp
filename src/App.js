import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { initializeContract, fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles"; // if you have global styled stuff
import styled, { createGlobalStyle } from "styled-components";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Leaderboard from "./components/Leaderboard";
import debounce from "lodash.debounce";

// Images
import defaultImage from "./assets/images/JOINTPACK.jpg";
import passTheJointImage from "./assets/images/PassTheJoint.gif";
import paintswapImage from "./assets/images/paintswap.png";
import telegramImage from "./assets/images/telegram.png";
import twitterImage from "./assets/images/x.png";
import bgImage from "./assets/images/bg.png";

// Utility function
const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

// Global Style for consistent box sizing
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`;

/* ------------------ Styled Components ------------------ */

// Header styles
const Header = styled.header`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #121212;
  padding: 10px 20px;
  z-index: 999;
`;

// HeaderWrapper with consistent padding
const HeaderWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 10px; /* same horizontal padding as the main content */
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Social icons container
const SocialIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    width: clamp(30px, 5vw, 40px);
    height: auto;
    transition: transform 0.3s ease;
  }
  img:hover {
    transform: scale(1.1);
  }
`;

// Main action buttons container
const MainActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

// Styled button components
const StyledButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: rgb(255, 255, 255);
  font-weight: bold;
  color: #0059d7;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
  &:hover {
    background-color: #21a1f1;
  }
`;

const ConnectWalletButton = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #0059d7;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 20px;
  :hover {
    background-color: #007bff;
  }
`;

const OpenJOINTPACKS = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #0059d7;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;

  :hover {
    background-color: #007bff;
  }
`;

// Main content container
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  padding: 0 10px;
  @media (max-width: 100%) {
    margin-top: 10px;
  }
`;

// New ContentWrapper to center main content and restrict max-width
const ContentWrapper = styled.div`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 0 10px;
`;

// NFT Grid & Card Styles
const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 35px;
  justify-items: center;
  margin-bottom: 20px;
  padding: 20px;
  max-width: 100%;
  width: 100%;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
`;

const NFTBox = styled.div`
  width: 220px;
  height: 300px;
  margin: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  @media (max-width: 768px) {
    width: 150px;
    height: 200px;
  }
`;

const NFTImage = styled.img`
  width: 100%;
  max-height: 70%;
  object-fit: cover;
  border-radius: 4px;
  @media (max-width: 768px) {
    max-height: 60%;
  }
`;

const NFTText = styled(s.TextDescription)`
  text-align: center;
  display: block;
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const NFTButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 5px;
  @media (max-width: 768px) {
    margin-top: 3px;
  }
`;

/* ------------------ Main App Component ------------------ */

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);

  const [selectedToken, setSelectedToken] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [totalRewards, setTotalRewards] = useState("0");
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
    GAS_LIMIT: 3000000,
  });

  const debouncedFetchRef = useRef(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce(async (account) => {
      if (!blockchain.LootBoxNFT || !account) {
        console.error("LootBoxNFT contract is not initialized or account is missing.");
        return;
      }
      try {
        const events = await blockchain.LootBoxNFT.getPastEvents("RewardClaimed", {
          filter: { user: account },
          fromBlock: 0,
          toBlock: "latest",
        });
        const total = events.reduce(
          (sum, event) =>
            sum + parseFloat(blockchain.web3.utils.fromWei(event.returnValues.amount, "ether")),
          0
        );
        setTotalRewards(
          total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      } catch (error) {
        console.error("Error fetching total rewards:", error);
      }
    }, 300);

    return () => {
      if (debouncedFetchRef.current) {
        debouncedFetchRef.current.cancel();
      }
    };
  }, [blockchain.LootBoxNFT, blockchain.web3]);

  const fetchTotalRewards = useCallback(
    async (account) => {
      if (!blockchain.web3 || !blockchain.web3.utils) {
        console.error("Web3 or Web3 utils is not initialized.");
        return;
      }
      if (debouncedFetchRef.current) {
        debouncedFetchRef.current(account);
      }
    },
    [blockchain.web3]
  );

  useEffect(() => {
    const fetchConfig = async () => {
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
    };

    fetchConfig();
  }, []);

  const handleConnectWallet = () => {
    if (!configLoaded || !CONFIG.CONTRACT_ADDRESS) {
      console.error("Config not loaded or missing contract address.");
      return;
    }
    dispatch(connect(CONFIG));
  };

  useEffect(() => {
    if (blockchain.account && blockchain.web3 && CONFIG.CONTRACT_ADDRESS) {
      try {
        dispatch(initializeContract(CONFIG.CONTRACT_ADDRESS));
        fetchTotalRewards(blockchain.account);
      } catch (error) {
        console.error("Error initializing LootBoxNFT contract:", error);
      }
    }
  }, [blockchain.account, blockchain.web3, CONFIG.CONTRACT_ADDRESS, dispatch, fetchTotalRewards]);

  useEffect(() => {
    if (!blockchain.account || !blockchain.LootBoxNFT) return;
    fetchTotalRewards(blockchain.account);
    dispatch(fetchData());
  }, [blockchain.account, blockchain.LootBoxNFT, dispatch, fetchTotalRewards]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        dispatch({ type: "UPDATE_ACCOUNT", payload: { account: accounts[0] } });
        if (CONFIG.CONTRACT_ADDRESS) {
          dispatch(initializeContract(CONFIG.CONTRACT_ADDRESS));
          fetchTotalRewards(accounts[0]);
          dispatch(fetchData());
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [dispatch, CONFIG.CONTRACT_ADDRESS, fetchTotalRewards]);

  const pollForRewardClaimed = async (tokenId, fromBlock) => {
    const pollInterval = 2000;
    const pollTimeout = 60000;
    const startTime = Date.now();

    const interval = setInterval(async () => {
      try {
        const events = await blockchain.LootBoxNFT.getPastEvents("RewardClaimed", {
          filter: { user: blockchain.account, tokenId: tokenId },
          fromBlock: fromBlock,
          toBlock: "latest",
        });

        if (events.length > 0) {
          const { amount } = events[0].returnValues;
          setRewardMessage(
            `YOU HAVE RECEIVED ${parseFloat(
              blockchain.web3.utils.fromWei(amount, "ether")
            ).toLocaleString()} $JOINT FROM PACK #${tokenId}.`
          );
          dispatch(fetchData());
          fetchTotalRewards(blockchain.account);
          clearInterval(interval);
        } else if (Date.now() - startTime >= pollTimeout) {
          setRewardMessage("Reward not received. Check later.");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error polling for RewardClaimed event:", error);
        setRewardMessage("Error fetching reward. Check later.");
        clearInterval(interval);
      }
    }, pollInterval);
  };

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
        const txReceipt = await blockchain.web3.eth.getTransactionReceipt(transactionHash);
        fromBlock = txReceipt.blockNumber;
      }
      setRewardMessage(`$JOINT PACK #${tokenId} OPENED SUCCESSFULLY. WAITING FOR REWARD....`);
      pollForRewardClaimed(tokenId, fromBlock);
    } catch (error) {
      console.error("Error opening lootbox:", error);
      setRewardMessage("FAILED TO OPEN $JOINTPACK. CONTACT $JOINT");
    }
  };

  return (
    <Router>
      <GlobalStyle />
      <s.Screen image={bgImage}>
        <Header>
          <HeaderWrapper>
            <SocialIcons>
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
            </SocialIcons>
            <ConnectWalletButton onClick={handleConnectWallet} disabled={!configLoaded}>
              {blockchain.account
                ? `CONNECTED: ${truncate(blockchain.account, 15)}`
                : "CONNECT WALLET"}
            </ConnectWalletButton>
          </HeaderWrapper>
        </Header>

        <MainActions>
          <Link to="/leaderboard">
            <StyledButton>LEADERBOARD</StyledButton>
          </Link>
          <Link to="/">
            <StyledButton>OPEN $JOINT PACKS</StyledButton>
          </Link>
          <a
            href="https://paintswap.io/sonic/collections/joint-packs/listings"
            target="_blank"
            rel="noopener noreferrer"
          >
            <StyledButton>GET MORE $JOINT PACKS</StyledButton>
          </a>
        </MainActions>
  
        <MainContent>
          <ContentWrapper>
            <Routes>
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/"
                element={
                  <>
                    {blockchain.errorMsg !== "" && (
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          fontSize: 20,
                          color: "white",
                          marginBottom: "20px",
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
                            marginBottom: "10px",
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
                            marginBottom: "20px",
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
                            marginBottom: "20px",
                          }}
                        >
                          PACKS CONTAIN ON AVERAGE 86,800 $JOINT
                        </s.TextSubTitle>
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "white",
                            marginTop: "0px",
                            marginBottom: "20px",
                          }}
                        >
                          TOTAL $JOINT RECEIVED: {totalRewards} $JOINT
                        </s.TextDescription>

                        {rewardMessage && (
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              fontSize: 20,
                              fontWeight: "bold",
                              color: "white",
                              marginTop: "20px",
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
                                <NFTText>{`$JOINT PACK #${tokenId}`}</NFTText>
                                <NFTButtonContainer>
                                  <OpenJOINTPACKS onClick={() => openLootBox(tokenId)}>
                                    OPEN $JOINT PACK
                                  </OpenJOINTPACKS>
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
                              marginTop: "20px",
                            }}
                          >
                            NO $JOINT PACKS FOUND. DON'T STOP THE PARTY! GET MORE $JOINT PACKS.
                          </s.TextDescription>
                        )}
                      </>
                    ) : (
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          fontSize: 20,
                          color: "white",
                          marginTop: "60px",
                        }}
                      >
                        PLEASE CONNECT YOUR WALLET TO VIEW YOUR $JOINT PACKS.
                      </s.TextDescription>
                    )}
                  </>
                }
              />
            </Routes>
          </ContentWrapper>
        </MainContent>
      </s.Screen>
    </Router>
  );
}

export default App;
