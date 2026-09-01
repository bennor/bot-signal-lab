"use client";

import { useEffect, useState } from "react";
import {
  simulations,
  type BotClassification,
} from "@/lib/traffic";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function TrafficDashboard({
  analyticsEnabled,
  initialClassification,
  initialTimestamp,
}: {
  analyticsEnabled: boolean;
  initialClassification: BotClassification;
  initialTimestamp: string;
}) {
  const [selected, setSelected] = useState<unknown>(() => ({
    timestamp: initialTimestamp,
    requestId: "initial-page-request",
    detection: initialClassification,
    request: {
      method: "GET",
      path: "/",
      userAgent: "Browser page request",
      userAgentFamily: "Browser",
    },
    analytics: { enabled: analyticsEnabled, delivered: false },
  }));
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  useEffect(() => {
    window.gtag?.("event", "bot_traffic_observed", {
      collection_point: "browser_page",
      is_bot: initialClassification.isBot ? "yes" : "no",
      bot_source: initialClassification.source,
      bot_category: initialClassification.category,
      bot_name: initialClassification.name,
      bot_verified: initialClassification.verified,
    });
  }, [initialClassification]);

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
            and attach the bot context to Google Analytics events.
          </p>
        </div>
        <div className={`status ${analyticsEnabled ? "online" : "offline"}`}>
          <span className="status-dot" />
          GA4 {analyticsEnabled ? "reporting enabled" : "reporting disabled"}
        </div>
      </header>

      {!analyticsEnabled ? (
        <aside className="analytics-warning" role="alert">
          <strong>Google Analytics is not connected</strong>
          <span>
            Events are being previewed on this page but are not being sent. Set
            {" "}
            <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> and <code>GA_API_SECRET</code>
            {" "}
            to enable reporting.
          </span>
        </aside>
      ) : null}

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

      <section className="how-it-works">
        <div className="section-heading">
          <span className="section-number">03</span>
          <div>
            <h2>How this works</h2>
            <p>
              Security+ adds bot classification headers before the request reaches
              your application. Read them in a Route Handler, then attach the values
              to the GA event you already send.
            </p>
          </div>
        </div>
        <pre className="code-sample">
          <code>{`import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const botCategory = request.headers.get("x-vercel-bot-category");
  const botName = request.headers.get("x-vercel-bot-name");
  const botVerified = request.headers.get("x-vercel-verified-bot");

  const event = {
    name: "bot_traffic_observed",
    params: {
      is_bot: Boolean(botCategory || botName),
      bot_category: botCategory ?? "human_or_unclassified",
      bot_name: botName ?? "none",
      bot_verified: botVerified ?? "not_applicable",
    },
  };

  // Send event through gtag or GA4 Measurement Protocol.
  return Response.json(event);
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
