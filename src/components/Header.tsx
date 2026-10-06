import React from 'react';
import { 
  Plus, 
  Table, 
  MessageSquare, 
  Settings, 
  FileCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Edit3
} from 'lucide-react';
import { HospitalDetails, PatientClaim } from '../types';

interface HeaderProps {
  currentTab: 'table' | 'communication' | 'masters';
  onTabChange: (tab: 'table' | 'communication' | 'masters') => void;
  onOpenNewCase: () => void;
  onOpenDocChecklist: () => void;
  onOpenHospitalDetails: () => void;
  hospitalDetails: HospitalDetails;
  claims: PatientClaim[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenNewCase,
  onOpenDocChecklist,
  onOpenHospitalDetails,
  hospitalDetails,
  claims,
}) => {
  const activeCases = claims.filter((c) => !c.isDischarged).length;
  const approvedCases = claims.filter(
    (c) => !c.isDischarged && c.status.toLowerCase().includes('approved')
  ).length;
  const queryCases = claims.filter(
    (c) => !c.isDischarged && (c.status.toLowerCase().includes('query') || c.status.toLowerCase().includes('pending'))
  ).length;

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur">
      {/* Top Banner: Hospital Profile Strip (Ultra-compact for mobile) */}
      <div className="border-b border-slate-800/80 bg-slate-900/90 px-3 sm:px-6 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
            {hospitalDetails.name}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 text-[11px] truncate max-w-sm">
            {hospitalDetails.address}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${hospitalDetails.mobileNumber}`}
            className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] sm:text-xs font-semibold hover:underline"
            title="Call Helpline"
          >
            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{hospitalDetails.mobileNumber}</span>
          </a>
          <button
            onClick={onOpenHospitalDetails}
            className="p-1 text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 rounded transition-colors"
            title="Edit Hospital Details"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Navigation & Action Bar - Compact & Space Maximized */}
      <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Wordmark (No AH logo, No Cashless Portal name) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            Pre-Auth Desk
          </h1>
        </div>

        {/* Navigation Tabs - Mobile Optimized */}
        <nav className="flex items-center gap-1 bg-slate-900 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => onTabChange('table')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'table'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Claims</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {activeCases}
            </span>
          </button>

          <button
            onClick={() => onTabChange('communication')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap relative ${
              currentTab === 'communication'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => onTabChange('masters')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'masters'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Masters</span>
          </button>
        </nav>

        {/* Primary Actions (Checklist + New Pre-Auth) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenDocChecklist}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-800/60 rounded-lg hover:bg-purple-900/80 hover:text-white transition-colors"
            title="Required Documents Checklist"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden md:inline">Docs Checklist</span>
          </button>

          <button
            onClick={onOpenNewCase}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md transition-all active:scale-95"
            title="Log New Pre-Auth Case"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ New</span>
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Compact Stats Strip */}
      <div className="border-t border-slate-800/60 bg-slate-950/90 px-3 sm:px-6 py-1 text-[11px] text-slate-400 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-3 sm:gap-5 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Active:</span>
            <span className="font-bold text-white font-mono">{activeCases}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Approved:</span>
            <span className="font-bold text-emerald-400 font-mono">{approvedCases}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Pending:</span>
            <span className="font-bold text-amber-400 font-mono">{queryCases}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>E2E Encrypted Messaging</span>
        </div>
      </div>
    </header>
  );
};
