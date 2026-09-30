'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserRole,
  District,
  Facility,
  InventoryBatch,
  AlertItem,
  TransferRecommendation,
  ExpiryRescueOpportunity,
  AuditLog,
  EmergencyModeState,
} from '@/types';
import {
  INITIAL_FACILITIES,
  INITIAL_INVENTORY_BATCHES,
  INITIAL_ALERTS,
  INITIAL_TRANSFERS,
  INITIAL_EXPIRY_RESCUES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMERGENCY_STATE,
} from '@/data/mockData';
import { testFirestoreConnection } from '@/lib/firebase';

interface AppContextType {
  // Current user & role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedDistrict: District;
  setSelectedDistrict: (district: District) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;

  // Domain data
  facilities: Facility[];
  inventoryBatches: InventoryBatch[];
  alerts: AlertItem[];
  transfers: TransferRecommendation[];
  expiryRescues: ExpiryRescueOpportunity[];
  auditLogs: AuditLog[];
  emergencyState: EmergencyModeState;

  // UI Preferences & Global state
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  isSyncing: boolean;
  lastSyncedTime: string;
  triggerManualSync: () => void;
  toasts: { id: string; title: string; message?: string; type?: 'success' | 'error' | 'info'; undoAction?: () => void; undoLabel?: string }[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info', undoAction?: () => void, undoLabel?: string) => void;
  removeToast: (id: string) => void;
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  // Impact metrics
  stockOutsPrevented: number;
  batchesRescued: number;
  estimatedValueSavedInr: number;

  // Core demo state transitions
  approveTransfer: (transferId: string, officerName?: string) => void;
  dispatchTransfer: (transferId: string, warehouseOfficer?: string) => void;
  confirmReceipt: (transferId: string, recipientName?: string) => void;
  rejectTransfer: (transferId: string, reason: string) => void;
  approveExpiryRescue: (rescueId: string) => void;
  activateEmergencyMode: (scenario: EmergencyModeState['scenarioType'], durationDays: number) => void;
  deactivateEmergencyMode: () => void;
  updateFacilityStock: (facilityId: string, medicineName: string, quantityChange: number, batchNumber?: string) => void;
  verifyPhysicalStock: (facilityId: string, medicineId: string) => void;
  addAuditEntry: (action: string, record: string, facility: string, details: string, status?: 'Success' | 'Pending' | 'Flagged') => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('DISTRICT_OFFICER');
  const [selectedDistrict, setSelectedDistrict] = useState<District>('Meerut District');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);

