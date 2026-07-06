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
  create: (data: { name: string; email: string; password: string }) =>
    request<{ message: string; student: StudentDto }>('/issuer/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
