"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { SidebarProvider } from "@/components/ui/sidebar";
import { httpBatchLink } from "@trpc/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserManagementProvider } from "@/contexts/UserManagementContext";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:7200/trpc",
          fetch: async (input, init) => {
            return fetch(input, {
              ...init,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserManagementProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </UserManagementProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Provider;
