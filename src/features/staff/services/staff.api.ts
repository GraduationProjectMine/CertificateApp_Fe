import { request } from "@/lib/api";

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
}

export const staffApi = {
  create: (data: CreateStaffPayload) =>
    request<{ message: string; staff: any }>('/issuer/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
