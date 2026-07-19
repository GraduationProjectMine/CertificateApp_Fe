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
};
