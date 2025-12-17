import client from "prom-client";

// Registry and default metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP request counter
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

// HTTP request duration histogram (seconds)
export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 1, 2, 5],
  registers: [register],
});

// In-flight requests
export const httpInFlightRequests = new client.Gauge({
  name: "http_in_flight_requests",
  help: "Number of in-flight HTTP requests",
  labelNames: ["route"],
  registers: [register],
});

export async function observeRequest(opts: {
  method?: string;
  route?: string;
  status?: string | number;
  durationMs?: number;
}) {
  const method = (opts.method || "UNKNOWN").toUpperCase();
  const route = opts.route || "unknown";
  const status = String(opts.status ?? "0");

  try {
    httpRequestsTotal.inc({ method, route, status });
    if (typeof opts.durationMs === "number") {
      httpRequestDurationSeconds.observe({ method, route, status }, opts.durationMs / 1000);
    }
  } catch (e) {
    // guard against any metrics failures — do not throw
    // eslint-disable-next-line no-console
    console.warn("metrics observe failed", e);
  }
}

export function inFlightInc(route?: string) {
  try {
    httpInFlightRequests.inc({ route: route || "unknown" });
  } catch (e) {
    console.warn("metrics inFlightInc failed", e);
  }
}

export function inFlightDec(route?: string) {
  try {
    httpInFlightRequests.dec({ route: route || "unknown" });
  } catch (e) {
    console.warn("metrics inFlightDec failed", e);
  }
}

export default register;
