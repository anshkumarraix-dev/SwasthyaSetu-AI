'use client';

import React from 'react';
import { ShieldCheck, Search, Boxes, Sparkles, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  variant?: 'normal' | 'search' | 'success';
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: CustomIcon,
  variant = 'normal',
  className = '',
}: EmptyStateProps) {
  const Icon = CustomIcon || (variant === 'search' ? Search : variant === 'success' ? ShieldCheck : Boxes);

  return (
    <div
      className={`p-8 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3.5">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
