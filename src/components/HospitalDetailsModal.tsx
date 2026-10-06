import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  X, 
  Check, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { HospitalDetails } from '../types';

interface HospitalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalDetails: HospitalDetails;
  onSave: (details: HospitalDetails) => void;
}

export const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  isOpen,
  onClose,
  hospitalDetails,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(hospitalDetails.name);
  const [address, setAddress] = useState(hospitalDetails.address);
  const [mobileNumber, setMobileNumber] = useState(hospitalDetails.mobileNumber);
  const [email, setEmail] = useState(hospitalDetails.email || '');
  const [tpaDeskExt, setTpaDeskExt] = useState(hospitalDetails.tpaDeskExt || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      address: address.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim(),
      tpaDeskExt: tpaDeskExt.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hospital Details & TPA Desk</h3>
              <p className="text-[11px] text-slate-400">
                Official hospital identity used across WhatsApp/SMS and pre-auth dossiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Hospital details saved successfully!</span>
            </div>
          )}

          {/* Hospital Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hospital Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saideep Hospital & Research Centre"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Hospital Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hospital Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Court Road, Savedi, Ahmednagar, Maharashtra 414001, India"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Hospital Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hospital Mobile / Cashless Helpdesk Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98220 12345"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Included in WhatsApp/SMS notifications as the callback hospital contact number
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hospital Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="saideepcashless1@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                TPA Desk Reference (Optional)
              </label>
              <input
                type="text"
                value={tpaDeskExt}
                onChange={(e) => setTpaDeskExt(e.target.value)}
                placeholder="Cashless Desk (Ext. 401)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-950/50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Hospital Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
