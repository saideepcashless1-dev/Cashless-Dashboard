import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  MessageSquare, 
  FileCheck2,
  Calendar,
  Building2,
  User,
  Phone
} from 'lucide-react';
import { PatientClaim, StatusItem } from '../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newClaim: PatientClaim, sendWelcome: boolean, channel: 'whatsapp' | 'sms') => void;
  admissionTypes: string[];
  statuses: StatusItem[];
  insuranceCompanies: string[];
  tpas: string[];
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onAddCase,
  admissionTypes,
  statuses,
  insuranceCompanies,
  tpas,
}) => {
  if (!isOpen) return null;

  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [admissionType, setAdmissionType] = useState(admissionTypes[0] || 'Regular Admission');
  const [status, setStatus] = useState('Preauth Request Sent');
  const [insuranceCompany, setInsuranceCompany] = useState(insuranceCompanies[0] || 'Star Health and Allied Insurance');
  const [tpa, setTpa] = useState(tpas[0] || 'In-House TPA (Star Health In-House)');
  const [dateOfAdmission, setDateOfAdmission] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [dateOfInitialAuthorization, setDateOfInitialAuthorization] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [sendWelcome, setSendWelcome] = useState(true);
  const [welcomeChannel, setWelcomeChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newClaim: PatientClaim = {
      id: `claim-${Date.now()}`,
      uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName.trim().toUpperCase(),
      phoneNumber: phoneNumber.trim() || '+91 98000 00000',
      admissionType,
      status,
      dateOfAdmission,
      dateOfInitialAuthorization: dateOfInitialAuthorization || (status.toLowerCase().includes('approved') ? dateOfAdmission : ''),
      insuranceCompany,
      tpa,
      notes: notes.trim() || 'New pre-authorization admission registered.',
      whatsappAutoNotify: true,
      lastMessageSent: '',
      isDischarged: false,
    };

    onAddCase(newClaim, sendWelcome, welcomeChannel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Log New Pre-Auth Admission</h3>
              <p className="text-[11px] text-slate-400">
                Register patient & send welcome message with required docs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable on mobile */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs">
          {/* Patient Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. PATIL ANITA RAMESH"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Patient WhatsApp Mobile *
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Admission Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admission Type
              </label>
              <select
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {admissionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Pre-Auth Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Admission & Date of Initial Authorization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Admission (Calendar)
              </label>
              <input
                type="date"
                required
                value={dateOfAdmission}
                onChange={(e) => setDateOfAdmission(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Date of Initial Authorization (if approved)
              </label>
              <input
                type="date"
                value={dateOfInitialAuthorization}
                onChange={(e) => setDateOfInitialAuthorization(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Insurance Company & TPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Indian Insurance Company
              </label>
              <select
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {insuranceCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Third-Party Administrator (TPA)
              </label>
              <select
                value={tpa}
                onChange={(e) => setTpa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {tpas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Remarks / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Initial Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Twin-sharing room, planned procedure, original reports submitted..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Welcome Message + Required Documents Checklist Option */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Send Welcome Message + Required Documents Checklist
                </span>
              </div>
              <input
                type="checkbox"
                checked={sendWelcome}
                onChange={(e) => setSendWelcome(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {sendWelcome && (
              <div className="flex items-center gap-2 pt-1 border-t border-purple-800/40">
                <span className="text-[11px] text-slate-400">Open App on Phone:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWelcomeChannel('whatsapp')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      welcomeChannel === 'whatsapp'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setWelcomeChannel('sms')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      welcomeChannel === 'sms'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Default SMS App
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-purple-300/80 leading-relaxed">
              Upon logging admission, opens {welcomeChannel === 'whatsapp' ? 'WhatsApp' : 'your Default Messaging App'} pre-filled with the English required documents checklist (IRDAI mandated KYC, photo ID, policy copy, and Cashless Desk No. 26 Ground Floor details).
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg transition-transform active:scale-95"
            >
              Log Admission & Send Welcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
