import { NextRequest, NextResponse } from "next/server";
import { reportTrafficToGoogleAnalytics } from "@/lib/google-analytics";
import { extractBotHeaders, type TrafficResult } from "@/lib/traffic";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "Unknown";
  const botHeaders = extractBotHeaders(request.headers);

  const googleAnalytics = await reportTrafficToGoogleAnalytics({
    collectionPoint: "server_api",
    botHeaders,
    userAgent,
  });
  const result: TrafficResult = { userAgent, botHeaders, googleAnalytics };

  return NextResponse.json(result, {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}
