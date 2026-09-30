'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  UserCheck,
  ShieldCheck,
  Building,
  Truck,
  Eye,
  Hospital,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useApp();

  const roles: Array<{
    role: UserRole;
    name: string;
    title: string;
    scope: string;
    icon: typeof Building;
    description: string;
    color: string;
    route: string;
  }> = [
    {
      role: 'DISTRICT_OFFICER',
      name: 'Dr. Aditi Sharma',
      title: 'District Health Officer (DHO)',
      scope: 'Meerut District Command',
      icon: ShieldCheck,
      description: 'Reviews and authorizes cross-facility medicine redistributions, activates Emergency Mode, audits district risk.',
      color: 'border-blue-300 hover:border-blue-500 bg-blue-50/50',
      route: '/dashboard',
    },
    {
      role: 'PHC_STAFF',
      name: 'Dr. Rajesh Verma',
      title: 'Frontline Medical Officer & Pharmacist',
      scope: 'PHC B — Meerut Rural',
      icon: Hospital,
      description: 'Enters daily footfall, fever trends, updates physical shelf inventory, and logs receipt of medicine consignments.',
      color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/50',
      route: '/phc-operations',
    },
    {
      role: 'WAREHOUSE_OFFICER',
      name: 'Suresh Gupta',
      title: 'District Medical Warehouse Manager',
      scope: 'Meerut Central Supply Depot',
      icon: Truck,
      description: 'Inspects approved transfer orders, dispatches medical transport vehicles, and logs transit tracking.',
      color: 'border-purple-300 hover:border-purple-500 bg-purple-50/50',
      route: '/redistribution',
    },
    {
      role: 'STATE_VIEWER',
      name: 'State Directorate Monitor',
      title: 'UP Health Resilience Observer',
      scope: 'State Mission Directorate (Lucknow)',
      icon: Eye,
      description: 'Read-only access to state-wide resilience benchmarks, prevented stock-out metrics, and compliance audit trail.',
      color: 'border-slate-300 hover:border-slate-500 bg-slate-50/70',
      route: '/impact-audit',
    },
  ];

  const handleSelectRole = (r: UserRole, targetRoute: string) => {
    setCurrentRole(r);
    router.push(targetRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-sm">
            SS
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            SwasthyaSetu AI
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Explainable Health Resilience Copilot for Primary Health Centres (PHCs) and District Officers.
          </p>
          <div className="inline-block text-[11px] text-blue-800 bg-blue-100 font-mono px-2.5 py-0.5 rounded-full font-semibold">
            Simulated Demo Mode · Select Operational Persona
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role, item.route)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 shadow-xs flex flex-col justify-between ${
                  isCurrent ? 'ring-2 ring-blue-600 border-blue-600 bg-white' : item.color
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <div className="text-xs text-slate-600 font-medium">{item.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.scope}</div>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Enter As {item.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-2">
          Demonstration platform complying with zero patient data storage principles.
        </div>
      </div>
    </div>
  );
}
