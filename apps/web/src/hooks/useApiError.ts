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
  /**
   * Show a toast notification with the error message
   * @default true
   */
  showToast?: boolean;

  /**
   * Custom handler for validation errors
   * Returns field errors as a record
   */
  onValidationError?: (fieldErrors: Record<string, string>) => void;

  /**
   * Custom handler for authentication errors
   * Called when the error indicates the user needs to re-authenticate
   */
  onAuthError?: () => void;

  /**
   * Custom handler for network errors
   */
  onNetworkError?: () => void;

  /**
   * Generic error handler called for all errors
   */
  onError?: (error: ParsedApiError) => void;

  /**
   * Custom toast message (overrides the error's userMessage)
   */
  customMessage?: string;
}

/**
 * Hook for handling API errors consistently throughout the application
 *
 * @example
 * ```tsx
 * const { handleError, handleMutationError } = useApiError();
 *
 * const mutation = trpc.user.create.useMutation({
 *   onError: handleMutationError,
 *   // OR with options:
 *   onError: handleMutationError({
 *     showToast: true,
 *     onValidationError: (fieldErrors) => {
 *       setErrors(fieldErrors);
 *     },
 *   }),
 * });
 *
 * // Or manually handle errors
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const parsed = handleError(error);
 *   // parsed contains structured error info
 * }
 * ```
 */
export function useApiError(defaultOptions?: UseApiErrorOptions) {
  /**
   * Parse and handle an error, returning the parsed error object
   */
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

  /**
   * Create an error handler function for use with tRPC mutation onError callbacks
   * Can be called with or without options
   */
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
