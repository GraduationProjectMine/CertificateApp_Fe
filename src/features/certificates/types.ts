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
  ipfsCid: string;
  txHash: string;
  status: CertificateStatus;
  onChain: boolean;
}
