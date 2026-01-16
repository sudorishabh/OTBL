"use client";
import React, { createContext, useContext, useState } from "react";

type SiteManagementContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: string;
  };
  setFilters: (filters: { status: string }) => void;
  resetFilters: () => void;
  siteNamesOrder: "asc" | "desc" | "latest" | "oldest";
  setSiteNamesOrder: (order: "asc" | "desc" | "latest" | "oldest") => void;
};

const SiteManagementContext = createContext<
  SiteManagementContextType | undefined
>(undefined);

export const SiteManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [siteNamesOrder, setSiteNamesOrder] = useState<
    "asc" | "desc" | "latest" | "oldest"
  >("latest");

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
    });
  };

  return (
    <SiteManagementContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        siteNamesOrder,
        setSiteNamesOrder,
      }}>
      {children}
    </SiteManagementContext.Provider>
  );
};

export const useSiteManagementContext = () => {
  const context = useContext(SiteManagementContext);
  if (!context) {
    throw new Error(
      "useSiteManagementContext must be used within a SiteManagementProvider"
    );
  }
  return context;
};
