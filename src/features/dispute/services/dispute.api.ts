import { request } from "@/lib/api";

export interface DisputeDto {
  id: string;
  student_id: string;
  certificate_id: string;
  reason: string;
  details: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewer_id: string | null;
  reviewer_note: string | null;
  resolved_at: string | null;
  new_cert_id: string | null;
  createdAt: string;
  updatedAt: string;
  certificate?: { certificate_title: string; student_fullName: string };
}

export const disputeApi = {
  myDisputes: () => request<DisputeDto[]>('/disputes'),

  getById: (id: string) => request<DisputeDto>(`/disputes/${id}`),

  create: (data: { certificate_id: string; reason: string; details?: string }) =>
    request<DisputeDto>('/disputes', { method: 'POST', body: JSON.stringify(data) }),

  orgList: (status?: string) =>
    request<DisputeDto[]>(`/disputes/org/list${status ? `?status=${status}` : ''}`),

  review: (id: string, data: { decision: 'APPROVED' | 'REJECTED'; reviewer_note?: string; new_cert_data?: any }) =>
    request<{ message: string; new_certificate_id?: string }>(`/disputes/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
