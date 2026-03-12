import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const URL  = process.env.NEXT_PUBLIC_URL ?? "https://your-app.vercel.app";
const NAME = "SN4KE";

export const metadata: Metadata = {
  title: NAME,
  description: "Retro pixel snake game with on-chain leaderboard on Base.",
  other: {
    // fc:miniapp — renders the launch button in Base App / Warpcast feeds
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${URL}/hero.png`,
      button: {
        title: `🐍 Play ${NAME}`,
        action: {
          type: "launch_frame",
          name: NAME,
          url: URL,
          splashImageUrl: `${URL}/splash.png`,
          splashBackgroundColor: "#060610",
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
