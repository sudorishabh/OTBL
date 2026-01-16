"use client";
import React, { createContext, useContext, useState } from "react";

type ClientManagementContextType = {
  clientSearchQuery: string;
  setClientSearchQuery: (query: string) => void;
  clientFilters: {
    status: "active" | "inactive" | "all";
  };
  setClientFilters: (filters: {
    status: "active" | "inactive" | "all";
  }) => void;
  contactSearchQuery: string;
  setContactSearchQuery: (query: string) => void;
  contactFilters: {
    clientId: string;
  };
  setContactFilters: (filters: { clientId: string }) => void;
  resetClientFilters: () => void;
  resetContactFilters: () => void;
};

const ClientManagementContext = createContext<
  ClientManagementContextType | undefined
>(undefined);

export const ClientManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientFilters, setClientFilters] = useState<{
    status: "active" | "inactive" | "all";
  }>({
    status: "all",
  });

  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFilters, setContactFilters] = useState<{ clientId: string }>({
    clientId: "all",
  });

  const resetClientFilters = () => {
    setClientSearchQuery("");
    setClientFilters({
      status: "all",
    });
  };

  const resetContactFilters = () => {
    setContactSearchQuery("");
    setContactFilters({
      clientId: "all",
    });
  };

  return (
    <ClientManagementContext.Provider
      value={{
        clientSearchQuery,
        setClientSearchQuery,
        clientFilters,
        setClientFilters,
        contactSearchQuery,
        setContactSearchQuery,
        contactFilters,
        setContactFilters,
        resetClientFilters,
        resetContactFilters,
      }}>
      {children}
    </ClientManagementContext.Provider>
  );
};

export const useClientManagementContext = () => {
  const context = useContext(ClientManagementContext);
  if (!context) {
    throw new Error(
      "useClientManagementContext must be used within a ClientManagementProvider"
    );
  }
  return context;
};
