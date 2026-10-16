import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ type = "info", title, description, duration = 2500 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

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
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <div
              key={toast.id}
              role="alert"
              className={cn(
                "relative overflow-hidden rounded-xl border bg-white p-3.5 shadow-xl transition-all pointer-events-auto duration-200 animate-in fade-in-0 slide-in-from-top-3 flex items-start gap-3",
                isSuccess && "border-emerald-200 shadow-emerald-900/5",
                isError && "border-rose-200 shadow-rose-900/5",
                !isSuccess && !isError && "border-slate-200 shadow-slate-900/5"
              )}
            >
              {/* Type Icon Badge */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  isSuccess && "bg-emerald-50 border-emerald-200/80 text-emerald-600",
                  isError && "bg-rose-50 border-rose-200/80 text-rose-600",
                  !isSuccess && !isError && "bg-slate-50 border-slate-200/80 text-slate-600"
                )}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isError ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug break-words">
                    {toast.description}
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Progress Countdown Bar */}
              {toast.duration && toast.duration > 0 && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5 origin-left",
                    isSuccess && "bg-emerald-500",
                    isError && "bg-rose-500",
                    !isSuccess && !isError && "bg-slate-500"
                  )}
                  style={{
                    animation: `toast-progress ${toast.duration}ms linear forwards`,
                  }}
                />
              )}
            </div>
          );
        })}
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

