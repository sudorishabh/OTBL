"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, getTrpcClient } from "@/lib/trpc";
import { SidebarProvider } from "@/components/ui/sidebar";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [client] = useState(() => getTrpcClient());
  return (
    <trpc.Provider
      client={client}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>{children}</SidebarProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Provider;
