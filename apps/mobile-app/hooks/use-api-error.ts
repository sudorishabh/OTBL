import { useCallback } from "react";
import Toast from "react-native-toast-message";

/**
 * Hook to handle tRPC/API errors consistently across the app.
 * Mirrors the web app's `useApiError` but uses react-native-toast-message.
 */
export function useApiError() {
  const handleError = useCallback(
    (error: unknown, fallbackMessage?: string) => {
      let message = fallbackMessage || "An unexpected error occurred.";

      if (error && typeof error === "object") {
        // tRPC error shape
        if ("message" in error && typeof (error as any).message === "string") {
          message = (error as any).message;
        }
        // Nested data.message
        if (
          "data" in error &&
          typeof (error as any).data === "object" &&
          (error as any).data?.message
        ) {
          message = (error as any).data.message;
        }
        // Array of errors (e.g., Zod validation)
        if ("shape" in error && (error as any).shape?.message) {
          message = (error as any).shape.message;
        }
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
        position: "top",
        visibilityTime: 4000,
      });

      console.error("[API Error]", message, error);
    },
    [],
  );

  const showSuccess = useCallback((message: string, title?: string) => {
    Toast.show({
      type: "success",
      text1: title || "Success",
      text2: message,
      position: "top",
      visibilityTime: 3000,
    });
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    Toast.show({
      type: "info",
      text1: title || "Info",
      text2: message,
      position: "top",
      visibilityTime: 3000,
    });
  }, []);

  return { handleError, showSuccess, showInfo };
}
