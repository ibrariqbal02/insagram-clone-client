import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, X, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastKind, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
};

const STYLES: Record<ToastKind, string> = {
  success: "bg-brand-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-900 text-white dark:bg-neutral-800",
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, message, kind }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-6 z-[100] flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind];

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg text-sm font-medium w-full ${STYLES[toast.kind]}`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="min-w-0">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
