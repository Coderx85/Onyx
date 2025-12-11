import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  fetchOptions: {
    onError(e) {
      console.error("Auth error:", e.error);
    },
  },
});

export const { signIn, signUp, useSession, signOut } = authClient;
