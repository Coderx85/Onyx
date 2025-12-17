"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ServerCogIcon, ServerCrashIcon } from "lucide-react";

interface SessionEvent {
  timestamp: string;
  eventType: "created" | "refreshed" | "terminated" | "unknown";
  sessionId: string;
  userId: string;
  expiresAt?: string;
  message: string;
}

interface SessionLogsResponse {
  success: boolean;
  count: number;
  events: SessionEvent[];
  timeRange: {
    hours: number;
    startTime: string;
    endTime: string;
  };
}

const AnalyticsPage = () => {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange] = useState({ hours: 168 }); // 7 days

  useEffect(() => {
    const fetchSessionLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/logs/sessions?hours=${timeRange.hours}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session logs");
        }

        const data: SessionLogsResponse = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          setError("Failed to fetch session logs from Loki");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionLogs();
  }, [timeRange]);

  const getEventBadgeColor = (eventType: SessionEvent["eventType"]) => {
    switch (eventType) {
      case "created":
        return "bg-green-100 rounded-sm px-2 py-1 dark:bg-green-900 dark:text-white/70 text-green-800 hover:bg-green-200";
      case "refreshed":
        return "bg-blue-100 rounded-sm px-2 py-1 dark:bg-blue-900 dark:text-white/70 text-blue-800 hover:bg-blue-200";
      case "terminated":
        return "bg-red-100 rounded-sm px-2 py-1 dark:bg-red-900 dark:text-white/70 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 rounded-sm px-2 py-1 dark:bg-gray-900 dark:text-white/70 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze Better Auth session activity
        </p>
      </div>

      <Card className="bg-sidebar">
        <CardHeader>
          <CardTitle className="text-xl">Session Events</CardTitle>
          <CardDescription>
            All session-related events from the last 7 days
            {events.length > 0 && ` (${events.length} events found)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  {process.env.NODE_ENV === "production" ? (
                    <ServerCogIcon />
                  ) : (
                    <ServerCrashIcon />
                  )}
                </EmptyMedia>
                <EmptyTitle>
                  {process.env.NODE_ENV === "production"
                    ? "Session Logs Unavailable"
                    : "Session Logs Not Loaded"}
                </EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="w-full max-w-2xl">
                {/* For production, Loki, Grafana and Vector are not deployed in the production environment. */}
                {/* For development. the loki, vector and grafana is not started yet. */}
                <p className="text-sm text-gray-500">
                  {process.env.NODE_ENV === "production"
                    ? "Contact support if you believe this is an error."
                    : "Start the observability stack using Docker Compose with the 'obs' profile."}
                </p>
              </EmptyContent>
            </Empty>
          ) : events.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No session events found</p>
              <p className="text-sm text-gray-500 mt-1">
                Session logs will appear here as users sign in and out
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Event</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Expires At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-xs text-gray-600 max-w-xs">
                        {formatTimestamp(event.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getEventBadgeColor(event.eventType)}>
                          {event.eventType.charAt(0).toUpperCase() +
                            event.eventType.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {event.expiresAt
                          ? formatTimestamp(event.expiresAt)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
