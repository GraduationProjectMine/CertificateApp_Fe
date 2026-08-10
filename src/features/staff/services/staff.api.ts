import { request } from "@/lib/api";

export interface StaffDto {
  staff_id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: string;
  password?: string;
}

export const staffApi = {
  list: () => request<StaffDto[]>('/staff'),

  get: (id: string) => request<StaffDto>(`/staff/${id}`),

  create: (data: CreateStaffPayload) =>
    request<{ message: string; staff: any }>('/issuer/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateStaffPayload) =>
    request<StaffDto>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/staff/${id}`, { method: 'DELETE' }),
};
