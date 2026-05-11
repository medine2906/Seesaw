// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Seesaw is ReentrancyGuard {
    struct Content {
        address creator;
        uint256 createdAt;
        uint256 settleAt;
        uint256 posPool;
        uint256 negPool;
        bool settled;
        string metadataURI;
    }

    uint256 public constant VOTE_AMOUNT = 0.01 ether;
    uint256 public constant VOTING_PERIOD = 5 minutes;

    uint256 public contentCount;

    mapping(uint256 => Content) public contents;
    mapping(uint256 => mapping(address => uint256)) public posVotes;
    mapping(uint256 => mapping(address => uint256)) public negVotes;
    mapping(uint256 => address[]) public posVoters;
    mapping(uint256 => address[]) public negVoters;

    event ContentSubmitted(uint256 indexed contentId, address indexed creator, string metadataURI);
    event Voted(uint256 indexed contentId, address indexed voter, bool positive, uint256 amount);
    event Settled(uint256 indexed contentId, address indexed creator, uint256 posPool, uint256 negPool, uint256 creatorPayout);

    error VotingClosed();
    error WrongVoteAmount();
    error AlreadySettled();
    error NotYetSettleable();
    error TransferFailed();

    function submitContent(string calldata metadataURI) external returns (uint256 contentId) {
        contentId = contentCount++;
        contents[contentId] = Content({
            creator: msg.sender,
            createdAt: block.timestamp,
            settleAt: block.timestamp + VOTING_PERIOD,
            posPool: 0,
            negPool: 0,
            settled: false,
            metadataURI: metadataURI
        });
        emit ContentSubmitted(contentId, msg.sender, metadataURI);
    }

    function voteUp(uint256 contentId) external payable {
        if (msg.value != VOTE_AMOUNT) revert WrongVoteAmount();
        Content storage c = contents[contentId];
        if (block.timestamp >= c.settleAt) revert VotingClosed();

        if (posVotes[contentId][msg.sender] == 0) {
            posVoters[contentId].push(msg.sender);
        }
        posVotes[contentId][msg.sender] += msg.value;
        c.posPool += msg.value;

        emit Voted(contentId, msg.sender, true, msg.value);
    }

    function voteDown(uint256 contentId) external payable {
        if (msg.value != VOTE_AMOUNT) revert WrongVoteAmount();
        Content storage c = contents[contentId];
        if (block.timestamp >= c.settleAt) revert VotingClosed();

        if (negVotes[contentId][msg.sender] == 0) {
            negVoters[contentId].push(msg.sender);
        }
        negVotes[contentId][msg.sender] += msg.value;
        c.negPool += msg.value;

        emit Voted(contentId, msg.sender, false, msg.value);
    }

    function settle(uint256 contentId) external nonReentrant {
        Content storage c = contents[contentId];
        if (c.settled) revert AlreadySettled();
        if (block.timestamp < c.settleAt) revert NotYetSettleable();

        c.settled = true;

        uint256 totalPool = c.posPool + c.negPool;
        uint256 creatorPayout = 0;

        if (totalPool == 0) {
            emit Settled(contentId, c.creator, c.posPool, c.negPool, 0);
            return;
        }

        if (c.posPool > c.negPool) {
            // Positive side won: creator gets 80%, pos voters split 20%
            creatorPayout = (totalPool * 80) / 100;
            uint256 voterRewards = totalPool - creatorPayout;

            _transfer(c.creator, creatorPayout);
            _distributeProportionally(posVoters[contentId], posVotes[contentId], voterRewards, c.posPool);
        } else {
            // Negative side won (or tie): neg voters split 100%
            _distributeProportionally(negVoters[contentId], negVotes[contentId], totalPool, c.negPool);
        }

        emit Settled(contentId, c.creator, c.posPool, c.negPool, creatorPayout);
    }

    function _distributeProportionally(
        address[] storage voters,
        mapping(address => uint256) storage votes,
        uint256 totalReward,
        uint256 totalContribution
    ) internal {
        uint256 voterCount = voters.length;
        uint256 distributed = 0;

        for (uint256 i = 0; i < voterCount; i++) {
            address voter = voters[i];
            uint256 contribution = votes[voter];
            if (contribution == 0) continue;

            uint256 reward;
            if (i == voterCount - 1) {
                // Last voter gets remainder to avoid rounding dust
                reward = totalReward - distributed;
            } else {
                reward = (totalReward * contribution) / totalContribution;
            }

            distributed += reward;
            _transfer(voter, reward);
        }
    }

    function _transfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function getTiltRatio(uint256 contentId) external view returns (int256) {
        Content storage c = contents[contentId];
        uint256 total = c.posPool + c.negPool;
        if (total == 0) return 0;
        // +100 = fully positive, -100 = fully negative
        return int256((c.posPool * 200) / total) - 100;
    }

    function getContent(uint256 contentId) external view returns (Content memory) {
        return contents[contentId];
    }

    function getPosVoters(uint256 contentId) external view returns (address[] memory) {
        return posVoters[contentId];
    }

    function getNegVoters(uint256 contentId) external view returns (address[] memory) {
        return negVoters[contentId];
    }
}
