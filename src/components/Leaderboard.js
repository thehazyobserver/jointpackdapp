import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import debounce from 'lodash.debounce';

const LeaderboardContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #121212;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const LeaderboardTitle = styled.h2`
  text-align: center;
  color: white;
  margin-bottom: 20px;
`;

const LeaderboardList = styled.ul`
  list-style: none;
  padding: 0;
`;

const LeaderboardItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  color: white;

  &:last-child {
    border-bottom: none;
  }
`;

const Leaderboard = () => {
  const blockchain = useSelector((state) => state.blockchain);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = useCallback(debounce(async () => {
    if (!blockchain.LootBoxNFT) {
      console.error("LootBoxNFT contract is not initialized.");
      return;
    }

    try {
      const events = await blockchain.LootBoxNFT.getPastEvents("RewardClaimed", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const rewards = events.reduce((acc, event) => {
        const user = event.returnValues.user;
        const amount = parseFloat(blockchain.web3.utils.fromWei(event.returnValues.amount, "ether"));

        if (!acc[user]) {
          acc[user] = 0;
        }
        acc[user] += amount;

        return acc;
      }, {});

      const leaderboardData = Object.keys(rewards).map((user) => ({
        user,
        total: rewards[user],
      }));

      leaderboardData.sort((a, b) => b.total - a.total);

      // Limit to top 50
      const top50Leaderboard = leaderboardData.slice(0, 50);

      setLeaderboard(top50Leaderboard);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setLoading(false);
    }
  }, 300), [blockchain.LootBoxNFT, blockchain.web3]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return (
    <LeaderboardContainer>
      <LeaderboardTitle>Leaderboard</LeaderboardTitle>
      {loading ? (
        <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
      ) : (
        <LeaderboardList>
          {leaderboard.map((item, index) => (
            <LeaderboardItem key={index}>
              <span>{item.user}</span>
              <span>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $JOINT</span>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      )}
    </LeaderboardContainer>
  );
};

export default Leaderboard;