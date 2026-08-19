import { request } from "@/lib/api";

export interface BlockchainVerification {
  exists: boolean;
  isRevoked: boolean;
  issuer: string;
  timestamp: string | number;
  signature: string;
  cid: string;
  sha3Hash: string;
}

export interface CertificateDetails {
  certificateId: string;
  certificateTitle: string;
  studentFullName: string;
  dob: string | null;
  placeOfBirth: string | null;
  gender: string | null;
  ethnicity: string | null;
  schoolName: string | null;
  examCohort: string | null;
  examBoard: string | null;
  issueLocation: string | null;
  issueDate: string | null;
  serialNumber: string | null;
  registryNumber: string | null;
  fileUrl?: string | null;
  organizationName: string;
  organizationId: string;
  organizationLogo?: string | null;
  organizationWallet?: string | null;
  txHash: string | null;
  issuedAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  revokeTransactionHash: string | null;
}

export interface VerifyCertificateResponse {
  isValid: boolean;
  isOnlineCertificate?: boolean;
  status: string;
  blockchain: BlockchainVerification | null;
  ipfsData: Record<string, unknown> | null;
  ipfsFetchSuccess: boolean;
  certificateDetails: CertificateDetails;
}

export const verifierApi = {
  verify: (serialNumber: string, registryNumber: string) => {
    const query = new URLSearchParams({ serialNumber, registryNumber });
    return request<VerifyCertificateResponse>(`/verifier/verify?${query.toString()}`);
  },

  verifyOnline: (serialNumber: string, registryNumber: string) => {
    const query = new URLSearchParams({ serialNumber, registryNumber });
    return request<VerifyCertificateResponse>(`/verifier/verify-online?${query.toString()}`);
  },

  getCertificate: (id: string) =>
    request<VerifyCertificateResponse>(`/verifier/certificate/${id}`),

  getOnlineCertificate: (id: string) =>
    request<VerifyCertificateResponse>(`/verifier/online-certificate/${id}`),

  // Fallback helper: Check normal certificate first; if not found, verify online certificate!
  verifyAny: async (serialNumber: string, registryNumber: string) => {
    try {
      return await verifierApi.verify(serialNumber, registryNumber);
    } catch {
      return await verifierApi.verifyOnline(serialNumber, registryNumber);
    }
  },

  // Fallback helper for certificate detail page by ID
  getAnyCertificate: async (id: string) => {
    try {
      return await verifierApi.getCertificate(id);
    } catch {
      return await verifierApi.getOnlineCertificate(id);
    }
  },

  scanOcr: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ serialNumber: string | null; registryNumber: string | null; accuracy: number; rawText: string }>('/verifier/scan-ocr', {
      method: 'POST',
      body: formData,
    });
  },
};

