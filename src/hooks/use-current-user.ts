import { useAuth } from "../features/auth/components/AuthContext";

export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
