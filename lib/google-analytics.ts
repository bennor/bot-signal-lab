import type { BotClassification, TrafficResult } from "./traffic";

type AnalyticsStatus = TrafficResult["analytics"];

export async function reportTrafficToGoogleAnalytics(input: {
  collectionPoint: "server_page" | "server_api";
  classification: BotClassification;
  request: TrafficResult["request"];
}): Promise<AnalyticsStatus> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;

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
              is_bot: input.classification.isBot ? "yes" : "no",
              bot_source: input.classification.source,
              bot_category: input.classification.category,
              bot_name: input.classification.name,
              bot_verified: input.classification.verified,
              request_method: input.request.method,
              request_path: input.request.path,
              user_agent_family: input.request.userAgentFamily,
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
