"use client";
import { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

const STYLES: Record<ToastType, { bar: string; icon: string; title: string }> = {
  success: {
    bar:   "bg-emerald-500",
    icon:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    title: "text-emerald-400",
  },
  error: {
    bar:   "bg-red-500",
    icon:  "bg-red-500/15 text-red-400 border-red-500/25",
    title: "text-red-400",
  },
  warning: {
    bar:   "bg-amber-500",
    icon:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
    title: "text-amber-400",
  },
  info: {
    bar:   "bg-sky-500",
    icon:  "bg-sky-500/15 text-sky-400 border-sky-500/25",
    title: "text-sky-400",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismiss(id), type === "error" ? 6000 : 4000);
    },
    [dismiss]
  );

  const success = useCallback((t: string, m?: string) => toast("success", t, m), [toast]);
  const error   = useCallback((t: string, m?: string) => toast("error",   t, m), [toast]);
  const warning = useCallback((t: string, m?: string) => toast("warning", t, m), [toast]);
  const info    = useCallback((t: string, m?: string) => toast("info",    t, m), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ── Rendered UI ──────────────────────────────────────────── */
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const s = STYLES[t.type];

  return (
    <div
      className="pointer-events-auto relative flex items-start gap-3 min-w-75 max-w-105
                 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden
                 animate-in slide-in-from-right-4 fade-in duration-300"
      style={{
        animation: "toastIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      {/* Colour bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />

      {/* Icon */}
      <div className={`mt-3.5 ml-4 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-sm font-bold ${s.icon}`}>
        {ICONS[t.type]}
      </div>

      {/* Text */}
      <div className="flex-1 py-3.5 pr-2 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${s.title}`}>{t.title}</p>
        {t.message && (
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        className="mt-3 mr-3 shrink-0 w-5 h-5 rounded flex items-center justify-center
                   text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors text-xs"
      >
        ✕
      </button>
    </div>
  );
}
