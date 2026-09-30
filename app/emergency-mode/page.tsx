'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Flame,
  AlertTriangle,
  Sliders,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Check,
  Building2,
  X,
  Truck,
  Activity,
  Bed,
  Wind,
  ShieldCheck,
} from 'lucide-react';

export default function EmergencyModePage() {
  const {
    emergencyState,
    activateEmergencyMode,
    deactivateEmergencyMode,
    approveTransfer,
    transfers,
    addToast,
  } = useApp();

  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<typeof emergencyState.scenarioType>('Fever/Dengue surge');
  const [selectedDuration, setSelectedDuration] = useState(14);
  const [whatIfSurgeMultiplier, setWhatIfSurgeMultiplier] = useState(40); // default +40%
  const [escalated, setEscalated] = useState(false);

  // Active elapsed timer
  const [elapsedMinutes, setElapsedMinutes] = useState(102); // 1h 42m

  useEffect(() => {
    if (!emergencyState.isActive) return;
    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [emergencyState.isActive]);

  const formatElapsed = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Simulated outcomes
  const phcBStockoutDays = Math.max(1, Math.round(3 - (whatIfSurgeMultiplier / 40) * 1.5));
  const projectedBedOccupancy = Math.min(100, Math.round(72 + whatIfSurgeMultiplier * 0.35));

  const handleCompleteActivation = () => {
    activateEmergencyMode(selectedIncident, selectedDuration);
    setIsActivationModalOpen(false);
    addToast('Emergency Protocol Activated', `Protocol level 3 initiated for ${selectedIncident}`, 'error');
  };

  const handleDeactivate = () => {
    deactivateEmergencyMode();
    setIsDeactivateModalOpen(false);
    addToast('Emergency Protocol Stand-Down', 'District returned to standard baseline operations', 'info');
  };

  const handleEscalateDepot = () => {
    setEscalated(true);
    addToast(
      'Warehouse Depot Escalation Triggered',
      'Central reserve stock dispatch requested for Meerut rural belt',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Visually Distinct Red-Tinted Header with Active Pulse */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          emergencyState.isActive
            ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-[#162238] border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              {emergencyState.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-xs animate-pulse">
                  <Flame className="w-4 h-4" />
                  <span>EMERGENCY ACTIVE · LEVEL 3</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  <span>Standby Mode</span>
                </span>
              )}

              {emergencyState.isActive && (
                <span className="text-xs font-mono text-red-900 dark:text-red-200 font-bold flex items-center gap-1 bg-red-100 dark:bg-red-900/60 px-2.5 py-0.5 rounded border border-red-200 dark:border-red-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Active for {formatElapsed(elapsedMinutes)}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              {emergencyState.isActive
                ? `Incident Command: ${emergencyState.scenarioType}`
                : 'District Outbreak & Emergency Incident Command'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Fast-tracked inter-facility allocations, clinical buffer protection, and real-time stress testing under simulated epidemic surges. Mandatory human approval enforced on every transfer.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {emergencyState.isActive ? (
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Deactivate Protocol
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Activate Emergency Protocol</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Live Critical Resource Counters */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Surge Readiness & Life-Support Reserve Telemetry
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Fever Bed Occupancy */}
          <div className="bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Fever Bed Occupancy</span>
              <Bed className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-white tabular-nums mt-1">
              78%
            </div>
            <div className="text-[11px] text-red-600 font-semibold font-mono mt-0.5">
              156 of 200 occupied · 6 referral held
            </div>
          </div>

          {/* Medical Oxygen Cylinders */}
          <div className="bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Oxygen Reserves</span>
              <Wind className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-white tabular-nums mt-1">
              92%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold font-mono mt-0.5">
              46/50 B-type cylinders full
            </div>
          </div>

          {/* Essential Paracetamol Readiness */}
          <div className="bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Paracetamol Readiness</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-white tabular-nums mt-1">
              63%
            </div>
            <div className="text-[11px] text-red-600 font-semibold font-mono mt-0.5">
              Depleted at PHC B · Transfer pending
            </div>
          </div>

          {/* IV Fluid Buffer */}
          <div className="bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">IV Saline Reserve</span>
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-sans text-slate-900 dark:text-white tabular-nums mt-1">
              55%
            </div>
            <div className="text-[11px] text-amber-600 font-semibold font-mono mt-0.5">
              Low buffer for Sardhana trauma room
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top 3 Critical Emergency Actions with One-Tap Escalation */}
      <div className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Top 3 Critical Operational Actions</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by patient mortality prevention and facility stockout lead time
            </p>
          </div>

          {/* One-Tap Escalation Button */}
          <button
            type="button"
            onClick={handleEscalateDepot}
            disabled={escalated}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              escalated
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{escalated ? 'Depot Mobilization Triggered' : 'One-Tap Warehouse Escalation'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Action 1 */}
          <div className="p-3.5 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Authorize Urgent Paracetamol Transfer (PHC A → PHC B)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  12 km arterial corridor · Prevents complete stockout at PHC B in 3 days. Preserves 21-day buffer at PHC A.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                approveTransfer('TR-2026-0042', 'Dr. Aditi Sharma (Chief Medical Officer)');
                addToast('Action Executed', 'Paracetamol transfer authorized for PHC B', 'success');
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 cursor-pointer"
            >
              Sign & Approve
            </button>
          </div>

          {/* Action 2 */}
          <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Pre-Position 600 ORS Sachets (PHC E → PHC C)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Rescues near-expiry batch ORS-221 (42 days left) and prevents diarrhea ward stockout at Mawana.
                </p>
              </div>
            </div>
            <Link
              href="/expiry-rescue"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 text-center"
            >
              Authorize Rescue
            </Link>
          </div>

          {/* Action 3 */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Hold 6 Emergency Referral Beds at SVBP District Hospital
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Fever bed pressure at 78% · Reserves acute dengue ICU transfer beds in Meerut City.
                </p>
              </div>
            </div>
            <Link
              href="/phc-operations?tab=beds"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 text-center"
            >
              Manage Beds
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Outbreak Surge Stress-Testing What-If Simulator */}
      <div className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Outbreak Surge Stress-Testing Simulator</span>
            </h2>
            <p className="text-xs text-slate-500">
              Simulate OPD footfall acceleration (+0% to +100%) and project hospital bed saturation
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            +{whatIfSurgeMultiplier}% Demand Spike
          </span>
        </div>

        {/* Slider */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold font-mono">
            <span>Normal Baseline (0%)</span>
            <span className="text-red-600 font-bold">Simulated Outbreak Spike: +{whatIfSurgeMultiplier}%</span>
            <span>Severe Epidemic (+100%)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={whatIfSurgeMultiplier}
            onChange={(e) => setWhatIfSurgeMultiplier(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer"
            aria-label="Surge demand multiplier slider"
          />
        </div>

        {/* Projected Outcomes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
            <span className="text-red-700 dark:text-red-300 font-bold">PHC B Stockout Horizon</span>
            <div className="text-xl font-bold font-mono text-red-950 dark:text-red-100 mt-1">
              {phcBStockoutDays} {phcBStockoutDays === 1 ? 'day' : 'days'}
            </div>
            <p className="text-[11px] text-red-800 dark:text-red-300/80 mt-1">
              Without transfer, medicine exhausts in {phcBStockoutDays} days.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
            <span className="text-amber-800 dark:text-amber-300 font-bold">Projected Bed Occupancy</span>
            <div className="text-xl font-bold font-mono text-amber-950 dark:text-amber-100 mt-1">
              {projectedBedOccupancy}%
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-1">
              District capacity reaches surge limit at {projectedBedOccupancy}%.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
            <span className="text-blue-800 dark:text-blue-300 font-bold">Additional Paracetamol Needed</span>
            <div className="text-xl font-bold font-mono text-blue-950 dark:text-blue-100 mt-1">
              +{1200 + whatIfSurgeMultiplier * 20} tab
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300/80 mt-1">
              District central buffer required to cover 14 days.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl">
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">Additional ORS Sachets</span>
            <div className="text-xl font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-1">
              +{800 + whatIfSurgeMultiplier * 10} sachets
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 mt-1">
              Covered by PHC E near-expiry rescue matching.
            </p>
          </div>
        </div>
      </div>

      {/* Activation Modal */}
      {isActivationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#162238] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <Flame className="w-5 h-5" />
                <span>Initiate Outbreak Emergency Protocol</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Type / Threat Profile:
                </label>
                <select
                  value={selectedIncident}
                  onChange={(e) => setSelectedIncident(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="Fever/Dengue surge">Fever / Vector-borne Dengue Surge</option>
                  <option value="Flood or transport disruption">Flood / Waterborne Outbreak</option>
                  <option value="Diarrhoea outbreak">Gastro / Diarrhoea Outbreak</option>
                  <option value="Heatwave">Acute Heatwave Emergency</option>
                  <option value="Mass gathering">Mass Gathering / Religious Event Surge</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Protocol Duration:
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value={7}>7 Days (Rapid containment)</option>
                  <option value={14}>14 Days (Standard outbreak wave)</option>
                  <option value={21}>21 Days (Extended crisis protocol)</option>
                </select>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-800 dark:text-red-300 text-[11px] leading-relaxed">
                Activating this protocol raises district consumption forecasts by +40%, flags critical medicines for immediate inter-PHC rebalancing, and alerts the Chief Medical Officer. Mandatory human approval is retained for every physical transfer.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteActivation}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Authorize Activation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#162238] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Deactivate Emergency Protocol?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will return district consumption forecasts to baseline (0% surge multiplier) and restore standard 24-hour sync intervals.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Confirm Stand-Down
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
