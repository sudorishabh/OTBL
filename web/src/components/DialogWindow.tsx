"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  title?: string;
  size: "sm" | "md" | "lg" | "xl";
  description?: string;
}

const DialogWindow = ({
  children,
  open,
  setOpen,
  className,
  title,
  description,
  size,
}: Props) => {
  let dialogSize = "";
  switch (size) {
    case "sm":
      dialogSize = "w-[100vw] sm:max-w-[35%]";
      break;
    case "md":
      dialogSize = "w-[100vw] sm:max-w-[50%]";
      break;
    case "lg":
      dialogSize = "w-[100vw] sm:max-w-[70%]";
      break;
    case "xl":
      dialogSize = "w-[100vw] sm:max-w-[90%]";
      break;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "min-h-96 max-h-[calc(100vh-4rem)]",
          className,
          dialogSize
        )}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(100vh-10rem)] py-'>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWindow;
