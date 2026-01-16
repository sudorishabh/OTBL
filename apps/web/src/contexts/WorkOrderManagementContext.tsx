"use client";
import React, { createContext, useContext, useState } from "react";

type WorkOrderManagementContextType = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    status: string;
    office_id: number | undefined;
  };
  setFilters: (filters: {
    status: string;
    office_id: number | undefined;
  }) => void;
  resetFilters: () => void;
  workOrderOrder: "asc" | "desc" | "latest" | "oldest";
  setWorkOrderOrder: (order: "asc" | "desc" | "latest" | "oldest") => void;
};

const WorkOrderManagementContext = createContext<
  WorkOrderManagementContextType | undefined
>(undefined);

export const WorkOrderManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    office_id: undefined as number | undefined,
  });
  const [workOrderOrder, setWorkOrderOrder] = useState<
    "asc" | "desc" | "latest" | "oldest"
  >("latest");

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      office_id: undefined,
    });
  };

  return (
    <WorkOrderManagementContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        workOrderOrder,
        setWorkOrderOrder,
      }}>
      {children}
    </WorkOrderManagementContext.Provider>
  );
};

export const useWorkOrderManagementContext = () => {
  const context = useContext(WorkOrderManagementContext);
  if (!context) {
    throw new Error(
      "useWorkOrderManagementContext must be used within a WorkOrderManagementProvider"
    );
  }
  return context;
};
