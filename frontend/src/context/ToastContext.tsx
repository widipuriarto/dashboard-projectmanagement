import * as React from "react";
import { ToastItem, type ToastItemData, type ToastType } from "@/components/molecules/ToastItem";

export type { ToastType };

export interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItemData[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type = "info", title, description, duration = 2500 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItemData = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Toast Container placed in top right below navbar */}
      <div
        aria-live="polite"
        className="fixed top-20 md:top-24 right-4 sm:right-6 md:right-8 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-32px)] sm:w-96 pointer-events-none select-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

