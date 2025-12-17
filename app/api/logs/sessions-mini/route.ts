import { config } from "@/lib";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${config.lokiURL}/loki/api/v1/labels`, { method: 'GET' });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (e) {
    console.error('sessions-mini fetch failed', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
