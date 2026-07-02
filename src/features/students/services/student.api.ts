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
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

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
