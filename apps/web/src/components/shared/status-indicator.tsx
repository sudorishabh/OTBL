import React from "react";

interface StatusIndicatorProps {
  status: "active" | "inactive" | boolean;
  size?: "sm" | "md";
}

const StatusIndicator = ({ status, size = "md" }: StatusIndicatorProps) => {
  const isActive = status === "active" || status === true;
  const sizeClasses = size === "sm" ? "h-2 w-2" : "h-3 w-3";

  return (
    <div
      className={`${sizeClasses} rounded-full ${
        isActive ? "bg-green-500" : "bg-red-500"
      }`}
      title={isActive ? "Active" : "Inactive"}
      aria-label={isActive ? "Active status" : "Inactive status"}
    />
  );
};

export default StatusIndicator;
