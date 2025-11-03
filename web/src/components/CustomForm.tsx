import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const CustomForm = ({ children, onSubmit, className }: Props) => {
  return (
    <form
      className={cn("space-y-4 px-3.5 py-4", className)}
      onSubmit={onSubmit}>
      {children}
    </form>
  );
};

export default CustomForm;
