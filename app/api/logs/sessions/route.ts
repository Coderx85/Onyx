import { config } from "@/lib";
import { NextRequest, NextResponse } from "next/server";

interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiResponse {
  status: string;
  data: {
    resultType: string;
    result: LokiStream[];
  };
}

interface SessionEvent {
  timestamp: string;
  eventType: "created" | "refreshed" | "terminated" | "unknown";
  sessionId: string;
  userId: string;
  expiresAt?: string;
  message: string;
}

/**
 * Query Loki for session-related logs from Better Auth
 * GET /api/logs/sessions?hours=168 (default: last 7 days = 168 hours)
 */
async function handler(request: NextRequest) {
  try {
    // attempt to record an incoming request immediately (debug)
    try {
      const mod = await import("@/lib/metrics");
      await mod.observeRequest({
        method: request.method ?? "GET",
        route: "/api/logs/sessions",
        status: 200,
      });
    } catch (e) {
      // ignore errors importing metrics (some runtimes may not support prom-client)
      // eslint-disable-next-line no-console
      console.warn("Could not pre-record metrics for sessions handler", e);
    }

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "168", 10);
    const endTime = Math.floor(Date.now() * 1_000_000); // nanoseconds
    const startTime = endTime - hours * 60 * 60 * 1_000_000_000;

    // Query Loki for session logs
    const query = encodeURIComponent(
      '{service="better-auth", component="session"} | json'
    );

    const lokiResponse = await fetch(
      `${config.lokiURL}/loki/api/v1/query_range?query=${query}&start=${startTime}&end=${endTime}&limit=1000`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!lokiResponse.ok) {
      console.error("Loki query failed:", lokiResponse.statusText);
      return NextResponse.json(
        { error: "Failed to fetch logs from Loki" },
        { status: 500 }
      );
    }

    const data: LokiResponse = await lokiResponse.json();

    if (data.status !== "success") {
      return NextResponse.json(
        { error: "Loki query unsuccessful" },
        { status: 500 }
      );
    }

    // Parse and structure the session events
    const events: SessionEvent[] = [];

    for (const stream of data.data.result) {
      for (const [timestamp, logLine] of stream.values) {
        try {
          const parsed = JSON.parse(logLine);

          console.log("Parsed log entry:", parsed);

          // Determine event type from message
          let eventType: SessionEvent["eventType"] = "unknown";
          const message = parsed.message || "";

          if (message.includes("created")) {
            eventType = "created";
          } else if (message.includes("refreshed")) {
            eventType = "refreshed";
          } else if (message.includes("terminated")) {
            eventType = "terminated";
          }

          events.push({
            timestamp: new Date(parseInt(timestamp) / 1_000_000).toISOString(),
            eventType,
            sessionId: parsed.sessionId || "unknown",
            userId: parsed.userId || "unknown",
            expiresAt: parsed.expiresAt || parsed.timestamp,
            message,
          });
        } catch (e) {
          // Skip parsing errors for individual logs
          console.warn("Failed to parse log entry:", e);
        }
      }
    }

    // Sort by timestamp descending (newest first)
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const start = new Date().getTime();
    const durationMs = new Date().getTime() - start;

    // observe metrics directly from handler (deterministic/debug)
    try {
      const mod = await import("@/lib/metrics");
      // Primary: use the helper that records counter + histogram
      await mod.observeRequest({
        method: "GET",
        route: "/api/logs/sessions",
        status: 200,
        durationMs,
      });

      // Extra deterministic increment in case helper paths fail to surface immediately
      try {
        if (
          mod.httpRequestsTotal &&
          typeof mod.httpRequestsTotal.inc === "function"
        ) {
          // increment the counter with explicit labels
          mod.httpRequestsTotal.inc({
            method: "GET",
            route: "/api/logs/sessions",
            status: "200",
          });
          // eslint-disable-next-line no-console
          console.log("[sessions route] deterministic metric incremented");
        }
        if (
          mod.httpRequestDurationSeconds &&
          typeof mod.httpRequestDurationSeconds.observe === "function"
        ) {
          mod.httpRequestDurationSeconds.observe(
            { method: "GET", route: "/api/logs/sessions", status: "200" },
            durationMs / 1000
          );
        }
      } catch (innerErr) {
        // eslint-disable-next-line no-console
        console.warn(
          "[sessions route] secondary metric increment failed",
          innerErr
        );
      }
    } catch (e) {
      // no-op if metrics module cannot be imported in this runtime (edge etc)
      // eslint-disable-next-line no-console
      console.warn("Could not record metrics from sessions handler", e);
    }

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
      timeRange: {
        hours,
        startTime: new Date(startTime / 1_000_000).toISOString(),
        endTime: new Date(endTime / 1_000_000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching session logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { withMetrics } from "@/lib/withMetrics";

export const GET = withMetrics(handler, "/api/logs/sessions");

// debug: indicate module load
// eslint-disable-next-line no-console
console.log("[sessions route] module loaded, GET exported");
