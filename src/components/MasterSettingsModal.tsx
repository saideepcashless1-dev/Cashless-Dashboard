import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Layers, 
  Activity, 
  Building2, 
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';
import { StatusItem } from '../types';

interface MasterSettingsModalProps {
  admissionTypes: string[];
  statuses: StatusItem[];
  insuranceCompanies: string[];
  tpas: string[];
  onUpdateAdmissionTypes: (types: string[]) => void;
  onUpdateStatuses: (statuses: StatusItem[]) => void;
  onUpdateInsuranceCompanies: (companies: string[]) => void;
  onUpdateTPAs: (tpas: string[]) => void;
}

export const MasterSettingsModal: React.FC<MasterSettingsModalProps> = ({
  admissionTypes,
  statuses,
  insuranceCompanies,
  tpas,
  onUpdateAdmissionTypes,
  onUpdateStatuses,
  onUpdateInsuranceCompanies,
  onUpdateTPAs,
}) => {
  const [activeTab, setActiveTab] = useState<'admission' | 'statuses' | 'insurance' | 'tpa'>('admission');
  
  // New item states
  const [newAdmissionType, setNewAdmissionType] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusCategory, setNewStatusCategory] = useState<StatusItem['category']>('in_progress');
  const [newInsurance, setNewInsurance] = useState('');
  const [newTPA, setNewTPA] = useState('');

  // Search states for long catalogs
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [tpaSearch, setTpaSearch] = useState('');

  // 1. Admission Types Handler
  const handleAddAdmissionType = () => {
    if (!newAdmissionType.trim()) return;
    if (!admissionTypes.includes(newAdmissionType.trim())) {
      onUpdateAdmissionTypes([...admissionTypes, newAdmissionType.trim()]);
    }
    setNewAdmissionType('');
  };

  const handleDeleteAdmissionType = (typeToDelete: string) => {
    onUpdateAdmissionTypes(admissionTypes.filter((t) => t !== typeToDelete));
  };

  // 2. Statuses Handler
  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    const newStatus: StatusItem = {
      id: `custom_status_${Date.now()}`,
      name: newStatusName.trim(),
      category: newStatusCategory,
      colorBg:
        newStatusCategory === 'approved'
          ? 'bg-emerald-900/80'
          : newStatusCategory === 'rejected'
          ? 'bg-red-900/90'
          : newStatusCategory === 'query'
          ? 'bg-amber-900/70'
          : 'bg-indigo-900/70',
      colorText:
        newStatusCategory === 'approved'
          ? 'text-emerald-100 font-bold'
          : newStatusCategory === 'rejected'
          ? 'text-red-100 font-bold'
          : 'text-slate-100',
      borderColor:
        newStatusCategory === 'approved'
          ? 'border-emerald-500'
          : newStatusCategory === 'rejected'
          ? 'border-red-600'
          : 'border-slate-600',
    };
    onUpdateStatuses([...statuses, newStatus]);
    setNewStatusName('');
  };

  const handleDeleteStatus = (idToDelete: string) => {
    onUpdateStatuses(statuses.filter((s) => s.id !== idToDelete));
  };

  // 3. Insurance Companies Handler
  const handleAddInsurance = () => {
    if (!newInsurance.trim()) return;
    if (!insuranceCompanies.includes(newInsurance.trim())) {
      onUpdateInsuranceCompanies([newInsurance.trim(), ...insuranceCompanies]);
    }
    setNewInsurance('');
  };

  const handleDeleteInsurance = (name: string) => {
    onUpdateInsuranceCompanies(insuranceCompanies.filter((i) => i !== name));
  };

  // 4. TPAs Handler
  const handleAddTPA = () => {
    if (!newTPA.trim()) return;
    if (!tpas.includes(newTPA.trim())) {
      onUpdateTPAs([newTPA.trim(), ...tpas]);
    }
    setNewTPA('');
  };

  const handleDeleteTPA = (name: string) => {
    onUpdateTPAs(tpas.filter((t) => t !== name));
  };

  // Filtered lists for long catalogs
  const filteredInsurance = insuranceCompanies.filter((i) =>
    i.toLowerCase().includes(insuranceSearch.toLowerCase().trim())
  );

  const filteredTPAs = tpas.filter((t) =>
    t.toLowerCase().includes(tpaSearch.toLowerCase().trim())
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Portal Dropdown Masters & Configuration
            </h2>
            <p className="text-xs text-slate-400">
              Customize admission types, status lifecycles, Indian insurance companies, and TPAs
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('admission')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'admission'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Admission Types ({admissionTypes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('statuses')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'statuses'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Status Lifecycle ({statuses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('insurance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'insurance'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Indian Insurance Companies ({insuranceCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tpa')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tpa'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Third-Party Administrators - TPA ({tpas.length})</span>
        </button>
      </div>

      {/* TAB 1: ADMISSION TYPES */}
      {activeTab === 'admission' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
            Configure admission categories. The portal defaults to <strong className="text-purple-300">Regular Admission</strong> and <strong className="text-purple-300">Planned admission</strong>, with full ability to add custom types like Emergency or Day Care Procedure.
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAdmissionType}
              onChange={(e) => setNewAdmissionType(e.target.value)}
              placeholder="e.g. Emergency Admission, Day Care Surgery, ICU Direct..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddAdmissionType}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Admission Type</span>
            </button>
          </div>

          <div className="space-y-2">
            {admissionTypes.map((type) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="font-semibold text-slate-200">{type}</span>
                </div>
                {admissionTypes.length > 1 && (
                  <button
                    onClick={() => handleDeleteAdmissionType(type)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Admission Type"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STATUSES */}
      {activeTab === 'statuses' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
            Define pre-authorization stages: Not started, Documents Pending, Documents received, Preauth Request Sent, Approved, Query Raised, Query replied, Cashless Denied or Rejected, Enhancement, Discharge, etc.
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="New status name (e.g. Reconsideration Approved)..."
              className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <select
              value={newStatusCategory}
              onChange={(e) => setNewStatusCategory(e.target.value as StatusItem['category'])}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="initial">Initial Stage</option>
              <option value="in_progress">In Progress</option>
              <option value="query">Query Stage</option>
              <option value="approved">Approved</option>
              <option value="rejected">Denied / Rejected</option>
              <option value="enhancement">Enhancement</option>
              <option value="discharge">Discharge</option>
            </select>
            <button
              onClick={handleAddStatus}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[460px] overflow-y-auto pr-1">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${status.colorBg} ${status.colorText} ${status.borderColor || 'border-transparent'}`}
                  >
                    {status.name}
                  </span>
                </div>
                {statuses.length > 3 && (
                  <button
                    onClick={() => handleDeleteStatus(status.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 shrink-0 ml-1"
                    title="Delete Status"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INDIAN HEALTH INSURANCE COMPANIES */}
      {activeTab === 'insurance' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              All registered <strong className="text-purple-300">Indian Insurance Companies</strong> operating in health care. Search or add any insurer.
            </span>
            <span className="text-[11px] text-purple-400 font-mono">
              Total: {insuranceCompanies.length}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInsurance}
              onChange={(e) => setNewInsurance(e.target.value)}
              placeholder="e.g. New Indian Health Insurer Ltd..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddInsurance}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Insurer</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={insuranceSearch}
              onChange={(e) => setInsuranceSearch(e.target.value)}
              placeholder="Filter insurance companies..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredInsurance.map((ins) => (
              <div
                key={ins}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-200 truncate font-medium">{ins}</span>
                </div>
                <button
                  onClick={() => handleDeleteInsurance(ins)}
                  className="text-slate-500 hover:text-rose-400 p-1 shrink-0 ml-2"
                  title="Remove Insurer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: THIRD-PARTY ADMINISTRATORS (TPAs) */}
      {activeTab === 'tpa' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              All licensed <strong className="text-purple-300">Third-Party Administrators (TPAs)</strong> in India.
            </span>
            <span className="text-[11px] text-purple-400 font-mono">
              Total: {tpas.length}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTPA}
              onChange={(e) => setNewTPA(e.target.value)}
              placeholder="e.g. New Health TPA Services Pvt Ltd..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAddTPA}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add TPA</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tpaSearch}
              onChange={(e) => setTpaSearch(e.target.value)}
              placeholder="Filter TPAs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredTPAs.map((tpa) => (
              <div
                key={tpa}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-200 truncate font-medium">{tpa}</span>
                </div>
                <button
                  onClick={() => handleDeleteTPA(tpa)}
                  className="text-slate-500 hover:text-rose-400 p-1 shrink-0 ml-2"
                  title="Remove TPA"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
