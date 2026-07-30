import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });
  const result = await env.MEDIA.list({ limit: 100, include: ["customMetadata", "httpMetadata"] });
  return Response.json({
    files: result.objects.map((object) => ({
      key: object.key,
      name: object.customMetadata?.originalName || object.key,
      size: object.size,
      uploaded: object.uploaded,
      url: `/api/media?key=${encodeURIComponent(object.key)}`,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "请选择图片文件。" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return Response.json({ error: "仅支持 JPG、PNG、WebP 或 GIF 图片。" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "单张图片不能超过 8MB。" }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "image";
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name.slice(0, 120), uploadedBy: user.email },
  });
  return Response.json({ file: { key, name: file.name, size: file.size, url: `/api/media?key=${encodeURIComponent(key)}` } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });
  const payload = (await request.json()) as { key?: string };
  if (!payload.key?.startsWith("uploads/")) return Response.json({ error: "无效的素材。" }, { status: 400 });
  await env.MEDIA.delete(payload.key);
  return Response.json({ deleted: true });
}
