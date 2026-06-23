export const ROUTES = {
  HOME: "/",
  VERIFY: "/verify",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    STUDENTS: "/admin/students",
    STUDENT_CREATE: "/admin/students/create",
    CERTIFICATES: "/admin/certificates",
    CERTIFICATE_ISSUE: "/admin/certificates/issue",
    TEMPLATES: "/admin/templates",
    BATCHES: "/admin/batches",
    BLOCKCHAIN: "/admin/blockchain",
    REVOCATIONS: "/admin/revocations",
    AUDIT_LOGS: "/admin/audit-logs",
    SETTINGS: "/admin/settings",
  },

  STUDENT: {
    DASHBOARD: "/student/dashboard",
    CERTIFICATES: "/student/certificates",
    PROFILE: "/student/profile",
  },

  EMPLOYER: {
    DASHBOARD: "/employer/dashboard",
    VERIFY: "/employer/verify",
    HISTORY: "/employer/history",
  },
};
