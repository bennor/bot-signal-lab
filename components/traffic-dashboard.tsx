"use client";

import { useState } from "react";
import { simulations, type TrafficResult } from "@/lib/traffic";

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
          <span className="eyebrow">Vercel bot classification demonstration</span>
          <h1>Bot Signal Lab</h1>
          <p className="intro">
            Keep Bot Protection in Log mode, read Vercel&apos;s classification headers,
            and inspect the raw values available to your application.
          </p>
        </div>
      </header>

      <div className="header-key-list" aria-label="Vercel bot headers inspected">
        <span>Headers inspected</span>
        <code>x-vercel-bot-category</code>
        <code>x-vercel-bot-name</code>
        <code>x-vercel-bot-status</code>
        <code>x-vercel-verified-bot</code>
      </div>

      <section>
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <h2>Traffic profiles</h2>
            <p>
              The browser calls the inspection API directly. The other buttons make a
              server-side request with the displayed user agent.
            </p>
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
                : "A normal fetch from the running application."}
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
              <p>The complete JSON returned by the local API appears below.</p>
            </div>
          </div>
          <pre>{JSON.stringify(selected, null, 2)}</pre>
        </section>
      ) : null}

      <section className="how-it-works">
        <div className="section-heading">
          <span className="section-number">03</span>
          <div>
            <h2>How this works</h2>
            <p>
              Security+ can add <code>x-vercel-bot-category</code>,{" "}
              <code>x-vercel-bot-name</code>, <code>x-vercel-bot-status</code>, and
              {" "}
              <code>x-vercel-verified-bot</code> before the request reaches your
              application. Read the raw values in a Route Handler, then attach them
              to any analytics or logging system that needs them.
            </p>
          </div>
        </div>
        <pre className="code-sample">
          <code>{`import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const vercelBotHeaders = [
    "x-vercel-bot-category",
    "x-vercel-bot-name",
    "x-vercel-bot-status",
    "x-vercel-verified-bot",
  ];

  const botHeaders = Object.fromEntries(
    vercelBotHeaders.flatMap((name) => {
      const value = request.headers.get(name);
      return value ? [[name, value]] : [];
    })
  );

  return Response.json({
    userAgent: request.headers.get("user-agent"),
    botHeaders,
  });
}`}</code>
        </pre>
      </section>

      <footer>
        Bot Protection should remain in Log mode for this demo. A Googlebot user agent
        alone cannot simulate a verified crawler because Vercel also verifies network
        or cryptographic identity.
      </footer>
    </main>
  );
}
