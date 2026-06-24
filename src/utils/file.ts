export async function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function generateFileName(prefix: string, extension: string): string {
  return `${prefix}-${Date.now()}.${extension}`;
}
