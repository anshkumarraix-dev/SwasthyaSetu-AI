'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, AlertCircle, FileCheck, Check } from 'lucide-react';
import { ActionCardData } from './ActionCard';

interface ConfirmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actionItem: ActionCardData | null;
  onConfirm: (item: ActionCardData, auditNote: string) => void;
  officerRoleName?: string;
}

export function ConfirmDrawer({
  isOpen,
  onClose,
  actionItem,
  onConfirm,
  officerRoleName = 'Dr. Aditi Sharma (District Health Officer)',
}: ConfirmDrawerProps) {
  const [auditNote, setAuditNote] = useState(
    'Approved based on 5-day fever surge signal and verified 21-day source buffer at PHC A.'
  );
  const [digitalSignChecked, setDigitalSignChecked] = useState(true);

  if (!isOpen || !actionItem) return null;

  const quantity = actionItem.transferQuantity || 500;
  const sourceName = actionItem.sourceFacilityName || 'PHC A (Meerut North)';
  const destName = actionItem.facility;

  // Source stock before and after
  const sourceStockBefore = 2400;
  const sourceStockAfter = sourceStockBefore - quantity; // 1,900 tablets (21 days)

  // Destination stock before and after
  const destStockBefore = 120;
  const destStockAfter = destStockBefore + quantity; // 620 tablets (15.5 days)

  const handleApprove = () => {
    onConfirm(actionItem, auditNote);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-drawer-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#162238] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Official Authorization
              </span>
              <span className="text-xs text-slate-500 font-mono">TR-2026-0042</span>
            </div>
            <h2 id="confirm-drawer-title" className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Authorize Inter-Facility Medicine Redistribution
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            aria-label="Close confirmation dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Medicine & Quantity Card */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">Resource to Dispatch</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {actionItem.medicineName || 'Paracetamol 500 mg tablets'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Standard strip pack (10x10) · Batch PCT-621</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono tabular-nums">
                {quantity}
              </div>
              <div className="text-xs text-slate-500">tablets</div>
            </div>
          </div>

          {/* Before & After Stock Preview Side-by-Side */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Before & After Facility Stock Balance</span>
              <span className="text-[11px] text-slate-400 font-normal">Calculated with 14-day government baseline</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Source Facility (PHC A) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  Source: {sourceName}
                </div>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Current Stock:</span>
                    <span className="font-mono tabular-nums font-semibold">{sourceStockBefore} tab</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-semibold">
                    <span>Dispatched:</span>
                    <span className="font-mono tabular-nums">-{quantity} tab</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Retained Buffer:</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {sourceStockAfter} tab (21d)
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Facility (PHC B) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  Target: {destName}
                </div>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Current Stock:</span>
                    <span className="font-mono tabular-nums font-semibold text-red-600">{destStockBefore} tab (3d)</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Incoming:</span>
                    <span className="font-mono tabular-nums">+{quantity} tab</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Post-Arrival:</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {destStockAfter} tab (15.5d)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transit Logistics Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Transit & Logistics Assignment</div>
            <div className="flex justify-between">
              <span>Corridor:</span>
              <span className="font-medium">NH-58 Bypass · 12 km (approx. 35 mins transit)</span>
            </div>
            <div className="flex justify-between">
              <span>Assigned Vehicle:</span>
              <span className="font-mono font-medium">UP-15-BT-4491 (Emergency Transit Van)</span>
            </div>
            <div className="flex justify-between">
              <span>Transit OTP Gate:</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400">482910</span>
            </div>
          </div>

          {/* Officer Mandatory Audit Note */}
          <div className="space-y-1.5">
            <label htmlFor="audit-note-field" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Officer Audit Note & Operational Justification (Required)
            </label>
            <textarea
              id="audit-note-field"
              rows={3}
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="State clinical and operational reason for approving this medicine transfer..."
            />
            <p className="text-[11px] text-slate-400">
              This note is permanently recorded in the district immutable audit log under your digital signature.
            </p>
          </div>

          {/* Digital Signature Hash Confirmation */}
          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 cursor-pointer">
            <input
              type="checkbox"
              checked={digitalSignChecked}
              onChange={(e) => setDigitalSignChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                Authorize with Digital Credential
              </span>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Signer: {officerRoleName} (ID: DHO-MEERUT-2026)
              </div>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!digitalSignChecked || !auditNote.trim()}
            onClick={handleApprove}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign & Authorize Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
