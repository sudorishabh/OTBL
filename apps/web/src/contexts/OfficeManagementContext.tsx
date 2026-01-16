"use client";
import React, { createContext, useContext, useState } from "react";

type OfficeManagementContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: "active" | "inactive" | "all";
  };
  setFilters: (filters: { status: "active" | "inactive" | "all" }) => void;
  resetFilters: () => void;
  officeNamesOrder: "asc" | "desc" | "latest" | "oldest";
  setOfficeNamesOrder: (order: "asc" | "desc" | "latest" | "oldest") => void;
};

const OfficeManagementContext = createContext<
  OfficeManagementContextType | undefined
>(undefined);

export const OfficeManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [officeNamesOrder, setOfficeNamesOrder] = useState<
    "asc" | "desc" | "latest" | "oldest"
  >("latest");

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
    });
  };

  return (
    <OfficeManagementContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        officeNamesOrder,
        setOfficeNamesOrder,
      }}>
      {children}
    </OfficeManagementContext.Provider>
  );
};

export const useOfficeManagementContext = () => {
  const context = useContext(OfficeManagementContext);
  if (!context) {
    throw new Error(
      "useOfficeManagementContext must be used within a OfficeManagementProvider"
    );
  }
  return context;
};
