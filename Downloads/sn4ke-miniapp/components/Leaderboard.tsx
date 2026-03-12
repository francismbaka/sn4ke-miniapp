"use client";

import { useReadContract } from "wagmi";
import { LEADERBOARD_ABI, CONTRACT_ADDRESS, isContractDeployed } from "@/lib/contract";

type Entry = { player: `0x${string}`; score: bigint; timestamp: bigint };

export function Leaderboard({ address }: { address?: `0x${string}` }) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "getLeaderboard",
    query: { enabled: isContractDeployed },
  });

  if (!isContractDeployed) {
    return (
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "0.3rem", color: "#1e1e3a", textAlign: "center", padding: "14px 0", letterSpacing: "0.1em", lineHeight: 2 }}>
        DEPLOY CONTRACT &<br />SET ADDRESS IN .ENV
      </div>
    );
  }

  if (isLoading) return <Placeholder text="LOADING..." />;
  if (!data || (data as Entry[]).length === 0) return <Placeholder text={"NO SCORES YET\nBE THE FIRST!"} />;

  const entries = data as Entry[];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={() => refetch()} style={refreshBtn}>↻ REFRESH</button>
      </div>
      {entries.map((e, i) => {
        const me = address && e.player.toLowerCase() === address.toLowerCase();
        const shortAddr = `${e.player.slice(0, 6)}…${e.player.slice(-4)}`;
        return (
          <div key={i} style={{ ...row, color: me ? "var(--green)" : "#3a4466" }}>
            <span style={{ color: me ? "var(--green)" : "#444466", width: 22 }}>{medals[i] ?? i + 1}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: me ? "var(--green)" : "#3a4466" }}>
              {me ? "▶ YOU" : shortAddr}
            </span>
            <span style={{ color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--yellow)", textAlign: "right" }}>
              {e.score.toString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "0.3rem", color: "#1e1e3a", textAlign: "center", padding: "14px 0", letterSpacing: "0.1em", lineHeight: 2.5, whiteSpace: "pre" }}>
      {text}
    </div>
  );
}

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "22px 1fr 60px",
  gap: 6,
  alignItems: "center",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: "0.3rem",
  padding: "5px 0",
  borderBottom: "1px solid #0a0a1e",
  letterSpacing: "0.05em",
};

const refreshBtn: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: "0.28rem",
  color: "#2a2a44",
  background: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.1em",
};
