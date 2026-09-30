'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Download,
  ChevronDown,
  ChevronUp,
  LayoutList,
  SlidersHorizontal,
  Calendar,
  Layers,
} from 'lucide-react';

export default function InventoryPage() {
  const { inventoryBatches, facilities, selectedDistrict, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'AT_RISK' | 'SAFE' | 'NEAR_EXPIRY'>('ALL');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [sortBy, setSortBy] = useState<'name' | 'days' | 'risk' | 'stock'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'Paracetamol 500 mg tablets': true,
  });
  const [selectedMedicineName, setSelectedMedicineName] = useState<string | null>('Paracetamol 500 mg tablets');

  const districtFacilityIds = new Set(
    facilities.filter((f) => f.district === selectedDistrict).map((f) => f.id)
  );

  const districtBatches = inventoryBatches.filter((b) => districtFacilityIds.has(b.facilityId));

  // Aggregate medicine operational intelligence
  const medicinesSummary = [
    {
      name: 'Paracetamol 500 mg tablets',
      category: 'Essential Analgesic',
      facilitiesAtRisk: 3,
      lowestDays: 3,
      demandTrend: 'Rising (+46% fever surge)',
      expiryBatchesCount: 1,
      totalDistrictStock: 2180,
      dailyBurn: 125,
      daysCoverage: 17,
      status: 'Critical' as const,
      reorderThresholdDays: 14,
      facilityComparison: [
        { facility: 'PHC A · Meerut North', days: 21, stock: 1800, status: 'Safe' as const },
        { facility: 'PHC C · Mawana', days: 14, stock: 450, status: 'Monitoring' as const },
        { facility: 'PHC B · Meerut Rural', days: 3, stock: 120, status: 'Critical' as const },
      ],
    },
    {
      name: 'ORS sachets',
      category: 'Electrolyte / Rehydration',
      facilitiesAtRisk: 1,
      lowestDays: 5,
      demandTrend: 'High Gastro Season',
      expiryBatchesCount: 1,
      totalDistrictStock: 1420,
      dailyBurn: 69,
      daysCoverage: 20,
      status: 'Expiry Opportunity' as const,
      reorderThresholdDays: 14,
      facilityComparison: [
        { facility: 'PHC E · Kharkhoda', days: 75, stock: 900, status: 'Expiry Opportunity' as const },
        { facility: 'PHC C · Mawana', days: 5, stock: 180, status: 'High Risk' as const },
        { facility: 'PHC B · Meerut Rural', days: 13, stock: 340, status: 'Monitoring' as const },
      ],
    },
    {
      name: 'Insulin vials (40 IU/ml)',
      category: 'Cold Chain Hormone',
      facilitiesAtRisk: 2,
      lowestDays: 4,
      demandTrend: 'Stable Chronic Need',
      expiryBatchesCount: 0,
      totalDistrictStock: 152,
      dailyBurn: 7,
      daysCoverage: 21,
      status: 'High Risk' as const,
      reorderThresholdDays: 14,
      facilityComparison: [
        { facility: 'PHC A · Meerut North', days: 35, stock: 140, status: 'Safe' as const },
        { facility: 'PHC D · Sardhana', days: 4, stock: 12, status: 'High Risk' as const },
      ],
    },
    {
      name: 'Amoxicillin 500 mg capsules',
      category: 'Antibacterial',
      facilitiesAtRisk: 1,
      lowestDays: 10,
      demandTrend: 'Seasonal Flu OPD',
      expiryBatchesCount: 1,
      totalDistrictStock: 610,
      dailyBurn: 20,
      daysCoverage: 30,
      status: 'Safe' as const,
      reorderThresholdDays: 14,
      facilityComparison: [
        { facility: 'PHC G · Modipuram', days: 45, stock: 400, status: 'Safe' as const },
        { facility: 'PHC B · Meerut Rural', days: 10, stock: 210, status: 'Monitoring' as const },
      ],
    },
    {
      name: 'IV fluid bottles (Normal Saline 500ml)',
      category: 'Emergency Trauma / Dehydration',
      facilitiesAtRisk: 1,
      lowestDays: 8,
      demandTrend: 'Emergency OPD',
      expiryBatchesCount: 1,
      totalDistrictStock: 480,
      dailyBurn: 35,
      daysCoverage: 13,
      status: 'Monitoring' as const,
      reorderThresholdDays: 14,
      facilityComparison: [
        { facility: 'PHC K · Baghpat Central', days: 40, stock: 280, status: 'Safe' as const },
        { facility: 'PHC L · Baraut', days: 8, stock: 120, status: 'Monitoring' as const },
      ],
    },
  ];

  // Filtering
  const filteredMedicines = medicinesSummary.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (riskFilter === 'CRITICAL') return matchesSearch && m.status === 'Critical';
    if (riskFilter === 'AT_RISK') return matchesSearch && (m.status === 'Critical' || m.status === 'High Risk');
    if (riskFilter === 'SAFE') return matchesSearch && m.status === 'Safe';
    if (riskFilter === 'NEAR_EXPIRY') return matchesSearch && m.status === 'Expiry Opportunity';
    return matchesSearch;
  });

  // Sorting
  filteredMedicines.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'name') comp = a.name.localeCompare(b.name);
    else if (sortBy === 'days') comp = a.lowestDays - b.lowestDays;
    else if (sortBy === 'stock') comp = a.totalDistrictStock - b.totalDistrictStock;
    else if (sortBy === 'risk') comp = a.facilitiesAtRisk - b.facilitiesAtRisk;
    return sortOrder === 'asc' ? comp : -comp;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const toggleRowExpand = (medName: string) => {
    setExpandedRows((prev) => ({ ...prev, [medName]: !prev[medName] }));
  };

  const handleExportCSV = () => {
    const headers = ['Medicine', 'Category', 'Facilities_At_Risk', 'Lowest_Days_Remaining', 'District_Stock', 'Daily_Burn', 'Status'];
    const rows = filteredMedicines.map((m) => [
      `"${m.name}"`,
      `"${m.category}"`,
      m.facilitiesAtRisk,
      m.lowestDays,
      m.totalDistrictStock,
      m.dailyBurn,
      `"${m.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `swasthyasetu_inventory_${selectedDistrict.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Report Exported', 'District inventory data downloaded as CSV', 'success');
  };

  const activeIntelligence = medicinesSummary.find((m) => m.name === selectedMedicineName) || medicinesSummary[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Medicine Inventory &amp; Operational Buffers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {selectedDistrict} · 20 Primary Health Centres · Days-of-cover surveillance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/phc-operations"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <span>Log Frontline Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Chips & Density Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Medicines (5)' },
            { id: 'CRITICAL', label: 'Critical Shortage (<7d)' },
            { id: 'AT_RISK', label: 'At Risk (≤14d)' },
            { id: 'NEAR_EXPIRY', label: 'Near Expiry Rescues' },
            { id: 'SAFE', label: 'Safe Buffers (≥14d)' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setRiskFilter(chip.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                riskFilter === chip.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search & Density View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDensity('comfortable')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                density === 'comfortable' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setDensity('compact')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                density === 'compact' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Table with Days-of-Cover Bars + Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Column (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Medicine Inventory Table">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('name')}>
                    Medicine
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('days')}>
                    Days of Cover (Min)
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('stock')}>
                    District Stock
                  </th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredMedicines.map((med) => {
                  const isSelected = selectedMedicineName === med.name;
                  const isExpanded = expandedRows[med.name];
                  const pad = density === 'compact' ? 'py-2 px-3.5' : 'py-3.5 px-3.5';

                  // Calculate coverage bar percentage
                  const barPct = Math.min(100, Math.round((med.lowestDays / 30) * 100));

                  return (
                    <React.Fragment key={med.name}>
                      <tr
                        onClick={() => setSelectedMedicineName(med.name)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        <td className={pad}>
                          <div className="font-bold text-slate-900 dark:text-white">{med.name}</div>
                          <div className="text-[11px] text-slate-400">{med.category}</div>
                        </td>

                        <td className={pad}>
                          {/* Horizontal Days-of-Cover Bar with Reorder Threshold Marker */}
                          <div className="space-y-1 min-w-[130px]">
                            <div className="flex justify-between text-[11px] font-mono font-bold">
                              <span
                                className={
                                  med.lowestDays <= 3
                                    ? 'text-red-600'
                                    : med.lowestDays <= 7
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }
                              >
                                {med.lowestDays} days
                              </span>
                              <span className="text-slate-400 font-normal text-[10px]">
                                Reorder @ 14d
                              </span>
                            </div>

                            <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              {/* 14-day threshold marker */}
                              <div className="absolute top-0 bottom-0 left-[46.6%] w-0.5 bg-slate-400 dark:bg-slate-500 z-10" />

                              {/* Progress Fill */}
                              <div
                                style={{ width: `${barPct}%` }}
                                className={`h-full rounded-full transition-all ${
                                  med.lowestDays <= 3
                                    ? 'bg-red-600'
                                    : med.lowestDays <= 7
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        <td className={pad}>
                          <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                            {med.totalDistrictStock.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {med.dailyBurn} / day burn
                          </div>
                        </td>

                        <td className={pad}>
                          <StatusBadge status={med.status} size="sm" />
                        </td>

                        <td className={`${pad} text-right`}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(med.name);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                            aria-label={`Toggle batch details for ${med.name}`}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Row Expanded Details: Batch Telemetry */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                          <td colSpan={5} className="p-3.5 border-t border-slate-200/60 dark:border-slate-800">
                            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              <span>Live Batch Inventory at Reporting Facilities</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              {med.facilityComparison.map((fc, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1"
                                >
                                  <div className="font-bold text-slate-900 dark:text-white truncate">
                                    {fc.facility}
                                  </div>
                                  <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                                    <span>Active Stock:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {fc.stock} units
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-700 text-[11px]">
                                    <span>Coverage:</span>
                                    <StatusBadge status={fc.status} size="sm" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Medicine Intelligence Drill-Down (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded uppercase border border-blue-200 dark:border-blue-800">
              Therapeutic Stock Intelligence
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
              {activeIntelligence.name}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              {activeIntelligence.category} · {activeIntelligence.demandTrend}
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px]">District Stock Balance</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {activeIntelligence.totalDistrictStock.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px]">Average Daily Burn</span>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                {activeIntelligence.dailyBurn} / day
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px]">District-Wide Buffer</span>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {activeIntelligence.daysCoverage} days total
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[10px]">Facilities Under 7 Days</span>
              <div className="text-lg font-bold font-mono text-red-600 dark:text-red-400 tabular-nums mt-0.5">
                {activeIntelligence.facilitiesAtRisk} PHCs
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <Link
              href="/alerts"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <span>Inspect Shortage Alerts for {activeIntelligence.name.split(' ')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
