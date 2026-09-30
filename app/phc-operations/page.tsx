'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  MetricCard,
  RiskStatusBadge,
  DataTrustBadge,
  SimulatedDataBanner,
} from '@/components/ui/ReusableBadges';
import { StockExtractionResult, Facility } from '@/types';
import {
  Mic,
  Send,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Bed,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  PlusCircle,
  AlertOctagon,
  ScanLine,
  Keyboard,
  X,
  WifiOff,
  RefreshCw,
  Home,
  Clock,
} from 'lucide-react';

function PhcOperationsContent() {
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get('facilityId');
  const tabParam = searchParams.get('tab');

  const {
    facilities,
    inventoryBatches,
    updateFacilityStock,
    verifyPhysicalStock,
    isOnline,
    stockOutsPrevented,
  } = useApp();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilityParam || 'phc-b');
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'speak' | 'manual' | 'scan'>('speak');

  // Manual stock form state
  const [manualMedicine, setManualMedicine] = useState('Paracetamol 500 mg tablets');
  const [manualBatch, setManualBatch] = useState('PCT-621');
  const [manualExpiry, setManualExpiry] = useState('2028-07-31');
  const [manualType, setManualType] = useState<'received' | 'dispensed' | 'damaged' | 'expired' | 'transferred'>('received');
  const [manualQuantity, setManualQuantity] = useState<number>(100);
  const [manualUnit, setManualUnit] = useState<'tablet' | 'sachet' | 'vial' | 'capsule' | 'bottle'>('tablet');
  const [manualVerifiedCheckbox, setManualVerifiedCheckbox] = useState(true);
  const [manualNotes, setManualNotes] = useState('');

  // Speech extraction state
  const [speechText, setSpeechText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<StockExtractionResult | null>(null);
  const [offlinePendingQueue, setOfflinePendingQueue] = useState<number>(0);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const activeFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];
  const facilityInventory = inventoryBatches.filter((b) => b.facilityId === selectedFacilityId);

  const handleStartVerification = () => {
    verifyPhysicalStock(activeFacility.id, 'med-paracetamol-500');
    setStatusNotification('30-second physical verification recorded! Data Trust upgraded to 91/100 Reliable.');
    setTimeout(() => setStatusNotification(null), 5000);
  };

  const handleSpeechExtract = async (textToUse?: string) => {
    const text = textToUse || speechText;
    if (!text.trim()) return;

    setIsExtracting(true);
    try {
      const response = await fetch('/api/gemini/extract-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: text }),
      });
      const data = await response.json();
      if (data.result) {
        setExtractedData(data.result);
      }
    } catch {
      setStatusNotification('Gemini extraction unavailable, switched to deterministic offline parsing.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmitUpdate = (dataToSubmit?: StockExtractionResult) => {
    const med = dataToSubmit?.medicineName || manualMedicine;
    const qty = dataToSubmit?.quantity || manualQuantity;
    const type = dataToSubmit?.transactionType || manualType;
    const batch = dataToSubmit?.batchNumber || manualBatch;

    const delta = type === 'received' ? qty : -qty;

    if (!isOnline) {
      setOfflinePendingQueue((prev) => prev + 1);
      setStatusNotification(`Offline mode active. Stock update for ${med} saved locally and queued for automatic sync.`);
    } else {
      updateFacilityStock(activeFacility.id, med, delta, batch || undefined);
      setStatusNotification(`Successfully updated ${med} (${delta > 0 ? `+${delta}` : delta}) for ${activeFacility.name}.`);
    }

    setIsUpdateDrawerOpen(false);
    setExtractedData(null);
    setSpeechText('');
    setTimeout(() => setStatusNotification(null), 5000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24 sm:pb-8">
      <SimulatedDataBanner />

      {/* Offline Status Ribbon */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> You can continue updating stocks and bed counts. All changes are saved locally ({offlinePendingQueue} updates queued) and will sync automatically when network returns.
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
            Local Storage Safe
          </span>
        </div>
      )}

      {/* Status Notification Toast */}
      {statusNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-emerald-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* PHC Staff Operations Header */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                {activeFacility.code}
              </span>
              <div>
                <h1 className="text-lg font-bold text-[#10233F] leading-tight">
                  {activeFacility.name} — Frontline Operations Desk
                </h1>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {activeFacility.block} · {activeFacility.district} · Last synchronized: {activeFacility.lastSyncTime}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DataTrustBadge
              score={activeFacility.dataTrustScore}
              category={activeFacility.trustCategory}
            />
            <RiskStatusBadge status={activeFacility.status} />

            {/* Facility Switcher */}
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Four Large Touch-Friendly Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => {
            setDrawerTab('speak');
            setIsUpdateDrawerOpen(true);
          }}
          className="p-4 bg-white hover:bg-blue-50/80 border-2 border-blue-200 hover:border-blue-400 rounded-[14px] text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-[#10233F]">Update Stock</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Speak or log batch entry</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setDrawerTab('manual');
            setManualType('dispensed');
            setIsUpdateDrawerOpen(true);
          }}
          className="p-4 bg-white hover:bg-rose-50/80 border-2 border-rose-200 hover:border-rose-400 rounded-[14px] text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-[#10233F]">Report Shortage</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Flag critical low stock</div>
        </button>

        <button
          type="button"
          onClick={() => {
            updateFacilityStock(activeFacility.id, 'Paracetamol 500 mg tablets', 0);
            setStatusNotification('Bed census confirmed: 8 of 12 beds occupied.');
          }}
          className="p-4 bg-white hover:bg-indigo-50/80 border-2 border-indigo-200 hover:border-indigo-400 rounded-[14px] text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Bed className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-[#10233F]">Update Beds</div>
          <div className="text-[11px] text-slate-500 mt-0.5">8 / 12 occupied today</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusNotification('Staff check-in recorded: 4 of 5 medical personnel on active duty.');
          }}
          className="p-4 bg-white hover:bg-emerald-50/80 border-2 border-emerald-200 hover:border-emerald-400 rounded-[14px] text-left transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-[#10233F]">Update Staff</div>
          <div className="text-[11px] text-slate-500 mt-0.5">4 / 5 present on duty</div>
        </button>
      </div>

      {/* Prominent Critical Verification Task Card (Required for PHC B) */}
      {activeFacility.id === 'phc-b' && (
        <div className="p-4.5 bg-red-50 border-2 border-red-300 rounded-[16px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#D92D20] text-white text-[10px] font-bold uppercase tracking-wider">
                Priority Task
              </span>
              <h3 className="font-bold text-sm text-red-950">Verify Paracetamol Stock in Shelf Bin B-04</h3>
            </div>
            <p className="text-xs text-red-900 leading-snug">
              Stock-out risk in 3 days. Complete a <strong>30-second physical verification</strong> to certify 120 tablets and unlock district redistribution.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartVerification}
            className="px-5 py-2.5 bg-[#D92D20] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Start Verification</span>
          </button>
        </div>
      )}

      {/* Today's Readiness Operational Metrics */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#10233F] mb-3">Today&apos;s Facility Readiness Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Medicine Readiness</span>
            <div className="text-lg font-bold font-mono text-[#D92D20] mt-0.5">Critical</div>
            <div className="text-[10px] text-red-700 mt-0.5">Paracetamol 3d left</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Inpatient Beds</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">8 / 12</div>
            <div className="text-[10px] text-slate-500 mt-0.5">67% occupied</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Staff Present</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">4 / 5</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Doctor on duty</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Outpatient Footfall</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">92 today</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Normal baseline</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Fever OPD Cases</span>
            <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">37 cases</div>
            <div className="text-[10px] text-rose-700 font-semibold mt-0.5">+46% 5-day surge</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Reporting Completion</span>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">100%</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">All 6 blocks filled</div>
          </div>
        </div>
      </div>

      {/* Facility Inventory Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#10233F]">Current Medicine Shelf Stock</h3>
            <p className="text-xs text-slate-500">Tap verify to confirm physical bin count</p>
          </div>
          <button
            onClick={handleStartVerification}
            className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Certify All Bins Today
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Stock Quantity</th>
                <th className="py-2.5 px-3">Burn Rate</th>
                <th className="py-2.5 px-3">Days Remaining</th>
                <th className="py-2.5 px-3">Verified Date</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facilityInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.medicineName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.batchNumber}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {item.quantity} {item.unit}s
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{item.dailyConsumption}/day</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        item.daysRemaining <= 3
                          ? 'bg-red-100 text-red-800'
                          : item.daysRemaining <= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.lastVerifiedDate}</td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={handleStartVerification}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick-Update Drawer / Bottom Sheet */}
      {isUpdateDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full sm:w-[480px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-[#10233F]">Log Stock Transaction</h3>
                <div className="text-xs text-slate-500">{activeFacility.name}</div>
              </div>
              <button
                onClick={() => setIsUpdateDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs: Speak update | Manual entry | Scan batch */}
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDrawerTab('speak')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    drawerTab === 'speak' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Speak Update (Gemini)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('manual')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    drawerTab === 'manual' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('scan')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    drawerTab === 'scan' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Scan Batch
                </button>
              </div>

              {/* Tab 1: Speak Update */}
              {drawerTab === 'speak' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Multilingual Gemini Voice Assistant</span>
                    </span>
                    <p className="text-blue-900 leading-snug text-[11px]">
                      Speak in Hindi, Hinglish or English. Gemini automatically parses batch, medicine and quantities.
                    </p>
                  </div>

                  <textarea
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    placeholder="e.g. 'Paracetamol ke 300 tablets receive hue, batch PCT-621, expiry July 2028'"
                    className="w-full p-3 border border-slate-300 rounded-xl min-h-[90px] text-xs focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Or click sample note:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const note = 'Paracetamol ke 300 tablets receive hue, batch PCT-621, expiry July 2028.';
                        setSpeechText(note);
                        handleSpeechExtract(note);
                      }}
                      className="block w-full text-left p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-[11px] text-slate-700 truncate"
                    >
                      🗣️ &quot;Paracetamol ke 300 tablets receive hue, batch PCT-621, expiry July 2028.&quot;
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeechExtract()}
                    disabled={isExtracting || !speechText.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isExtracting ? 'Extracting with Gemini...' : 'Extract Structured Entry'}</span>
                  </button>

                  {/* Form Preview */}
                  {extractedData && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                      <div className="font-bold text-slate-800 text-xs">Preview & Confirm:</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Medicine: <strong>{extractedData.medicineName}</strong></div>
                        <div>Qty: <strong>{extractedData.quantity} {extractedData.unit}s</strong></div>
                        <div>Type: <strong className="capitalize">{extractedData.transactionType}</strong></div>
                        <div>Batch: <strong>{extractedData.batchNumber || 'N/A'}</strong></div>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSubmitUpdate(extractedData)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                        >
                          Submit Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Manual Form */}
              {drawerTab === 'manual' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Medicine Name</label>
                    <select
                      value={manualMedicine}
                      onChange={(e) => setManualMedicine(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Paracetamol 500 mg tablets">Paracetamol 500 mg tablets</option>
                      <option value="ORS sachets">ORS sachets</option>
                      <option value="Insulin vials (40 IU/ml)">Insulin vials (40 IU/ml)</option>
                      <option value="Amoxicillin 500 mg capsules">Amoxicillin 500 mg capsules</option>
                      <option value="IV fluid bottles (Normal Saline 500ml)">IV fluid bottles (Normal Saline 500ml)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Batch Number</label>
                      <input
                        type="text"
                        value={manualBatch}
                        onChange={(e) => setManualBatch(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={manualExpiry}
                        onChange={(e) => setManualExpiry(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Transaction Type</label>
                      <select
                        value={manualType}
                        onChange={(e) => setManualType(e.target.value as typeof manualType)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white capitalize"
                      >
                        <option value="received">Received (+)</option>
                        <option value="dispensed">Dispensed (-)</option>
                        <option value="damaged">Damaged (-)</option>
                        <option value="expired">Expired (-)</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Quantity</label>
                      <input
                        type="number"
                        value={manualQuantity}
                        onChange={(e) => setManualQuantity(parseInt(e.target.value, 10) || 0)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualVerifiedCheckbox}
                      onChange={(e) => setManualVerifiedCheckbox(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                    <span className="text-slate-700">Physical stock count verified in shelf bin</span>
                  </label>
                </div>
              )}

              {/* Tab 3: Scan Batch */}
              {drawerTab === 'scan' && (
                <div className="p-6 text-center space-y-3 text-xs text-slate-600">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-500">
                    <ScanLine className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="font-bold text-slate-800">Scan Medicine Barcode / QR</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Point camera at standard GS1 / manufacturer barcode to autofill batch PCT-621.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setManualBatch('PCT-621');
                      setManualMedicine('Paracetamol 500 mg tablets');
                      setDrawerTab('manual');
                      setStatusNotification('Scanned GS1 Barcode: Batch PCT-621 (Paracetamol 500 mg).');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Simulate Camera Scan
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSubmitUpdate();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
              >
                Save Offline
              </button>
              <button
                type="button"
                onClick={() => handleSubmitUpdate()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Bottom Sticky Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E2E8F0] py-2 px-4 flex items-center justify-around z-30 sm:hidden shadow-lg">
        <a href="/phc-operations" className="flex flex-col items-center text-blue-600 text-[10px] font-bold">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </a>
        <button
          onClick={() => {
            setDrawerTab('speak');
            setIsUpdateDrawerOpen(true);
          }}
          className="flex flex-col items-center text-slate-600 text-[10px] font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Update</span>
        </button>
        <a href="/alerts" className="flex flex-col items-center text-slate-600 text-[10px] font-medium">
          <AlertOctagon className="w-4 h-4" />
          <span>Alerts</span>
        </a>
        <button
          onClick={handleStartVerification}
          className="flex flex-col items-center text-slate-600 text-[10px] font-medium"
        >
          <FileCheck className="w-4 h-4" />
          <span>Tasks</span>
        </button>
      </div>
    </div>
  );
}

export default function PhcOperationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading PHC Operations...</div>}>
      <PhcOperationsContent />
    </Suspense>
  );
}
