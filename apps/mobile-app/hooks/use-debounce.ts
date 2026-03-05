import { useEffect, useState } from "react";

/**
 * Debounce a value — useful for search inputs
 * Delays updating the returned value until after `delay` ms have
 * passed since the last time the input `value` changed.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
