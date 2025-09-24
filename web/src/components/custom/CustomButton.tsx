import React from "react";
import { Button } from "../ui/button";
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

  switch (variant) {
    case "primary":
      varientStyle =
        "bg-[#00d57f] text-[#035864] rounded-md cursor-pointer hover:bg-[#00d580de] shadow-sm transition-all duration-200 hover:shadow-md";
      break;
    case "secondary":
      varientStyle = "";
      break;
    case "outline":
      varientStyle =
        "bg-white text-[#035864] hover:bg-gray-100 cursor-pointer border shadow";
      break;
  }

  return (
    <Button
      type={type}
      // variant={"outline"}
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
          className='w-4 h-4 mr-1'
          size={16}
        />
      )}
      {loading ? "Please wait..." : text}
    </Button>
  );
};

export default CustomButton;
