import { after } from "next/server";
import { headers } from "next/headers";
import { TrafficDashboard } from "@/components/traffic-dashboard";
import { reportTrafficToGoogleAnalytics } from "@/lib/google-analytics";
import { classifyRequest } from "@/lib/traffic";

export default async function Home() {
  const requestHeaders = await headers();
  const classification = classifyRequest(requestHeaders);
  const analyticsEnabled = Boolean(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.GA_API_SECRET,
  );

  after(async () => {
    await reportTrafficToGoogleAnalytics({
      collectionPoint: "server_page",
      classification,
      request: {
        method: "GET",
        path: "/",
        userAgent: requestHeaders.get("user-agent") ?? "Unknown",
        userAgentFamily: identifyUserAgent(requestHeaders.get("user-agent")),
      },
    });
  });

  return (
    <TrafficDashboard
      analyticsEnabled={analyticsEnabled}
      initialClassification={classification}
      initialTimestamp={new Date().toISOString()}
    />
  );
}

function identifyUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown";
  if (/googlebot/i.test(userAgent)) return "Googlebot";
  if (/bingbot/i.test(userAgent)) return "Bingbot";
  if (/curl/i.test(userAgent)) return "curl";
  if (/python-requests/i.test(userAgent)) return "python-requests";
  if (/playwright|headlesschrome/i.test(userAgent)) return "Headless browser";
  if (/chrome|safari|firefox|edg/i.test(userAgent)) return "Browser";
  return "Unknown";
}
