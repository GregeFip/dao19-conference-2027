import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("static conference site sends every registration entry to Microsoft Forms", async () => {
  const page = await read("../app/page.tsx");
  assert.match(page, /MICROSOFT_FORM_URL/);
  assert.match(page, /forms\.cloud\.microsoft\/pages\/responsepage\.aspx/);
  assert.equal((page.match(/href=\{MICROSOFT_FORM_URL\}/g) ?? []).length, 4);
  assert.doesNotMatch(page, /fetch\("\/api\/registrations"/);
  assert.doesNotMatch(page, /openRegistration|dao-modal-backdrop/);
});

test("GitHub Pages output is configured as a static export", async () => {
  const [config, workflow, content] = await Promise.all([
    read("../next.config.ts"),
    read("../.github/workflows/deploy-pages.yml"),
    read("../app/site-content.ts"),
  ]);
  assert.match(config, /output: "export"/);
  assert.match(config, /basePath/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(content, /The Overseas Dissemination of Daoism: Ideas, Practices, and Scriptures/);
});
