import type { NextRequest } from "next/server";
import { observeRequest, inFlightInc, inFlightDec } from "./metrics";

export function withMetrics(
  handler: (req: NextRequest) => Promise<Response>,
  routeName = "unknown",
) {
  return async function (req: NextRequest) {
    const method = (req.method || "GET").toUpperCase();
    const route = routeName || new URL(req.url).pathname;
    const start = Date.now();

    try {
      inFlightInc(route);
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
      observeRequest({ method, route, status, durationMs }).catch(() => {});
      return res;
    } catch (err) {
      const durationMs = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(
        `[withMetrics] ${method} ${route} - error after ${durationMs}ms`,
      );
      observeRequest({ method, route, status: 500, durationMs }).catch(
        () => {},
      );
      throw err;
    } finally {
      try {
        inFlightDec(route);
      } catch (e) {
        // ignore
      }
    }
  };
}
