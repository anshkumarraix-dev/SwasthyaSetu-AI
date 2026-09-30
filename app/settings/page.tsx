'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { SimulatedDataBanner } from '@/components/ui/ReusableBadges';
import {
  Settings,
  Bell,
  Sliders,
  Database,
  RotateCcw,
  CheckCircle,
  Globe,
  Shield,
  HelpCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { resetDemoData, currentRole } = useApp();
  const [criticalDaysThreshold, setCriticalDaysThreshold] = useState<number>(3);
  const [expiryDaysThreshold, setExpiryDaysThreshold] = useState<number>(60);
  const [autoEmailDistrictOfficer, setAutoEmailDistrictOfficer] = useState<boolean>(true);
  const [allowVoiceHindi, setAllowVoiceHindi] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage('Thresholds and configuration preferences updated.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    resetDemoData();
    setToastMessage('Demo state reset to initial factory values.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SimulatedDataBanner />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              System Configuration
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Settings & Operational Parameters
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure risk classification thresholds, Data Trust Score weights, language assistants, and demo lifecycle state.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo State</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Shortage Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Resilience Alert Thresholds</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Critical Shortage Threshold:</span>
                <strong className="text-rose-600">{criticalDaysThreshold} days remaining</strong>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={criticalDaysThreshold}
                onChange={(e) => setCriticalDaysThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600"
              />
              <span className="text-[11px] text-slate-500">
                Facilities with consumption buffer under this threshold immediately trigger priority alerts and redistribution matching.
              </span>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Expiry Rescue Window:</span>
                <strong className="text-purple-600">{expiryDaysThreshold} days to expiry</strong>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={expiryDaysThreshold}
                onChange={(e) => setExpiryDaysThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600"
              />
              <span className="text-[11px] text-slate-500">
                Batches with remaining shelf-life below this number will be flagged for matching against high-consumption candidate facilities.
              </span>
            </div>
          </div>
        </div>

        {/* Data Trust Score Engine Formulation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Data Trust Score Weights (Constitutional Formula)</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Data Freshness (&lt; 2h reporting)</span>
              <strong className="font-mono text-slate-900">30% weight</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Reporting Completeness (Beds, Staff, OPD)</span>
              <strong className="font-mono text-slate-900">25% weight</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Physical Verification logged by Staff today</span>
              <strong className="font-mono text-slate-900">20% weight</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Historical Trend & Variance Consistency</span>
              <strong className="font-mono text-slate-900">15% weight</strong>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <span>Direct Cold-Chain & Battery Sync Status</span>
              <strong className="font-mono text-slate-900">10% weight</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
            Facilities scoring <strong>under 40/100</strong> are automatically locked from algorithmic redistribution recommendations until physical stock counts are logged.
          </div>
        </div>

        {/* Assistant & Language Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Gemini Multilingual Voice & Field Entry</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700">Enable Hindi & Hinglish Speech Extraction</span>
              <input
                type="checkbox"
                checked={allowVoiceHindi}
                onChange={(e) => setAllowVoiceHindi(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700">Automated Notification to District Officer</span>
              <input
                type="checkbox"
                checked={autoEmailDistrictOfficer}
                onChange={(e) => setAutoEmailDistrictOfficer(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Save Configuration Changes
          </button>
        </div>

        {/* Hackathon Demo Governance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Hackathon Prototype Compliance Notice</span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            SwasthyaSetu AI is configured for the <strong>Smart Health & Supply Chain Resilience</strong> hackathon theme.
          </p>

          <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
            <li>Zero individual patient medical or ABHA identifiers are recorded.</li>
            <li>All AI recommendations require explicit human sign-off from an authorized officer.</li>
            <li>All 20 facilities in Meerut and Baghpat operate on reproducible deterministic operational data.</li>
          </ul>

          <div className="pt-2 text-slate-400 font-mono text-[11px]">
            Current Session Role: {currentRole} · Platform ID: 0e1f1fa7-8ef0-489c-ae67-147538cad655
          </div>
        </div>
      </div>
    </div>
  );
}
