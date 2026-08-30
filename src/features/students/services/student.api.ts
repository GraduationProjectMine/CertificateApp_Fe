import { request } from "@/lib/api";

export interface StudentDto {
  student_id: string;
  student_fullName: string;
  email: string;
  organization_id: string;
  organization_name: string;
  isActive: boolean;
  isActivated: boolean;
  createdAt: string;
}

export interface UpdateStudentPayload {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface ImportResult {
  batch_id: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  results: {
    row: number;
    name: string;
    email: string;
    status: 'success' | 'failed';
    error?: string;
    student_id?: string;
    password?: string;
  }[];
}

export interface ImportBatchDto {
  id: string;
  organization_id: string;
  created_by_id: string;
  created_by_name: string;
  file_name: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  createdAt: string;
}

export const studentApi = {
  list: () => request<StudentDto[]>('/students'),
  search: (query: string, limit = 20) =>
    request<StudentDto[]>(`/students/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  get: (id: string) => request<StudentDto>(`/students/${id}`),
  create: (data: { name: string; email: string; password: string }) =>
    request<{ message: string; student: StudentDto }>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateStudentPayload) =>
    request<{ message: string; student: StudentDto }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/students/${id}`, { method: 'DELETE' }),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ImportResult>('/students/import', {
      method: 'POST',
      body: formData,
    });
  },
  downloadTemplate: async () => {
    const csv = await request<string>('/students/import/template');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  },
  importHistory: () => request<ImportBatchDto[]>('/students/import/history'),

  updateProfile: (data: { name?: string; email?: string }) =>
    request<{ message: string; student: StudentDto }>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/students/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resendActivation: (studentId: string) =>
    request<{ message: string }>(`/auth/resend-activation/${studentId}`, {
      method: 'POST',
    }),
};
