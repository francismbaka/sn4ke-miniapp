"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnect, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { useMiniAppContext } from "./providers";
import { SnakeGame } from "@/components/SnakeGame";
import { Leaderboard } from "@/components/Leaderboard";
import {
  LEADERBOARD_ABI, CONTRACT_ADDRESS, TREASURY,
  PLAY_FEE_ETH, isContractDeployed,
} from "@/lib/contract";

type Phase = "idle" | "paying" | "playing" | "gameover" | "saving";

export default function HomePage() {
  const { isInMiniApp, context } = useMiniAppContext();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const [phase, setPhase]     = useState<Phase>("idle");
  const [score, setScore]     = useState(0);
  const [best, setBest]       = useState(0);
  const [level, setLevel]     = useState(1);
  const [txMsg, setTxMsg]     = useState("");
  const [txErr, setTxErr]     = useState("");
  const [paused, setPaused]   = useState(false);
  const [tab, setTab]         = useState<"game" | "board">("game");

  const { sendTransactionAsync }  = useSendTransaction();
  const { writeContractAsync }    = useWriteContract();

  // Auto-connect wallet via Farcaster frame connector when inside Mini App
  useEffect(() => {
    if (isInMiniApp && !isConnected) {
      connect({ connector: farcasterMiniApp() });
    }
  }, [isInMiniApp, isConnected, connect]);

  // Keyboard pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && phase === "playing") {
        setPaused(p => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase]);

  // ── Pay to play ────────────────────────────────────────────────────────────
  const handlePayAndPlay = useCallback(async () => {
    if (!isConnected) {
      connect({ connector: farcasterMiniApp() });
      return;
    }
    setPhase("paying");
    setTxErr("");
    setTxMsg("Confirm in wallet…");

    try {
      const to = (
        TREASURY !== "0x0000000000000000000000000000000000000000"
          ? TREASURY
          : CONTRACT_ADDRESS
      ) as `0x${string}`;

      // Demo mode — no contract/treasury configured yet
      if (to === "0x0000000000000000000000000000000000000000") {
        setTxMsg("Demo mode — session unlocked!");
        setScore(0); setLevel(1);
        setPhase("playing");
        return;
      }

      const hash = await sendTransactionAsync({
        to,
        value: parseEther(PLAY_FEE_ETH),
      });
      setTxMsg(`✓ Paid! tx: ${hash.slice(0, 10)}…`);
      setScore(0); setLevel(1);
      setPhase("playing");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setTxErr(msg.slice(0, 80));
      setPhase("idle");
    }
  }, [isConnected, connect, sendTransactionAsync]);

  // ── Game over ──────────────────────────────────────────────────────────────
  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > best) setBest(finalScore);
    setPhase("gameover");
    setTxMsg(""); setTxErr("");
  }, [best]);

  const handleScoreUpdate = useCallback((s: number, l: number) => {
    setScore(s); setLevel(l);
  }, []);

  // ── Save score on-chain ────────────────────────────────────────────────────
  const handleSaveScore = useCallback(async () => {
    if (!isContractDeployed) return;
    setPhase("saving");
    setTxMsg("Saving score to Base…");
    setTxErr("");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: LEADERBOARD_ABI,
        functionName: "submitScore",
        args: [BigInt(score)],
        value: BigInt(0),
      });
      setTxMsg(`✓ Score saved! ${hash.slice(0, 10)}…`);
      setPhase("gameover");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "TX failed";
      setTxErr(msg.slice(0, 80));
      setPhase("gameover");
    }
  }, [score, writeContractAsync]);

  const isPlaying = phase === "playing" && !paused;

  const displayName = context?.user?.displayName ?? context?.user?.username ?? null;

  return (
    <div style={S.root}>
      {/* TOP BAR */}
      <div style={S.topbar}>
        <span style={S.logo}>SN4KE</span>
        <div style={S.baseBadge}><span style={S.dot} />BASE</div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        <button onClick={() => setTab("game")}  style={{ ...S.tab, ...(tab === "game"  ? S.tabOn : {}) }}>▶ GAME</button>
        <button onClick={() => setTab("board")} style={{ ...S.tab, ...(tab === "board" ? S.tabOn : {}) }}>🏆 BOARD</button>
      </div>

      {tab === "game" && (
        <>
          {/* HUD */}
          <div style={S.hud}>
            <span>SCR <b style={S.hv}>{score}</b></span>
            <span>BEST <b style={S.hv}>{best}</b></span>
            <span>LVL <b style={S.hv}>{level}</b></span>
          </div>

          {/* CANVAS */}
          <div style={S.screen}>
            <SnakeGame
              onGameOver={handleGameOver}
              onScoreUpdate={handleScoreUpdate}
              running={isPlaying}
            />

            {/* IDLE overlay */}
            {phase === "idle" && (
              <Overlay>
                <p style={S.title}>SN4KE</p>
                <div style={S.feeBox}>
                  PAY TO PLAY
                  <span style={S.feeAmt}>{PLAY_FEE_ETH} ETH</span>
                  per session
                </div>
                {displayName && <p style={S.userTag}>👤 {displayName}</p>}
                <Btn color="orange" onClick={handlePayAndPlay}>
                  {isConnected ? `⚡ PAY ${PLAY_FEE_ETH} ETH` : "CONNECT & PAY"}
                </Btn>
                <p style={S.hint}>WASD / ARROWS · P = PAUSE</p>
              </Overlay>
            )}

            {/* PAYING overlay */}
            {phase === "paying" && (
              <Overlay>
                <p style={S.title}>PAYING…</p>
                <p style={S.txMsg}>{txMsg}</p>
                {txErr && <p style={S.txErr}>{txErr}</p>}
              </Overlay>
            )}

            {/* PAUSED overlay */}
            {paused && phase === "playing" && (
              <Overlay>
                <p style={{ ...S.title, color: "var(--green)" }}>PAUSED</p>
                <Btn color="green" onClick={() => setPaused(false)}>RESUME</Btn>
              </Overlay>
            )}

            {/* GAME OVER overlay */}
            {phase === "gameover" && (
              <Overlay>
                <p style={{ ...S.title, color: "#ff2d55" }}>GAME OVER</p>
                <p style={S.scoreSummary}>SCORE: {score}{"\n"}BEST: {best}{"\n"}LEVEL: {level}</p>
                {txMsg && <p style={S.txMsg}>{txMsg}</p>}
                {txErr && <p style={S.txErr}>{txErr}</p>}
                {isContractDeployed && score > 0 && (
                  <Btn color="blue" onClick={handleSaveScore}>⛓ SAVE TO BASE</Btn>
                )}
                <div style={S.feeBox}>
                  PLAY AGAIN?
                  <span style={S.feeAmt}>{PLAY_FEE_ETH} ETH</span>
                </div>
                <Btn color="orange" onClick={handlePayAndPlay}>⚡ PAY & RETRY</Btn>
              </Overlay>
            )}

            {/* SAVING overlay */}
            {phase === "saving" && (
              <Overlay>
                <p style={{ ...S.title, color: "#4d8bff" }}>SAVING…</p>
                <p style={S.txMsg}>{txMsg}</p>
              </Overlay>
            )}
          </div>

          {/* wallet strip */}
          {address && (
            <p style={S.addrStrip}>{address.slice(0,6)}…{address.slice(-4)} · BASE</p>
          )}
          {!isInMiniApp && !address && (
            <p style={S.addrStrip}>Open in Coinbase Wallet or Warpcast to connect</p>
          )}
        </>
      )}

      {tab === "board" && (
        <div style={S.boardPanel}>
          <p style={S.panelTitle}>▸ ON-CHAIN TOP 10</p>
          <Leaderboard address={address as `0x${string}` | undefined} />
        </div>
      )}
    </div>
  );
}

