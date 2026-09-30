'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Stepper, StatusTimeline } from '@/components/ui/Stepper';
import { RouteLine } from '@/components/ui/RouteLine';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustBadge } from '@/components/ui/TrustBadge';
import {
  CheckCircle,
  Truck,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Check,
  X,
  FileText,
  RotateCcw,
  Info,
} from 'lucide-react';

export default function TransfersPage() {
  const {
    transfers,
    approveTransfer,
    dispatchTransfer,
    confirmReceipt,
    rejectTransfer,
    currentRole,
    resetDemoData,
    addToast,
  } = useApp();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const transfer = transfers.find((t) => t.id === 'TR-2026-0042') || transfers[0];

  const handleApprove = () => {
    approveTransfer(transfer.id);
    addToast(
      'Transfer Approved by District Officer',
      'Consignment authorized under digital key. Queued for warehouse dispatch.',
      'success'
    );
  };

  const handleDispatch = () => {
    dispatchTransfer(transfer.id);
    addToast(
      'Consignment Dispatched',
      'Vehicle UP-15-BT-4491 in transit. Driver Suresh Kumar en route.',
      'info'
    );
  };

  const handleReceipt = () => {
    confirmReceipt(transfer.id);
    addToast(
      'Stock Received & Replenished',
      'PHC B stock restored to 620 tablets (15.5 days). Status upgraded to Safe.',
      'success'
    );
  };

  // Determine current stepper index
  const currentStep =
    transfer.status === 'Completed'
      ? 3
      : transfer.status === 'In Transit' || transfer.status === 'Approved'
      ? 3
      : 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              TR-2026-0042
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Medicine Redistribution Protocol
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Inter-facility balancing · Source-buffer protection · Chain-of-custody audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <Link
            href="/impact-audit"
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors"
          >
            <span>View Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Step Stepper Component */}
      <div className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <Stepper currentStep={currentStep} />
      </div>

      {/* Status Timeline */}
      <StatusTimeline status={transfer.status} />

      {/* Split Grid: Details & Corridor (Left) + Officer Action (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Route & Comparison */}
        <div className="lg:col-span-7 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Decision Summary &amp; Transit Logistics
              </h2>
              <p className="text-xs text-slate-500">
                Facility pairing calculated using safe surplus reserves and travel duration
              </p>
            </div>
            <StatusBadge status={transfer.status} size="sm" />
          </div>

          {/* Transit Corridor Visual Component */}
          <RouteLine
            sourceName="PHC A"
            sourceCode="Meerut North"
            destName="PHC B"
            destCode="Meerut Rural"
            distanceKm={transfer.distanceKm}
            durationMins={transfer.travelTimeMins}
            vehicleNumber="UP-15-BT-4491"
            driverName="Suresh Kumar"
            status={
              transfer.status === 'Completed'
                ? 'Completed'
                : transfer.status === 'In Transit'
                ? 'In Transit'
                : 'Proposed'
            }
          />

          {/* Source & Destination Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Source */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Source Facility (Donor)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {transfer.sourceFacilityName}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Batch: {transfer.batchNumber} · Expiry: July 2028
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Stock Before:</span>
                  <span className="font-mono font-bold">{transfer.sourceStockBefore} tab</span>
                </div>
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Dispatched:</span>
                  <span className="font-mono font-bold">-{transfer.quantity} tab</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Retained Buffer:</span>
                  <span className="font-mono">{transfer.sourceBufferDaysAfter} days safe reserve</span>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-2">
              <div className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                Destination Facility (Recipient)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {transfer.destinationFacilityName}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
                Critical stockout in 3 days without rebalance
              </div>

              <div className="pt-2 border-t border-red-200 dark:border-red-800/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Current Stock:</span>
                  <span className="font-mono font-bold text-red-600">{transfer.destinationStockBefore} tab</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Incoming Stock:</span>
                  <span className="font-mono font-bold">+{transfer.quantity} tab</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 dark:text-blue-400 pt-1 border-t border-red-200 dark:border-red-800">
                  <span>Coverage After Receipt:</span>
                  <span className="font-mono">15.5 days (620 tab)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alternatives Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Evaluated Alternate Donor Facilities
            </h3>
            <div className="space-y-1.5 text-xs">
              {transfer.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{alt.facilityName}</span>
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>{alt.distanceKm} km</span>
                    <span>Surplus: {alt.surplus} tab</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Fit: {alt.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Safety Gate & Lifecycle Execution */}
        <div className="lg:col-span-5 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Safety Verification &amp; Authorization Gate
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic constraint checks must pass before state dispatch
            </p>
          </div>

          {/* Safety Check Items */}
          <div className="space-y-2 text-xs">
            {[
              {
                check: 'Source Buffer Threshold (≥14 days)',
                details: `Source ${transfer.sourceFacilityName} retains ${transfer.sourceStockAfter} units (${transfer.sourceBufferDaysAfter} days buffer), safely exceeding minimum 14-day policy.`,
              },
              {
                check: 'Transit Corridor & Vehicle Feasibility',
                details: `${transfer.transportMode} · ${transfer.distanceKm} km · ${transfer.travelTimeMins} mins estimated corridor delivery.`,
              },
              {
                check: 'Cryptographic Audit Trail Pre-Check',
                details: 'Deterministic ledger hash will record approving officer signature and physical batch dispatch.',
              },
            ].map((sc, i) => (
              <div
                key={i}
                className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-950 dark:text-emerald-200">{sc.check}</div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">{sc.details}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            {transfer.status === 'Awaiting District Approval' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize &amp; Sign Transfer (Dr. Aditi Sharma)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  className="w-full py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition-colors cursor-pointer"
                >
                  Decline Recommendation
                </button>
              </div>
            )}

            {transfer.status === 'Approved' && (
              <button
                type="button"
                onClick={handleDispatch}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch Consignment (Vehicle UP-15-BT-4491)</span>
              </button>
            )}

            {transfer.status === 'In Transit' && (
              <button
                type="button"
                onClick={handleReceipt}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Confirm Delivery at PHC B (Dr. Manoj Patel)</span>
              </button>
            )}

            {transfer.status === 'Completed' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-800 dark:text-emerald-300 font-semibold space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Redistribution Protocol Completed</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-normal">
                  All 500 tablets verified and placed into active dispensary inventory.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#162238] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Decline Redistribution Recommendation
            </h3>
            <p className="text-xs text-slate-500">
              Provide an official clinical or logistical reason. This justification is permanently recorded in the immutable audit trail.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. State depot consignment already arriving today"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  rejectTransfer(transfer.id, rejectReason);
                  setRejectModalOpen(false);
                  addToast('Transfer Declined', 'Audit log updated with officer reason', 'info');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
