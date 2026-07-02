const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

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
