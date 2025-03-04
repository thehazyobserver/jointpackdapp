import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!blockchain.LootBoxNFT) return;

      try {
        const events = await blockchain.LootBoxNFT.getPastEvents('RewardClaimed', {
          fromBlock: 0,
          toBlock: 'latest',
        });

        const rewards = events.reduce((acc, event) => {
          const { user, amount } = event.returnValues;
          if (!acc[user]) acc[user] = 0;
          acc[user] += parseFloat(blockchain.web3.utils.fromWei(amount, 'ether'));
          return acc;
        }, {});

        const sortedRewards = Object.entries(rewards)
          .map(([user, total]) => ({ user, total }))
          .sort((a, b) => b.total - a.total);

        setLeaderboard(sortedRewards);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [blockchain.LootBoxNFT, blockchain.web3]);

  return (
    <LeaderboardContainer>
      <LeaderboardTitle>Leaderboard</LeaderboardTitle>
      <LeaderboardList>
        {leaderboard.map((item, index) => (
          <LeaderboardItem key={index}>
            <span>{item.user}</span>
            <span>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $JOINT</span>
          </LeaderboardItem>
        ))}
      </LeaderboardList>
    </LeaderboardContainer>
  );
};

export default Leaderboard;