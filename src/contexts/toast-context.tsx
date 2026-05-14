import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: string; title: string; description?: string; variant?: "default" | "destructive" };
type ToastContextValue = { toast: (toast: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((payload: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { ...payload, id }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(380px,calc(100vw-2rem))] gap-3">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className={`glass-panel rounded-xl border p-4 ${item.variant === "destructive" ? "border-destructive/20 bg-destructive/5" : "border-border bg-background/60"}`}
            >
              <div className="flex gap-3">
                {item.variant === "destructive" ? (
                  <X className="mt-0.5 h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
