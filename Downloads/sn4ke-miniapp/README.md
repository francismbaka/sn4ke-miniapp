# 🐍 SN4KE — Base Mini App

Retro pixel snake game built as a **Base Mini App** using MiniKit + OnchainKit.  
Pay-to-play per session · On-chain leaderboard · Runs inside Coinbase Wallet & Warpcast.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Mini App SDK | `@coinbase/minikit` + `@farcaster/frame-sdk` |
| Wallet | Wagmi v2 + Farcaster Frame connector (auto-connects, no login button) |
| On-chain | Viem + `useWriteContract` — your deployed `SnakeLeaderboard.sol` |
| Styling | Inline styles + Tailwind (Press Start 2P font) |
| Deploy | Vercel |

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_URL=https://your-app.vercel.app       # your Vercel URL
NEXT_PUBLIC_CDP_API_KEY=                          # from portal.cdp.coinbase.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...               # your deployed SnakeLeaderboard
NEXT_PUBLIC_TREASURY=0x...                       # wallet that collects play fees
NEXT_PUBLIC_PLAY_FEE=0.0005                      # ETH per session
NEXT_PUBLIC_CHAIN=base-sepolia                   # or "base" for mainnet
```

### 3. Run locally

```bash
npm run dev
```

Preview in-frame at: **https://warpcast.com/~/developers/mini-apps/manifest**  
(paste your ngrok/localhost tunnel URL)

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Then copy the production URL into your `.env.local` as `NEXT_PUBLIC_URL` and redeploy.

---

## Sign the Manifest

1. Go to **[base.dev/preview](https://base.dev/preview?tab=account)**
2. Paste your Vercel URL → click **Verify**
3. Connect your Farcaster custody wallet
4. Copy the `accountAssociation` object
5. Paste it into `minikit.config.ts`:

```ts
accountAssociation: {
  header: "eyJ...",
  payload: "eyJ...",
  signature: "0x...",
},
```

6. Redeploy: `vercel --prod`

---

## Deploy the Smart Contract

Use [Remix IDE](https://remix.ethereum.org):

1. Open `SnakeLeaderboard.sol` (in the previous scaffold or use the ABI in `lib/contract.ts`)
2. Compile with Solidity ^0.8.20
3. Deploy to **Base Sepolia** (or Base Mainnet)
4. Copy the deployed address → set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

---

## Publish

Post your Vercel URL as a cast in the Base App or Warpcast.  
The `fc:frame` metadata in `app/layout.tsx` will render the embed automatically.

---

## Project Structure

```
sn4ke-miniapp/
├── app/
│   ├── .well-known/farcaster.json/route.ts  ← serves manifest
│   ├── api/webhook/route.ts                 ← MiniKit webhook
│   ├── layout.tsx                           ← fc:frame metadata
│   ├── page.tsx                             ← main game page
│   ├── providers.tsx                        ← MiniKit + Wagmi providers
│   └── globals.css
├── components/
│   ├── SnakeGame.tsx                        ← canvas game engine
│   └── Leaderboard.tsx                      ← on-chain leaderboard
├── lib/
│   ├── contract.ts                          ← ABI + contract config
│   └── wagmi.ts                             ← wagmi + frame connector
├── minikit.config.ts                        ← manifest config
└── .env.local.example
```

---

## Game Flow

1. User opens Mini App in Coinbase Wallet / Warpcast
2. Wallet auto-connects via Farcaster frame connector (no login button)
3. User taps **⚡ PAY 0.0005 ETH** → wallet confirms → game unlocks
4. Play snake — score saved locally per session
5. Game over → **⛓ SAVE TO BASE** submits score to leaderboard contract
6. Leaderboard tab shows top 10 on-chain scores

---

## Customise

- **Fee amount**: `NEXT_PUBLIC_PLAY_FEE` env var (must match contract's `PLAY_FEE`)
- **Chain**: `NEXT_PUBLIC_CHAIN=base` for mainnet
- **App name/icon/splash**: edit `minikit.config.ts`
- **Grid size / speed**: edit `COLS`, `ROWS`, `getSpeed()` in `components/SnakeGame.tsx`
