import { z } from "zod";

export const certificateSchema = z.object({
  studentId: z.string().min(1, "Vui lòng chọn sinh viên"),
  type: z.string().min(1, "Vui lòng nhập loại văn bằng"),
  major: z.string().min(1, "Vui lòng nhập chuyên ngành"),
  classification: z.string().min(1, "Vui lòng chọn xếp loại"),
  gpa: z.string().min(1, "Vui lòng nhập GPA"),
  issueDate: z.string().min(1, "Vui lòng chọn ngày cấp"),
});

export type CertificateFormData = z.infer<typeof certificateSchema>;
