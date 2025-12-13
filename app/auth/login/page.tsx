"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn.email({
      email,
      password,
    });

    if (result.error) {
      const errorMessage =
        result.error.message ||
        result.error.statusText ||
        JSON.stringify(result.error) ||
        "Sign in failed";
      setError(errorMessage);
    } else {
      router.refresh();
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Sign in to your account
          </CardTitle>
        </CardHeader>
        <form className="space-y-6 px-6 pb-6" onSubmit={handleSignIn}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-5 py-3">
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm font-medium text-primary hover:underline"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
