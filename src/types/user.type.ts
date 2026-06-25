import type { UserRole } from "../features/auth/components/AuthContext";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgName?: string;
  institutionName?: string;
  walletAddress?: string;
  loginType?: "credentials" | "metamask" | "google";
  createdAt?: string;
}
