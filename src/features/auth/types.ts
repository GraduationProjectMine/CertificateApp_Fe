export type UserRole = 'issuer' | 'staff' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId: string | null;
  institutionId: string | null;
  walletAddress: string | null;
  institutionName?: string | null;
  loginType?: 'credentials' | 'metamask' | 'google';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface NonceResponse {
  nonce: string;
  expiresAt: string;
  message: string;
}
