import { env } from "cloudflare:workers";

type MediaMetadata = {
  contentType?: string;
};

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key?.startsWith("uploads/")) return new Response("Missing key", { status: 400 });
  const object = await env.MEDIA.getWithMetadata<MediaMetadata>(key, { type: "stream" });
  if (!object.value) return new Response("Not found", { status: 404 });
  return new Response(object.value, {
    headers: {
      "content-type": object.metadata?.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
