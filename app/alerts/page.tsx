'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  DataTrustBadge,
  SimulatedDataBanner,
  RiskStatusBadge,
} from '@/components/ui/ReusableBadges';
import { PHC_B_CONSUMPTION_DATA } from '@/data/mockData';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  Calendar,
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

export default function ExplainableAlertPage() {
  const { alerts, transfers, approveTransfer } = useApp();
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const criticalAlert = alerts.find((a) => a.id === 'alt-paracetamol-phc-b') || alerts[0];
  const transfer = transfers.find((t) => t.id === 'TR-2026-0042') || transfers[0];

  const handleApprove = () => {
    approveTransfer(transfer.id);
    setToastMessage('Recommendation approved! Transferred to Warehouse dispatch queue.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-28">
      <SimulatedDataBanner />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#10233F] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decision Brief Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D92D20] text-white text-[11px] font-bold uppercase tracking-wider">
              Critical Risk
            </span>
            <h1 className="text-xl font-bold text-[#10233F] tracking-tight">
              Paracetamol 500 mg · PHC B (Meerut Rural)
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-mono">
            Autonomous predictive shortage alert with transparent explainability &amp; deterministic safety checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Situation Room
          </Link>
          <Link
            href="/redistribution"
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <span>Review Transfer Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="bg-red-50/70 border border-red-200 rounded-[16px] p-4.5 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px]">Stock-out Horizon</span>
            <div className="text-lg font-bold font-mono text-[#D92D20] mt-0.5">3 Days Left</div>
            <div className="text-[10px] text-red-700">02 October 2026</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Current Stock</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">120 tablets</div>
            <div className="text-[10px] text-slate-500">Bin B-04 verified</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Forecast Confidence</span>
            <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">88%</div>
            <div className="text-[10px] text-blue-600">±10% uncertainty band</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Data Trust Score</span>
            <div className="mt-0.5">
              <DataTrustBadge score={91} category="Reliable" />
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Verified today 08:15 AM</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Recommended Action</span>
            <div className="text-xs font-bold text-slate-900 mt-0.5">Transfer 500 tabs</div>
            <div className="text-[10px] text-slate-600">From PHC A (12 km away)</div>
          </div>
        </div>
      </div>

      {/* Structured Explainable Decision Brief (Sections 1-7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Narrative, Calculation & Evidence (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: What changed? */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
              1. What Changed?
            </span>
            <h3 className="text-sm font-bold text-[#10233F]">
              Fever outpatient footfall increased 46% over the last five days.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surveillance logs indicate a localized seasonal febrile surge across Meerut Block A. Outpatient volume at PHC B expanded from a baseline of 24 fever visits/day to 40 visits/day.
            </p>
          </div>

          {/* Section 2: Why does it matter? */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-wider">
              2. Why Does It Matter?
            </span>
            <h3 className="text-sm font-bold text-[#10233F]">
              Current stock covers approximately three days at the present usage rate.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Without emergency intervention or safe facility redistribution, zero inventory will be reached on <strong>02 October 2026</strong>, leaving symptomatic fever patients without primary antipyretic care.
            </p>
          </div>

          {/* Section 3: Evidence (14-day consumption chart + 7-day forecast) */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                3. Quantitative Evidence &amp; Forecast
              </span>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Dashed line = Forecast
              </span>
            </div>

            {/* Accessible screen-reader chart summary as required by constitution */}
            <div className="sr-only">
              Paracetamol consumption increased from 24 to 40 tablets per day over five days; stock-out is projected in three days.
            </div>

            {/* Consumption and Forecast Visual */}
            <div className="h-56 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-end relative">
              <div className="h-36 flex items-end justify-between gap-1.5 pt-2">
                {PHC_B_CONSUMPTION_DATA.map((d, i) => {
                  const isForecast = d.forecast !== null && d.actual === null;
                  const isDepleted = d.stockRemaining === 0;
                  const val = d.actual || d.forecast || 0;
                  const heightPct = (val / 55) * 100;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      <div className="absolute -top-9 bg-[#10233F] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 font-mono">
                        {d.date}: {val} tabs
                      </div>

                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[16px] rounded-t ${
                          isDepleted
                            ? 'bg-red-200 border-t-2 border-red-600 border-dashed'
                            : isForecast
                            ? 'bg-blue-200 border-t-2 border-blue-600 border-dashed'
                            : d.date.includes('Today')
                            ? 'bg-[#D92D20]'
                            : 'bg-blue-600'
                        }`}
                      />
                      <span className="text-[8px] text-slate-400 mt-1 truncate w-full text-center">
                        {d.date.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Zero Depletion Marker */}
              <div className="absolute right-6 bottom-14 bg-[#D92D20] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                Zero Stock Depletion: 02 Oct
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Chart summary: Paracetamol consumption increased from 24 to 40 tablets per day over five days; stock-out is projected in three days.
            </p>
          </div>

          {/* Section 4: Expandable Calculation Panel */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs">
            <button
              onClick={() => setIsCalcOpen(!isCalcOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>4. Mathematical Calculation Breakdown</span>
              </div>
              {isCalcOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isCalcOpen && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-800 animate-in fade-in">
                <div>Current Stock: 120 tablets</div>
                <div>Forecasted Daily Use: 40 tablets/day (surge baseline)</div>
                <div className="font-bold text-blue-700 pt-1 border-t border-slate-200">
                  Estimated Days Remaining: 120 ÷ 40 = 3.0 days
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommendation, Safety Checks, and Outcomes (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 5: What can we do? */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-[16px] p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
              5. Recommended Action
            </span>
            <h3 className="text-sm font-bold text-blue-950">
              Transfer 500 tablets from PHC A (Meerut North) to PHC B.
            </h3>
            <p className="text-xs text-blue-900 leading-relaxed">
              PHC A holds 1,800 tablets with safe surplus. Distance: 12 km (approx 35 minutes via arterial road). Dispatch via District Medical Vehicle UP-15-G-401.
            </p>
          </div>

          {/* Section 6: Six Deterministic Safety Checks */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
              6. Deterministic Safety Checks (All Passed)
            </span>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>PHC A retains 21-day safety buffer</strong> after transferring 500 tablets (1,300 remain).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Destination demand verified:</strong> +46% fever footfall confirmed by local clinician.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Batch expiry suitable:</strong> Batch PCT-621 expires July 2028 (670 days remaining).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Transit route available:</strong> 12 km open bypass without transport blocks.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No duplicate transfer:</strong> Zero concurrent orders active for Paracetamol at PHC B.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Source data recently updated:</strong> PHC A stock verified 12 mins ago.</span>
              </div>
            </div>
          </div>

          {/* Section 7: What happens after action? */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
              7. Post-Action Outcome Horizon
            </span>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-emerald-950">
                PHC B coverage increases to approximately 15 days.
              </div>
              <p className="text-emerald-800 text-[11px]">
                Stock expands from 120 to 620 tablets. Facility risk classification drops from Critical to Safe.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar on Desktop and Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] py-3 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#64748B] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>AI recommendation only. Final approval remains with the authorised District Health Officer.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/redistribution"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Compare Alternatives
            </Link>
            <button
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Approve Recommendation (500 Tabs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
