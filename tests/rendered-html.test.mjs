import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("conference page includes the persistent registration flow", async () => {
  const [page, layout, hosting, content] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/layout.tsx"),
    read("../.openai/hosting.json"),
    read("../app/site-content.ts"),
  ]);
  assert.match(layout, /NEXUS 2026/);
  assert.match(content, /道教的海外傳播/);
  assert.match(page, /SIX LINES OF INQUIRY/);
  assert.match(page, /fetch\("\/api\/registrations"/);
  assert.match(page, /INTEREST RECORDED/);
  assert.match(page, /Registration records/);
  assert.match(hosting, /"d1": "DB"/);
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton|codex-preview/);
});

test("backend stores, protects, and exports registration records", async () => {
  const [schema, submitRoute, exportRoute, adminPage, dashboard, migration] = await Promise.all([
    read("../db/schema.ts"),
    read("../app/api/registrations/route.ts"),
    read("../app/api/admin/registrations/export/route.ts"),
    read("../app/admin/page.tsx"),
    read("../app/admin/AdminDashboard.tsx"),
    read("../drizzle/0000_sparkling_starjammers.sql"),
  ]);
  assert.match(schema, /registrations/);
  assert.match(schema, /registrationCode/);
  assert.match(submitRoute, /db\.insert\(registrations\)/);
  assert.match(exportRoute, /getChatGPTUser/);
  assert.match(exportRoute, /text\/csv/);
  assert.match(exportRoute, /\\uFEFF/);
  assert.match(adminPage, /requireChatGPTUser\("\/admin"\)/);
  assert.match(dashboard, /导出完整名单/);
  assert.match(dashboard, /票种筛选/);
  assert.match(migration, /CREATE TABLE `registrations`/);
});

test("content manager persists conference content and manages image assets", async () => {
  const [page, schema, migration, contentPage, manager, publicContent, adminContent, adminMedia, publicMedia, hosting] = await Promise.all([
    read("../app/page.tsx"),
    read("../db/schema.ts"),
    read("../drizzle/0001_nosy_leper_queen.sql"),
    read("../app/admin/content/page.tsx"),
    read("../app/admin/content/ContentManager.tsx"),
    read("../app/api/content/route.ts"),
    read("../app/api/admin/content/route.ts"),
    read("../app/api/admin/media/route.ts"),
    read("../app/api/media/route.ts"),
    read("../.openai/hosting.json"),
  ]);
  assert.match(page, /fetch\("\/api\/content"/);
  assert.match(schema, /siteContent/);
  assert.match(migration, /CREATE TABLE `site_content`/);
  assert.match(contentPage, /requireChatGPTUser\("\/admin\/content"\)/);
  assert.match(manager, /保存全部更改/);
  assert.match(manager, /素材库/);
  assert.match(publicContent, /parseSiteContent/);
  assert.match(adminContent, /getChatGPTUser/);
  assert.match(adminContent, /onConflictDoUpdate/);
  assert.match(adminMedia, /env\.MEDIA\.put/);
  assert.match(adminMedia, /getChatGPTUser/);
  assert.match(publicMedia, /env\.MEDIA\.get/);
  assert.match(hosting, /"r2": "MEDIA"/);
});
