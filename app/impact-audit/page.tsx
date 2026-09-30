'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  MetricCard,
  RiskStatusBadge,
  SimulatedDataBanner,
} from '@/components/ui/ReusableBadges';
import {
  FileCheck2,
  Filter,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Search,
} from 'lucide-react';

function ImpactAuditContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'impact' ? 'impact' : 'audit';

  const {
    auditLogs,
    stockOutsPrevented,
    batchesRescued,
    estimatedValueSavedInr,
    resetDemoData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'audit' | 'impact'>(initialTab);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesRole = roleFilter === 'ALL' || log.role === roleFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.record.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SimulatedDataBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Reporting &amp; Accountability
            </span>
            <h1 className="text-xl font-bold text-[#10233F] tracking-tight">
              Impact Analytics &amp; District Audit Trail
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-mono">
            Cryptographic-style audit records of every AI recommendation, human approval, vehicle dispatch, and stock receipt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'audit' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Audit Trail
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'impact' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Impact Metrics
            </button>
          </div>

          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Ledger</span>
          </button>
        </div>
      </div>

      {/* Six Key Impact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Stock-outs Averted"
          value={stockOutsPrevented}
          secondaryText="Zero stock averted"
          variant="emerald"
        />
        <MetricCard
          title="Batches Rescued"
          value={batchesRescued}
          secondaryText="Near-expiry redistributed"
          variant="purple"
        />
        <MetricCard
          title="Public Value Rescued"
          value={`₹${(estimatedValueSavedInr / 1000).toFixed(1)}k`}
          secondaryText="Medicine losses avoided"
          variant="emerald"
        />
        <MetricCard
          title="Avg Response Time"
          value="3.8 hrs"
          secondaryText="Detection to delivery"
          variant="default"
        />
        <MetricCard
          title="Forecast Precision"
          value="84%"
          secondaryText="7-day demand model"
          variant="default"
        />
        <MetricCard
          title="Reporting Compliance"
          value="17 / 20"
          secondaryText="Facilities updated < 2h"
          variant="emerald"
        />
      </div>

      {activeTab === 'impact' ? (
        /* Impact Visual Analytics Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#10233F] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Cumulative Shortages Prevented Over 30 Days</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparing autonomous early warning &amp; redistribution vs standard static inventory cycles.
            </p>

            <div className="h-44 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-end justify-between gap-3 pt-6">
              {[
                { week: 'Week 1', prevented: 3, value: '₹22,000' },
                { week: 'Week 2', prevented: 6, value: '₹48,000' },
                { week: 'Week 3', prevented: 9, value: '₹84,000' },
                { week: 'Week 4 (Current)', prevented: 12, value: '₹124,000' },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${(item.prevented / 12) * 100}%` }}
                    className="w-full max-w-[36px] bg-emerald-600 rounded-t-md relative group flex justify-center"
                  >
                    <div className="absolute -top-7 text-[10px] font-mono font-bold text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600">{item.week}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#10233F] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Data Trust Score Distribution across 20 PHCs</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enforcing high-trust reporting to prevent erroneous stock reallocations.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Reliable (Score 85–100):</span>
                  <span className="font-bold text-emerald-700">14 Facilities (70%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Usable with caution (Score 65–84):</span>
                  <span className="font-bold text-amber-700">5 Facilities (25%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Unreliable / Verification Required (&lt; 40):</span>
                  <span className="font-bold text-red-700">1 Facility (PHC H · 5%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Immutable Audit Ledger Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#10233F] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Immutable District Audit Ledger</span>
            </h3>
            <p className="text-xs text-slate-500">
              Filter by operational role or search records to inspect decision provenance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search records, facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-800"
            >
              <option value="ALL">All Roles</option>
              <option value="DISTRICT_OFFICER">District Officer</option>
              <option value="PHC_STAFF">PHC Staff</option>
              <option value="WAREHOUSE_OFFICER">Warehouse Officer</option>
              <option value="STATE_VIEWER">System Engine</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor &amp; Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Facility / Scope</th>
                <th className="py-2.5 px-3">Record Identifier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{log.actor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {log.facility}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-blue-600 whitespace-nowrap">
                    {log.record}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        log.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'Flagged'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ImpactAuditPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Impact & Audit Ledger...</div>}>
      <ImpactAuditContent />
    </Suspense>
  );
}
