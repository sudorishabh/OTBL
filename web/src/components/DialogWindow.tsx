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
interface Props {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  title?: string;
  description?: string;
}

const DialogWindow = ({
  children,
  open,
  setOpen,
  className,
  title,
  description,
}: Props) => {
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className='h-[calc(100vh-15rem)] my-2 py-2'>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWindow;