// ── Reusable components ───────────────────────────────────────────────────────
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      background: "rgba(0,0,0,0.9)",
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color }: {
  children: React.ReactNode;
  onClick: () => void;
  color: "green" | "blue" | "orange";
}) {
  const bg = color === "green" ? "#00ff41" : color === "blue" ? "#0052ff" : "#ff9900";
  const sh = color === "green"
    ? "0 4px 0 #00662a,0 0 18px rgba(0,255,65,.3)"
    : color === "blue"
    ? "0 4px 0 #002280,0 0 18px rgba(0,82,255,.4)"
    : "0 4px 0 #7a4400,0 0 18px rgba(255,153,0,.4)";
  return (
    <button onClick={onClick} style={{
      fontFamily: "'Press Start 2P',monospace",
      fontSize: "0.4rem", padding: "10px 18px", cursor: "pointer",
      letterSpacing: "0.12em", border: "none", textTransform: "uppercase",
      background: bg, color: color === "blue" ? "#fff" : "#060610",
      boxShadow: sh,
    }}>
      {children}
    </button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", background:"#060610", backgroundImage:"radial-gradient(ellipse 80% 50% at 20% 80%,rgba(0,82,255,.07) 0%,transparent 60%)", paddingBottom:24 },
  topbar: { width:"100%", maxWidth:420, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", borderBottom:"1px solid #0e0e22" },
  logo: { fontFamily:"'Press Start 2P',monospace", fontSize:"1.1rem", letterSpacing:"0.28em", color:"#00ff41", textShadow:"0 0 10px #00ff41,0 0 25px rgba(0,255,65,.25)" },
  baseBadge: { display:"flex", alignItems:"center", gap:7, fontFamily:"'Press Start 2P',monospace", fontSize:"0.34rem", color:"#4d8bff", border:"1px solid rgba(77,139,255,.28)", padding:"5px 9px", letterSpacing:"0.15em" },
  dot: { width:7, height:7, borderRadius:"50%", background:"#4d8bff", boxShadow:"0 0 8px #4d8bff", display:"inline-block" },
  tabs: { display:"flex", width:"100%", maxWidth:420, borderBottom:"1px solid #0e0e22" },
  tab: { flex:1, fontFamily:"'Press Start 2P',monospace", fontSize:"0.32rem", color:"#2a2a44", background:"none", border:"none", padding:"10px 0", cursor:"pointer", letterSpacing:"0.1em", borderBottom:"2px solid transparent" },
  tabOn: { color:"#00ff41", borderBottom:"2px solid #00ff41", textShadow:"0 0 8px rgba(0,255,65,.3)" },
  hud: { display:"flex", justifyContent:"space-between", width:"100%", maxWidth:384, padding:"8px 2px", fontFamily:"'Press Start 2P',monospace", fontSize:"0.36rem", color:"#00662a", letterSpacing:"0.08em" },
  hv: { color:"#00ff41", textShadow:"0 0 6px #00ff41", fontWeight:"normal" },
  screen: { position:"relative", border:"2px solid #00662a", boxShadow:"0 0 0 1px #060610,0 0 0 2px #00662a,0 0 28px rgba(0,255,65,.2)" },
  title: { fontFamily:"'Press Start 2P',monospace", fontSize:"1rem", color:"#00ff41", textShadow:"0 0 12px #00ff41", letterSpacing:"0.15em" },
  feeBox: { border:"1px solid rgba(255,153,0,.3)", background:"rgba(255,153,0,.05)", padding:"10px 16px", fontFamily:"'Press Start 2P',monospace", fontSize:"0.3rem", color:"#aa7700", lineHeight:2.4, letterSpacing:"0.08em", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" },
  feeAmt: { fontSize:"0.6rem", color:"#ff9900", textShadow:"0 0 10px rgba(255,153,0,.5)", marginTop:4 },
  userTag: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.3rem", color:"#4466aa", letterSpacing:"0.1em" },
  hint: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.28rem", color:"#2a2a44", letterSpacing:"0.08em", lineHeight:2, textAlign:"center" },
  scoreSummary: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.42rem", color:"#ffd700", textShadow:"0 0 8px #ffd700", lineHeight:2.5, textAlign:"center", whiteSpace:"pre" },
  txMsg: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.3rem", color:"#3a4466", letterSpacing:"0.06em", textAlign:"center", maxWidth:300, lineHeight:2 },
  txErr: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.28rem", color:"#ff2d55", letterSpacing:"0.06em", textAlign:"center", maxWidth:300, lineHeight:2 },
  addrStrip: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.28rem", color:"#2a2a44", letterSpacing:"0.06em", marginTop:8, textAlign:"center" },
  boardPanel: { width:"100%", maxWidth:420, padding:"14px 18px", background:"rgba(8,8,24,.95)", border:"1px solid #0e0e28", marginTop:10 },
  panelTitle: { fontFamily:"'Press Start 2P',monospace", fontSize:"0.36rem", color:"#4d8bff", textShadow:"0 0 8px rgba(0,82,255,.4)", letterSpacing:"0.18em", marginBottom:12, borderBottom:"1px solid #0e0e28", paddingBottom:8 },
};
