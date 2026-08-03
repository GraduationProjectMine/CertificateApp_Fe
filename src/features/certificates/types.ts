export type CertificateStatus = "ISSUED" | "PENDING" | "REVOKED" | "DRAFT";

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

export interface StudentCertificate {
  id: string;
  credentialCode: string;
  serialNumber: string;
  studentName: string;
  studentCode: string;
  credentialTitle: string;
  type: string;
  major: string;
  classification: string;
  gpa: string;
  issueDate: string;
  issuerName: string;
  issuerLogo: string;
  status: "VALID" | "REVOKED";
  rawStatus: CertificateStatus;
  onChain: boolean;
  ipfsCid: string;
  metadataHash: string;
  transactionHash: string;
  contractAddress: string;
  network: string;
  credentialHash: string;
  dob?: string | null;
  placeOfBirth?: string | null;
  gender?: string | null;
  ethnicity?: string | null;
  schoolName?: string | null;
  examCohort?: string | null;
  examBoard?: string | null;
  issueLocation?: string | null;
  registryNumber?: string | null;
}
