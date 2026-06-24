export interface Student {
  id: string;
  code: string;
  name: string;
  email: string;
  department: string;
  major: string;
  status: "Active" | "Pending" | "Graduated";
}

export interface CreateStudentRequest {
  code: string;
  name: string;
  email: string;
  department: string;
  major: string;
}
