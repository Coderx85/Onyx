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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "168", 10);

    const lokiUrl = process.env.LOKI_URL || "http://localhost:3100";
    const endTime = Math.floor(Date.now() * 1_000_000); // nanoseconds
    const startTime = endTime - hours * 60 * 60 * 1_000_000_000;

    // Query Loki for session logs
    const query = encodeURIComponent(
      '{service="better-auth", component="session"} | json'
    );

    const lokiResponse = await fetch(
      `${lokiUrl}/loki/api/v1/query_range?query=${query}&start=${startTime}&end=${endTime}&limit=1000`,
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
