"use client";

import { useEffect } from "react";

export default function ForceLightMode() {
  useEffect(() => {
    const root = document.documentElement;

    const enforce = () => {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    };

    enforce();

    const observer = new MutationObserver(enforce);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return null;
}

