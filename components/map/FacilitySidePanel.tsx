'use client';

import React from 'react';
import { Facility } from '@/types';
import { RiskStatusBadge, DataTrustBadge } from '@/components/ui/ReusableBadges';
import {
  X,
  Hospital,
  Bed,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  MapPin,
} from 'lucide-react';

interface FacilitySidePanelProps {
  facility: Facility | null;
  onClose: () => void;
  onSelectAction: (facilityId: string) => void;
}

export function FacilitySidePanel({
  facility,
  onClose,
  onSelectAction,
}: FacilitySidePanelProps) {
  if (!facility) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {facility.code}
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#10233F] leading-tight">
                {facility.name}
              </h3>
              <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{facility.block} · {facility.district}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200">
          <RiskStatusBadge status={facility.status} />
          <span className="text-[11px] text-slate-500 font-mono">
            Synced: {facility.lastSyncTime}
          </span>
        </div>
      </div>

      {/* Body: Operational Assessment */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Medicine Risk Section */}
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between font-bold text-[#D92D20]">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Medicine Supply Vulnerability</span>
            </span>
            <span className="font-mono text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded">
              High Risk
            </span>
          </div>

          <div className="space-y-1.5 text-slate-700">
            <div className="flex items-center justify-between border-b border-red-100 pb-1">
              <span>Paracetamol 500 mg:</span>
              <strong className="text-red-700 font-mono">
                {facility.id === 'phc-b' ? '120 tabs · 3 days left' : '15 days safe buffer'}
              </strong>
            </div>
            <div className="flex items-center justify-between border-b border-red-100 pb-1">
              <span>Insulin vials:</span>
              <span className="font-mono">7 days buffer</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ORS sachets:</span>
              <span className="font-mono text-emerald-700">13 days safe</span>
            </div>
          </div>
        </div>

        {/* Capacity Section */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="font-bold text-slate-800">Bed & Staff Readiness</div>
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Bed className="w-3 h-3 text-blue-600" />
                <span>Beds Occupied</span>
              </div>
              <div className="text-sm font-bold font-mono text-[#10233F] mt-0.5">
                {facility.bedsOccupied} / {facility.bedsTotal}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {Math.round((facility.bedsOccupied / facility.bedsTotal) * 100)}% utilization
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-600" />
                <span>Staff On Duty</span>
              </div>
              <div className="text-sm font-bold font-mono text-[#10233F] mt-0.5">
                {facility.staffOnDuty} / {facility.staffRequired}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {Math.round((facility.staffOnDuty / facility.staffRequired) * 100)}% readiness
              </div>
            </div>
          </div>
        </div>

        {/* Demand Signal */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-slate-700">
          <div className="font-bold text-blue-950 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Demand Signals (7-Day Rolling)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Daily Outpatient Footfall:</span>
            <strong className="font-mono text-[#10233F]">{facility.footfallDaily} patients/day</strong>
          </div>
          <div className="flex justify-between items-center text-rose-700 font-medium">
            <span>Fever / Acute Flu Footfall:</span>
            <span className="font-mono font-bold">+{facility.feverFootfallChange}% surge</span>
          </div>
        </div>

        {/* Data Trust Score */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Data Trust Score</span>
            <DataTrustBadge
              score={facility.dataTrustScore}
              category={facility.trustCategory}
            />
          </div>
          <div className="text-[11px] text-slate-500">
            {facility.isPhysicallyVerifiedToday
              ? 'Physically verified by local pharmacist this morning. High statistical confidence.'
              : 'Physical audit pending. Data based on sync logs and automated dispense records.'}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/80 flex flex-col gap-2">
        <button
          onClick={() => onSelectAction(facility.id)}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Review Top Action for {facility.code}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={`/phc-operations?facilityId=${facility.id}`}
          className="w-full text-center py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-medium text-xs transition-colors"
        >
          Open PHC Operations Desk
        </a>
      </div>
    </div>
  );
}
