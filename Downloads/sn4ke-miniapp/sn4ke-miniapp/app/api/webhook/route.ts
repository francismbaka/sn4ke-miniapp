import { NextRequest, NextResponse } from "next/server";

// MiniKit requires a webhook URL in the manifest.
// Extend this to handle notification events, frame adds, etc.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[SN4KE webhook]", body);
    // Handle events: frame_added, frame_removed, notifications_enabled, etc.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
