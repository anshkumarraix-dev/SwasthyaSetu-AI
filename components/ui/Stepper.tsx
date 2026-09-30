'use client';

import React from 'react';
import { Check, Clock, ShieldCheck, Truck, PackageCheck } from 'lucide-react';

interface StepperProps {
  currentStep: number; // 1, 2, 3
  steps?: { title: string; subtitle?: string }[];
  className?: string;
}

export function Stepper({
  currentStep = 2,
  steps = [
    { title: '1. Select & Match', subtitle: 'Identify shortage & safe donor facility' },
    { title: '2. Verify Buffer', subtitle: 'Confirm donor retains >=14 days safe buffer' },
    { title: '3. Approve & Sign', subtitle: 'District Officer cryptographic digital sign' },
  ],
  className = '',
}: StepperProps) {
  return (
    <nav aria-label="Transfer Approval Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li
              key={index}
              className={`flex-1 relative ${index < steps.length - 1 ? 'pr-4 sm:pr-8' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>

                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {step.title}
                  </div>
                  {step.subtitle && (
                    <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                      {step.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-3.5 left-auto right-4 w-[calc(100%-80px)] h-0.5 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Lifecycle Status Timeline component
interface TimelineProps {
  status: 'Awaiting District Approval' | 'Approved' | 'In Transit' | 'Completed' | 'Rejected';
  requestedAt?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  className?: string;
}

export function StatusTimeline({
  status,
  requestedAt = '29 Sep 09:30',
  approvedAt = '29 Sep 10:15',
  dispatchedAt = '29 Sep 11:00',
  receivedAt = '29 Sep 11:35',
  className = '',
}: TimelineProps) {
  const steps = [
    { label: 'Requested', time: requestedAt, icon: Clock, isDone: true },
    {
      label: 'Approved',
      time: approvedAt,
      icon: ShieldCheck,
      isDone: status === 'Approved' || status === 'In Transit' || status === 'Completed',
    },
    {
      label: 'In Transit',
      time: dispatchedAt,
      icon: Truck,
      isDone: status === 'In Transit' || status === 'Completed',
    },
    {
      label: 'Received',
      time: receivedAt,
      icon: PackageCheck,
      isDone: status === 'Completed',
    },
  ];

  return (
    <div className={`flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs ${className}`}>
      {steps.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center text-center relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                s.isDone
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className={`font-semibold ${s.isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {s.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{s.time}</span>
          </div>
        );
      })}
    </div>
  );
}
