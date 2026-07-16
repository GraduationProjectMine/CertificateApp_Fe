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
  organizationName: string;
  organizationId: string;
  txHash: string | null;
  issuedAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  revokeTransactionHash: string | null;
}

export interface VerifyCertificateResponse {
  isValid: boolean;
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
  getCertificate: (id: string) =>
    request<VerifyCertificateResponse>(`/verifier/certificate/${id}`),
};
