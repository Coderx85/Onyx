import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withMetrics } from "./lib/withMetrics";

async function _proxy(request: NextRequest) {
  const cookies = getSessionCookie(request);
  if (!cookies) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const proxy = withMetrics(_proxy, "/proxy");

export const config = {
  matcher: ["/dashboard"],
};
