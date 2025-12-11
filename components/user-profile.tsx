"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type SessionData = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
} | null;

export function UserProfile() {
  const [session, setSession] = useState<SessionData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await authClient.getSession();
        console.log("Fetched session data: ", response);
        if (response && response.data) {
          setSession(response.data as SessionData);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Not signed in</p>
        <div className="space-x-4">
          <Link
            href="/sign-in"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">Welcome,</p>
        <p className="text-lg font-semibold">
          {session.user.name || session.user.email}
        </p>
        <p className="text-sm text-gray-600">{session.user.email}</p>
      </div>
      <button
        onClick={() => authClient.signOut()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}
