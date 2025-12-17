import type { NextRequest } from "next/server";

// Lazily import metrics to avoid bundling node-only `prom-client` into edge/middleware builds.
let metricsModule: typeof import("./metrics") | null = null;
async function getMetrics() {
  if (metricsModule) return metricsModule;
  try {
    // dynamic import — may fail in environments without prom-client available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import("./metrics");
    metricsModule = mod;
    return mod;
  } catch (e) {
    // fallback to a safe no-op implementation
    metricsModule = null;
    return null;
  }
}

export function withMetrics(
  handler: (req: NextRequest) => Promise<Response>,
  routeName = "unknown",
) {
  return async (req: NextRequest) => {
    const method = (req.method || "GET").toUpperCase();
    const route = routeName || new URL(req.url).pathname;
    const start = Date.now();

    try {
      const m = await getMetrics();
      try {
        m?.inFlightInc?.(route);
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }

    try {
      // debug: log metric wrapper hit
      // eslint-disable-next-line no-console
      console.log(`[withMetrics] ${method} ${route} - start`);
      const res = await handler(req);
      const status = res.status ?? 0;
      const durationMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        `[withMetrics] ${method} ${route} - status ${status} duration ${durationMs}ms`,
      );
      try {
        const m = await getMetrics();
        m?.observeRequest?.({ method, route, status, durationMs });
      } catch (_) {
        // ignore
      }
      return res;
    } catch (err) {
      const durationMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        `[withMetrics] ${method} ${route} - error after ${durationMs}ms`,
      );
      try {
        const m = await getMetrics();
        m?.observeRequest?.({ method, route, status: 500, durationMs });
      } catch (_) {
        // ignore
      }
      throw err;
    } finally {
      try {
        const m = await getMetrics();
        m?.inFlightDec?.(route);
      } catch (e) {
        // ignore
      }
    }
  };
}
