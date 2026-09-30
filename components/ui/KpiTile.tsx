'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowRight, LucideIcon, TrendingUp, ShieldAlert } from 'lucide-react';

// Hero District Risk Score Component
interface HeroDistrictScoreProps {
  score: number; // 0 - 100
  previousScore?: number;
  districtName: string;
  status: 'Safe' | 'Monitoring' | 'High Risk' | 'Critical';
  sparklineData: number[]; // e.g. [58, 62, 60, 68, 71, 69, 74]
  onDrilldown?: () => void;
  drilldownHref?: string;
}

export function HeroDistrictScore({
  score,
  previousScore = 69,
  districtName,
  status,
  sparklineData,
  onDrilldown,
  drilldownHref = '/dashboard#queue',
}: HeroDistrictScoreProps) {
  const delta = score - previousScore;
  const isWorsening = delta > 0; // In risk score, higher score means more risk

  // Calculate SVG sparkline points
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 140;
  const height = 40;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  const getStatusColor = () => {
    switch (status) {
      case 'Critical':
        return {
          text: 'text-red-700 dark:text-red-300',
          bg: 'bg-red-50 dark:bg-red-950/50',
          border: 'border-red-200 dark:border-red-800',
          stroke: '#DC2626',
        };
      case 'High Risk':
        return {
          text: 'text-orange-700 dark:text-orange-300',
          bg: 'bg-orange-50 dark:bg-orange-950/50',
          border: 'border-orange-200 dark:border-orange-800',
          stroke: '#EA580C',
        };
      case 'Monitoring':
        return {
          text: 'text-amber-700 dark:text-amber-300',
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          border: 'border-amber-200 dark:border-amber-800',
          stroke: '#D97706',
        };
      default:
        return {
          text: 'text-emerald-700 dark:text-emerald-300',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          border: 'border-emerald-200 dark:border-emerald-800',
          stroke: '#16A34A',
        };
    }
  };

  const style = getStatusColor();

  return (
    <div className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
      {/* Decorative accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.bg} border-b ${style.border}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Composite District Risk Index
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
              {status}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {districtName} · Health Vulnerability
          </h2>
        </div>

        {/* 7-day sparkline */}
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-slate-400 font-mono">7-day trend</div>
          <svg width={width} height={height} className="overflow-visible mt-1" aria-hidden="true">
            <polyline
              fill="none"
              stroke={style.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {sparklineData.map((val, idx) => {
              const x = (idx / (sparklineData.length - 1)) * width;
              const y = height - ((val - minVal) / range) * (height - 8) - 4;
              const isLast = idx === sparklineData.length - 1;
              return isLast ? (
                <circle key={idx} cx={x} cy={y} r="3.5" fill={style.stroke} className="animate-pulse" />
              ) : null;
            })}
          </svg>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-sans">
            {score}
            <span className="text-sm text-slate-400 font-normal"> / 100</span>
          </div>

          <div
            className={`flex items-center text-xs font-semibold font-mono ${
              isWorsening ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isWorsening ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" aria-hidden="true" />
            )}
            <span>
              {delta > 0 ? `+${delta}` : delta} pts vs yesterday
            </span>
          </div>
        </div>

        <Link
          href={drilldownHref}
          onClick={onDrilldown}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1.5 py-1"
        >
          <span>View 4 urgent drivers</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// Compact KPI Tile Component
interface CompactKpiTileProps {
  title: string;
  value: string | number;
  deltaText: string; // e.g. "+2 vs yesterday", "Stable", "-3% drop"
  deltaType?: 'positive' | 'negative' | 'neutral'; // determines color: positive usually green or red depending on context
  isGood?: boolean; // if positive delta is good or bad
  subtitle?: string;
  icon?: LucideIcon;
  href?: string;
  onDrilldown?: () => void;
  accentColor?: string;
}

export function CompactKpiTile({
  title,
  value,
  deltaText,
  isGood = true,
  subtitle,
  icon: Icon,
  href,
  onDrilldown,
}: CompactKpiTileProps) {
  const content = (
    <div className="bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group h-full">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{title}</span>
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight font-sans">
          {value}
        </div>
        <div
          className={`text-[11px] font-semibold font-mono flex items-center ${
            isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {deltaText}
        </div>
      </div>

      {subtitle && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onDrilldown} className="block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onDrilldown} role={onDrilldown ? 'button' : undefined} tabIndex={onDrilldown ? 0 : undefined} className={onDrilldown ? 'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl' : ''}>
      {content}
    </div>
  );
}
