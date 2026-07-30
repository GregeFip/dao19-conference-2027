import { sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { siteContent } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import type { SiteContent } from "../../../site-content";

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录管理后台。" }, { status: 401 });

  try {
    const payload = (await request.json()) as { content?: SiteContent };
    if (payload.content?.version !== 2027 || !payload.content.basics || !Array.isArray(payload.content.topics) || !Array.isArray(payload.content.schedule)) {
      return Response.json({ error: "内容结构不完整，请刷新后重试。" }, { status: 400 });
    }
    const value = JSON.stringify(payload.content);
    if (value.length > 500_000) return Response.json({ error: "内容数据过大，请减少文字长度。" }, { status: 400 });

    await getDb().insert(siteContent).values({ key: "main", value, updatedBy: user.email }).onConflictDoUpdate({
      target: siteContent.key,
      set: { value, updatedBy: user.email, updatedAt: sql`CURRENT_TIMESTAMP` },
    });
    return Response.json({ saved: true });
  } catch {
    return Response.json({ error: "暂时无法保存内容，请稍后重试。" }, { status: 500 });
  }
}
