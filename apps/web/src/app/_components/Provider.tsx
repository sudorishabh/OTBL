"use client";
import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import {
  httpLink,
  httpBatchLink,
  splitLink,
  TRPCClientError,
} from "@trpc/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserManagementProvider } from "@/contexts/UserManagementContext";
import { WorkOrderManagementProvider } from "@/contexts/WorkOrderManagementContext";
import { OfficeManagementProvider } from "@/contexts/OfficeManagementContext";

const Provider = ({ children }: { children: React.ReactNode }) => {
  // Flag to prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<boolean> | null>(null);

  /**
   * Attempt to refresh the auth session by calling the 'me' endpoint
   * This triggers server-side token refresh via the refresh token
   */
  const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
    // If already refreshing, wait for the existing refresh to complete
    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current;
    }

    isRefreshing.current = true;
    refreshPromise.current = (async () => {
      try {
        // Call the me endpoint directly via fetch to trigger token refresh
        // The server will set new cookies if refresh token is valid
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
        const response = await fetch(
          `${serverUrl}/trpc/authQuery.me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        // Check if the refresh was successful
        if (result?.result?.data?.success) {
          return true;
        }
        return false;
      } catch (error) {
        console.error("[Auth] Token refresh failed:", error);
        return false;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // Don't retry UNAUTHORIZED errors more than once
              // The first retry is handled by our custom logic
              if (error instanceof TRPCClientError) {
                if (error.data?.code === "UNAUTHORIZED") {
                  return false;
                }
              }
              // For other errors, use default retry logic (3 retries)
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            staleTime: 1000 * 30,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  // Custom fetch wrapper for auth handling
  const customFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, {
        ...init,
        credentials: "include",
      });

      // If we get an UNAUTHORIZED response, try to refresh tokens
      if (response.status === 401) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          // Retry the original request with new tokens
          return fetch(input, {
            ...init,
            credentials: "include",
          });
        }
      }

      return response;
    },
    [attemptTokenRefresh]
  );

  const [trpcClient] = useState(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "";
    return trpc.createClient({
      links: [
        splitLink({
          // Route based on operation type
          condition: (op) => op.type === "mutation",
          // Mutations use httpLink (POST requests)
          true: httpLink({
            url: `${serverUrl}/trpc`,
            fetch: customFetch,
          }),
          // Queries use httpBatchLink (GET requests with batching)
          false: httpBatchLink({
            url: `${serverUrl}/trpc`,
            fetch: customFetch,
          }),
        }),
      ],
    });
  });

  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          <AuthProvider>
            <UserManagementProvider>
              <WorkOrderManagementProvider>
                <OfficeManagementProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </OfficeManagementProvider>
              </WorkOrderManagementProvider>
            </UserManagementProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Provider;
