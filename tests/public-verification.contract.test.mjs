import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("verifier API calls both public backend endpoints", async () => {
  const source = await readFile(
    new URL("../src/features/verification/services/verifier.api.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /\/verifier\/verify\?/);
  assert.match(source, /serialNumber/);
  assert.match(source, /registryNumber/);
  assert.match(source, /`\/verifier\/certificate\/\$\{id\}`/);
});

test("public verification screens contain no hard-coded credential fixtures", async () => {
  for (const file of [
    "../src/app/public/verify/page.tsx",
    "../src/app/public/certificate/[id]/page.tsx",
  ]) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /Nguyễn Văn Hùng/);
    assert.doesNotMatch(source, /VD-2026-000001/);
    assert.doesNotMatch(source, /new Promise\(\(r\) => setTimeout/);
  }
});

test("manual verification requires serial and registry numbers", async () => {
  const source = await readFile(
    new URL("../src/app/public/verify/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /serialNumber/);
  assert.match(source, /registryNumber/);
  assert.match(source, /verifierApi\.verify/);
});
