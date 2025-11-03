import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  Insert: React.ElementType;
  size?: number;
  className?: string;
}

const CustomIcon = ({ Insert, size = 24, className }: Props) => {
  return (
    <Insert
      className={cn("text-teal-800", className)}
      size={size}
    />
  );
};

export default CustomIcon;
