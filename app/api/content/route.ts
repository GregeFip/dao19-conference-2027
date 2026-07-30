import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { siteContent } from "../../../db/schema";
import { DEFAULT_SITE_CONTENT, parseSiteContent } from "../../site-content";

export async function GET() {
  try {
    const rows = await getDb().select().from(siteContent).where(eq(siteContent.key, "main")).limit(1);
    return Response.json({ content: parseSiteContent(rows[0]?.value) }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ content: DEFAULT_SITE_CONTENT }, { headers: { "cache-control": "no-store" } });
  }
}
