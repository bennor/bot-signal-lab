# Bot Signal Lab

A small Next.js application showing how to run Vercel Bot Protection in Log mode, read the resulting bot classification headers in application code, and attach that context to Google Analytics 4 events.

This demo does not use the Vercel BotID product.

## Request flow

1. A request reaches Vercel's edge.
2. Bot Protection evaluates it in Log mode. The request is recorded but not blocked.
3. Security+ forwards classification data to the application through:
   - `x-vercel-bot-category`
   - `x-vercel-bot-name`
   - `x-vercel-verified-bot`
4. The server reads those headers and makes them available to the page.
5. The browser adds the fields to a GA page-view event.
6. The server can also send classified requests through GA4 Measurement Protocol, which covers clients that do not execute the browser tag.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The five buttons exercise two paths:

- **Human browser** calls the in-app `/api/traffic` inspection endpoint directly.
- **curl**, **OpenAI GPTBot**, **Googlebot claim**, and **Headless Chrome** call `/api/simulate`. That server route makes a second request to `/api/traffic` with the selected `User-Agent` override.
- The complete `/api/traffic` response is rendered below the buttons. It contains the user agent, raw bot headers, and GA delivery state.
- The **How this works** section shows the Route Handler code needed to read the Vercel headers and map them into a GA event.

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

## Optional GA4 reporting

All GA reporting code is inactive when its environment variables are absent.
The page displays a visible warning in this state so it cannot be mistaken for a live GA integration.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your-measurement-protocol-secret
```

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` enables the browser Google tag.
- Both variables enable server-side page and API events through Measurement Protocol.
- `GA_API_SECRET` remains server-only.

All paths use the `bot_traffic_observed` event. The `collection_point` parameter identifies the browser or server collection path.

Events include:

- `is_bot`
- `collection_point`
- `bot_category`
- `bot_name`
- `bot_verified`
- `user_agent`

Use GA4 Realtime or DebugView to confirm delivery. Register the parameters required for reporting as GA4 custom dimensions.

## Demo sequence

1. Show Bot Protection set to Log in the Vercel Firewall.
2. Open the application and select **Human browser** to show an API request without bot headers.
3. Select each bot button to show the overridden user agent and raw bot headers returned by the same inspection API.
4. Review the **How this works** code sample.
5. Open Vercel Firewall traffic to show the logged bot matches.
6. Open GA4 Realtime or DebugView and compare the classification parameters.

## Limitation to explain

Bots that execute JavaScript can send the browser GA event with bot context. Clients such as curl do not execute the Google tag, so server-side Measurement Protocol reporting is required if those requests need to be represented in GA.
