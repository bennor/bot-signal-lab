"use client";

import Image from "next/image";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { simulations, type TrafficResult } from "@/lib/traffic";

const codeSample = `import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const vercelBotHeaders = [
    "x-vercel-bot-category",
    "x-vercel-bot-name",
    "x-vercel-verified-bot",
  ];

  const botHeaders = Object.fromEntries(
    vercelBotHeaders.flatMap((name) => {
      const value = request.headers.get(name);
      return value ? [[name, value]] : [];
    })
  );
  const isBot = "x-vercel-bot-category" in botHeaders;

  return Response.json({
    userAgent: request.headers.get("user-agent"),
    isBot,
    botHeaders,
  });
}`;

export function TrafficDashboard() {
  const [selected, setSelected] = useState<TrafficResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  async function inspectRequest() {
    setLoading(true);
    try {
      const response = await fetch("/api/traffic", { method: "POST" });
      setSelected(await response.json());
    } finally {
      setLoading(false);
    }
  }

  async function runSimulation(scenario: string) {
    setLoading(true);
    setActiveScenario(scenario);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      setSelected(await response.json());
    } finally {
      setLoading(false);
      setActiveScenario(null);
    }
  }

  return (
    <main>
      <header className="masthead">
        <div>
          <div className="project-brand">
            <Image src="/bot-icon.svg" alt="" width={28} height={28} priority />
            <span className="eyebrow">Security Plus</span>
          </div>
          <h1>Bot Signal Lab</h1>
          <p className="intro">
            Send a request, then inspect the bot headers Vercel passed to the
            application.
          </p>
        </div>
      </header>

      <div className="header-key-list" aria-label="Vercel bot headers inspected">
        <span>Headers inspected</span>
        <code>x-vercel-bot-category</code>
        <code>x-vercel-bot-name</code>
        <code>x-vercel-verified-bot</code>
      </div>

      <section>
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <h2>Traffic profiles</h2>
            <p>
              The first button calls <code>/api/traffic</code> from this browser. The
              others call it from the server with a different <code>User-Agent</code>.
            </p>
            <div className="resource-links">
              <a
                href="https://vercel.com/docs/vercel-firewall/security-plus"
                target="_blank"
                rel="noreferrer"
              >
                Security Plus documentation
              </a>
              <a
                href="https://vercel.com/docs/bot-management#bot-visibility-and-classification-with-security-plus"
                target="_blank"
                rel="noreferrer"
              >
                Bot visibility and classification categories
              </a>
            </div>
          </div>
        </div>
        <div className="scenario-grid">
          <button
            className="scenario"
            onClick={inspectRequest}
            disabled={loading}
          >
            <span className="human">APP CALL</span>
            <strong>Human browser</strong>
            <small>
              {loading && activeScenario === null
                ? "Sending request..."
                : "A browser fetch to /api/traffic."}
            </small>
          </button>
          {simulations.map((simulation) => (
            <button
              className="scenario"
              key={simulation.id}
              onClick={() => runSimulation(simulation.id)}
              disabled={loading}
            >
              <span className="bot">API CALL</span>
              <strong>{simulation.label}</strong>
              <small>
                {activeScenario === simulation.id
                  ? "Sending request..."
                  : simulation.description}
              </small>
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <section className="result-section">
          <div className="section-heading">
            <span className="section-number">02</span>
            <div>
              <h2>Inspection API response</h2>
              <p>Response from <code>/api/traffic</code>.</p>
            </div>
          </div>
          <CodeBlock code={JSON.stringify(selected, null, 2)} language="json" />
        </section>
      ) : null}

      <section className="how-it-works">
        <div className="section-heading">
          <span className="section-number">03</span>
          <div>
            <h2>How this works</h2>
            <p>
              Security Plus passes <code>x-vercel-bot-category</code>,{" "}
              <code>x-vercel-bot-name</code>, and <code>x-vercel-verified-bot</code> to
              application code. This route reads them without changing the values.
            </p>
          </div>
        </div>
        <CodeBlock code={codeSample} language="tsx" />
      </section>

      <footer>
        A Googlebot user agent alone cannot simulate a verified crawler because Vercel
        also verifies network or cryptographic identity.
      </footer>
    </main>
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: "json" | "tsx";
}) {
  return (
    <Highlight theme={themes.github} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} code-sample`} style={style}>
          {tokens.map((line, index) => (
            <span key={`line-${index}`} {...getLineProps({ line })} className="code-line">
              <span className="line-number">{index + 1}</span>
              <span>
                {line.map((token, tokenIndex) => (
                  <span
                    key={`token-${index}-${tokenIndex}`}
                    {...getTokenProps({ token })}
                  />
                ))}
              </span>
            </span>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
