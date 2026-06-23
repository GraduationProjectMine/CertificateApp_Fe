import { UserRole } from "./components/AuthContext";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    name: string;
    role: UserRole;
  };
  error?: string;
}
