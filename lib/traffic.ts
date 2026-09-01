export type DetectionSource =
  | "vercel-edge"
  | "demo-simulation"
  | "user-agent-simulation"
  | "none";

export type BotClassification = {
  isBot: boolean;
  source: DetectionSource;
  category: string;
  name: string;
  verified: string;
};

export type TrafficResult = {
  timestamp: string;
  requestId: string;
  detection: BotClassification;
  request: {
    method: string;
    path: string;
    userAgent: string;
    userAgentFamily: string;
  };
  analytics: {
    enabled: boolean;
    delivered: boolean;
  };
};

export type Simulation = {
  id: string;
  label: string;
  description: string;
  userAgent: string;
};

export const simulations: Simulation[] = [
  {
    id: "curl",
    label: "curl",
    description: "A command-line HTTP client with no browser runtime.",
    userAgent: "curl/8.7.1",
  },
  {
    id: "openai",
    label: "OpenAI GPTBot",
    description: "OpenAI's declared training crawler user agent.",
    userAgent: "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot",
  },
  {
    id: "googlebot-claim",
    label: "Googlebot claim",
    description: "A Googlebot user agent without Google's network identity.",
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    id: "headless-chrome",
    label: "Headless Chrome",
    description: "A browser controlled through Playwright or Puppeteer.",
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 HeadlessChrome/128.0.0.0 Safari/537.36",
  },
];

export function classifyRequest(
  requestHeaders: Pick<Headers, "get">,
  allowSimulation = false,
  localUserAgent?: string,
): BotClassification {
  const demoCategory = allowSimulation
    ? requestHeaders.get("x-demo-bot-category")
    : null;
  const category =
    demoCategory ?? requestHeaders.get("x-vercel-bot-category");
  const name =
    (allowSimulation ? requestHeaders.get("x-demo-bot-name") : null) ??
    requestHeaders.get("x-vercel-bot-name");
  const verified =
    (allowSimulation ? requestHeaders.get("x-demo-bot-verified") : null) ??
    requestHeaders.get("x-vercel-verified-bot");

  if (!category && !name && verified === null) {
    if (localUserAgent) {
      return classifyLocalUserAgent(localUserAgent);
    }

    return {
      isBot: false,
      source: "none",
      category: "human_or_unclassified",
      name: "None",
      verified: "not_applicable",
    };
  }

  return {
    isBot: true,
    source: demoCategory ? "demo-simulation" : "vercel-edge",
    category: category ?? "unknown",
    name: name ?? "Unknown bot",
    verified: verified ?? "unknown",
  };
}

function classifyLocalUserAgent(userAgent: string): BotClassification {
  if (/gptbot/i.test(userAgent)) {
    return localClassification("unverified_bot", "GPTBot");
  }
  if (/googlebot/i.test(userAgent)) {
    return localClassification("unverified_bot", "Googlebot");
  }
  if (/headlesschrome|playwright|puppeteer/i.test(userAgent)) {
    return localClassification("automated_browser", "Headless Chrome");
  }
  if (/curl|python-requests|httpie/i.test(userAgent)) {
    return localClassification("http_client", userAgent.split("/")[0]);
  }

  return {
    isBot: false,
    source: "none",
    category: "human_or_unclassified",
    name: "None",
    verified: "not_applicable",
  };
}

function localClassification(category: string, name: string): BotClassification {
  return {
    isBot: true,
    source: "user-agent-simulation",
    category,
    name,
    verified: "not_verified_locally",
  };
}
