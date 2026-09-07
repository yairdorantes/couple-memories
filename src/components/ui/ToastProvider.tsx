import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { ToastContext, type ToastTone } from "./toastContext";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);

  function dismissToast(id: number) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }

  function showToast(message: string, tone: ToastTone = "info") {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, message, tone }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3200);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className='toast-region' aria-live='polite' aria-atomic='true'>
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.tone}`} key={toast.id}>
            <span>{toast.message}</span>
            <button type='button' onClick={() => dismissToast(toast.id)} aria-label={t("toast.dismiss")}>
              <X aria-hidden='true' />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
