import { after } from "next/server";
import { headers } from "next/headers";
import { TrafficDashboard } from "@/components/traffic-dashboard";
import { reportTrafficToGoogleAnalytics } from "@/lib/google-analytics";
import { extractBotHeaders, type TrafficResult } from "@/lib/traffic";

export default async function Home() {
  const requestHeaders = await headers();
  const botHeaders = extractBotHeaders(requestHeaders);
  const userAgent = requestHeaders.get("user-agent") ?? "Unknown";
  const analyticsEnabled = Boolean(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.GA_API_SECRET,
  );

  after(async () => {
    await reportTrafficToGoogleAnalytics({
      collectionPoint: "server_page",
      botHeaders,
      userAgent,
    });
  });

  const initialResult: TrafficResult = {
    userAgent,
    botHeaders,
    googleAnalytics: { enabled: analyticsEnabled, delivered: false },
  };

  return (
    <TrafficDashboard
      analyticsEnabled={analyticsEnabled}
      initialResult={initialResult}
    />
  );
}
