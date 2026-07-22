import { request } from "@/lib/api";

export interface DashboardStats {
  organizations: { total: number; pending: number; verified: number };
  users: { total: number; staff: number; students: number };
  certificates: { total: number; issued: number; pending: number; revoked: number };
}

export interface Organization {
  organization_id: string;
  organization_name: string;
  contact_email: string;
  logo_url: string | null;
  is_verified: boolean;
  wallet_address: string | null;
  created_at: string;
  stats?: { staff: number; students: number; certificates: number };
  staff_accounts?: Array<{
    staff_id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
}

export interface User {
  staff_id?: string;
  student_id?: string;
  name?: string;
  student_fullName?: string;
  email: string;
  role: string;
  status: string;
  organization_name: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  actorName: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  ipAddress: string | null;
  success: boolean;
  details: Record<string, unknown> | null;
  createdAt: string;
}

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export interface OrgWalletInfo {
  organization_id: string;
  organization_name: string;
  wallet_address: string;
  balance: string;
  is_authorized: boolean;
  has_private_key?: boolean;
  has_wallet?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

export interface WalletsOverview {
  items: OrgWalletInfo[];
  total: number;
}

export const superAdminApi = {
  dashboard: () => request<DashboardStats>('/super-admin/dashboard'),

  listOrganizations: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) =>
    request<Paginated<Organization>>(`/super-admin/organizations${queryString(params)}`),

  getOrganization: (id: string) => request<Organization>(`/super-admin/organizations/${id}`),

  verifyOrganization: (id: string) =>
    request<Organization>(`/super-admin/organizations/${id}/verify`, { method: 'PUT' }),

  suspendOrganization: (id: string) =>
    request<Organization>(`/super-admin/organizations/${id}/suspend`, { method: 'PUT' }),

  listUsers: (params: { page?: number; limit?: number; role?: string; organization_id?: string; search?: string } = {}) =>
    request<Paginated<User>>(`/super-admin/users${queryString(params)}`),

  listAuditLogs: (params: { page?: number; limit?: number; action?: string; search?: string } = {}) =>
    request<Paginated<AuditLog>>(`/super-admin/audit-logs${queryString(params)}`),

  // Wallet Management
  getWalletsOverview: () => request<WalletsOverview>('/super-admin/wallet/overview'),

  getOrgWallet: (id: string) => request<OrgWalletInfo>(`/super-admin/organizations/${id}/wallet`),

  fundOrgWallet: (id: string, amount: string) =>
    request<{ message: string; transactionHash: string }>(`/super-admin/organizations/${id}/wallet/fund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  deauthorizeOrg: (id: string) =>
    request<{ message: string; transactionHash: string }>(`/super-admin/organizations/${id}/deauthorize`, {
      method: 'POST',
    }),

  reauthorizeOrg: (id: string) =>
    request<{ message: string; transactionHash: string }>(`/super-admin/organizations/${id}/reauthorize`, {
      method: 'POST',
    }),

  // Certificate Management
  listCertificates: (params: { page?: number; limit?: number; search?: string; status?: string; organization_id?: string } = {}) =>
    request<Paginated<CertificateSummary>>(`/super-admin/certificates${queryString(params)}`),

  getCertificate: (id: string) => request<CertificateDetail>(`/super-admin/certificates/${id}`),

  getCertificateStats: () => request<CertificateStats>('/super-admin/certificates/stats'),

  // System Health & Activity
  getSystemHealth: () => request<SystemHealth>('/super-admin/system-health'),
  getRecentActivity: () => request<ActivityItem[]>('/super-admin/recent-activity'),

  // User Management
  getUser: (id: string) => request<User & { type: string; staff_id: string; name: string }>(`/super-admin/users/${id}`),
  lockUser: (id: string) => request<any>(`/super-admin/users/${id}/lock`, { method: "PUT" }),
  unlockUser: (id: string) => request<any>(`/super-admin/users/${id}/unlock`, { method: "PUT" }),
  resetUserPassword: (id: string, password?: string) => 
    request<{ message: string; defaultPassword?: string }>(`/super-admin/users/${id}/reset-password`, { 
      method: "PUT",
      body: password ? JSON.stringify({ password }) : undefined
    }),

  // Super Admin CRUD
  listSuperAdmins: () => request<SuperAdminUser[]>('/super-admin/admins'),
  createSuperAdmin: (body: { name: string; email: string; password?: string }) => 
    request<SuperAdminUser & { defaultPassword?: string }>('/super-admin/admins', {
      method: "POST",
      body: JSON.stringify(body)
    }),

  // Infrastructure Monitoring
  getDetailedBlockchainInfo: () => request<DetailedBlockchainInfo>('/super-admin/infrastructure/blockchain'),
  getDetailedIpfsInfo: () => request<DetailedIpfsInfo>('/super-admin/infrastructure/ipfs'),
  getDetailedContractInfo: () => request<DetailedContractInfo>('/super-admin/infrastructure/contract'),

  // System Configuration
  getSystemConfig: () => request<Record<string, string>>('/super-admin/config'),
  updateSystemConfig: (configs: Record<string, string>) => 
    request<Record<string, string>>('/super-admin/config', {
      method: "PUT",
      body: JSON.stringify(configs)
    }),
};

export interface SuperAdminUser {
  admin_id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface SystemHealth {
  blockchain: {
    connected: boolean;
    network: string | null;
    chainId: number | null;
    blockNumber: number | null;
    contractAddress: string | null;
    walletAddress: string | null;
    walletBalance: string | null;
  };
}

export interface ActivityItem {
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface CertificateSummary {
  certificate_id: string;
  certificate_title: string;
  student_fullName: string;
  organization_name: string;
  status: string;
  serialNumber: string | null;
  registryNumber: string | null;
  ipfs_cid: string | null;
  tx_hash: string | null;
  block_number: number | null;
  issuedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface CertificateDetail extends CertificateSummary {
  organization_id: string;
  student_id: string;
  template_id: string | null;
  dob: string | null;
  placeOfBirth: string | null;
  gender: string | null;
  ethnicity: string | null;
  schoolName: string | null;
  examCohort: string | null;
  examBoard: string | null;
  issueLocation: string | null;
  issueDate: string | null;
  gas_used: string | null;
  revokedById: string | null;
  revoke_tx_hash: string | null;
  revoke_block_number: number | null;
}

export interface CertificateStats {
  statusDistribution: {
    draft: number;
    pending: number;
    issued: number;
    revoked: number;
    revokeFailed: number;
    total: number;
  };
  monthly: Array<{ month: string; issued: number; revoked: number }>;
  topOrganizations: Array<{ organization_id: string; organization_name: string; count: number }>;
}

export interface DetailedBlockchainInfo {
  connected: boolean;
  network: string | null;
  chainId: number | null;
  blockNumber: number | null;
  contractAddress: string | null;
  walletAddress: string | null;
  walletBalance: string | null;
  rpcUrl: string;
  recentBlocks: Array<{
    number: number;
    hash: string;
    timestamp: string;
    transactionsCount: number;
    gasUsed: string;
  }>;
}

export interface DetailedIpfsInfo {
  connected: boolean;
  gateway: string;
  error: string | null;
  totalCids: number;
  pinataJwtConfigured: boolean;
  pinataApiKeyConfigured: boolean;
}

export interface DetailedContractInfo {
  contractAddress: string;
  owner: string;
  isInitialized: boolean;
}

