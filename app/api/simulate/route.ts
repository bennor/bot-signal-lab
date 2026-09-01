import { NextRequest, NextResponse } from "next/server";
import { simulations } from "@/lib/traffic";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { scenario?: string };
  const simulation = simulations.find(({ id }) => id === body.scenario);

  if (!simulation) {
    return NextResponse.json(
      { error: "Unknown simulation scenario" },
      { status: 400 },
    );
  }

  const response = await fetch(new URL("/api/traffic", request.url), {
    method: "POST",
    headers: {
      "user-agent": simulation.userAgent,
      ...simulation.botHeaders,
    },
    cache: "no-store",
  });
  const inspection = await response.json();

  return NextResponse.json(inspection, {
    status: response.status,
    headers: { "cache-control": "no-store" },
  });
}
