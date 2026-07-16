import { request } from "@/lib/api";
import type { CertificateTemplate } from "../types";

export const templateApi = {
  list: () =>
    request<CertificateTemplate[]>("/templates"),

  get: (id: string) =>
    request<CertificateTemplate>(`/templates/${id}`),

  getDefault: () =>
    request<CertificateTemplate>("/templates/default"),

  create: (data: { name: string; description?: string; design_data: Record<string, unknown>; thumbnail_url?: string; is_default?: boolean }) =>
    request<CertificateTemplate>("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string; design_data?: Record<string, unknown>; thumbnail_url?: string; is_default?: boolean }) =>
    request<CertificateTemplate>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/templates/${id}`, {
      method: "DELETE",
    }),

  duplicate: (id: string) =>
    request<CertificateTemplate>(`/templates/${id}/duplicate`, {
      method: "POST",
    }),
};
