import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
