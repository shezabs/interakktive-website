'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (tone: ToastTone, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

const TONE_STYLES: Record<ToastTone, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  success: { bg: 'bg-teal-500/10',  border: 'border-teal-500/30',  text: 'text-teal-400',  icon: CheckCircle2 },
  error:   { bg: 'bg-red-500/10',   border: 'border-red-500/30',   text: 'text-red-400',   icon: XCircle },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle },
  info:    { bg: 'bg-sky-500/10',   border: 'border-sky-500/30',   text: 'text-sky-400',   icon: Info },
};

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = ++toastIdCounter;
    const toast: Toast = { id, tone, title, description };
    setToasts((prev) => [...prev, toast]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => dismissToast(id), 5000);
  }, [dismissToast]);

  const value: ToastContextValue = {
    showToast,
    success: (t, d) => showToast('success', t, d),
    error:   (t, d) => showToast('error', t, d),
    warning: (t, d) => showToast('warning', t, d),
    info:    (t, d) => showToast('info', t, d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — top-right, stacks */}
      <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const { bg, border, text, icon: Icon } = TONE_STYLES[t.tone];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={`pointer-events-auto w-80 rounded-lg ${bg} ${border} border shadow-lg backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3 p-3">
                  <Icon className={`w-5 h-5 ${text} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    {t.description && <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>}
                  </div>
                  <button
                    onClick={() => dismissToast(t.id)}
                    className="text-gray-500 hover:text-white transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
