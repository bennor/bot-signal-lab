import { NextRequest, NextResponse } from "next/server";
import type { TrafficResult } from "@/lib/traffic";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "Unknown";
  const botHeaderNames = [
    "x-vercel-bot-category",
    "x-vercel-bot-name",
    "x-vercel-verified-bot",
  ];
  const botHeaders = Object.fromEntries(
    botHeaderNames.flatMap((name) => {
      const value = request.headers.get(name);
      return value ? [[name, value]] : [];
    }),
  );
  const result: TrafficResult = { userAgent, botHeaders };

  return NextResponse.json(result, {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}
