import * as XLSX from "xlsx";
import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";

export type CertificateImportField = {
  key: keyof CreateCertificatePayload;
  label: string;
  aliases?: string[];
  sample: string;
  width: number;
  guide: string;
};

export const certificateImportFields: CertificateImportField[] = [
  { key: "student_id", label: "ID sinh viên", aliases: ["studentId", "Mã sinh viên"], sample: "SV001", width: 16, guide: "Mã sinh viên đã tồn tại trong hệ thống." },
  { key: "student_fullName", label: "Tên sinh viên", aliases: ["Họ tên", "Họ tên sinh viên", "fullName", "name"], sample: "Nguyễn Văn A", width: 24, guide: "Họ và tên đầy đủ của sinh viên." },
  { key: "certificate_title", label: "Tên văn bằng", aliases: ["title"], sample: "Cử nhân CNTT", width: 28, guide: "Tên văn bằng/chứng chỉ cần cấp." },
  { key: "dob", label: "Ngày sinh", sample: "2002-05-15", width: 14, guide: "Định dạng YYYY-MM-DD, ví dụ 2002-05-15." },
  { key: "placeOfBirth", label: "Nơi sinh", sample: "Hà Nội", width: 18, guide: "Tỉnh/thành phố hoặc địa danh theo hồ sơ." },
  { key: "gender", label: "Giới tính", sample: "Nam", width: 12, guide: "Ví dụ: Nam, Nữ." },
  { key: "ethnicity", label: "Dân tộc", sample: "Kinh", width: 12, guide: "Dân tộc theo hồ sơ sinh viên." },
  { key: "schoolName", label: "Tên trường", sample: "ĐH Bách Khoa Hà Nội", width: 30, guide: "Tên trường/đơn vị đào tạo." },
  { key: "examCohort", label: "Khóa/Năm TN", sample: "2025", width: 14, guide: "Khóa, niên khóa hoặc năm tốt nghiệp." },
  { key: "examBoard", label: "Hội đồng thi", sample: "Hội đồng 1", width: 18, guide: "Tên hội đồng xét/thi/cấp bằng." },
  { key: "issueLocation", label: "Nơi cấp", sample: "Hà Nội", width: 16, guide: "Địa điểm cấp văn bằng." },
  { key: "issueDate", label: "Ngày cấp", sample: "2025-06-15", width: 14, guide: "Định dạng YYYY-MM-DD, ví dụ 2025-06-15." },
  { key: "serialNumber", label: "Số hiệu", sample: "BK-2025-001", width: 18, guide: "Số hiệu in trên văn bằng." },
  { key: "registryNumber", label: "Số vào sổ", sample: "001", width: 14, guide: "Số vào sổ cấp phát." },
  { key: "ipfs_cid", label: "IPFS CID (file văn bằng)", aliases: ["ipfsCid", "CID", "Mã IPFS"], sample: "bafkreihdwdcefgh...", width: 30, guide: "Mã CID từ IPFS của file văn bằng. Để trống nếu chưa có file." },
];

const templateRows = [
  certificateImportFields.map((field) => field.label),
  certificateImportFields.map((field) => field.sample),
];

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function createCertificateTemplateCsv() {
  return `${templateRows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}\r\n`;
}

