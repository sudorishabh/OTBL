import { ClientManagementProvider } from "@/contexts/ClientManagementContext";
import React from "react";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return <ClientManagementProvider>{children}</ClientManagementProvider>;
};

export default ClientLayout;
