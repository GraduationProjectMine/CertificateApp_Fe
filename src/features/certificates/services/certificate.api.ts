import { request } from "@/lib/api";

export interface CertificateDto {
  certificate_id: string;
  organization_id: string;
  student_id: string;
  certificate_title: string;
  organization_name: string;
  student_fullName: string;
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
  ipfs_cid: string | null;
  tx_hash: string | null;
  status: string;
  issuedAt: string;
}

export interface CreateCertificatePayload {
  student_id: string;
  certificate_title: string;
  dob?: string;
  placeOfBirth?: string;
  gender?: string;
  ethnicity?: string;
  schoolName?: string;
  examCohort?: string;
  examBoard?: string;
  issueLocation?: string;
  issueDate?: string;
  serialNumber?: string;
  registryNumber?: string;
}

export const certificateApi = {
  list: (params?: { status?: string; student_id?: string }) => {
    const query = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => !!v)) as Record<string, string>).toString()
      : '';
    return request<CertificateDto[]>(`/certificates${query}`);
  },

  get: (id: string) =>
    request<CertificateDto>(`/certificates/${id}`),

  createDraft: (data: CreateCertificatePayload) =>
    request<CertificateDto>('/certificates/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<CertificateDto>(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  approve: (id: string) =>
    request<CertificateDto>(`/certificates/${id}/approve`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/certificates/${id}`, {
      method: 'DELETE',
    }),
};

export function mapCertificateDtoToStudentCert(
  dto: CertificateDto,
): import("@/features/certificates/types").StudentCertificate {
  const statusMap: Record<string, "VALID" | "REVOKED"> = {
    Issued: "VALID",
    Revoked: "REVOKED",
    "Pending Blockchain": "VALID",
    Draft: "VALID",
  };
  return {
    id: dto.certificate_id,
    credentialCode: dto.serialNumber || dto.certificate_id,
    serialNumber: dto.serialNumber || "",
    studentName: dto.student_fullName,
    studentCode: "",
    credentialTitle: dto.certificate_title,
    type: "BACHELOR_DEGREE",
    major: "",
    classification: "",
    gpa: "",
    issueDate: dto.issueDate || dto.issuedAt?.split("T")[0] || "",
    issuerName: dto.organization_name,
    issuerLogo: "",
    status: statusMap[dto.status] || "VALID",
    onChain: !!dto.tx_hash,
    ipfsCid: dto.ipfs_cid || "",
    metadataHash: "",
    transactionHash: dto.tx_hash || "",
    contractAddress: "",
    network: "",
    credentialHash: "",
  };
}
