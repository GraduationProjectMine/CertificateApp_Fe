import assert from "node:assert/strict";
import test from "node:test";

function normalizePackagePath(value) {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) return null;
  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "..")) return null;
  return segments.join("/");
}

function matchPackageDocument(requestedPath, documents) {
  const normalizedRequested = normalizePackagePath(requestedPath);
  if (!normalizedRequested) return { status: "MISSING_FILE", requested: requestedPath };
  const exact = documents.filter((document) => document.path.toLowerCase() === normalizedRequested.toLowerCase());
  if (exact.length === 1) return { status: "MATCHED", document: exact[0] };
  if (exact.length > 1) return { status: "DUPLICATE_FILE", requested: requestedPath, candidates: exact.map((item) => item.path) };
  const requestedName = normalizedRequested.split("/").at(-1)?.toLowerCase();
  const byName = documents.filter((document) => document.name.toLowerCase() === requestedName);
  if (byName.length === 1) return { status: "MATCHED", document: byName[0] };
  if (byName.length > 1) return { status: "DUPLICATE_FILE", requested: requestedPath, candidates: byName.map((item) => item.path) };
  return { status: "MISSING_FILE", requested: requestedPath };
}

test("rejects zip-slip and absolute paths", () => {
  assert.equal(normalizePackagePath("../secret.pdf"), null);
  assert.equal(normalizePackagePath("C:/secret.pdf"), null);
  assert.equal(normalizePackagePath("/secret.pdf"), null);
  assert.equal(normalizePackagePath("documents/SV001.pdf"), "documents/SV001.pdf");
});

test("matches an explicit relative path before basename fallback", () => {
  const documents = [
    { path: "documents/SV001.pdf", name: "SV001.pdf" },
    { path: "archive/SV001.pdf", name: "SV001.pdf" },
  ];
  assert.equal(matchPackageDocument("documents/SV001.pdf", documents).status, "MATCHED");
  assert.equal(matchPackageDocument("SV001.pdf", documents).status, "DUPLICATE_FILE");
});

test("reports missing documents instead of silently issuing", () => {
  const result = matchPackageDocument("SV099.pdf", [{ path: "documents/SV001.pdf", name: "SV001.pdf" }]);
  assert.equal(result.status, "MISSING_FILE");
});
