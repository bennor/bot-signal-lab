# Bot Signal Lab

A small Next.js application showing how to run Vercel Bot Protection in Log mode and read the resulting bot classification headers in application code.

This demo does not use the Vercel BotID product.

## Request flow

1. A request reaches Vercel's edge.
2. Bot Protection evaluates it in Log mode. The request is recorded but not blocked.
3. Security+ forwards classification data to the application through:
   - `x-vercel-bot-category`
   - `x-vercel-bot-name`
   - `x-vercel-bot-status`
   - `x-vercel-verified-bot`
4. The server reads those headers and makes them available to the page.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The five buttons exercise two paths:

- **Human browser** calls the in-app `/api/traffic` inspection endpoint directly.
- **curl**, **OpenAI GPTBot**, **Googlebot claim**, and **Headless Chrome** call `/api/simulate`. That server route makes a second request to `/api/traffic` with the selected `User-Agent` override.
- The complete `/api/traffic` response is rendered below the buttons. It contains only the user agent and raw bot headers.
- The **How this works** section shows the Route Handler code needed to read the Vercel headers.

Vercel classification headers do not exist locally. The four simulation routes attach ordinary `x-bot-*` headers to the request. `/api/traffic` returns those raw headers unchanged. When Security+ adds native `x-vercel-bot-*` headers, they appear in the same object without remapping.

The command-line simulator uses the same raw header model:

```bash
pnpm simulate
```

## Deploy and test real classification

Deploy the app directly to Vercel, without Akamai or another reverse proxy in front of it. In the project Firewall rules:

1. Find Bot Protection under Bot Management.
2. Select **Log**.
3. Review and publish the change.
4. Enable Security+ for the project so application code receives the detailed classification headers.

Then send test traffic:

```bash
TARGET_URL=https://your-project.vercel.app pnpm simulate
```

A fake Googlebot user agent should not be presented as a genuinely verified crawler because Vercel also checks network or cryptographic identity. The button is an API payload demonstration.

## Demo sequence

1. Show Bot Protection set to Log in the Vercel Firewall.
2. Open the application and select **Human browser** to show an API request without bot headers.
3. Select each bot button to show the overridden user agent and raw bot headers returned by the same inspection API.
4. Review the **How this works** code sample.
5. Open Vercel Firewall traffic to show the logged bot matches.
