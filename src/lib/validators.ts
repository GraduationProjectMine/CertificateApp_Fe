export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateStudentCode(code: string): boolean {
  return /^\d{8}$/.test(code);
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} l\u00e0 b\u1eaft bu\u1ed9c`;
  return null;
}
