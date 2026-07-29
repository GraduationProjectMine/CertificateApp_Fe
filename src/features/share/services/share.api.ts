import { request } from "@/lib/api";

export interface ShareDto {
  id: string;
  student_id: string;
  certificate_id: string;
  certificate_title?: string;
  share_token: string;
  scope: string | null;
  expires_at: string | null;
  revoked: boolean;
  verify_count: number;
  createdAt: string;
  is_expired: boolean;
  share_url: string;
}

export const shareApi = {
  list: () => request<ShareDto[]>("/share"),

  create: (data: {
    certificate_id: string;
    expires_in_days?: number;
    scope?: string[];
  }) =>
    request<ShareDto>("/share", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  revoke: (id: string) =>
    request<{ message: string }>(`/share/${id}`, { method: "DELETE" }),

  getByCert: (certId: string) =>
    request<ShareDto[]>(`/share/cert/${certId}`),

  verify: (token: string) => request<any>(`/share/verify/${token}`),
};
