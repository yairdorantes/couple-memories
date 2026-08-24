import { useState, type ReactNode } from "react";
import { ToastContext, type ToastTone } from "./toastContext";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, tone: ToastTone = "info") {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 3200);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className='toast-region' aria-live='polite' aria-atomic='true'>
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.tone}`} key={toast.id}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
