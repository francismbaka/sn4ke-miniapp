"use client";

import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import sdk, { type Context } from "@farcaster/miniapp-sdk";

const queryClient = new QueryClient();

// ── Mini App context ─────────────────────────────────────────────────────────
interface MiniAppCtx {
  isReady: boolean;
  isInMiniApp: boolean;
  context: Context.MiniAppContext | null;
}

const MiniAppContext = createContext<MiniAppCtx>({
  isReady: false,
  isInMiniApp: false,
  context: null,
});

export function useMiniAppContext() {
  return useContext(MiniAppContext);
}

// ── MiniApp bootstrap — calls sdk.actions.ready() to hide splash screen ──────
function MiniAppBootstrap({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MiniAppCtx>({
    isReady: false,
    isInMiniApp: false,
    context: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const ctx = await sdk.context;
        if (cancelled) return;
        // Signal to the host client that the app is ready (hides splash)
        await sdk.actions.ready();
        setState({ isReady: true, isInMiniApp: !!ctx, context: ctx ?? null });
      } catch {
        // Running in a normal browser — not inside a Mini App host
        if (!cancelled) setState({ isReady: true, isInMiniApp: false, context: null });
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  return (
    <MiniAppContext.Provider value={state}>
      {children}
    </MiniAppContext.Provider>
  );
}

// ── Root provider ─────────────────────────────────────────────────────────────
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppBootstrap>
          {children}
        </MiniAppBootstrap>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
