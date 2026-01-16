"use client";
import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

/**
 * User type matching the server response
 */
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

/**
 * Auth hook return type
 */
export type UseAuthReturn = {
  user: User | null;
  setUser: (user: User | null) => void;
  isUserLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetchUser: () => void;
};

/**
 * Custom hook for authentication state management
 * Fetches user on mount and provides logout functionality
 * Session is automatically refreshed via server-side token refresh
 */
export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserIsLoading] = useState(true);

  // Query for current user - uses cookies for auth
  // Server automatically refreshes tokens if access token is expired but refresh token is valid
  const {
    data,
    isLoading: isQueryLoading,
    refetch,
  } = trpc.authQuery.me.useQuery(undefined, {
    retry: 1, // Retry once in case of network issues
    refetchOnWindowFocus: true, // Refetch on window focus to refresh session
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes to keep session alive
    staleTime: 1000 * 60 * 10, // Consider data stale after 10 minutes
  });

  const logoutMutation = trpc.authMutation.logout.useMutation();

  // Sync user state with query data
  useEffect(() => {
    if (!isQueryLoading) {
      if (data?.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setUserIsLoading(false);
    }
  }, [data, isQueryLoading]);

  /**
   * Logout the user - clears cookies on server and redirects to login
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [logoutMutation, router]);

  /**
   * Manually refetch user data
   * This also triggers token refresh on the server if needed
   */
  const refetchUser = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    user,
    setUser,
    isUserLoading: isUserLoading || isQueryLoading,
    isAuthenticated: !!user,
    logout,
    refetchUser,
  };
};
