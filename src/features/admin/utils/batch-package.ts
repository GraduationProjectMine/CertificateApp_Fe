export const BATCH_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;
const BATCH_DATA_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;

export type BatchDocument = {
  path: string;
  name: string;
  file: File;
};

export type DocumentMatch =
  | { status: "MATCHED"; document: BatchDocument }
  | { status: "MISSING_FILE"; requested: string }
  | { status: "DUPLICATE_FILE"; requested: string; candidates: string[] };

const MAX_PACKAGE_BYTES = 100 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 250 * 1024 * 1024;
const MAX_ENTRIES = 600;

export function normalizePackagePath(value: string): string | null {
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) {
    return null;
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "..")) {
    return null;
  }

  return segments.join("/");
}

export function isSupportedDocumentPath(path: string): boolean {
  const lower = path.toLowerCase();
  return BATCH_DOCUMENT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function isSupportedPackageEntry(path: string): boolean {
  return isSupportedDocumentPath(path) || BATCH_DATA_EXTENSIONS.some((extension) => path.toLowerCase().endsWith(extension));
}

function findEndOfCentralDirectory(bytes: Uint8Array): number {
  const minimumOffset = Math.max(0, bytes.length - 0xffff - 22);
  for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x05 &&
      bytes[offset + 3] === 0x06
    ) {
      return offset;
    }
  }
  throw new Error("Gói ZIP không hợp lệ hoặc thiếu thư mục trung tâm");
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("Trình duyệt không hỗ trợ giải nén ZIP an toàn");
  }
  const stream = new Blob([data.slice().buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function extractZipEntries(packageFile: File): Promise<Map<string, File>> {
  if (packageFile.size > MAX_PACKAGE_BYTES) {
    throw new Error("Gói ZIP vượt quá giới hạn 100 MB");
  }

  const bytes = new Uint8Array(await packageFile.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(bytes);
  const entryCount = view.getUint16(eocd + 10, true);
  const centralDirectorySize = view.getUint32(eocd + 12, true);
  const centralDirectoryOffset = view.getUint32(eocd + 16, true);
  if (entryCount > MAX_ENTRIES || centralDirectoryOffset + centralDirectorySize > bytes.length) {
    throw new Error("Gói ZIP có cấu trúc hoặc số lượng file không hợp lệ");
  }

  const entries = new Map<string, File>();
  let cursor = centralDirectoryOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) {
      throw new Error("Gói ZIP có entry không hợp lệ");
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
      throw new Error("Gói ZIP chứa file mã hóa hoặc bị hỏng");
    }
    cursor = nextCursor;
    if (!normalizedName || rawName.endsWith("/") || !isSupportedPackageEntry(normalizedName)) continue;
    if (entries.has(normalizedName.toLowerCase())) {
      throw new Error(`Gói ZIP chứa file trùng tên: ${normalizedName}`);
    }
    totalUncompressed += uncompressedSize;
    if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
      throw new Error("Tổng dung lượng sau giải nén vượt quá giới hạn 250 MB");
    }

    if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
      throw new Error("Gói ZIP có local entry không hợp lệ");
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
    entries.set(normalizedName.toLowerCase(), new File([content.slice().buffer as ArrayBuffer], fileName, { type: mimeType }));
  }
  return entries;
}

export function matchPackageDocument(
  requestedPath: string,
  documents: BatchDocument[],
): DocumentMatch {
  const normalizedRequested = normalizePackagePath(requestedPath);
  if (!normalizedRequested) {
    return { status: "MISSING_FILE", requested: requestedPath };
  }

  const exact = documents.filter(
    (document) => document.path.toLowerCase() === normalizedRequested.toLowerCase(),
  );
  if (exact.length === 1) return { status: "MATCHED", document: exact[0] };
  if (exact.length > 1) {
    return {
      status: "DUPLICATE_FILE",
      requested: requestedPath,
      candidates: exact.map((document) => document.path),
    };
  }

  const requestedName = normalizedRequested.split("/").at(-1)?.toLowerCase();
  const byName = documents.filter(
    (document) => document.name.toLowerCase() === requestedName,
  );
  if (byName.length === 1) return { status: "MATCHED", document: byName[0] };
  if (byName.length > 1) {
    return {
      status: "DUPLICATE_FILE",
      requested: requestedPath,
      candidates: byName.map((document) => document.path),
    };
  }

  return { status: "MISSING_FILE", requested: requestedPath };
}
