import { uploadToIPFS, fetchFromIPFS } from "./ipfs.client";

export async function storeCertificatePdf(pdfBuffer: Buffer): Promise<string> {
  return uploadToIPFS(new Blob([pdfBuffer as BlobPart]));
}

export async function retrieveCertificatePdf(cid: string): Promise<Blob | null> {
  return fetchFromIPFS(cid);
}
