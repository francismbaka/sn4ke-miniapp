const ROOT_URL = process.env.NEXT_PUBLIC_URL ?? "https://your-app.vercel.app";

export const minikitConfig = {
  // Filled in by the account association signing tool at https://www.base.dev/preview?tab=account
  // These map to FARCASTER_HEADER / FARCASTER_PAYLOAD / FARCASTER_SIGNATURE in your .env
  accountAssociation: {
    header:    process.env.FARCASTER_HEADER    ?? "",
    payload:   process.env.FARCASTER_PAYLOAD   ?? "",
    signature: process.env.FARCASTER_SIGNATURE ?? "",
  },
  miniapp: {
    version: "1",
    name:        process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "SN4KE",
    subtitle:    process.env.NEXT_PUBLIC_APP_SUBTITLE            ?? "Retro snake on Base",
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION         ?? "Classic pixel snake with on-chain leaderboard on Base.",
    iconUrl:          process.env.NEXT_PUBLIC_ICON_URL       ?? `${ROOT_URL}/icon.png`,
    splashImageUrl:   process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE ?? `${ROOT_URL}/splash.png`,
    splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR ?? "#060610",
    heroImageUrl:     process.env.NEXT_PUBLIC_APP_HERO_IMAGE ?? `${ROOT_URL}/splash.png`,
    homeUrl:          ROOT_URL,
    webhookUrl:       `${ROOT_URL}/api/webhook`,
    primaryCategory:  process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY ?? "gaming",
    tags: ["game", "snake", "base", "onchain", "retro", "arcade"],
    tagline:          process.env.NEXT_PUBLIC_APP_TAGLINE       ?? "Eat. Score. Chain.",
    ogTitle:          process.env.NEXT_PUBLIC_APP_OG_TITLE      ?? "SN4KE on Base",
    ogDescription:    process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION ?? "Retro pixel snake with on-chain leaderboard on Base.",
    ogImageUrl:       process.env.NEXT_PUBLIC_APP_OG_IMAGE      ?? `${ROOT_URL}/splash.png`,
  },
} as const;
