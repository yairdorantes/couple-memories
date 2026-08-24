import { useEffect, useState } from "react";
import { ApiError } from "./client";

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debouncedValue;
}

export function getFriendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return "Could not connect to the server. Please try again.";
    }
    return "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
