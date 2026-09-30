'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { HeroDistrictScore, CompactKpiTile } from '@/components/ui/KpiTile';
import { InteractiveDistrictMap } from '@/components/map/InteractiveDistrictMap';
import { GoogleDistrictMap } from '@/components/map/GoogleDistrictMap';
import { FacilitySidePanel } from '@/components/map/FacilitySidePanel';
import { ActionCard, ActionCardData } from '@/components/ui/ActionCard';
import { ConfirmDrawer } from '@/components/ui/ConfirmDrawer';
import { StaleWarningBanner, TrustBadge } from '@/components/ui/TrustBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Facility } from '@/types';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Map as MapIcon,
  Navigation,
  List as ListIcon,
  X,
  Search,
  SlidersHorizontal,
  Boxes,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function SituationRoomPage() {
  const router = useRouter();
  const {
    facilities,
    alerts,
    transfers,
    expiryRescues,
    selectedDistrict,
    currentRole,
    stockOutsPrevented,
    approveTransfer,
    rejectTransfer,
    verifyPhysicalStock,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'google-maps' | 'schematic-map' | 'list'>('google-maps');
  const [queueFilter, setQueueFilter] = useState<'All' | 'Critical' | 'Needs approval' | 'Verification' | 'Expiry' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'trust'>('priority');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [confirmDrawerOpen, setConfirmDrawerOpen] = useState(false);
  const [activeActionItem, setActiveActionItem] = useState<ActionCardData | null>(null);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  // District-specific facilities
  const districtFacilities = facilities.filter((f) => f.district === selectedDistrict);
  const transfer = transfers.find((t) => t.id === 'TR-2026-0042') || transfers[0];

  // Action Queue domain items
  const queueItems: ActionCardData[] = [
    {
      id: 'act-1',
      severity: 'Critical',
      priorityScore: 96,
      title: 'Paracetamol 500 mg — PHC B (Meerut Rural)',
      facility: 'PHC B · Meerut Rural',
      facilityCode: 'PHC B',
      facilityId: 'phc-b',
      medicineName: 'Paracetamol 500 mg tablets',
      timeRemainingText: 'Stock-out predicted in 3 days (120 tablets remaining)',
      whatChanged: 'Fever OPD attendance increased +46% over the last 5 days.',
      whyItMatters: 'Daily consumption accelerated from 24 to 40 tablets/day. Only 3 days of buffer remaining.',
      recommendation: 'Transfer 500 tablets Paracetamol 500mg from PHC A (Meerut North, 12 km away). Preserves 21-day source buffer.',
      sourceFacilityName: 'PHC A (Meerut North)',
      sourceBufferDays: 21,
      confidence: 88,
      dataTrust: 91,
      status:
        transfer.status === 'Completed'
          ? 'Completed'
          : transfer.status === 'In Transit'
          ? 'In transit'
          : transfer.status === 'Approved'
          ? 'Approved'
          : 'Awaiting approval',
      evidenceHref: '/alerts',
      actionHref: '/redistribution',
      transferQuantity: 500,
    },
    {
      id: 'act-2',
      severity: 'High Risk',
      priorityScore: 84,
      title: 'Insulin Vials (40 IU/ml) — PHC D (Sardhana)',
      facility: 'PHC D · Sardhana',
      facilityCode: 'PHC D',
      facilityId: 'phc-d',
      medicineName: 'Insulin regular vials (40 IU/ml)',
      timeRemainingText: 'Stock-out predicted in 4 days (12 vials remaining)',
      whatChanged: 'Daily cold-chain outpatient usage steady at 3 vials/day with no replenishment scheduled.',
      whyItMatters: 'Insulin stock cannot be interrupted without immediate acute diabetic referral crisis.',
      recommendation: 'Redistribute 20 vials from PHC A regional surplus buffer depot.',
      sourceFacilityName: 'PHC A (Depot)',
      sourceBufferDays: 18,
      confidence: 82,
      dataTrust: 84,
      status: 'Awaiting approval',
      evidenceHref: '/alerts',
      actionHref: '/redistribution',
      transferQuantity: 20,
    },
    {
      id: 'act-3',
      severity: 'Expiry Opportunity',
      priorityScore: 78,
      title: 'ORS Sachets Expiry Rescue — PHC E → PHC C',
      facility: 'PHC E · Kharkhoda',
      facilityCode: 'PHC E',
      facilityId: 'phc-e',
      medicineName: 'ORS sachets (Batch ORS-221)',
      timeRemainingText: 'Batch expires in 42 days (10 Nov 2026)',
      whatChanged: '900 sachets sitting in low-turnover facility at risk of public medicine expiry waste.',
      whyItMatters: 'PHC C (Mawana) facing acute seasonal gastro attendance with 32 sachets/day burn rate.',
      recommendation: 'Transfer 600 sachets to Mawana. Prevents ₹8,700 loss and avoids Mawana stock-out.',
      sourceFacilityName: 'PHC E (Kharkhoda)',
      sourceBufferDays: 30,
      confidence: 94,
      dataTrust: 88,
      status: expiryRescues[0]?.status === 'Approved' ? 'Approved' : 'Awaiting approval',
      evidenceHref: '/expiry-rescue',
      actionHref: '/expiry-rescue',
      transferQuantity: 600,
    },
    {
      id: 'act-4',
      severity: 'Needs Verification',
      priorityScore: 68,
      title: 'Physical Audit Required — PHC H (Parikshitgarh)',
      facility: 'PHC H · Parikshitgarh',
      facilityCode: 'PHC H',
      facilityId: 'phc-h',
      medicineName: 'Full Facility Inventory Audit',
      timeRemainingText: 'Telemetry stale for 28 hours (Data Trust dropped to 36/100)',
      whatChanged: 'No inventory or footfall updates transmitted since yesterday morning.',
      whyItMatters: 'Data Trust Score dropped to 36/100 (Unreliable). Automated medicine allocations suspended.',
      recommendation: 'Assign physical verification audit to PHC In-Charge to conduct bin count.',
      confidence: 45,
      dataTrust: 36,
      status: 'Verification required',
      evidenceHref: '/phc-operations?facilityId=phc-h',
      actionHref: '/phc-operations?facilityId=phc-h',
    },
  ];

  // Filtering
  const filteredQueue = queueItems.filter((item) => {
    if (queueFilter === 'All') return true;
    if (queueFilter === 'Critical') return item.severity === 'Critical';
    if (queueFilter === 'Needs approval') return item.status === 'Awaiting approval';
    if (queueFilter === 'Verification') return item.severity === 'Needs Verification';
    if (queueFilter === 'Expiry') return item.severity === 'Expiry Opportunity';
    if (queueFilter === 'Completed') return item.status === 'Completed';
    return true;
  });

  // Sorting
  filteredQueue.sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'trust') return b.dataTrust - a.dataTrust;
    return a.title.localeCompare(b.title);
  });

  const handleOpenApprove = (item: ActionCardData) => {
    if (item.severity === 'Needs Verification') {
      verifyPhysicalStock(item.facilityId, 'all');
      addToast('Verification Assigned', `Physical audit requested for ${item.facility}`, 'info');
      return;
    }
    setActiveActionItem(item);
    setConfirmDrawerOpen(true);
  };

  const handleConfirmAuthorize = (item: ActionCardData, auditNote: string) => {
    approveTransfer(transfer.id, 'Dr. Aditi Sharma (District Health Officer)');
    addToast(
      'Transfer Authorized',
      `Dispatched 500 tab Paracetamol to ${item.facility}`,
      'success',
      () => {
        addToast('Action Undone', 'Transfer approval returned to queue', 'info');
      },
      'Undo Authorization'
    );
  };

  const handleReject = (item: ActionCardData) => {
    rejectTransfer(transfer.id, 'Declined by District Health Officer during triage');
    addToast('Transfer Declined', 'Record updated with mandatory audit justification', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Slim Demo Mode Ribbon */}
      {!demoBannerDismissed && (
        <aside
          aria-label="Simulation notice"
          className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Demonstration Mode
            </span>
            <span className="text-slate-400">·</span>
            <span>Simulated facility-level telemetry for Meerut & Baghpat districts</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/impact-audit"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audit Trail Enforced</span>
            </Link>
            <button
              type="button"
              onClick={() => setDemoBannerDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Dismiss demo notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Situation Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Situation Room · {selectedDistrict}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Autonomous anomaly prediction · Clinical human-in-the-loop approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/emergency-mode"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Emergency Protocol</span>
          </Link>
        </div>
      </div>

      {/* 3. Decision-Focused KPI Hierarchy (Hero District Score + 5 Compact Tiles) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Score (5 cols) */}
        <div className="lg:col-span-4">
          <HeroDistrictScore
            score={74}
            previousScore={69}
            districtName={selectedDistrict}
            status="High Risk"
            sparklineData={[58, 62, 60, 68, 71, 69, 74]}
            drilldownHref="#queue"
          />
        </div>

        {/* 5 Compact KPI Tiles (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <CompactKpiTile
            title="Critical PHCs"
            value={3}
            deltaText="+1 vs yday"
            isGood={false}
            subtitle="Earliest stock-out 3d"
            icon={AlertTriangle}
            href="/alerts"
          />
          <CompactKpiTile
            title="Meds Under 7d"
            value={7}
            deltaText="+2 vs yday"
            isGood={false}
            subtitle="Paracetamol, Insulin, IV"
            icon={Boxes}
            href="/inventory"
          />
          <CompactKpiTile
            title="Pending Actions"
            value={3}
            deltaText="Requires DO"
            isGood={false}
            subtitle="Awaiting your sign-off"
            icon={Clock}
            href="#queue"
          />
          <CompactKpiTile
            title="Fever Beds"
            value="72%"
            deltaText="+8% surge"
            isGood={false}
            subtitle="144/200 occupied"
            icon={Users}
            href="/phc-operations?tab=beds"
          />
          <CompactKpiTile
            title="Expiry Rescue"
            value="₹48.6k"
            deltaText="4 Batches"
            isGood={true}
            subtitle="600 ORS sachets ready"
            icon={ShieldCheck}
            href="/expiry-rescue"
          />
        </div>
      </div>

      {/* Stale Facility Banner if applicable */}
      <StaleWarningBanner
        facilityName="PHC H (Parikshitgarh)"
        facilityCode="PHC H"
        trustScore={36}
        lastSyncHours={28}
        onAssignVerification={() => {
          verifyPhysicalStock('phc-h', 'all');
          addToast('Verification Assigned', 'Field worker tasked for PHC H manual count', 'info');
        }}
      />

      {/* 4. Split Layout: Geolocation Map (Left 60%) + Action Queue (Right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: District Operational Facility Readiness (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  District Operational Facility Readiness
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interactive geolocation network · Select any marker to inspect clinical risk metrics
                </p>
              </div>

              {/* 3-Way Mode Toggle: Google Maps / Cluster Schematic / Table */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('google-maps')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'google-maps'
                      ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  aria-pressed={activeTab === 'google-maps'}
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Maps (Live GIS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schematic-map')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'schematic-map'
                      ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  aria-pressed={activeTab === 'schematic-map'}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Sector Clusters</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  aria-pressed={activeTab === 'list'}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* Display Google Maps, Cluster SVG Map, or Accessible Table View */}
            {activeTab === 'google-maps' ? (
              <GoogleDistrictMap
                facilities={facilities}
                alerts={alerts}
                selectedDistrict={selectedDistrict}
                onFacilityClick={(facility) => setSelectedFacility(facility)}
                selectedFacilityId={selectedFacility?.id}
                showTransferRoute={true}
              />
            ) : activeTab === 'schematic-map' ? (
              <InteractiveDistrictMap
                facilities={facilities}
                alerts={alerts}
                selectedDistrict={selectedDistrict}
                onFacilityClick={(facility) => setSelectedFacility(facility)}
                selectedFacilityId={selectedFacility?.id}
                showTransferRoute={true}
              />
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs" aria-label="District facilities table alternative">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Facility</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Beds</th>
                      <th className="py-2.5 px-3">Data Trust</th>
                      <th className="py-2.5 px-3">Last Sync</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                    {districtFacilities.map((f) => (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFacility(f)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          selectedFacility?.id === f.id ? 'bg-blue-50/60 dark:bg-blue-950/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{f.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{f.code} · {f.block}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={f.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {f.bedsOccupied}/{f.bedsTotal}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <TrustBadge score={f.dataTrustScore} size="sm" showLabel={false} />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {f.lastSyncTime}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFacility(f);
                            }}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Route PHC A → PHC B: 12 km (35m) arterial corridor</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
              21 days safety buffer preserved at donor facility
            </span>
          </div>
        </div>

        {/* Right Column: Prioritized Action Queue (5 cols) */}
        <div
          className="lg:col-span-5 bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between sticky top-20"
          id="queue"
        >
          <div>
            {/* Action Queue Header */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
                  <span>Prioritized Action Queue</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Algorithmic triage · District Health Officer human approval gates
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  aria-label="Sort queue by"
                >
                  <option value="priority">Sort: Impact Priority</option>
                  <option value="trust">Sort: Data Trust</option>
                  <option value="time">Sort: Title</option>
                </select>
              </div>
            </div>

            {/* Filter Tabs as Sticky Chips with Counts */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 text-xs">
              {(
                [
                  { id: 'All', label: 'All', count: queueItems.length },
                  { id: 'Critical', label: 'Critical', count: queueItems.filter((i) => i.severity === 'Critical').length },
                  { id: 'Needs approval', label: 'Needs Approval', count: queueItems.filter((i) => i.status === 'Awaiting approval').length },
                  { id: 'Verification', label: 'Verification', count: queueItems.filter((i) => i.severity === 'Needs Verification').length },
                  { id: 'Expiry', label: 'Expiry Rescue', count: queueItems.filter((i) => i.severity === 'Expiry Opportunity').length },
                  { id: 'Completed', label: 'Resolved', count: queueItems.filter((i) => i.status === 'Completed').length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    queueFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1 opacity-75 font-mono text-[10px]">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Action Cards List */}
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {filteredQueue.map((item) => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onApprove={handleOpenApprove}
                  onReject={handleReject}
                  onModify={handleOpenApprove}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 font-mono">
            Immutable SHA-256 District Audit Trail enforced on every authorization.
          </div>
        </div>
      </div>

      {/* Confirmation Slide-Over Drawer for Approvals */}
      <ConfirmDrawer
        isOpen={confirmDrawerOpen}
        onClose={() => setConfirmDrawerOpen(false)}
        actionItem={activeActionItem}
        onConfirm={handleConfirmAuthorize}
        officerRoleName="Dr. Aditi Sharma (Chief Medical Officer / DHO)"
      />

      {/* Facility Inspection Side Panel */}
      <FacilitySidePanel
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
        onSelectAction={(facilityId) => {
          if (facilityId === 'phc-b') {
            router.push('/alerts');
          } else {
            router.push(`/phc-operations?facilityId=${facilityId}`);
          }
        }}
      />
    </div>
  );
}
