import { NextRequest, NextResponse } from "next/server";
import { reportTrafficToGoogleAnalytics } from "@/lib/google-analytics";
import { classifyRequest, type TrafficResult } from "@/lib/traffic";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "Unknown";
  const claimedName = identifyUserAgent(userAgent);
  const configuredToken = process.env.DEMO_SIMULATION_TOKEN;
  const allowSimulation =
    process.env.NODE_ENV !== "production" ||
    Boolean(
      configuredToken &&
        request.headers.get("x-demo-token") === configuredToken,
    );
  const effectiveClassification = classifyRequest(
    request.headers,
    allowSimulation,
    process.env.NODE_ENV !== "production" ? userAgent : undefined,
  );

  const partialResult: Omit<TrafficResult, "analytics"> = {
    timestamp: new Date().toISOString(),
    requestId: request.headers.get("x-vercel-id") ?? crypto.randomUUID(),
    detection: effectiveClassification,
    request: {
      method: request.method,
      path: request.nextUrl.pathname,
      userAgent,
      userAgentFamily: claimedName,
    },
  };

  const analytics = await reportTrafficToGoogleAnalytics({
    collectionPoint: "server_api",
    classification: effectiveClassification,
    request: partialResult.request,
  });
  const result: TrafficResult = { ...partialResult, analytics };

  return NextResponse.json(result, {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}

function identifyUserAgent(userAgent: string) {
  if (/googlebot/i.test(userAgent)) return "Googlebot";
  if (/bingbot/i.test(userAgent)) return "Bingbot";
  if (/curl/i.test(userAgent)) return "curl";
  if (/python-requests/i.test(userAgent)) return "python-requests";
  if (/playwright|headlesschrome/i.test(userAgent)) return "Headless browser";
  if (/chrome|safari|firefox|edg/i.test(userAgent)) return "Browser";
  return "Unknown";
}
