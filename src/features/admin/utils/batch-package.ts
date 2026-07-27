import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";

export interface BatchDocument {
  name: string;
  path: string;
  file: File;
}

export interface DocumentMatch {
  status: "MATCHED" | "MISSING_FILE" | "DUPLICATE_FILE";
  document?: BatchDocument;
  requested?: string;
  candidates?: string[];
}

const MAX_UNCOMPRESSED_BYTES = 250 * 1024 * 1024; // 250MB limit

export function normalizePackagePath(pathStr: string): string {
  return pathStr.replaceAll("\\", "/").replace(/^\/+/, "").trim();
}

export function isSupportedPackageEntry(pathStr: string): boolean {
  const ext = pathStr.substring(pathStr.lastIndexOf(".") + 1).toLowerCase();
  return ["pdf", "png", "jpg", "jpeg", "webp", "xlsx", "xls", "csv"].includes(ext);
}

// Simple Deflate Uncompress via DecompressionStream API (native modern browsers)
async function inflateRaw(bytes: Uint8Array): Promise<ArrayBuffer | null> {
  try {
    if (typeof DecompressionStream === "undefined") return null;
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    const copy = new Uint8Array(bytes.buffer as ArrayBuffer, bytes.byteOffset, bytes.byteLength);
    void writer.write(copy);
    void writer.close();
    const response = new Response(ds.readable);
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

// Parse ZIP Buffer directly in browser
export async function parseZipPackageEntries(zipBuffer: ArrayBuffer): Promise<Map<string, File>> {
  const bytes = new Uint8Array(zipBuffer);
  const view = new DataView(zipBuffer);
  let eocdOffset = -1;

  for (let i = bytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("File không đúng định dạng ZIP hoặc bị hỏng");
  }

  const cdCount = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);
  let cursor = cdOffset;
  let totalUncompressed = 0;
  const entries = new Map<string, File>();

  for (let i = 0; i < cdCount; i++) {
    if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50) {
      throw new Error("Gói ZIP có cấu trúc Central Directory không hợp lệ");
    }

    const flags = view.getUint16(cursor + 8, true);
    const compressionMethod = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const fileNameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);
    const rawName = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + fileNameLength));
    const normalizedName = normalizePackagePath(rawName);
    const nextCursor = cursor + 46 + fileNameLength + extraLength + commentLength;

    if (nextCursor > bytes.length || (flags & 0x1) !== 0) {
      throw new Error("Gói ZIP chứa file bị mã hóa mật khẩu");
    }

    cursor = nextCursor;
    if (!normalizedName || rawName.endsWith("/") || !isSupportedPackageEntry(normalizedName)) continue;

    if (entries.has(normalizedName.toLowerCase())) {
      throw new Error(`Gói ZIP chứa file trùng tên: ${normalizedName}`);
    }

    totalUncompressed += uncompressedSize;
    if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
      throw new Error("Tổng dung lượng sau giải nén vượt quá 250 MB");
    }

    if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
      throw new Error("Gói ZIP có Local Header không hợp lệ");
    }

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;

    if (dataStart < 0 || dataEnd > bytes.length) throw new Error("Gói ZIP có dữ liệu vượt phạm vi");

    const compressed = bytes.slice(dataStart, dataEnd);
    const content = compressionMethod === 0
      ? compressed
      : compressionMethod === 8
        ? await inflateRaw(compressed)
        : null;

    if (!content || content.byteLength !== uncompressedSize) {
      throw new Error(`Không thể giải nén file ${normalizedName}`);
    }

    const extension = normalizedName.substring(normalizedName.lastIndexOf(".") + 1).toLowerCase();
    const mimeType = extension === "pdf"
      ? "application/pdf"
      : extension === "csv"
        ? "text/csv"
        : extension === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : extension === "xls"
            ? "application/vnd.ms-excel"
            : `image/${extension === "jpg" ? "jpeg" : extension}`;

    const fileName = normalizedName.split("/").at(-1) || normalizedName;
    const bufferData = content instanceof Uint8Array
      ? content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength)
      : content;
    entries.set(normalizedName.toLowerCase(), new File([bufferData as ArrayBuffer], fileName, { type: mimeType }));
  }

  return entries;
}

/**
 * Smart Auto-Match Document:
 * 1. Match theo tên file cụ thể trong cột document_file (nếu cán bộ gõ).
 * 2. Nếu rỗng, tự động match theo student_id (VD: student_id="SV001" -> match "SV001.pdf", "SV001.jpg", "SV001.png")
 */
export function matchPackageDocument(
  record: CreateCertificatePayload,
  documents: BatchDocument[]
): DocumentMatch {
  const requestedPath = record.document_file?.trim();
  const studentId = record.student_id?.trim();

  // Mode 1: Cán bộ khai báo cột document_file cụ thể
  if (requestedPath) {
    const normalizedRequested = normalizePackagePath(requestedPath);
    const exact = documents.filter((doc) => doc.path.toLowerCase() === normalizedRequested.toLowerCase());
    if (exact.length === 1) return { status: "MATCHED", document: exact[0] };
    if (exact.length > 1) {
      return { status: "DUPLICATE_FILE", requested: requestedPath, candidates: exact.map((d) => d.path) };
    }

    const requestedName = normalizedRequested.split("/").at(-1)?.toLowerCase();
    const byName = documents.filter((doc) => doc.name.toLowerCase() === requestedName);
    if (byName.length === 1) return { status: "MATCHED", document: byName[0] };
    if (byName.length > 1) {
      return { status: "DUPLICATE_FILE", requested: requestedPath, candidates: byName.map((d) => d.path) };
    }
  }

  // Mode 2: Smart Auto-Match theo student_id
  if (studentId) {
    const cleanStudentId = studentId.toLowerCase();
    const matchedByStudentId = documents.filter((doc) => {
      const fileNameWithoutExt = doc.name.substring(0, doc.name.lastIndexOf(".")).toLowerCase();
      return fileNameWithoutExt === cleanStudentId;
    });

    if (matchedByStudentId.length === 1) return { status: "MATCHED", document: matchedByStudentId[0] };
    if (matchedByStudentId.length > 1) {
      return { status: "DUPLICATE_FILE", requested: `[Tự động theo Mã SV: ${studentId}]`, candidates: matchedByStudentId.map((d) => d.path) };
    }
  }

  return { status: "MISSING_FILE", requested: requestedPath || `[Mã SV: ${studentId}]` };
}
