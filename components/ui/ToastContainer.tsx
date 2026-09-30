'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  undoAction?: () => void;
  undoLabel?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl p-3.5 shadow-xl border border-slate-700 dark:border-slate-200 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
          >
            {isSuccess && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0 mt-0.5" />
            )}
            {isError && (
              <AlertCircle className="w-4 h-4 text-red-400 dark:text-red-600 shrink-0 mt-0.5" />
            )}
            {!isSuccess && !isError && (
              <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs">
              <div className="font-bold">{toast.title}</div>
              {toast.message && (
                <div className="opacity-80 text-[11px] mt-0.5 leading-normal">
                  {toast.message}
                </div>
              )}

              {toast.undoAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.undoAction?.();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 dark:text-amber-600 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{toast.undoLabel || 'Undo this authorization'}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
