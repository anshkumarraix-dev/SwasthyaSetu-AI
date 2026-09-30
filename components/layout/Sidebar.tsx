'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Flame,
  Hospital,
  Boxes,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Activity;
  badge: string | null;
  emergencyHighlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// New Information Architecture grouped by sections: COMMAND, OPERATIONS, DECISIONS, REPORTING, SYSTEM
export const navigationGroups: NavGroup[] = [
  {
    group: 'COMMAND',
    items: [
      { href: '/dashboard', label: 'Situation Room', icon: Activity, badge: 'Live' },
      { href: '/emergency-mode', label: 'Emergency Mode', icon: Flame, badge: null, emergencyHighlight: true },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { href: '/phc-operations', label: 'My PHC', icon: Hospital, badge: 'PHC B' },
      { href: '/inventory', label: 'Inventory', icon: Boxes, badge: null },
      { href: '/phc-operations?tab=beds', label: 'Beds & Staff', icon: Users, badge: null },
    ],
  },
  {
    group: 'DECISIONS',
    items: [
      { href: '/dashboard?section=queue', label: 'Action Queue', icon: AlertTriangle, badge: '4' },
      { href: '/alerts', label: 'AI Insights', icon: Sparkles, badge: 'Critical' },
      { href: '/redistribution', label: 'Transfers', icon: ArrowLeftRight, badge: '1 Pending' },
      { href: '/expiry-rescue', label: 'Expiry Rescue', icon: ShieldCheck, badge: '₹48.6k' },
    ],
  },
  {
    group: 'REPORTING',
    items: [
      { href: '/impact-audit?tab=impact', label: 'Impact', icon: TrendingUp, badge: null },
      { href: '/impact-audit', label: 'Audit Trail', icon: FileCheck2, badge: null },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { href: '/dashboard?view=list', label: 'Facilities', icon: Building2, badge: '20' },
      { href: '/settings', label: 'Settings', icon: Settings, badge: null },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { emergencyState, currentRole } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#10233F] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#1E3A5F] z-30 transition-all duration-200 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 group-hover:bg-blue-500 transition-colors">
            SS
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-bold text-white text-sm tracking-tight leading-tight truncate">
                SwasthyaSetu AI
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight leading-tight truncate">
                Health Resilience Copilot
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 hidden lg:block transition-colors"
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Emergency Surge Warning Ribbon */}
      {emergencyState.isActive && !isCollapsed && (
        <div className="mx-3 mt-3 p-2.5 bg-rose-950/80 border border-rose-500/80 rounded-xl text-xs text-rose-200 flex items-start gap-2 shadow-xs">
          <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-semibold text-rose-300">Surge Active</div>
            <div className="text-[10px] text-rose-300/80 truncate">{emergencyState.affectedBlock}</div>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href.split('?')[0];
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : item.emergencyHighlight && emergencyState.isActive
                      ? 'bg-rose-900/40 text-rose-300 hover:bg-rose-900/60'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : item.badge === 'Live'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.badge.includes('Critical')
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[#1E3A5F] bg-[#0A1629]">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Officer Role:</span>
              <span className="text-blue-400 font-mono font-medium truncate max-w-[120px]">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <Link
              href="/login"
              className="block w-full text-center py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              Switch Role / Facility
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Switch Persona"
          >
            <ShieldAlert className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
}
