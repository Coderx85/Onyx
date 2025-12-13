import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import * as schema from "./db/schema";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { createBetterAuthLokiLogger, createLokiLogger } from "./lib/loki";

// Create dedicated loggers for different auth components
const authLogger = createLokiLogger("better-auth");
const sessionLogger = createLokiLogger("better-auth", { component: "session" });
const userLogger = createLokiLogger("better-auth", { component: "user" });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // Logger configured to push logs to Grafana Loki in development mode
  logger: createBetterAuthLokiLogger(),
  plugins: [nextCookies()],
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Database hooks for tracking user and session lifecycle
  databaseHooks: {
    // User lifecycle hooks
    user: {
      create: {
        after: async (user) => {
          userLogger.info("New user created", {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString(),
          });
        },
      },
      update: {
        after: async (user) => {
          userLogger.info("User updated", {
            userId: user.id,
            email: user.email,
            updatedAt: new Date().toISOString(),
          });
        },
      },
    },
    // Session lifecycle hooks
    session: {
      create: {
        after: async (session) => {
          sessionLogger.info("Session created by database hook", {
            sessionId: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
            createdAt: new Date().toISOString(),
          });
        },
      },
      update: {
        after: async (session) => {
          sessionLogger.debug("Session refreshed by database hook", {
            sessionId: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
            refreshedAt: new Date().toISOString(),
          });
        },
      },
      delete: {
        after: async (session) => {
          sessionLogger.info("Session terminated by database hook", {
            sessionId: session.id,
            userId: session.userId,
            terminatedAt: new Date().toISOString(),
          });
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const { path, method, headers } = ctx;
      const userAgent = headers?.get?.("user-agent") || "unknown";
      const ip =
        headers?.get?.("x-forwarded-for") ||
        headers?.get?.("x-real-ip") ||
        "unknown";

      // Log authentication attempts
      if (path.includes("/sign-in")) {
        authLogger.info("Sign-in attempt by Before:hook", {
          path,
          method,
          userAgent,
          ip,
        });
      } else if (path.includes("/sign-up")) {
        authLogger.info("Sign-up attempt by Before:hook", {
          path,
          method,
          userAgent,
          ip,
        });
      } else if (path.includes("/sign-out")) {
        // authLogger.info("Sign out attempt", {
        //   path,
        //   userAgent,
        //   method,
        //   ip,
        // });
        sessionLogger.info("Session terminated", {
          path,
          method,
          userAgent,
          ip,
        });
        ctx.redirect("/");
      } else if (path.includes("/session")) {
        authLogger.debug("Session validation request", {
          path,
          method,
          userAgent,
          ip,
        });
      } else if (
        path.includes("/forgot-password") ||
        path.includes("/reset-password")
      ) {
        authLogger.info("Password reset attempt", { path, method, ip });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const { path, context } = ctx;
      const response = context.returned;

      // Log authentication results
      if (path.includes("/sign-in") || path.includes("/sign-up")) {
        if (response instanceof Response && response.ok) {
          authLogger.info("Authentication successful by After:hook", {
            path,
            status: response.status,
          });
        } else if (response instanceof Response && !response.ok) {
          authLogger.warn("Authentication failed by After:hook", {
            path,
            status: response.status,
          });
        }
      }

      // Log sign-out results
      if (path.includes("/sign-out")) {
        if (response instanceof Response && response.ok) {
          authLogger.info("Sign-out successful", {
            path,
            status: response.status,
          });
        }
      }

      // Log session validation results
      if (path.includes("/session")) {
        if (response instanceof Response && response.ok) {
          authLogger.debug("Session valid", {
            path,
            status: response.status,
          });
        } else if (response instanceof Response && !response.ok) {
          authLogger.debug("Session invalid or expired", {
            path,
            status: response.status,
          });
        }
      }
    }),
  },
});
