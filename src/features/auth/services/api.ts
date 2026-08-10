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

  getMetaMaskNonce: (walletAddress: string) =>
    request<{ message: string; tempToken: string }>(
      '/auth/metamask/nonce',
      { method: 'POST', body: JSON.stringify({ walletAddress }) }
    ),

  loginWithMetaMask: (walletAddress: string, signature: string, tempToken: string) =>
    request<{ id: string; email: string; name: string; role: string; accessToken: string }>(
      '/auth/metamask/login',
      { method: 'POST', body: JSON.stringify({ walletAddress, signature, tempToken }) }
    ),

  registerWithMetaMask: (data: {
    walletAddress: string;
    signature: string;
    tempToken: string;
    email: string;
    name: string;
    adminName?: string;
  }) =>
    request<{ id: string; email: string; name: string; role: string; accessToken: string }>(
      '/auth/metamask/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),
};
