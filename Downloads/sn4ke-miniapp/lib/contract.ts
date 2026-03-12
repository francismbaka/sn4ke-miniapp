export const LEADERBOARD_ABI = [
  {
    name: "submitScore",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_score", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getLeaderboard",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "player", type: "address" },
          { name: "score",  type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "PLAY_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ScoreSubmitted",
    type: "event",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score",  type: "uint256", indexed: false },
    ],
  },
] as const;

export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const TREASURY =
  (process.env.NEXT_PUBLIC_TREASURY as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const PLAY_FEE_ETH = process.env.NEXT_PUBLIC_PLAY_FEE ?? "0.0005";

export const isContractDeployed =
  CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
