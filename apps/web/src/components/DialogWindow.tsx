"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Loading from "./Loading";

/**
 * heightMode options:
 * - 'auto': Height adjusts to content, no minimum (default behavior)
 * - 'fixed': Uses a fixed height based on size (consistent height regardless of content)
 * - 'full': Takes full available viewport height
 */
type HeightMode = "auto" | "fixed" | "full";

interface Props {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  title?: string;
  size: "sm" | "md" | "lg" | "xl" | "full";
  description?: string;
  /**
   * @deprecated Use `heightMode` instead. This prop will be removed in future versions.
   */
  heightFull?: boolean;
  /**
   * Controls dialog height behavior:
   * - 'auto': Adjusts to content (may shrink with less content)
   * - 'fixed': Fixed height based on dialog size (consistent height)
   * - 'full': Full viewport height
   */
  heightMode?: HeightMode;
  isLoading?: boolean;
}

const DialogWindow = ({
  children,
  open,
  setOpen,
  className,
  title,
  description,
  size,
  heightFull,
  heightMode = "auto",
  isLoading,
}: Props) => {
  // Handle legacy heightFull prop
  const effectiveHeightMode: HeightMode = heightFull ? "full" : heightMode;

  // Width classes based on size
  const widthClasses: Record<typeof size, string> = {
    sm: "w-[100vw] sm:max-w-[525px]",
    md: "w-[100vw] sm:max-w-[700px]",
    lg: "w-[100vw] sm:max-w-[900px]",
    xl: "w-[100vw] sm:max-w-[1100px]",
    full: "w-[calc(100vw-4rem)] max-w-none sm:max-w-none",
  };

  // Fixed height classes based on size (used when heightMode is 'fixed')
  const fixedHeightClasses: Record<typeof size, string> = {
    sm: "h-[400px]",
    md: "h-[500px]",
    lg: "h-[600px]",
    xl: "h-[700px]",
    full: "h-[calc(100vh-4rem)]",
  };

  // Height classes based on heightMode
  const getHeightClasses = (): string => {
    switch (effectiveHeightMode) {
      case "full":
        return "h-[calc(100vh-4rem)]";
      case "fixed":
        return fixedHeightClasses[size];
      case "auto":
      default:
        return "";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          // Base styles
          "flex flex-col gap-0",
          // Max height constraint (always applied)
          "max-h-[calc(100vh-4rem)]",
          // Width based on size
          widthClasses[size],
          // Height based on mode
          getHeightClasses(),
          // Custom className
          className
        )}>
        {/* Header - Fixed, never scrolls */}
        {(title || description) && (
          <DialogHeader className='shrink-0 pb-4'>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content area - Scrollable when needed */}
        <div
          className={cn(
            "flex-1 min-h-0",
            // Only add overflow for scrolling when content exceeds available space
            "overflow-y-auto overflow-x-hidden",
            // Negative margin to extend scroll area edge-to-edge, then add padding back
            "-mx-6 px-6",
            // Add some bottom padding for breathing room
            "pb-1"
          )}>
          {isLoading ? (
            <div className='h-full flex items-center justify-center min-h-[200px]'>
              <Loading />
            </div>
          ) : (
            <div>{children}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWindow;
