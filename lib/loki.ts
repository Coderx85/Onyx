/**
 * Loki Logger Utility
 *
 * Provides a simple interface to push logs directly to Grafana Loki.
 * Designed for development mode observability.
 *
 * @example
 * ```ts
 * import { pushToLoki, createLokiLogger } from "@/lib/loki";
 *
 * // Direct push
 * await pushToLoki("info", "User logged in", { userId: "123" });
 *
 * // Create a logger for a specific service
 * const authLogger = createLokiLogger("better-auth");
 * authLogger.info("Session created");
 * ```
 */

import { config } from "./config";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

interface LokiPushBody {
  streams: LokiStream[];
}

interface LogMetadata {
  [key: string]: unknown;
}

// Configuration
const LOKI_PUSH_ENDPOINT = `${config.lokiURL}/loki/api/v1/push`;
const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Push a log entry directly to Loki
 *
 * @param level - Log level (debug, info, warn, error)
 * @param message - Log message
 * @param metadata - Additional metadata to include in the log
 * @param labels - Custom labels for the log stream
 */
export async function pushToLoki(
  level: LogLevel,
  message: string,
  metadata: LogMetadata = {},
  labels: Record<string, string> = {},
): Promise<void> {
  // Only push to Loki in development mode
  if (!IS_DEV) {
    return;
  }

  const timestamp = (Date.now() * 1_000_000).toString(); // Nanoseconds as string

  const logEntry = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  });

  const body: LokiPushBody = {
    streams: [
      {
        stream: {
          level,
          service: "next-app",
          ...labels,
        },
        values: [[timestamp, logEntry]],
      },
    ],
  };

  // Fire and forget - don't await, don't block
  fetch(LOKI_PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(() => {
    // Silently fail if Loki is not available
  });
}

/**
 * Create a logger instance for a specific service
 *
 * @param service - Service name to use as a label
 * @param defaultLabels - Default labels to include with every log
 * @returns Logger object with level methods
 */
export function createLokiLogger(
  service: string,
  defaultLabels: Record<string, string> = {},
) {
  const labels = { service, ...defaultLabels };

  const log = (level: LogLevel, message: string, ...args: unknown[]) => {
    // Always log to console
    console[level](message, ...args);

    // Prepare metadata from args
    const metadata: LogMetadata = {};
    if (args.length > 0) {
      if (
        args.length === 1 &&
        typeof args[0] === "object" &&
        args[0] !== null
      ) {
        Object.assign(metadata, args[0]);
      } else {
        metadata.args = args;
      }
    }

    // Push to Loki (fire and forget)
    pushToLoki(level, message, metadata, labels);
  };

  return {
    debug: (message: string, ...args: unknown[]) =>
      log("debug", message, ...args),
    info: (message: string, ...args: unknown[]) =>
      log("info", message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      log("warn", message, ...args),
    error: (message: string, ...args: unknown[]) =>
      log("error", message, ...args),
    log, // Generic log method
  };
}

/**
 * Create a Better Auth compatible logger that pushes to Loki
 *
 * @returns Logger configuration object for Better Auth
 */
export function createBetterAuthLokiLogger() {
  const lokiLogger = createLokiLogger("better-auth");

  return {
    level: "info" as const,
    log: (level: LogLevel, message: string, ...args: unknown[]) => {
      lokiLogger.log(level, message, ...args);
    },
  };
}
