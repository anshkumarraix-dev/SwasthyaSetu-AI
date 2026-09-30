'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { GeminiChatAssistant } from '@/components/ai/GeminiChatAssistant';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const {
    theme,
    toasts,
    removeToast,
    shortcutsModalOpen,
    setShortcutsModalOpen,
    isOnline,
    emergencyState,
  } = useApp();

  // Listen for global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"], input[type="search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShortcutsModalOpen]);

  // Google Maps Platform Two-Tier Quota Defense (Demo Key)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      };
      const origError = console.error;
      console.error = (...args: unknown[]) => {
        origError.apply(console, args);
        const msg = args.map((a) => String(a)).join(' ');
        if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      };

      const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
      window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
      return () => {
        window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
        console.error = origError;
      };
    }
  }, []);

  const isEmergency = emergencyState.isActive;

  return (
    <div
      className={`min-h-screen font-sans antialiased ${
        theme === 'dark'
          ? 'dark bg-[#0B132B] text-slate-100'
          : theme === 'high-contrast'
          ? 'bg-black text-white contrast-125'
          : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* Google Maps Platform Quota Notice Banner */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-amber-600 text-white text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-2 shadow-xs"
        >
          <span>You are operating offline. All actions and approvals are queued locally and will automatically synchronize when connectivity returns.</span>
        </div>
      )}

      {/* Emergency Active Global Strip */}
      {isEmergency && !isLoginPage && (
        <div
          role="banner"
          className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>DISTRICT EMERGENCY PROTOCOL ACTIVE: {emergencyState.scenarioType.toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-mono opacity-90 hidden sm:inline">
            OPD Surge: +{Math.round((emergencyState.surgeMultiplier - 1) * 100)}% · Mandatory Human Approvals Enforced
          </span>
        </div>
      )}

      {isLoginPage ? (
        <main className="min-h-screen">{children}</main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            <TopBar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Floating AI Copilot & Notifications */}
          <GeminiChatAssistant />
          <BottomTabBar />
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
          <KeyboardShortcutsModal
            isOpen={shortcutsModalOpen}
            onClose={() => setShortcutsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ShellContent>{children}</ShellContent>
      </AppProvider>
    </AuthProvider>
  );
}
