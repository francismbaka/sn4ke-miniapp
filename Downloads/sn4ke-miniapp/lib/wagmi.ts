import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

const chain = process.env.NEXT_PUBLIC_CHAIN === "base" ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [farcasterMiniApp()],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

export { chain };