export function createCertificateTemplateWorkbook() {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Template import cấp văn bằng",
    Subject: "Certificate import template",
    Author: "CertiChain",
    Company: "CertiChain",
  };

  const templateSheet = XLSX.utils.aoa_to_sheet(templateRows);
  templateSheet["!cols"] = certificateImportFields.map((field) => ({ wch: field.width }));
  templateSheet["!rows"] = [{ hpt: 28 }, { hpt: 24 }];
  templateSheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(certificateImportFields.length - 1)}1` };
  templateSheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  certificateImportFields.forEach((field, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
    const cell = templateSheet[cellAddress];
    if (!cell) return;
    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "0F766E" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
    };
    cell.c = [{ a: "CertiChain", t: field.guide }];
  });

  XLSX.utils.book_append_sheet(workbook, templateSheet, "Template");

  const guideRows = [
    ["Hướng dẫn nhập template cấp văn bằng"],
    ["Nhập dữ liệu ở sheet Template. Không đổi tên cột ở dòng 1 nếu muốn hệ thống tự mapping chính xác."],
    [],
    ["Cột", "Bắt buộc", "Định dạng/Gợi ý", "Ví dụ"],
    ...certificateImportFields.map((field) => [field.label, "Có", field.guide, field.sample]),
  ];
  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
  guideSheet["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 58 }, { wch: 26 }];
  guideSheet["!rows"] = [{ hpt: 30 }, { hpt: 36 }, { hpt: 8 }, { hpt: 24 }];
  guideSheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
  ];
  ["A1", "A4", "B4", "C4", "D4"].forEach((cellAddress) => {
    if (!guideSheet[cellAddress]) return;
    guideSheet[cellAddress].s = {
      font: { bold: true, color: { rgb: cellAddress === "A1" ? "0F172A" : "FFFFFF" } },
      fill: cellAddress === "A1" ? undefined : { fgColor: { rgb: "0F766E" } },
      alignment: { vertical: "center", wrapText: true },
    };
  });
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Huong dan");

  return workbook;
}

export function createCertificateTemplateHtmlExcel(): string {
  const fields = certificateImportFields;
  const colCount = fields.length + 1;

  const sampleRows = [
    ["1", "SV2025001", "Nguyễn Văn An", "Cử nhân Công nghệ thông tin", "2002-05-15", "Hà Nội", "Nam", "Kinh", "Đại học Bách Khoa Hà Nội", "2025", "Hội đồng 1", "Hà Nội", "2025-06-15", "BK-2025-001", "001", ""],
    ["2", "SV2025002", "Trần Thị Bình", "Kỹ sư Khoa học máy tính", "2002-08-20", "Đà Nẵng", "Nữ", "Kinh", "Đại học Bách Khoa Hà Nội", "2025", "Hội đồng 1", "Hà Nội", "2025-06-15", "BK-2025-002", "002", ""],
    ["3", "SV2025003", "Lê Hoàng Cường", "Cử nhân Quản trị kinh doanh", "2001-11-10", "TP. Hồ Chí Minh", "Nam", "Kinh", "Đại học Bách Khoa Hà Nội", "2025", "Hội đồng 2", "Hà Nội", "2025-06-15", "BK-2025-003", "003", ""],
  ];

  const emptyRows = Array.from({ length: 15 }, (_, i) => [String(i + 4), ...Array(fields.length).fill("")]);
  const halfCols = Math.floor(colCount / 2);

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Template Import Văn Bằng</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 0; padding: 12px; }
  
  table.data-table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
  
  td.title-main { font-size: 16pt; font-weight: bold; color: #1e293b; text-align: center; padding: 14px 0 4px 0; border: none; }
  td.title-sub { font-size: 10pt; color: #64748b; text-align: center; padding-bottom: 12px; font-style: italic; border: none; }
  
  td.stats-cell { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 14px; font-weight: 600; color: #334155; font-size: 10pt; }
  .val { font-weight: bold; color: #0f766e; }
  
  th.hdr { background-color: #383759; color: #ffffff; font-weight: bold; font-size: 11pt; text-align: center; vertical-align: middle; border: 1px solid #25243d; padding: 10px 8px; height: 36px; }
  th.stt-hdr { background-color: #2b2a45; width: 45px; }
  
  td.cell { border: 1px solid #cbd5e1; font-size: 10pt; padding: 7px 10px; vertical-align: middle; height: 26px; }
  td.stt { text-align: center; font-weight: bold; color: #475569; background-color: #f1f5f9; width: 45px; }
  td.center { text-align: center; }
  td.left { text-align: left; }
  
  tr.sample-even td.cell { background-color: #ffffff; }
  tr.sample-odd td.cell { background-color: #f8fafc; }
  tr.empty-row td.cell { background-color: #ffffff; color: #cbd5e1; }
</style>
</head>
<body>
  <table class="data-table">
    <thead>
      <tr>
        <td colspan="${colCount}" class="title-main">BẢNG DANH SÁCH CẤP PHÁT VĂN BẰNG & CHỨNG CHỈ</td>
      </tr>
      <tr>
        <td colspan="${halfCols}" class="stats-cell">Tổng số bản ghi sinh viên: <span class="val">${sampleRows.length}</span></td>
        <td colspan="${colCount - halfCols}" class="stats-cell" style="text-align: right;">Ngày xuất mẫu: <span class="val">${new Date().toLocaleDateString("vi-VN")}</span></td>
      </tr>
      <tr>
        <th class="hdr stt-hdr">STT</th>
        ${fields.map((f) => `<th class="hdr" style="min-width: ${f.width * 9}px;">${f.label}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${sampleRows
        .map(
          (row, rIdx) => `
      <tr class="${rIdx % 2 === 0 ? "sample-even" : "sample-odd"}">
        <td class="cell stt">${row[0]}</td>
        ${row
          .slice(1)
          .map(
            (val, cIdx) => `
        <td class="cell ${[3, 4, 5, 6, 8, 11, 12, 13].includes(cIdx) ? "center" : "left"}">${val}</td>`
          )
          .join("")}
      </tr>`
        )
        .join("")}
      ${emptyRows
        .map(
          (row) => `
      <tr class="empty-row">
        <td class="cell stt">${row[0]}</td>
        ${row.slice(1).map(() => `<td class="cell">&nbsp;</td>`).join("")}
      </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
}

