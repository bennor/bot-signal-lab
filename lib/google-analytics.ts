import { readBotHeader, type BotHeaders, type TrafficResult } from "./traffic";

type AnalyticsStatus = TrafficResult["googleAnalytics"];

export async function reportTrafficToGoogleAnalytics(input: {
  collectionPoint: "server_page" | "server_api";
  botHeaders: BotHeaders;
  userAgent: string;
}): Promise<AnalyticsStatus> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  const category = readBotHeader(input.botHeaders, "category");
  const name = readBotHeader(input.botHeaders, "name");
  const verified =
    readBotHeader(input.botHeaders, "verified-bot") ??
    readBotHeader(input.botHeaders, "verified");

  if (!measurementId || !apiSecret) {
    return { enabled: false, delivered: false };
  }

  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: crypto.randomUUID(),
        events: [
          {
            name: "bot_traffic_observed",
            params: {
              collection_point: input.collectionPoint,
              is_bot: category || name ? "yes" : "no",
              bot_category: category ?? "human_or_unclassified",
              bot_name: name ?? "none",
              bot_verified: verified ?? "not_applicable",
              user_agent: input.userAgent.slice(0, 100),
              engagement_time_msec: 1,
            },
          },
        ],
      }),
      cache: "no-store",
    },
  );

  return { enabled: true, delivered: response.ok };
}
