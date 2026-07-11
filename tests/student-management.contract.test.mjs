import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const apiSource = await readFile(
  new URL("../src/features/students/services/student.api.ts", import.meta.url),
  "utf8",
);

test("student API uses the organization-scoped CRUD endpoints", () => {
  assert.match(apiSource, /request<StudentDto\[]>\(['"]\/students['"]/);
  assert.match(apiSource, /request<StudentDto>\(`\/students\/\$\{id\}`\)/);
  assert.match(apiSource, /request<[^>]+>\(['"]\/students['"],\s*\{\s*method:\s*['"]POST['"]/s);
  assert.match(apiSource, /method:\s*['"]PUT['"]/);
  assert.match(apiSource, /method:\s*['"]DELETE['"]/);
  assert.doesNotMatch(apiSource, /\/issuer\/students/);
});

test("student management pages no longer use the students localStorage cache", async () => {
  const files = [
    "../src/app/admin/students/page.tsx",
    "../src/app/admin/students/create/page.tsx",
    "../src/app/admin/certificates/issue/page.tsx",
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /localStorage\.getItem\(['"]students['"]\)/);
    assert.doesNotMatch(source, /localStorage\.setItem\(['"]students['"]/);
  }
});
