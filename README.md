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

Open [http://localhost:3000](http://localhost:3000) and select **Inspect API request**.

The five buttons exercise two paths:

- **Human browser** calls the in-app `/api/traffic` inspection endpoint directly.
- **curl**, **OpenAI GPTBot**, **Googlebot claim**, and **Headless Chrome** call `/api/simulate`. That server route makes a second request to `/api/traffic` with the selected `User-Agent` override.
- The complete `/api/traffic` response is rendered in the panel below the buttons, including the outbound user agent, classification, and GA delivery state.
- The **How this works** section shows the Route Handler code needed to read the Vercel headers and map them into a GA event.

Vercel classification headers do not exist locally. The simulator sends clearly labelled `x-demo-bot-*` headers so the complete application and GA mapping can be demonstrated:

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

Without `DEMO_SIMULATION_TOKEN`, the deployed simulator sends only different user agents. Classification comes from Vercel. A fake Googlebot user agent should not be presented as verified because Vercel also checks network or cryptographic identity.

For a deterministic deployed presentation, set `DEMO_SIMULATION_TOKEN` on the project and pass the same value to the command:

```bash
DEMO_SIMULATION_TOKEN=your-demo-token \
TARGET_URL=https://your-project.vercel.app \
pnpm simulate
```

Synthetic results are marked with `source: "demo-simulation"`. Never describe them as live Vercel classifications.

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

All paths use the `bot_traffic_observed` event. The `collection_point` parameter identifies `browser_page`, `browser_simulation`, `server_page`, or `server_api`.

Events include:

- `is_bot`
- `collection_point`
- `bot_source`
- `bot_category`
- `bot_name`
- `bot_verified`
- `request_method`
- `request_path`
- `user_agent_family`

Use GA4 Realtime or DebugView to confirm delivery. Register the parameters required for reporting as GA4 custom dimensions.

## Demo sequence

1. Show Bot Protection set to Log in the Vercel Firewall.
2. Open the application and inspect the classification attached to the page request.
3. Select **Inspect API request** to show that the same headers are available to Functions.
4. Run the simulator against the deployed URL.
5. Open Vercel Firewall traffic to show the logged bot matches.
6. Open GA4 Realtime or DebugView and compare the classification parameters.

## Limitation to explain

Bots that execute JavaScript can send the browser GA event with bot context. Clients such as curl do not execute the Google tag, so server-side Measurement Protocol reporting is required if those requests need to be represented in GA.