  // Entities initialized with deterministic server-safe mock data
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>(INITIAL_INVENTORY_BATCHES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [transfers, setTransfers] = useState<TransferRecommendation[]>(INITIAL_TRANSFERS);
  const [expiryRescues, setExpiryRescues] = useState<ExpiryRescueOpportunity[]>(INITIAL_EXPIRY_RESCUES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [emergencyState, setEmergencyState] = useState<EmergencyModeState>(INITIAL_EMERGENCY_STATE);

  // UI Preferences & Global state
  const [theme, setThemeState] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('10 mins ago');
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<
    { id: string; title: string; message?: string; type?: 'success' | 'error' | 'info'; undoAction?: () => void; undoLabel?: string }[]
  >([]);

  const setTheme = (newTheme: 'light' | 'dark' | 'high-contrast') => {
    setThemeState(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'high-contrast');
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      if (newTheme === 'high-contrast') document.documentElement.classList.add('high-contrast');
    }
  };

  const toastCounterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      title: string,
      message?: string,
      type: 'success' | 'error' | 'info' = 'success',
      undoAction?: () => void,
      undoLabel?: string
    ) => {
      toastCounterRef.current += 1;
      const id = `toast-${toastCounterRef.current}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, title, message, type, undoAction, undoLabel }]);
      setTimeout(() => {
        removeToast(id);
      }, 6000);
    },
    [removeToast]
  );

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime('Just now');
      addToast('Telemetry Synchronized', '20 of 20 facilities in sync', 'success');
    }, 1200);
  };

  // Metrics
  const [stockOutsPrevented, setStockOutsPrevented] = useState<number>(12);
  const [batchesRescued, setBatchesRescued] = useState<number>(8);
  const [estimatedValueSavedInr, setEstimatedValueSavedInr] = useState<number>(124000);

  // Safely restore persistent state post-hydration to eliminate SSR mismatches
  useEffect(() => {
    testFirestoreConnection();

    const restoreTimer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('swasthya_setu_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.transfers) setTransfers(parsed.transfers);
          if (parsed.inventoryBatches) setInventoryBatches(parsed.inventoryBatches);
          if (parsed.facilities) setFacilities(parsed.facilities);
          if (parsed.alerts) setAlerts(parsed.alerts);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.stockOutsPrevented) setStockOutsPrevented(parsed.stockOutsPrevented);
          if (parsed.batchesRescued) setBatchesRescued(parsed.batchesRescued);
          if (parsed.estimatedValueSavedInr) setEstimatedValueSavedInr(parsed.estimatedValueSavedInr);
          if (parsed.emergencyState) setEmergencyState(parsed.emergencyState);
        }
      } catch {
        // ignore parse errors
      }
    }, 0);

    return () => clearTimeout(restoreTimer);
  }, []);

  const saveToStorage = (updates: Record<string, unknown>) => {
    try {
      const current = localStorage.getItem('swasthya_setu_state_v1');
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem('swasthya_setu_state_v1', JSON.stringify({ ...parsed, ...updates }));
    } catch {
      // storage unavailable
    }
  };

  const addAuditEntry = (
    action: string,
    record: string,
    facility: string,
    details: string,
    status: 'Success' | 'Pending' | 'Flagged' = 'Success'
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentRole === 'DISTRICT_OFFICER' ? 'Dr. Aditi Sharma (District Health Officer)' : currentRole,
      role: currentRole,
      action,
      record,
      facility,
      status,
      details,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveToStorage({ auditLogs: updated });
      return updated;
    });
  };

  // State transitions: 1. District Officer Approves Transfer
  const approveTransfer = (transferId: string, officerName: string = 'Dr. Aditi Sharma (DHO)') => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTransfers((prev) => {
      const updated = prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'Approved' as const,
              officerApproval: {
                approved: true,
                approvedBy: officerName,
                approvalTimestamp: now,
                role: 'District Health Officer',
                digitalSignatureHash: '0x8f2d...91c4 (SHA-256 District GovKey)',
              },
            }
          : t
      );
      saveToStorage({ transfers: updated });
      return updated;
    });

    // Update alert status
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === 'alt-1'
          ? {
              ...a,
              status: 'Approved' as const,
              actionTaken: `Transfer TR-2026-0042 approved by ${officerName}`,
            }
          : a
      );
      saveToStorage({ alerts: updated });
      return updated;
    });

    // Add immutable audit trail record
    addAuditEntry(
      'TRANSFER_APPROVED',
      transferId,
      'PHC B (Meerut Rural) ← PHC A (Meerut North)',
      `Approved 500 tablets Paracetamol 500mg. Verified PHC A retains 21-day safety buffer (1,900 tablets remaining). Digital Signature: 0x8f2d...91c4`
    );
  };

  // 2. Warehouse Officer Dispatches
  const dispatchTransfer = (transferId: string, warehouseOfficer: string = 'Ramesh Verma') => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTransfers((prev) => {
      const updated = prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'In Transit' as const,
              dispatchDetails: {
                dispatchedAt: now,
                driverName: 'Suresh Kumar',
                vehicleNumber: 'UP-15-BT-4491',
                transitOtp: '482910',
                warehouseStaff: warehouseOfficer,
              },
            }
          : t
      );
      saveToStorage({ transfers: updated });
      return updated;
    });

    // Decrement stock from source facility (PHC A)
    setInventoryBatches((prev) => {
      const updated = prev.map((b) =>
        b.id === 'inv-a-paracetamol' || b.id === 'bat-1'
          ? {
              ...b,
              quantity: Math.max(0, b.quantity - 500),
              daysRemaining: Math.floor(Math.max(0, b.quantity - 500) / (b.dailyConsumption || 35)),
            }
          : b
      );
      saveToStorage({ inventoryBatches: updated });
      return updated;
    });

    addAuditEntry(
      'TRANSFER_DISPATCHED',
      transferId,
      'PHC A (Meerut North)',
      `500 tablets Paracetamol dispatched via Vehicle UP-15-BT-4491. Driver: Suresh Kumar. Transit OTP issued.`
    );
  };

  // 3. Recipient PHC confirms delivery
  const confirmReceipt = (transferId: string, recipientName: string = 'Dr. Manoj Patel') => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTransfers((prev) => {
      const updated = prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'Completed' as const,
              receiptDetails: {
                receivedAt: now,
                receivedBy: recipientName,
                intactPacksCount: 50,
                discrepancyNote: 'Zero discrepancies noted. Physical seals verified.',
              },
            }
          : t
      );
      saveToStorage({ transfers: updated });
      return updated;
    });

    // Increment stock at destination facility (PHC B)
    setInventoryBatches((prev) => {
      const updated = prev.map((b) =>
        b.id === 'inv-b-paracetamol' || b.id === 'bat-3'
          ? {
              ...b,
              quantity: b.quantity + 500, // Now 620 tablets
              daysRemaining: Math.floor((b.quantity + 500) / (b.dailyConsumption || 40)), // Now 15.5 days buffer!
            }
          : b
      );
      saveToStorage({ inventoryBatches: updated });
      return updated;
    });

    // Update PHC B status from Critical to Safe
    setFacilities((prev) => {
      const updated = prev.map((f) =>
        f.id === 'phc-b'
          ? {
              ...f,
              status: 'Safe' as const,
              criticalShortagesCount: 0,
            }
          : f
      );
      saveToStorage({ facilities: updated });
      return updated;
    });

    // Resolve Alert
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === 'alt-1'
          ? {
              ...a,
              status: 'Resolved' as const,
              actionTaken: `Stock replenishment received. Stock buffer extended to 15.5 days.`,
            }
          : a
      );
      saveToStorage({ alerts: updated });
      return updated;
    });

    // Update verified impact counters
    setStockOutsPrevented((prev) => {
      const next = prev + 1;
      saveToStorage({ stockOutsPrevented: next });
      return next;
    });

    addAuditEntry(
      'STOCK_RECEIVED_AND_RESTOCKED',
      transferId,
      'PHC B (Meerut Rural)',
      `Delivery verified by ${recipientName}. 500 tablets Paracetamol added to active bin. Stock status upgraded to Safe (15.5 days coverage).`
    );
  };

  // Reject transfer with mandatory audit justification
  const rejectTransfer = (transferId: string, reason: string) => {
    setTransfers((prev) => {
      const updated = prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'Rejected' as const,
              rejectionReason: reason,
            }
          : t
      );
      saveToStorage({ transfers: updated });
      return updated;
    });

    addAuditEntry(
      'TRANSFER_REJECTED',
      transferId,
      'District Operations Cell',
      `Transfer recommendation declined by DHO. Officer Reason: "${reason}".`,
      'Flagged'
    );
  };

  // Approve Expiry Rescue Match
  const approveExpiryRescue = (rescueId: string) => {
    setExpiryRescues((prev) => {
      const updated = prev.map((r) =>
        r.id === rescueId
          ? {
              ...r,
              status: 'Approved' as const,
            }
          : r
      );
      saveToStorage({ expiryRescues: updated });
      return updated;
    });

    setBatchesRescued((prev) => {
      const next = prev + 1;
      saveToStorage({ batchesRescued: next });
      return next;
    });

    setEstimatedValueSavedInr((prev) => {
      const next = prev + 8700;
      saveToStorage({ estimatedValueSavedInr: next });
      return next;
    });

    addAuditEntry(
      'EXPIRY_RESCUE_APPROVED',
      rescueId,
      'PHC E (Kharkhoda) → PHC C (Mawana)',
      'Approved transfer of 600 ORS sachets (Batch ORS-221) expiring in 42 days to high-consumption gastro facility. Saved ₹8,700 public medicine value.'
    );
  };

  // Activate Emergency Surge Mode
  const activateEmergencyMode = (
    scenario: EmergencyModeState['scenarioType'],
    durationDays: number
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const mult = scenario === 'Fever/Dengue surge' ? 2.2 : scenario === 'Flood or transport disruption' ? 2.5 : 1.8;
    const updatedState: EmergencyModeState = {
      isActive: true,
      scenarioType: scenario,
      affectedBlock: 'Meerut Block A & Rural',
      affectedDistrict: selectedDistrict,
      activatedAt: now,
      activatedBy: 'Dr. Aditi Sharma (Chief Medical Officer)',
      expectedDurationDays: durationDays,
      surgeMultiplier: mult,
      preparedness: {
        paracetamolReadiness: 48,
        orsReadiness: 62,
        ivFluidsReadiness: 50,
        feverBedOccupancy: 88,
        staffCoverage: 'Moderate',
        dataReportingRate: 85,
      },
      next24hActions: [
        'Approve urgent Paracetamol transfer from PHC A to PHC B (TR-2026-0042)',
        'Dispatch near-expiry ORS from PHC E to PHC C before 42-day window closes',
        'Replenish IV Fluids for Sardhana and Mawana trauma stabilization rooms',
      ],
    };

    setEmergencyState(updatedState);
    saveToStorage({ emergencyState: updatedState });

    addAuditEntry(
      'EMERGENCY_MODE_ACTIVATED',
      `EMERGENCY-${Date.now()}`,
      'District-Wide (Meerut)',
      `Activated ${scenario} emergency protocol for ${durationDays} days. OPD consumption forecast raised by ${Math.round((mult - 1) * 100)}%. Mandatory human approvals retained.`,
      'Flagged'
    );
  };

  // Deactivate Emergency Mode
  const deactivateEmergencyMode = () => {
    const updatedState: EmergencyModeState = {
      ...INITIAL_EMERGENCY_STATE,
      isActive: false,
      activatedAt: undefined,
      activatedBy: undefined,
      surgeMultiplier: 1.0,
      expectedDurationDays: 0,
    };
    setEmergencyState(updatedState);
    saveToStorage({ emergencyState: updatedState });

    addAuditEntry(
      'EMERGENCY_MODE_DEACTIVATED',
      'STAND-DOWN',
      'District-Wide (Meerut)',
      'Returned to standard baseline operations. Stock depletion forecasts normalized.'
    );
  };

  // Update Facility Stock (from Frontline Operations or Voice Assistant)
  const updateFacilityStock = (
    facilityId: string,
    medicineName: string,
    quantityChange: number,
    batchNumber?: string
  ) => {
    setInventoryBatches((prev) => {
      const updated = prev.map((b) => {
        if (
          b.facilityId === facilityId &&
          b.medicineName.toLowerCase().includes(medicineName.toLowerCase())
        ) {
          const newStock = Math.max(0, b.quantity + quantityChange);
          return {
            ...b,
            quantity: newStock,
            daysRemaining: Math.floor(newStock / (b.dailyConsumption || 1)),
            batchNumber: batchNumber || b.batchNumber,
            lastVerifiedDate: 'Just now',
          };
        }
        return b;
      });
      saveToStorage({ inventoryBatches: updated });
      return updated;
    });

    addAuditEntry(
      'INVENTORY_UPDATE',
      `${facilityId}-${medicineName}`,
      facilityId,
      `Stock logged: ${quantityChange > 0 ? '+' : ''}${quantityChange} units of ${medicineName}${batchNumber ? ` (Batch ${batchNumber})` : ''}.`
    );
  };

  // Physical Count Verification
  const verifyPhysicalStock = (facilityId: string, medicineId: string) => {
    setInventoryBatches((prev) => {
      const updated = prev.map((b) =>
        b.id === medicineId || (b.facilityId === facilityId && medicineId === 'all')
          ? {
              ...b,
              lastVerifiedDate: 'Physical audit completed just now',
            }
          : b
      );
      saveToStorage({ inventoryBatches: updated });
      return updated;
    });

    setFacilities((prev) => {
      const updated = prev.map((f) => {
        if (f.id === facilityId) {
          const newScore = Math.min(100, f.dataTrustScore + 15);
          const trustCat: Facility['trustCategory'] =
            newScore >= 85 ? 'Reliable' : newScore >= 65 ? 'Usable with caution' : 'Needs verification';
          return {
            ...f,
            dataTrustScore: newScore,
            isPhysicallyVerifiedToday: true,
            trustCategory: trustCat,
            lastSyncTime: 'Just now (Physical audit)',
          };
        }
        return f;
      });
      saveToStorage({ facilities: updated });
      return updated;
    });

    addAuditEntry(
      'PHYSICAL_COUNT_VERIFIED',
      facilityId,
      facilityId,
      `Physical bin audit recorded by PHC In-Charge. Data Trust Score upgraded (+15 pts). Stale telemetry flag cleared.`
    );
  };

  // Reset to original pristine mock state
  const resetDemoData = () => {
    try {
      localStorage.removeItem('swasthya_setu_state_v1');
    } catch {
      // ignore
    }
    setFacilities(INITIAL_FACILITIES);
    setInventoryBatches(INITIAL_INVENTORY_BATCHES);
    setAlerts(INITIAL_ALERTS);
    setTransfers(INITIAL_TRANSFERS);
    setExpiryRescues(INITIAL_EXPIRY_RESCUES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setEmergencyState(INITIAL_EMERGENCY_STATE);
    setStockOutsPrevented(12);
    setBatchesRescued(8);
    setEstimatedValueSavedInr(124000);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedDistrict,
        setSelectedDistrict,
        isOnline,
        setIsOnline,
        unreadNotifications,
        setUnreadNotifications,
        facilities,
        inventoryBatches,
        alerts,
        transfers,
        expiryRescues,
        auditLogs,
        emergencyState,
        theme,
        setTheme,
        language,
        setLanguage,
        isSyncing,
        lastSyncedTime,
        triggerManualSync,
        toasts,
        addToast,
        removeToast,
        shortcutsModalOpen,
        setShortcutsModalOpen,
        stockOutsPrevented,
        batchesRescued,
        estimatedValueSavedInr,
        approveTransfer,
        dispatchTransfer,
        confirmReceipt,
        rejectTransfer,
        approveExpiryRescue,
        activateEmergencyMode,
        deactivateEmergencyMode,
        updateFacilityStock,
        verifyPhysicalStock,
        addAuditEntry,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
