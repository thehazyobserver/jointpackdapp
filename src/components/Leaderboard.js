import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import debounce from "lodash.debounce";

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%; /* Use percentage for responsiveness */
  max-width: 800px;
  margin: 20px auto;
  background-color: #121212;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;

  @media (max-width: 768px) {
    width: 95%;
    padding: 15px;
  }
`;

const YourRankingContainer = styled.div`
  background-color: #222;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 1rem;
  word-break: break-all; /* Ensure long addresses wrap */
`;

const LeaderboardTitle = styled.h2`
  text-align: center;
  color: white;
  margin-bottom: 20px;
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const LeaderboardSubtitle = styled.h3`
  text-align: center;
  color: #ccc;
  margin-bottom: 20px;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LeaderboardList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

const LeaderboardItem = styled.li`
  display: flex;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  color: white;
  background-color: ${({ highlight }) => (highlight ? "#0059d7" : "transparent")};

  &:last-child {
    border-bottom: none;
  }
`;

const RankSpan = styled.span`
  margin-right: 10px;
  font-weight: bold;
  width: 30px;
  text-align: right;
`;

const UserSpan = styled.span`
  flex: 1;
  margin: 0 10px;
  word-break: break-all;
`;

const TotalSpan = styled.span`
  font-weight: bold;
`;

const Leaderboard = () => {
  const blockchain = useSelector((state) => state.blockchain);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!blockchain.LootBoxNFT || !blockchain.web3) {
      console.error("LootBoxNFT contract is not initialized.");
      return;
    }

    if (!debounceRef.current) {
      debounceRef.current = debounce(async () => {
        try {
          const events = await blockchain.LootBoxNFT.getPastEvents("RewardClaimed", {
            fromBlock: 0,
            toBlock: "latest",
          });

          const rewards = events.reduce((acc, event) => {
            const user = event.returnValues.user;
            const amount = parseFloat(
              blockchain.web3.utils.fromWei(event.returnValues.amount, "ether")
            );
            acc[user] = (acc[user] || 0) + amount;
            return acc;
          }, {});

          const leaderboardData = Object.keys(rewards).map((user) => ({
            user,
            total: rewards[user],
          }));

          leaderboardData.sort((a, b) => b.total - a.total);

          // Limit to top 100
          setLeaderboard(leaderboardData.slice(0, 100));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching leaderboard data:", error);
          setLoading(false);
        }
      }, 300);
    }

    debounceRef.current();
  }, [blockchain.LootBoxNFT, blockchain.web3]);

  // Compute user's ranking from the leaderboard data
  const userRank =
    blockchain.account && leaderboard.length > 0
      ? leaderboard.findIndex(
          (item) =>
            item.user.toLowerCase() === blockchain.account.toLowerCase()
        )
      : -1;

  return (
    <LeaderboardContainer>
      <LeaderboardTitle>TOP 100 $JOINT PACK STONERS</LeaderboardTitle>
      <LeaderboardSubtitle>
        Top wallets that have received the most $JOINT from opening Packs.
      </LeaderboardSubtitle>
      <LeaderboardSubtitle>
        Connect wallet to load Leaderboard.
      </LeaderboardSubtitle>

      {/* Display connected user's wallet and ranking */}
      {blockchain.account && (
        <YourRankingContainer>
          <p>Your Wallet: {blockchain.account}</p>
          {userRank > -1 ? (
            <p>
              Your Ranking: <strong>#{userRank + 1}</strong>
            </p>
          ) : (
            <p>Your wallet is not in the Top 100.</p>
          )}
        </YourRankingContainer>
      )}

      {loading ? (
        <p style={{ color: "white", textAlign: "center" }}>Loading...</p>
      ) : (
        <LeaderboardList>
          {leaderboard.map((item, index) => (
            <LeaderboardItem
              key={item.user}
              highlight={
                blockchain.account &&
                item.user.toLowerCase() === blockchain.account.toLowerCase()
              }
            >
              <RankSpan>#{index + 1}</RankSpan>
              <UserSpan>{item.user}</UserSpan>
              <TotalSpan>
                {item.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                $JOINT
              </TotalSpan>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      )}
    </LeaderboardContainer>
  );
};

export default Leaderboard;
