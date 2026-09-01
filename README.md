# Bot Signal Lab

A small Next.js application showing how to read Vercel bot classification headers in application code.

This demo does not use the Vercel BotID product.

## Documentation

- [Security Plus documentation](https://vercel.com/docs/vercel-firewall/security-plus)
- [Bot visibility and classification categories](https://vercel.com/docs/bot-management#bot-visibility-and-classification-with-security-plus)

## Request flow

1. A request reaches Vercel's edge.
2. Vercel classifies bot traffic at the edge.
3. Security+ forwards classification data to the application through:
   - `x-vercel-bot-category`
   - `x-vercel-bot-name`
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
- The complete `/api/traffic` response is rendered below the buttons. It contains only the user agent and genuine `x-vercel-bot-*` headers added by Vercel.
- The **How this works** section shows the Route Handler code needed to read the Vercel headers.
- The TypeScript example uses token-based syntax highlighting and line numbers.

Vercel classification headers do not exist locally. The four simulation routes override only `User-Agent`. On a Vercel deployment, Bot Protection classifies each request and `/api/traffic` returns the native `x-vercel-bot-*` headers without remapping.

The command-line simulator also sends only the selected user agents:

```bash
pnpm simulate
```

## Deploy and test real classification

Deploy the app directly to Vercel, without Akamai or another reverse proxy in front of it.

Enable Security+ for the project so application code receives the detailed classification headers.

Then send test traffic:

```bash
TARGET_URL=https://your-project.vercel.app pnpm simulate
```

A fake Googlebot user agent should not be presented as a genuinely verified crawler because Vercel also checks network or cryptographic identity. The button is an API payload demonstration.
