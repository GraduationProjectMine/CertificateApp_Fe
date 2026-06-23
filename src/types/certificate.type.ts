export type CertificateStatus = "Issued" | "Pending Blockchain" | "Revoked" | "Draft";

export interface Certificate {
  id: string;
  serialNumber: string;
  studentName: string;
  studentCode: string;
  type: string;
  major: string;
  classification: string;
  gpa: string;
  issueDate: string;
  issuerName: string;
  issuerDID?: string;
  ipfsCid: string;
  pdfHash?: string;
  txHash: string;
  blockNumber?: number;
  status: CertificateStatus;
  onChain: boolean;
  createdAt: string;
  updatedAt: string;
}
