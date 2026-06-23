export const ROLES = {
  ISSUER: "issuer" as const,
  STUDENT: "student" as const,
  EMPLOYER: "employer" as const,
  SYSADMIN: "sysadmin" as const,
};

export const ROLE_LABELS: Record<string, string> = {
  issuer: "Trường Đại Học",
  student: "Sinh viên",
  employer: "Nhà tuyển dụng",
  sysadmin: "Quản trị hệ thống",
};
