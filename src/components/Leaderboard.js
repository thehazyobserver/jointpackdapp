import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import debounce from "lodash.debounce";
import { Link } from "react-router-dom";

const LeaderboardContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #121212;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const LeaderboardTitle = styled.h2`
  color: white;
  margin: 0;
`;

const LeaderboardList = styled.ul`
  list-style: none;
  padding: 0;
`;

const LeaderboardItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  color: white;

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
`;

const TotalSpan = styled.span`
  font-weight: bold;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
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

  return (
    <LeaderboardContainer>
      <HeaderContainer>
        <LeaderboardTitle>TOP 100 $JOINT PACK STONERS</LeaderboardTitle>
        <Link to="/">
          <StyledButton>Open $JOINT PACKS</StyledButton>
        </Link>
      </HeaderContainer>
      {loading ? (
        <p style={{ color: "white", textAlign: "center" }}>Loading...</p>
      ) : (
        <LeaderboardList>
          {leaderboard.map((item, index) => (
            <LeaderboardItem key={item.user}>
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
