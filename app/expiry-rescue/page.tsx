'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  MetricCard,
  SimulatedDataBanner,
} from '@/components/ui/ReusableBadges';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';

export default function ExpiryRescuePage() {
  const { expiryRescues, approveExpiryRescue, batchesRescued, estimatedValueSavedInr } = useApp();
  const [selectedRescueId, setSelectedRescueId] = useState<string>('EXP-2026-018');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedRescue = expiryRescues.find((r) => r.id === selectedRescueId) || expiryRescues[0];

  const handleApprove = (rescueId: string) => {
    approveExpiryRescue(rescueId);
    setToastMessage('Expiry rescue transfer approved! 600 ORS sachets scheduled for dispatch to Mawana.');
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SimulatedDataBanner />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10233F] text-white px-4 py-3 rounded-xl shadow-xl border border-purple-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Zero-Waste Resilience
            </span>
            <h1 className="text-xl font-bold text-[#10233F] tracking-tight">
              Expiry Rescue Opportunity Centre
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-mono">
            Save usable medicines before they become waste.
          </p>
        </div>

        <Link
          href="/redistribution"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>View Active Transfers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <MetricCard
          title="Batches at Risk"
          value={4}
          secondaryText="Expiry window <= 60 days"
          variant="warning"
        />
        <MetricCard
          title="Demand Matches"
          value={3}
          secondaryText="Safe recipient facilities"
          variant="emerald"
        />
        <MetricCard
          title="Protected Value"
          value="₹48,600"
          secondaryText="Public funds preserved"
          variant="purple"
        />
        <MetricCard
          title="Stock-outs Prevented"
          value={2}
          secondaryText="Dual-benefit redistribution"
          variant="blue"
        />
      </div>

      {/* Visual Flow Banner */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs">
        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
          Resilience Mechanism Pipeline
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="p-2 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg font-semibold">
            1. Near-Expiry Surplus
          </span>
          <span className="text-slate-400">→</span>
          <span className="p-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg font-semibold">
            2. Demand Match (Mawana)
          </span>
          <span className="text-slate-400">→</span>
          <span className="p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-semibold">
            3. Safe Transfer (600 sachets)
          </span>
          <span className="text-slate-400">→</span>
          <span className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-bold">
            4. Wastage Avoided + Shortage Averted
          </span>
        </div>
      </div>

      {/* Main Grid: Opportunities Table + Detail Explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#10233F]">Identified Expiry Opportunities</h3>
            <span className="text-xs font-mono text-slate-400">{expiryRescues.length} candidate batches</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {expiryRescues.map((rescue) => {
              const isSelected = selectedRescueId === rescue.id;
              return (
                <div
                  key={rescue.id}
                  onClick={() => setSelectedRescueId(rescue.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-purple-50/70 border-l-4 border-l-[#7C3AED]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{rescue.medicineName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Source: <strong>{rescue.sourceFacilityName}</strong> · Batch {rescue.batchNumber}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                      {rescue.expiryDaysRemaining} days left
                    </span>
                  </div>

                  <div className="mt-2 text-xs flex items-center justify-between text-slate-600">
                    <div>
                      Match: <strong>{rescue.suggestedReceiverName}</strong> ({rescue.recommendedTransfer} {rescue.unit}s)
                    </div>
                    <div className="font-mono font-bold text-emerald-700">
                      Value: ₹{rescue.valueRecoverableInr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Match Detail Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
              Opportunity Detail: {selectedRescue.id}
            </span>
            <h3 className="text-base font-bold text-[#10233F] mt-1.5">
              {selectedRescue.sourceFacilityName} to {selectedRescue.suggestedReceiverName}
            </h3>
            <p className="text-xs text-slate-500">{selectedRescue.medicineName} · Batch {selectedRescue.batchNumber}</p>
          </div>

          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-purple-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Demand Match Rationale</span>
            </div>
            <p className="text-purple-900 leading-relaxed">
              {selectedRescue.riskExplanation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500">Available at Source:</span>
              <div className="font-bold font-mono text-slate-900">{selectedRescue.availableQuantity} {selectedRescue.unit}s</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Suggested Transfer:</span>
              <div className="font-bold font-mono text-purple-700">{selectedRescue.recommendedTransfer} {selectedRescue.unit}s</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Receiver Need:</span>
              <div className="font-bold font-mono text-slate-900">{selectedRescue.estimatedDemandBeforeExpiry} in 28d</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Wastage Avoided:</span>
              <div className="font-bold font-mono text-emerald-700">₹{selectedRescue.valueRecoverableInr.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Potential outcome */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-950">Potential Outcome:</div>
            <ul className="text-emerald-900 text-[11px] space-y-0.5 list-disc list-inside">
              <li>600 sachets used before 42-day expiry</li>
              <li>15 additional days of acute diarrhea coverage at PHC C</li>
              <li>Public health funds protected</li>
            </ul>
          </div>

          <div className="pt-2">
            {selectedRescue.status === 'Approved' ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Rescue Transfer Approved &amp; Queued</span>
              </div>
            ) : (
              <button
                onClick={() => handleApprove(selectedRescue.id)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Approve Expiry Rescue Transfer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
