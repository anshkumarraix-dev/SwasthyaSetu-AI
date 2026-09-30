'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Boxes, MapPin, Menu, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function BottomTabBar() {
  const pathname = usePathname();
  const { emergencyState, alerts } = useApp();
  const isEmergency = emergencyState.isActive;
  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;

  const tabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/alerts', label: 'Queue', icon: AlertTriangle, badge: criticalCount > 0 ? criticalCount : undefined },
    { href: '/inventory', label: 'Inventory', icon: Boxes },
    { href: '/dashboard#map-view', label: 'Map', icon: MapPin },
    { href: isEmergency ? '/emergency-mode' : '/settings', label: isEmergency ? 'Emergency' : 'More', icon: isEmergency ? Flame : Menu, emergency: isEmergency },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#10233F]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 safe-area-bottom shadow-lg"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === '/dashboard#map-view' && pathname === '/dashboard');

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : tab.emergency
                  ? 'text-red-600 dark:text-red-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
