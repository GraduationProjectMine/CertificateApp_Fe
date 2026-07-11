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

  getPendingInstitutions: () =>
    request('/super-admin/pending-institutions'),

  approveInstitution: (id: string) =>
    request(`/super-admin/approve/${id}`, { method: 'POST' }),

  rejectInstitution: (id: string) =>
    request(`/super-admin/reject/${id}`, { method: 'POST' }),

  superAdminStats: () =>
    request('/super-admin/stats'),
};
