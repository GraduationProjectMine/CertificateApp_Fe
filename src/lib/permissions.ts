export type Permission = "issue" | "revoke" | "manage_students" | "manage_templates" | "view_audit" | "manage_settings";

export const ROLES: Record<string, Permission[]> = {
  issuer: ["issue", "revoke", "manage_students", "manage_templates", "view_audit", "manage_settings"],
  staff: ["issue", "manage_students", "manage_templates", "view_audit"],
  student: [],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLES[role]?.includes(permission) ?? false;
}
