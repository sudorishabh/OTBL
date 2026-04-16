import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const CustomForm = ({ children, onSubmit, className }: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      className={cn("space-y-4 pl-2 py-4", className)}
      onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

export default CustomForm;
