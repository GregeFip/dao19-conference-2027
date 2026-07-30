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
  assert.match(layout, /DAO 19 · 2027/);
  assert.match(content, /The Overseas Dissemination of Daoism: Ideas, Practices, and Scriptures/);
  assert.match(content, /道教的海外傳播：觀念、行為與典籍/);
  assert.match(page, /OFFICIAL CONFERENCE THEME · 正式會議主題/);
  assert.doesNotMatch(page + content, /DAOISM|ACROSS WORLDS/);
  assert.match(page, /SIX LINES OF INQUIRY/);
  assert.match(page, /fetch\("\/api\/registrations"/);
  assert.match(page, /INTEREST RECORDED/);
  assert.match(page, /Registration records/);
  assert.match(hosting, /"d1": "DB"/);
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton|codex-preview/);
});

test("backend stores, protects, rate-limits, and exports registration records", async () => {
  const [schema, submitRoute, exportRoute, adminPage, dashboard, migration, auth, loginRoute, loginForm, workerConfig] = await Promise.all([
    read("../db/schema.ts"),
    read("../app/api/registrations/route.ts"),
    read("../app/api/admin/registrations/export/route.ts"),
    read("../app/admin/page.tsx"),
    read("../app/admin/AdminDashboard.tsx"),
    read("../drizzle/0000_sparkling_starjammers.sql"),
    read("../app/admin-auth.ts"),
    read("../app/api/admin/session/route.ts"),
    read("../app/admin/login/AdminLoginForm.tsx"),
    read("../wrangler.jsonc"),
  ]);
  assert.match(schema, /registrations/);
  assert.match(schema, /registrationCode/);
  assert.match(submitRoute, /db\.insert\(registrations\)/);
  assert.match(submitRoute, /REGISTRATION_RATE_LIMITER/);
  assert.match(exportRoute, /getAdminUser/);
  assert.match(exportRoute, /text\/csv/);
  assert.match(exportRoute, /\\uFEFF/);
  assert.match(adminPage, /requireAdminUser\("\/admin"\)/);
  assert.match(dashboard, /导出完整名单/);
  assert.match(dashboard, /参会身份/);
  assert.match(migration, /CREATE TABLE `registrations`/);
  assert.doesNotMatch(auth, /deriveBits|PBKDF2/);
  assert.match(loginForm, /PBKDF2/);
  assert.match(loginForm, /iterations: 210_000/);
  assert.match(loginForm, /passwordProof/);
  assert.match(auth, /verifyAdminPasswordProof/);
  assert.match(auth, /HMAC/);
  assert.match(auth, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(loginRoute, /LOGIN_RATE_LIMITER/);
  assert.match(workerConfig, /REGISTRATION_RATE_LIMITER/);
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
  assert.match(contentPage, /requireAdminUser\("\/admin\/content"\)/);
  assert.match(manager, /保存全部更改/);
  assert.match(manager, /素材库/);
  assert.match(publicContent, /parseSiteContent/);
  assert.match(adminContent, /getAdminUser/);
  assert.match(adminContent, /onConflictDoUpdate/);
  assert.match(adminMedia, /env\.MEDIA\.put/);
  assert.match(adminMedia, /getAdminUser/);
  assert.match(publicMedia, /env\.MEDIA\.getWithMetadata/);
  assert.match(hosting, /"r2": "MEDIA"/);
});

test("GitHub workflow validates, migrates, and deploys the public Worker", async () => {
  const [workflow, readme] = await Promise.all([
    read("../.github/workflows/deploy-cloudflare.yml"),
    read("../README.md"),
  ]);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /d1 migrations apply DB --remote/);
  assert.match(workflow, /cloudflare\/wrangler-action@v3/);
  assert.match(workflow, /command: deploy/);
  assert.match(readme, /普通访客无需 ChatGPT/);
});
