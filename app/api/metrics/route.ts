import register from "@/lib/metrics";

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new Response(metrics, {
      status: 200,
      headers: {
        "Content-Type": register.contentType || "text/plain; version=0.0.4",
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to collect metrics", e);
    return new Response("", { status: 500 });
  }
}
