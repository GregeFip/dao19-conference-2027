import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const output = new URL("../out/", import.meta.url);
const html = await read("../out/index.html");
const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

test("the exported page contains the new dates, venue, deadlines, and fees", () => {
  assert.match(text, /Daoism Overseas: Ideas, Practices, and Scriptures/);
  for (const value of ["MAY 25", "MAY 26", "MAY 27", "MAY 28", "MAY 29", "Mount Wufeng", "2027.03.01", "2027.04.01", "US \$ 80", "US \$ 150", "US \$ 100"]) {
    assert.ok(text.includes(value), `Missing conference fact: ${value}`);
  }
  assert.doesNotMatch(text, /JULY|JUL 1[4-8]|Central Campus|校內學人大廈|Campus dining|75 KM|Register interest|PROTOTYPE|測試版/);
  assert.match(html, /2027年5月25日至29日/);
});

test("registration explains the email route and preserves the auxiliary form", () => {
  assert.match(html, /href="mailto:hkhongdao100@163\.com\?subject=/);
  assert.match(html, /href="https:\/\/forms\.cloud\.microsoft\/pages\/responsepage\.aspx/);
  assert.match(text, /Please email the information above to complete registration/);
  assert.match(text, /ID or passport number/);
  assert.match(text, /roommate/);
  assert.match(text, /160/);
  assert.doesNotMatch(html, /fetch\("\/api\/registrations"/);
});

test("every section target and local image or download exists under the Pages base path", async () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), `Missing section ${id}`);
  const paths = new Set([...html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)].map((match) => match[1]));
  assert.ok(paths.size > 5);
  for (const path of paths) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    assert.ok(!base || path.startsWith(`${base}/`), `Asset outside base path: ${path}`);
    const relative = decodeURIComponent(path.slice(base.length)).replace(/^\//, "");
    const result = await stat(join(fileURLToPath(output), relative));
    assert.ok(result.isFile() || result.isDirectory(), `Missing asset ${path}`);
  }
});

test("the existing static Pages deployment configuration is retained", async () => {
  const [config, workflow] = await Promise.all([read("../next.config.ts"), read("../.github/workflows/deploy-pages.yml")]);
  assert.match(config, /output: "export"/);
  assert.match(config, /basePath/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH/);
});
