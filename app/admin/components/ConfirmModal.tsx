'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  // If provided, user must type this exact string to enable the confirm button
  typeToConfirm?: string;
  destructive?: boolean;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  typeToConfirm,
  destructive = false,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTyped('');
      setLoading(false);
    }
  }, [open]);

  const canConfirm = !typeToConfirm || typed === typeToConfirm;

  const handleConfirm = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {destructive && (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{message}</p>
                  </div>
                </div>

                {typeToConfirm && (
                  <div className="mt-5">
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Type <span className="font-mono font-bold text-white">{typeToConfirm}</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 p-4 bg-white/[0.02] border-t border-white/5">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canConfirm || loading}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    destructive
                      ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
                      : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  {loading ? 'Working...' : confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
