'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, Database, ShieldCheck, TrendingDown } from 'lucide-react';
import { ConfidenceMeter } from './ConfidenceMeter';

interface ExplainPanelProps {
  signalText: string;
  dataUsed: string[];
  forecastDepletionDays: number;
  confidence: number;
  sourceBufferText?: string;
  sourceFacilityName?: string;
  sourceBufferDays?: number;
  chartData?: { day: string; stock: number; upper?: number; lower?: number }[];
  defaultExpanded?: boolean;
}

export function ExplainPanel({
  signalText,
  dataUsed,
  forecastDepletionDays,
  confidence,
  sourceBufferText = 'Preserves 21-day safety buffer (1,900 tablets remaining)',
  sourceFacilityName = 'PHC A (Meerut North)',
  sourceBufferDays = 21,
  chartData = [
    { day: 'D-3', stock: 180, upper: 190, lower: 170 },
    { day: 'D-1', stock: 140, upper: 155, lower: 130 },
    { day: 'Today', stock: 120, upper: 130, lower: 110 },
    { day: '+1d', stock: 80, upper: 95, lower: 65 },
    { day: '+2d', stock: 40, upper: 60, lower: 25 },
    { day: '+3d', stock: 0, upper: 20, lower: 0 },
  ],
  defaultExpanded = false,
}: ExplainPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // SVG dimensions for forecast mini-chart with confidence envelope
  const svgWidth = 260;
  const svgHeight = 70;
  const maxStock = 200;

  const pointsMain = chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * (svgWidth - 20) + 10;
      const y = svgHeight - (d.stock / maxStock) * (svgHeight - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');

  // Upper/lower confidence polygon envelope
  const upperPoints = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - ((d.upper ?? d.stock) / maxStock) * (svgHeight - 16) - 8;
    return `${x},${y}`;
  });

  const lowerPoints = [...chartData].reverse().map((d, i) => {
    const origIdx = chartData.length - 1 - i;
    const x = (origIdx / (chartData.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - ((d.lower ?? d.stock) / maxStock) * (svgHeight - 16) - 8;
    return `${x},${y}`;
  });

  const envelopePolygon = [...upperPoints, ...lowerPoints].join(' ');

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 overflow-hidden text-xs transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span>Why does AI recommend this transfer?</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-normal">
          <span>{isExpanded ? 'Hide explanation' : 'View forecast details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 space-y-3.5">
          {/* Signal */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" aria-hidden="true" />
              <span>Observed Clinical Signal</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
              {signalText}
            </p>
          </div>

          {/* Mini Forecast Chart with Confidence Band */}
          <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Depletion Curve & Uncertainty Envelope</span>
              <span className="text-red-600 dark:text-red-400 font-mono font-semibold">Stock-out in {forecastDepletionDays} days</span>
            </div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-16 overflow-visible" aria-label="Depletion forecast chart with confidence intervals">
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Zero Stock Baseline */}
              <line x1="10" y1={svgHeight - 8} x2={svgWidth - 10} y2={svgHeight - 8} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Confidence Band Envelope */}
              <polygon points={envelopePolygon} fill="url(#bandGrad)" />
              
              {/* Actual & Forecast Line */}
              <polyline points={pointsMain} fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Points */}
              {chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * (svgWidth - 20) + 10;
                const y = svgHeight - (d.stock / maxStock) * (svgHeight - 16) - 8;
                return (
                  <circle key={i} cx={x} cy={y} r="2.5" fill={i < 3 ? '#1E293B' : '#DC2626'} />
                );
              })}
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
              <span>Past 3 days</span>
              <span>Today (120 rem.)</span>
              <span className="text-red-500 font-bold">Depleted (Day 3)</span>
            </div>
          </div>

          {/* Source Buffer Safety Proof */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Source Buffer Protection Verified</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-normal">
              {sourceFacilityName} retains a calculated <strong className="font-semibold">{sourceBufferDays} days of buffer</strong> even after transferring 500 units. Neither facility will drop below the 14-day government contingency baseline.
            </p>
          </div>

          {/* Confidence Meter */}
          <ConfidenceMeter confidence={confidence} />

          {/* Telemetry inputs */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 font-medium mb-1">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Verified Data Points Used in Calculation:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-300">
              {dataUsed.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
