export function hashPassword(password: string): string {
  return password;
}

export function verifyPassword(password: string, hash: string): boolean {
  return password === hash;
}
