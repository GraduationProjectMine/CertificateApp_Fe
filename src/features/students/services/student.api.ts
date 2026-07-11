import { request } from "@/lib/api";

export interface StudentDto {
  student_id: string;
  student_fullName: string;
  email: string;
  organization_id: string;
  organization_name: string;
  status: string;
  createdAt: string;
}

export const studentApi = {
  list: () =>
    request<StudentDto[]>('/students'),

  get: (id: string) =>
    request<StudentDto>(`/students/${id}`),

  create: (data: { name: string; email: string; password: string }) =>
    request<{ message: string; student: StudentDto }>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; email?: string; status?: string; password?: string }) =>
    request<{ message: string; student: StudentDto }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/students/${id}`, {
      method: 'DELETE',
    }),
};
