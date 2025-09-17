import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface Props {
  Icon?: React.ElementType;
  text: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
}

const CustomButton = ({
  Icon,
  text,
  className,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
}: Props) => {
  return (
    <Button
      type={type}
      className={cn(
        "bg-emerald-600 text-white rounded-sm cursor-pointer hover:bg-emerald-700 shadow-sm transition-all duration-200 hover:shadow-md",
        disabled || loading ? "opacity-70 cursor-not-allowed" : "",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}>
      {loading && <Loader className='animate-spin' />}
      {Icon && !loading && (
        <Icon
          className='w-4 h-4 mr-1'
          size={16}
        />
      )}
      {loading ? "Please wait..." : text}
    </Button>
  );
};

export default CustomButton;
