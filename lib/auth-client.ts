import { createAuthClient } from "better-auth/react";
import { config } from "./config";

export const authClient = createAuthClient({
  baseURL: config.baseURL!,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, useSession, signOut } = authClient;
