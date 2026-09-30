'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  Wifi,
  WifiOff,
  Flame,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  Eye,
  Keyboard,
  Globe,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { District } from '@/types';

export function TopBar() {
  const {
    selectedDistrict,
    setSelectedDistrict,
    isOnline,
    setIsOnline,
    currentRole,
    emergencyState,
    unreadNotifications,
    theme,
    setTheme,
    language,
    setLanguage,
    isSyncing,
    lastSyncedTime,
    triggerManualSync,
    setShortcutsModalOpen,
  } = useApp();

  return (
    <header className="h-16 bg-white dark:bg-[#10233F] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: District Selector, Last Synced & Operating Mode */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* District Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <label htmlFor="district-select" className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider hidden lg:inline">
            District:
          </label>
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value as District)}
            className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Meerut District">Meerut District (20 PHCs)</option>
            <option value="Baghpat District">Baghpat District (10 PHCs)</option>
          </select>
        </div>

        {/* Live Sync Status & Manual Sync Button */}
        <div className="hidden md:flex items-center gap-2 text-xs border-l border-slate-200 dark:border-slate-700 pl-3">
          <button
            type="button"
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
            title="Click to manually refresh and sync live district telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : `Synced ${lastSyncedTime}`}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            17/20 live
          </span>
        </div>
      </div>

      {/* Right Controls: Language, Theme, Network, Alerts, Shortcuts & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Language Toggle (English / हिन्दी) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Toggle display language (English / हिन्दी)"
          aria-label="Language switcher"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono">{language === 'en' ? 'EN' : 'हि'}</span>
        </button>

        {/* Theme Mode Toggle (Light / Dark / High-Contrast) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              theme === 'light' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Light mode"
            aria-label="Switch to light mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              theme === 'dark' ? 'bg-slate-700 text-white shadow-2xs' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark mode"
            aria-label="Switch to dark mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('high-contrast')}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              theme === 'high-contrast' ? 'bg-black text-amber-300 shadow-2xs' : 'text-slate-400 hover:text-amber-500'
            }`}
            title="High contrast mode (WCAG AAA)"
            aria-label="Switch to high contrast mode"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Network Online/Offline Toggle */}
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          title={isOnline ? 'Online (Telemetry active). Click to simulate offline.' : 'Offline mode active. Click to reconnect.'}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          <span className="hidden sm:inline font-mono text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          type="button"
          onClick={() => setShortcutsModalOpen(true)}
          className="hidden sm:flex items-center gap-1 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
          title="Keyboard shortcuts (?)"
          aria-label="Open keyboard shortcuts cheat sheet"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <kbd className="font-mono text-[10px] text-slate-400">?</kbd>
        </button>

        {/* Notification Bell */}
        <Link
          href="/dashboard#queue"
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Action Queue Notifications"
          aria-label={`${unreadNotifications} urgent resilience alerts`}
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </Link>

        {/* User Role Chip with Persona Switcher */}
        <Link
          href="/login"
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Switch Active Persona"
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
              {currentRole === 'DISTRICT_OFFICER'
                ? 'Dr. Aditi Sharma'
                : currentRole === 'PHC_STAFF'
                ? 'Dr. Rajesh Verma'
                : currentRole === 'WAREHOUSE_OFFICER'
                ? 'Suresh Gupta'
                : 'State Directorate'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              {currentRole.replace(/_/g, ' ')}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </Link>
      </div>
    </header>
  );
}
