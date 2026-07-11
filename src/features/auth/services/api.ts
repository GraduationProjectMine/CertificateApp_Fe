import { request } from "@/lib/api";

export const authApi = {
  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  login: (email: string, password: string) =>
    request<{ id: string; email: string; name: string; role: string; accessToken: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),

  register: (data: { email: string; password: string; name: string }) =>
    request<{ id: string; email: string; name: string; role: string; accessToken: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  registerInstitution: (data: { institutionName: string; institutionCode: string; email: string; adminName: string; password: string }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: data.email, name: data.institutionName, adminName: data.adminName, password: data.password }),
    }),

  loginGoogle: (credential: string) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),

  getMetamaskLoginNonce: (walletAddress: string) =>
    request('/auth/login-metamask/nonce', { method: 'POST', body: JSON.stringify({ walletAddress }) }),

  loginMetamask: (walletAddress: string, signature: string) =>
    request('/auth/login-metamask', { method: 'POST', body: JSON.stringify({ walletAddress, signature }) }),

  getLinkWalletNonce: (walletAddress: string) =>
    request('/auth/link-wallet/nonce', { method: 'POST', body: JSON.stringify({ walletAddress }) }),

  linkWallet: (walletAddress: string, signature: string) =>
    request('/auth/link-wallet', { method: 'POST', body: JSON.stringify({ walletAddress, signature }) }),

  unlinkWallet: () =>
    request('/auth/unlink-wallet', { method: 'POST' }),

  getProfile: () =>
    request('/auth/profile'),

  getOrganizationProfile: () =>
    request<{ organization_id: string; organization_name: string; contact_email: string; logo_url?: string; wallet_address?: string; is_verified: boolean }>('/issuer'),

  updateOrganizationProfile: (data: { organization_name?: string; contact_email?: string; logo_url?: string; wallet_address?: string }) =>
    request<{ message: string; organization: any }>('/issuer', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
