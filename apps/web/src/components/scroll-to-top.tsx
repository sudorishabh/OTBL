"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  threshold?: number;
  className?: string;
}

const ScrollToTop = ({ threshold = 300, className }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "w-12 h-12 rounded-full",
        "bg-emerald-600 text-white",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-in-out",
        "hover:bg-emerald-700 hover:scale-110",
        "active:scale-95",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
      aria-label='Scroll to top'
      title='Scroll to top'>
      <ArrowUp className='w-5 h-5' />
    </button>
  );
};

export default ScrollToTop;
