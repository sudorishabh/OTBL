"use client";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: isQueryLoading } = trpc.authQuery.me.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const logoutMutation = trpc.authMutation.logout.useMutation();

  useEffect(() => {
    if (!isQueryLoading) {
      if (data?.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [data, isQueryLoading]);

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
};
