import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = path.resolve("src/features/admin/utils/certificate-import-template.ts");

function loadTemplateModule() {
  const source = fs.readFileSync(sourcePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, { exports: module.exports, module, require }, { filename: sourcePath });
  return module.exports;
}

const {
  certificateImportFields,
  createCertificateTemplateCsv,
  createCertificateTemplateWorkbook,
} = loadTemplateModule();

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

test("CSV template has aligned headers and sample values", () => {
  const [headerLine, sampleLine] = createCertificateTemplateCsv().trimEnd().split("\r\n");
  const headers = parseCsvLine(headerLine);
  const sample = parseCsvLine(sampleLine);

  assert.equal(headers.length, certificateImportFields.length);
  assert.equal(sample.length, certificateImportFields.length);
  assert.equal(headers[0], "ID sinh viên");
  assert.equal(headers[1], "Tên sinh viên");
  assert.equal(headers[2], "Tên văn bằng");
  assert.equal(sample[1], "Nguyễn Văn A");
});

test("Excel template exposes readable columns and a guide sheet", () => {
  const workbook = createCertificateTemplateWorkbook();
  const templateSheet = workbook.Sheets.Template;
  const guideSheet = workbook.Sheets["Huong dan"];

  assert.deepEqual(workbook.SheetNames, ["Template", "Huong dan"]);
  assert.equal(templateSheet.A1.v, "ID sinh viên");
  assert.equal(templateSheet.B1.v, "Tên sinh viên");
  assert.equal(templateSheet.C1.v, "Tên văn bằng");
  assert.equal(templateSheet.B2.v, "Nguyễn Văn A");
  assert.equal(templateSheet["!cols"].length, certificateImportFields.length);
  assert.ok(templateSheet["!cols"].every((column) => column.wch >= 12));
  assert.equal(templateSheet["!autofilter"].ref, "A1:N1");
  assert.equal(guideSheet.A1.v, "Hướng dẫn nhập template cấp văn bằng");
});
