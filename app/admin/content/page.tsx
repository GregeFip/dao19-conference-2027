import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { siteContent } from "../../../db/schema";
import { chatGPTSignOutPath, requireChatGPTUser } from "../../chatgpt-auth";
import { parseSiteContent } from "../../site-content";
import ContentManager from "./ContentManager";
import "../admin.css";
import "./content.css";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const user = await requireChatGPTUser("/admin/content");
  const rows = await getDb().select().from(siteContent).where(eq(siteContent.key, "main")).limit(1);
  return <ContentManager initialContent={parseSiteContent(rows[0]?.value)} userName={user.displayName} signOutHref={chatGPTSignOutPath("/")} />;
}
