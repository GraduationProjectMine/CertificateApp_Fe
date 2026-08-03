import { request } from "@/lib/api";

export interface IssuerProfile {
  organization_id: string;
  organization_name: string;
  contact_email: string;
  logo_url: string | null;
  is_verified: boolean;
  wallet_address: string | null;
  created_at: string;
}

export interface UpdateIssuerProfile {
  organization_name?: string;
  contact_email?: string;
  logo_url?: string;
}

export const issuerApi = {
  getProfile: () => request<IssuerProfile>('/issuer'),
  updateProfile: (data: UpdateIssuerProfile) =>
    request<IssuerProfile>('/issuer', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string; logo_url: string; organization: IssuerProfile }>('/issuer/upload-logo', {
      method: 'POST',
      body: formData,
    });
  },
};
