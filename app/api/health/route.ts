import { NextResponse } from "next/server";
import { withMetrics } from "@/lib/withMetrics";

async function handler() {
  return NextResponse.json({ ok: true });
}

export const GET = withMetrics(handler, "/api/health");
