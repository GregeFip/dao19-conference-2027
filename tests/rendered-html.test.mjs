import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the conference landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>NEXUS 2026｜国际智能科学前沿大会<\/title>/i);
  assert.match(html, /智能涌现/);
  assert.match(html, /科学共生/);
  assert.match(html, /特邀主旨嘉宾/);
  assert.match(html, /大会日程/);
  assert.match(html, /立即注册参会/);
  assert.match(html, /报名数据不会保存/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);
});

test("conference page keeps the core sections and demo disclosure", async () => {
  const [page, layout, css] = await Promise.all([
    import("node:fs/promises").then(({ readFile }) => readFile(new URL("../app/page.tsx", import.meta.url), "utf8")),
    import("node:fs/promises").then(({ readFile }) => readFile(new URL("../app/layout.tsx", import.meta.url), "utf8")),
    import("node:fs/promises").then(({ readFile }) => readFile(new URL("../app/globals.css", import.meta.url), "utf8")),
  ]);
  assert.match(page, /use client/);
  assert.match(page, /setModalOpen/);
  assert.match(page, /报名流程体验完成/);
  assert.match(layout, /NEXUS 2026/);
  assert.match(css, /@media \(max-width:680px\)/);
  assert.match(css, /\.registration-modal/);
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton|codex-preview/);
});
