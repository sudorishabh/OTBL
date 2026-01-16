"use client";
import { useCallback } from "react";
import toast from "react-hot-toast";
import {
  parseApiError,
  getFieldErrors,
  hasValidationErrors,
  requiresReauthentication,
  type ParsedApiError,
} from "@pkg/trpc/errors";

export interface UseApiErrorOptions {
  showToast?: boolean;

  onValidationError?: (fieldErrors: Record<string, string>) => void;

  onAuthError?: () => void;

  onNetworkError?: () => void;

  onError?: (error: ParsedApiError) => void;
  customMessage?: string;
}

export function useApiError(defaultOptions?: UseApiErrorOptions) {
  const handleError = useCallback(
    (error: unknown, options?: UseApiErrorOptions): ParsedApiError => {
      const opts = { ...defaultOptions, ...options };
      const parsed = parseApiError(error);

      // Handle authentication errors
      if (requiresReauthentication(parsed)) {
        if (opts.onAuthError) {
          opts.onAuthError();
        }
        if (opts.showToast !== false) {
          toast.error(opts.customMessage || parsed.message);
        }
        return parsed;
      }

      // Handle network errors
      if (parsed.isNetworkError) {
        if (opts.onNetworkError) {
          opts.onNetworkError();
        }
        if (opts.showToast !== false) {
          toast.error(
            opts.customMessage || "Network error. Please check your connection."
          );
        }
        return parsed;
      }

      // Handle validation errors
      if (hasValidationErrors(parsed) && opts.onValidationError) {
        const fieldErrors = getFieldErrors(parsed.validationErrors);
        opts.onValidationError(fieldErrors);
      }

      // Call generic error handler
      if (opts.onError) {
        opts.onError(parsed);
      }

      // Show toast notification
      if (opts.showToast !== false) {
        toast.error(opts.customMessage || parsed.message);
      }

      return parsed;
    },
    [defaultOptions]
  );

  const handleMutationError = useCallback(
    (
      optionsOrError?: UseApiErrorOptions | unknown,
      maybeOptions?: UseApiErrorOptions
    ): ((error: unknown) => void) | void => {
      // If first argument looks like an error (has message property), handle it directly
      if (
        optionsOrError &&
        typeof optionsOrError === "object" &&
        "message" in optionsOrError
      ) {
        handleError(optionsOrError, maybeOptions);
        return;
      }

      // Otherwise, return a handler function configured with options
      return (error: unknown) => {
        handleError(error, optionsOrError as UseApiErrorOptions);
      };
    },
    [handleError]
  );

  /**
   * Create a simple error handler that just shows a toast
   */
  const createToastHandler = useCallback(
    (customMessage?: string) => {
      return (error: unknown) => {
        handleError(error, { showToast: true, customMessage });
      };
    },
    [handleError]
  );

  return {
    handleError,
    handleMutationError,
    createToastHandler,
    // Re-export utilities for convenience
    parseApiError,
    getFieldErrors,
    hasValidationErrors,
    requiresReauthentication,
  };
}

/**
 * Default export for convenience
 */
export default useApiError;
