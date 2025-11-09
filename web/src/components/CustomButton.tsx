import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

const enum variantEnum {
  "primary" = "primary",
  "secondary" = "secondary",
}

interface Props {
  Icon?: React.ElementType;
  text: string;
  className?: string;
  variant: "primary" | "secondary" | "outline";
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
  variant,
  type = "button",
  disabled = false,
  loading = false,
}: Props) => {
  let varientStyle = "";
  let varientIconStyle = "";

  switch (variant) {
    case "primary":
      varientStyle =
        "bg-emerald-600 text-gray-100 rounded-md cursor-pointer hover:bg-emerald-700/90 shadow-sm transition-all duration-200 hover:shadow-md gap-1.5 h-8.5 text-[0.813rem]";
      break;
    case "secondary":
      varientStyle =
        "bg-gray-50 text-gray-700 rounded-md cursor-pointer borde hover:bg-gray-200/60 shadow-sm transition-all duration-200 hover:shadow-sm gap-1.5 h-8.5 text-[0.813rem]";
      break;
    case "outline":
      varientStyle =
        "bg-white text-gray-800 shadow-none hover:bg-gray-50 cursor-pointer border transition-all duration-200  h-8.5";
      break;
  }

  switch (variant) {
    case "primary":
      varientIconStyle = "size-3.5 text-gray-100";
      break;
    case "secondary":
      varientIconStyle = "size-3.5 text-gray-700";
      break;
    case "outline":
      varientIconStyle = "size-3.5 text-gray-700";
      break;
  }

  return (
    <Button
      type={type}
      className={cn(
        varientStyle,
        disabled || loading ? "cursor-not-allowed" : "",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}>
      {loading && <Loader className='animate-spin' />}
      {Icon && !loading && (
        <Icon
          className={varientIconStyle}
          size={16}
        />
      )}
      {loading ? "Please wait..." : text}
    </Button>
  );
};

export default CustomButton;
