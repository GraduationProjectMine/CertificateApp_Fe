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
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data: { email: string; password: string; name: string; role?: string; studentId?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  registerInstitution: (data: { institutionName: string; institutionCode: string; email: string; adminName: string; password: string }) =>
    request('/auth/register-institution', { method: 'POST', body: JSON.stringify(data) }),

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
