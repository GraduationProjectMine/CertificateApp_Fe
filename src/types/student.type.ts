export interface Student {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  major: string;
  course: string;
  class: string;
  status: "Active" | "Pending" | "Graduated" | "Suspended";
  certificateCount: number;
  createdAt: string;
}
