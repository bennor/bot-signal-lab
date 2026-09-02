export type BotHeaders = Record<string, string>;

export type TrafficResult = {
  userAgent: string;
  isBot: boolean;
  botHeaders: BotHeaders;
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
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2; +https://openai.com/gptbot",
  },
  {
    id: "googlebot-claim",
    label: "Googlebot claim",
    description: "A Googlebot user agent without Google's network identity.",
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    id: "headless-chrome",
    label: "Headless Chrome",
    description: "A browser controlled through Playwright or Puppeteer.",
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 HeadlessChrome/128.0.0.0 Safari/537.36",
  },
];
