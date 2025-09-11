import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  Icon?: React.ElementType;
  text: string;
  className?: string;
  onClick?: () => void;
}

const CustomButton = ({ Icon, text, className, onClick }: Props) => {
  return (
    <Button
      className={cn(
        "bg-emerald-600 text-white rounded-sm cursor-pointer hover:bg-emerald-700 shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
      onClick={onClick}>
      {Icon && (
        <Icon
          className='w-4 h-4 mr-1'
          size={16}
        />
      )}
      {text}
    </Button>
  );
};

export default CustomButton;
