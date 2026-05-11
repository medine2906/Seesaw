// Seesaw contract — update SEESAW_ADDRESS after deploying to Monad Testnet
export const SEESAW_ADDRESS = (process.env.NEXT_PUBLIC_SEESAW_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const SEESAW_ABI = [
  { inputs: [], name: "AlreadySettled", type: "error" },
  { inputs: [], name: "NotYetSettleable", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  { inputs: [], name: "VotingClosed", type: "error" },
  { inputs: [], name: "WrongVoteAmount", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "metadataURI", type: "string" },
    ],
    name: "ContentSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "posPool", type: "uint256" },
      { indexed: false, name: "negPool", type: "uint256" },
      { indexed: false, name: "creatorPayout", type: "uint256" },
    ],
    name: "Settled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentId", type: "uint256" },
      { indexed: true, name: "voter", type: "address" },
      { indexed: false, name: "positive", type: "bool" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [],
    name: "VOTE_AMOUNT",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VOTING_PERIOD",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contentCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "getContent",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "settleAt", type: "uint256" },
          { name: "posPool", type: "uint256" },
          { name: "negPool", type: "uint256" },
          { name: "settled", type: "bool" },
          { name: "metadataURI", type: "string" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "getTiltRatio",
    outputs: [{ name: "", type: "int256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "getNegVoters",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "getPosVoters",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "metadataURI", type: "string" }],
    name: "submitContent",
    outputs: [{ name: "contentId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "voteDown",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "voteUp",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const VOTE_AMOUNT = BigInt("10000000000000000"); // 0.01 MON in wei
