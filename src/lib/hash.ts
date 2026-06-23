import { createHash } from "crypto";

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function calculateFileHash(buffer: Buffer): string {
  return sha256(buffer);
}
