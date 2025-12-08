import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

// TESTING MODE: Set to true to bypass authentication
const BYPASS_AUTH_FOR_TESTING = true;

const mockTestUser: User = {
  id: "test-user-123",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  role: "borrower",
  createdAt: new Date(),
  updatedAt: new Date(),
  password: null,
  profileImageUrl: null,
  staffRole: null,
};

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !BYPASS_AUTH_FOR_TESTING,
  });

  if (BYPASS_AUTH_FOR_TESTING) {
    return {
      user: mockTestUser,
      isLoading: false,
      isAuthenticated: true,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
