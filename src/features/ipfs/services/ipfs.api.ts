import { request } from "@/lib/api";

export interface IpfsUploadResponse {
  cid: string;
  ipfsUrl: string;
  sha3Hash: string;
  fileName: string;
}

export const ipfsApi = {
  uploadFile: (file: File): Promise<IpfsUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<IpfsUploadResponse>("/ipfs/upload-file", {
      method: "POST",
      body: formData,
    });
  },
};
