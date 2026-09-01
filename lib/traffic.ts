export type BotHeaders = Record<string, string>;

export type TrafficResult = {
  userAgent: string;
  botHeaders: BotHeaders;
};

export type Simulation = {
  id: string;
  label: string;
  description: string;
  userAgent: string;
  botHeaders: BotHeaders;
};

export const simulations: Simulation[] = [
  {
    id: "curl",
    label: "curl",
    description: "A command-line HTTP client with no browser runtime.",
    userAgent: "curl/8.7.1",
    botHeaders: {
      "x-bot-category": "http_client",
      "x-bot-name": "curl",
      "x-bot-verified": "false",
    },
  },
  {
    id: "openai",
    label: "OpenAI GPTBot",
    description: "OpenAI's declared training crawler user agent.",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot",
    botHeaders: {
      "x-bot-category": "ai_crawler",
      "x-bot-name": "GPTBot",
      "x-bot-verified": "false",
    },
  },
  {
    id: "googlebot-claim",
    label: "Googlebot claim",
    description: "A Googlebot user agent without Google's network identity.",
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    botHeaders: {
      "x-bot-category": "unverified_bot",
      "x-bot-name": "Googlebot",
      "x-bot-verified": "false",
    },
  },
  {
    id: "headless-chrome",
    label: "Headless Chrome",
    description: "A browser controlled through Playwright or Puppeteer.",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 HeadlessChrome/128.0.0.0 Safari/537.36",
    botHeaders: {
      "x-bot-category": "automated_browser",
      "x-bot-name": "Headless Chrome",
      "x-bot-verified": "false",
    },
  },
];

export function extractBotHeaders(headers: Headers): BotHeaders {
  return Object.fromEntries(
    [...headers.entries()].filter(
      ([name]) =>
        name.startsWith("x-vercel-bot-") || name.startsWith("x-bot-"),
    ),
  );
}
