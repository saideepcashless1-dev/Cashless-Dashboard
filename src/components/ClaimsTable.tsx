import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  FileCheck, 
  Edit3, 
  Trash2, 
  Phone, 
  LogOut, 
  Check, 
  HeartHandshake, 
  ExternalLink, 
  AlertCircle,
  Clock,
  RotateCcw,
  Send,
  X,
  Smartphone
} from 'lucide-react';
import { HospitalDetails, PatientClaim, StatusItem, StatusMessageTemplate } from '../types';
import { getMessageTemplate, getWhatsAppDeepLink, getSmsDeepLink } from '../services/messagingService';

interface ClaimsTableProps {
  claims: PatientClaim[];
  statuses: StatusItem[];
  admissionTypes: string[];
  insuranceCompanies: string[];
  tpas: string[];
  hospitalDetails: HospitalDetails;
  statusTemplates: StatusMessageTemplate[];
  onUpdateClaim: (id: string, updates: Partial<PatientClaim>) => void;
  onDeleteClaim: (id: string) => void;
  onOpenQuickWhatsApp: (claim: PatientClaim) => void;
  onOpenDocChecklist: (claim: PatientClaim) => void;
  onDischargePatient: (claim: PatientClaim, messageText: string) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  claims,
  statuses,
  admissionTypes,
  insuranceCompanies,
  tpas,
  hospitalDetails,
  statusTemplates,
  onUpdateClaim,
  onDeleteClaim,
  onOpenQuickWhatsApp,
  onOpenDocChecklist,
  onDischargePatient,
}) => {
  // Tabs: 'active' (default) or 'discharged'
  const [viewTab, setViewTab] = useState<'active' | 'discharged'>('active');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAdmissionType, setFilterAdmissionType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterInsurance, setFilterInsurance] = useState('ALL');
  
  // Quick inline edits
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  // Discharge modal state
  const [dischargingClaim, setDischargingClaim] = useState<PatientClaim | null>(null);
  const [dischargeMessage, setDischargeMessage] = useState('');
  const [isSendingDischarge, setIsSendingDischarge] = useState(false);

  // Filter claims based on viewTab (Active vs Discharged) and search/filters
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // 1. Tab filter: Active vs Discharged
      if (viewTab === 'active' && claim.isDischarged) return false;
      if (viewTab === 'discharged' && !claim.isDischarged) return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = claim.patientName.toLowerCase().includes(q);
        const matchesPhone = claim.phoneNumber.toLowerCase().includes(q);
        const matchesUhid = claim.uhid.toLowerCase().includes(q);
        const matchesIns = claim.insuranceCompany.toLowerCase().includes(q);
        const matchesNotes = (claim.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesUhid && !matchesIns && !matchesNotes) {
          return false;
        }
      }

      // 3. Admission Type
      if (filterAdmissionType !== 'ALL' && claim.admissionType !== filterAdmissionType) {
        return false;
      }

      // 4. Status
      if (filterStatus !== 'ALL' && claim.status !== filterStatus) {
        return false;
      }

      // 5. Insurance Company
      if (filterInsurance !== 'ALL' && claim.insuranceCompany !== filterInsurance) {
        return false;
      }

      return true;
    });
  }, [claims, viewTab, searchQuery, filterAdmissionType, filterStatus, filterInsurance]);

  const activeCount = claims.filter((c) => !c.isDischarged).length;
  const dischargedCount = claims.filter((c) => c.isDischarged).length;

  // Open Discharge Modal
  const handleOpenDischarge = (claim: PatientClaim) => {
    setDischargingClaim(claim);
    const tmpl = getMessageTemplate('discharge_take_care', claim, undefined, hospitalDetails, statusTemplates);
    setDischargeMessage(tmpl.body);
  };

  const handleConfirmDischarge = () => {
    if (!dischargingClaim) return;
    setIsSendingDischarge(true);
    setTimeout(() => {
      onDischargePatient(dischargingClaim, dischargeMessage);
      setIsSendingDischarge(false);
      setDischargingClaim(null);
    }, 400);
  };

  const handleDischargeViaWhatsApp = () => {
    if (!dischargingClaim) return;
    onDischargePatient(dischargingClaim, dischargeMessage);
    const url = getWhatsAppDeepLink(dischargingClaim.phoneNumber, dischargeMessage);
    window.location.href = url;
    setDischargingClaim(null);
  };

  const handleDischargeViaSMS = () => {
    if (!dischargingClaim) return;
    onDischargePatient(dischargingClaim, dischargeMessage);
    const url = getSmsDeepLink(dischargingClaim.phoneNumber, dischargeMessage);
    window.location.href = url;
    setDischargingClaim(null);
  };

  // Status Color Helper
  const getStatusStyle = (statusName: string) => {
    const s = statuses.find((item) => item.name.toLowerCase() === statusName.toLowerCase());
    if (s) {
      return `${s.colorBg} ${s.colorText} border ${s.borderColor || 'border-transparent'}`;
    }

    const lower = statusName.toLowerCase();
    if (lower.includes('approved')) {
      return 'bg-emerald-600/90 text-white font-semibold border border-emerald-500';
    }
    if (lower.includes('denied') || lower.includes('rejected')) {
      return 'bg-red-700 text-white font-bold border border-red-500';
    }
    if (lower.includes('not utilized')) {
      return 'bg-rose-950 text-rose-200 border border-rose-700 font-medium';
    }
    if (lower.includes('query')) {
      return 'bg-amber-700/80 text-amber-100 border border-amber-500';
    }
    if (lower.includes('discharged')) {
      return 'bg-purple-900/80 text-purple-200 border border-purple-500 font-semibold';
    }
    return 'bg-slate-800 text-slate-200 border border-slate-700';
  };

  return (
    <div className="space-y-3">
      {/* View Switcher Tabs (Active Admissions vs Discharged) & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-md">
        {/* Active vs Discharged Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewTab('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
              viewTab === 'active'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Active Admissions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              viewTab === 'active' ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab('discharged')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
              viewTab === 'discharged'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
            <span>Discharged</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              viewTab === 'discharged' ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {dischargedCount}
            </span>
          </button>
        </div>

        {/* Search Input - Compact & Fast */}
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone (+91), insurer, notes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Quick Dropdown Filters (Admission Type, Status) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-500 max-w-[130px] truncate"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterAdmissionType}
            onChange={(e) => setFilterAdmissionType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-purple-500 max-w-[130px] truncate"
          >
            <option value="ALL">All Types</option>
            {admissionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE-FIRST VIEW: Responsive Dense Cards (Optimized for Phones) */}
      {/* ------------------------------------------------------------- */}
      <div className="block md:hidden space-y-2.5">
        {filteredClaims.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">
              {viewTab === 'active' ? 'No active pre-auth admissions found' : 'No discharged cases recorded'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tap "+ New" above to log a new admission.
            </p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2.5"
            >
              {/* Row 1: Patient Name & Status Dropdown */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div
                    onClick={() => onOpenDocChecklist(claim)}
                    className="text-sm font-bold text-rose-400 uppercase tracking-tight truncate cursor-pointer hover:underline flex items-center gap-1.5"
                    title="Tap to view required documents checklist"
                  >
                    <span>{claim.patientName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {claim.uhid} · {claim.admissionType}
                  </div>
                </div>

                {/* Inline Status Dropdown */}
                <select
                  value={claim.status}
                  onChange={(e) => onUpdateClaim(claim.id, { status: e.target.value })}
                  className={`text-[11px] px-2 py-1 rounded font-bold cursor-pointer shrink-0 max-w-[140px] truncate ${getStatusStyle(
                    claim.status
                  )}`}
                >
                  {statuses.map((st) => (
                    <option key={st.id} value={st.name} className="bg-slate-900 text-white font-normal">
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Phone with Tap-to-Call, Tap-to-WhatsApp, Tap-to-SMS */}
              <div className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Phone:</span>
                  <a
                    href={`tel:${claim.phoneNumber}`}
                    className="font-mono text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                    title="Call patient"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{claim.phoneNumber}</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenQuickWhatsApp(claim)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[11px] font-semibold active:bg-emerald-900"
                    title="Send WhatsApp update"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={getSmsDeepLink(claim.phoneNumber, `Update regarding cashless claim at ${hospitalDetails.name} for ${claim.patientName}: Status is ${claim.status}.`)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-sky-300 border border-sky-800/60 text-[11px] font-semibold active:bg-slate-750"
                    title="Open in Default SMS App"
                  >
                    <Smartphone className="w-3 h-3 text-sky-400" />
                    <span>SMS</span>
                  </a>
                </div>
              </div>

              {/* Row 3: Insurance & TPA */}
              <div className="text-[11px] text-slate-300">
                <div className="font-semibold text-purple-300 truncate">
                  {claim.insuranceCompany}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  TPA: {claim.tpa}
                </div>
              </div>

              {/* Row 4: Dates (Admission & Initial Auth Selectable from Calendar) */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Admission Date:</span>
                  <input
                    type="date"
                    value={claim.dateOfAdmission}
                    onChange={(e) => onUpdateClaim(claim.id, { dateOfAdmission: e.target.value })}
                    className="bg-transparent text-slate-200 font-mono text-[11px] w-full focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-amber-400/90 block text-[10px]">Initial Auth Date:</span>
                  <input
                    type="date"
                    value={claim.dateOfInitialAuthorization || ''}
                    onChange={(e) => onUpdateClaim(claim.id, { dateOfInitialAuthorization: e.target.value })}
                    className="bg-transparent text-amber-300 font-mono text-[11px] w-full focus:outline-none cursor-pointer font-semibold"
                  />
                </div>
              </div>

              {/* Row 5: Notes */}
              {claim.notes && (
                <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-1.5 rounded border border-slate-850">
                  "{claim.notes}"
                </div>
              )}

              {/* Row 6: Mobile Action Bar - Discharge Button Prominent */}
              <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-800">
                <button
                  onClick={() => onOpenDocChecklist(claim)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg text-xs font-medium"
                >
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Checklist</span>
                </button>

                {viewTab === 'active' ? (
                  <button
                    onClick={() => handleOpenDischarge(claim)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95"
                    title="Discharge patient and send take-care message"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Discharge</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateClaim(claim.id, { isDischarged: false })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-semibold"
                    title="Restore to Active Admissions"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-admit</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteClaim(claim.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP VIEW: Dense, Space-Maximized Clinical Table */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[460px]">
          <table className="w-full text-left border-collapse text-xs">
            {/* Deep Purple Header Row */}
            <thead>
              <tr className="bg-[#4c1d95] text-purple-100 font-semibold uppercase tracking-wider text-[11px] border-b border-purple-800/80">
                <th className="py-3 px-3 min-w-[200px] border-r border-purple-800/60 sticky left-0 z-20 bg-[#4c1d95]">
                  <span>Patient Name</span>
                </th>
                <th className="py-3 px-3 min-w-[150px] border-r border-purple-800/60">
                  <span>Patient Phone</span>
                </th>
                <th className="py-3 px-3 min-w-[140px] border-r border-purple-800/60">
                  <span>Admission Type</span>
                </th>
                <th className="py-3 px-3 min-w-[170px] border-r border-purple-800/60">
                  <span>Status</span>
                </th>
                <th className="py-3 px-3 min-w-[125px] border-r border-purple-800/60">
                  <span>Admission Date</span>
                </th>
                <th className="py-3 px-3 min-w-[130px] border-r border-purple-800/60">
                  <span className="text-amber-200">Date Initial Auth</span>
                </th>
                <th className="py-3 px-3 min-w-[190px] border-r border-purple-800/60">
                  <span>Indian Insurance Company</span>
                </th>
                <th className="py-3 px-3 min-w-[160px] border-r border-purple-800/60">
                  <span>TPA</span>
                </th>
                <th className="py-3 px-3 min-w-[220px] border-r border-purple-800/60">
                  <span>Notes / Reason</span>
                </th>
                <th className="py-3 px-3 min-w-[120px] text-center">
                  <span>Discharge / Actions</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/70">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-300">
                      {viewTab === 'active' ? 'No active pre-auth cases' : 'No discharged cases recorded'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-900/60 transition-colors group"
                  >
                    {/* Patient Name */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60 sticky left-0 z-10 bg-slate-950 group-hover:bg-slate-900/90 transition-colors">
                      <div className="flex flex-col">
                        <span 
                          className="font-bold text-[#f43f5e] tracking-wide uppercase hover:underline cursor-pointer"
                          onClick={() => onOpenDocChecklist(claim)}
                          title="Click to view required documents checklist"
                        >
                          {claim.patientName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{claim.uhid}</span>
                      </div>
                    </td>

                    {/* Patient Phone Number (WhatsApp & SMS trigger) */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[11px] text-slate-300">
                          {claim.phoneNumber}
                        </span>
                        <button
                          onClick={() => onOpenQuickWhatsApp(claim)}
                          className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-400 transition-colors"
                          title="Send encrypted WhatsApp status"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Admission Type (Dropdown) */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      <select
                        value={claim.admissionType}
                        onChange={(e) => onUpdateClaim(claim.id, { admissionType: e.target.value })}
                        className="text-xs px-2 py-1 rounded font-medium bg-slate-900 text-slate-200 border border-slate-700/80 cursor-pointer w-full focus:outline-none"
                      >
                        {admissionTypes.map((type) => (
                          <option key={type} value={type} className="bg-slate-900 text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status (Dropdown) */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      <select
                        value={claim.status}
                        onChange={(e) => onUpdateClaim(claim.id, { status: e.target.value })}
                        className={`text-xs px-2 py-1 rounded font-semibold cursor-pointer w-full focus:outline-none ${getStatusStyle(
                          claim.status
                        )}`}
                      >
                        {statuses.map((st) => (
                          <option key={st.id} value={st.name} className="bg-slate-900 text-white">
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date of Admission (Calendar Selectable) */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60 font-mono text-[11px] text-slate-300">
                      <input
                        type="date"
                        value={claim.dateOfAdmission}
                        onChange={(e) => onUpdateClaim(claim.id, { dateOfAdmission: e.target.value })}
                        className="bg-transparent hover:bg-slate-900 border border-transparent hover:border-slate-700 rounded px-1.5 py-0.5 text-slate-200 cursor-pointer w-full font-mono"
                        title="Click to select Date of Admission"
                      />
                    </td>

                    {/* Date of Initial Authorization (Calendar Selectable) */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60 font-mono text-[11px] text-amber-300">
                      <input
                        type="date"
                        value={claim.dateOfInitialAuthorization || ''}
                        onChange={(e) => onUpdateClaim(claim.id, { dateOfInitialAuthorization: e.target.value })}
                        className="bg-transparent hover:bg-slate-900 border border-transparent hover:border-slate-700 rounded px-1.5 py-0.5 text-amber-200 cursor-pointer w-full font-mono font-semibold"
                        title="Click to select Date of Initial Authorization"
                      />
                    </td>

                    {/* Indian Insurance Companies */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      <select
                        value={claim.insuranceCompany}
                        onChange={(e) => onUpdateClaim(claim.id, { insuranceCompany: e.target.value })}
                        className="text-xs bg-slate-900 border border-slate-700/80 text-slate-200 px-2 py-1 rounded w-full focus:outline-none truncate"
                        title={claim.insuranceCompany}
                      >
                        {insuranceCompanies.map((ins) => (
                          <option key={ins} value={ins} className="bg-slate-900 text-white">
                            {ins}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* TPA */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      <select
                        value={claim.tpa}
                        onChange={(e) => onUpdateClaim(claim.id, { tpa: e.target.value })}
                        className="text-xs bg-slate-900 border border-slate-700/80 text-slate-200 px-2 py-1 rounded w-full focus:outline-none truncate"
                        title={claim.tpa}
                      >
                        {tpas.map((tpa) => (
                          <option key={tpa} value={tpa} className="bg-slate-900 text-white">
                            {tpa}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="py-2.5 px-3 border-r border-slate-800/60">
                      {editingNotesId === claim.id ? (
                        <div className="flex flex-col gap-1">
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-900 border border-purple-500 rounded p-1 text-xs text-white"
                          />
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="text-[10px] text-slate-400 hover:text-white px-1.5"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                onUpdateClaim(claim.id, { notes: tempNotes });
                                setEditingNotesId(null);
                              }}
                              className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(claim.id);
                            setTempNotes(claim.notes || '');
                          }}
                          className="cursor-pointer group/note flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-900"
                        >
                          <p className="line-clamp-2 text-[11px] text-slate-400 italic">
                            {claim.notes || 'Click to add notes...'}
                          </p>
                          <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover/note:opacity-100 shrink-0" />
                        </div>
                      )}
                    </td>

                    {/* Actions: Discharge Button Prominent (or Re-admit if discharged) */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {viewTab === 'active' ? (
                          <button
                            onClick={() => handleOpenDischarge(claim)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow transition-transform active:scale-95"
                            title="Discharge patient and send take-care message"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Discharge</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateClaim(claim.id, { isDischarged: false })}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-medium"
                            title="Restore to Active Admissions"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Re-admit</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteClaim(claim.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DISCHARGE CONFIRMATION & TAKE-CARE FEEDBACK MODAL */}
      {/* ------------------------------------------------------------- */}
      {dischargingClaim && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Discharge Patient & Send Care Wishes</h3>
                  <p className="text-[11px] text-slate-400">
                    Removes from active admissions & sends take-care message
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDischargingClaim(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">{dischargingClaim.patientName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{dischargingClaim.uhid} · {dischargingClaim.insuranceCompany}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Recipient Phone:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{dischargingClaim.phoneNumber}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp Discharge, Well Wishes & Feedback Message:
                </label>
                <textarea
                  rows={9}
                  value={dischargeMessage}
                  onChange={(e) => setDischargeMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                <span>
                  Pressing Confirm will remove <strong>{dischargingClaim.patientName}</strong> from active display and send this care & feedback message via WhatsApp.
                </span>
              </div>
            </div>

            {/* Modal Actions with Direct Mobile WhatsApp / SMS Launch */}
            <div className="px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setDischargingClaim(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white w-full sm:w-auto text-center"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleDischargeViaSMS}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-800/60 rounded-lg text-xs font-bold shadow transition-colors active:scale-95"
                  title="Discharge & Open Default Messaging App"
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Default SMS App</span>
                </button>

                <button
                  type="button"
                  onClick={handleDischargeViaWhatsApp}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition-transform active:scale-95"
                  title="Discharge & Open in WhatsApp on Mobile Phone"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
