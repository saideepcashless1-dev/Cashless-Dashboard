import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Phone, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { HospitalDetails, PatientClaim, RequiredDocumentItem } from '../types';
import { DEFAULT_REQUIRED_DOCUMENTS } from '../data/masters';
import { getWhatsAppDeepLink, getSmsDeepLink } from '../services/messagingService';

interface DocumentChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim?: PatientClaim | null;
  hospitalDetails: HospitalDetails;
  onSendWhatsAppChecklist: (phoneNumber: string, messageText: string) => void;
}

export const DocumentChecklistModal: React.FC<DocumentChecklistModalProps> = ({
  isOpen,
  onClose,
  claim,
  hospitalDetails,
  onSendWhatsAppChecklist,
}) => {
  if (!isOpen) return null;

  const [checklist, setChecklist] = useState<RequiredDocumentItem[]>(() => {
    return DEFAULT_REQUIRED_DOCUMENTS.map((doc) => ({
      ...doc,
      received: claim?.documentsChecklist?.[doc.id] ?? false,
    }));
  });

  const [copied, setCopied] = useState(false);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, received: !item.received } : item))
    );
  };

  const deskText = hospitalDetails.cashlessDeskNumber || 'Cashless Desk No. 26 (Ground Floor)';

  // Build the English WhatsApp text based on the user's Marathi requirement
  const englishChecklistMessage = `*Required Documents for Cashless Health Insurance Claim*
${hospitalDetails.name}

Dear ${claim?.patientName || 'Patient / Relative'},

For processing your cashless health insurance claim, please submit the following documents at the earliest:

1. *Patient Documents:*
   - Health Insurance Policy Paper / Cashless Health Card
   - Patient Photo ID (Aadhaar Card, PAN Card, or Driving License - Any one)

2. *Primary Policy Member / Proposer Documents:*
   - PAN Card
   - Aadhaar Card
   - Passport Size Photograph
   *(All the above documents are mandatory as per IRDAI guidelines since 1st January 2023)*

3. *Corporate / Group Policy (if applicable):*
   - Valid Employee ID Card

4. *In case of Name Discrepancy (if applicable):*
   - Marriage Certificate, Official Gazette, or Notarized Affidavit

⚠️ *IMPORTANT: Late submission of documents may lead to cashless claim denial / rejection.*

For queries or document submission, please report to:
📍 ${deskText}
${hospitalDetails.name}
📍 ${hospitalDetails.address}
📞 Helpline / Mobile: ${hospitalDetails.mobileNumber}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(englishChecklistMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phone = claim?.phoneNumber || hospitalDetails.mobileNumber;
    onSendWhatsAppChecklist(phone, englishChecklistMessage);
    const url = getWhatsAppDeepLink(phone, englishChecklistMessage);
    window.location.href = url;
  };

  const handleSendSMS = () => {
    const phone = claim?.phoneNumber || hospitalDetails.mobileNumber;
    onSendWhatsAppChecklist(phone, englishChecklistMessage);
    const url = getSmsDeepLink(phone, englishChecklistMessage);
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Required Documents Checklist
                </h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-mono">
                  Cashless Claims
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {claim ? `For ${claim.patientName} (${claim.admissionType})` : 'IRDAI Mandated Patient Documentation Standards'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title="Copy English Checklist text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title="Print Checklist"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Subtitle intro */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white text-sm">
              Required Documents for Cashless Health Insurance Claims
            </div>
            <p className="text-slate-400 text-xs">
              For processing cashless health insurance claims, please submit the following documents to the hospital cashless desk.
            </p>
          </div>

          {/* Interactive Checklist Cards */}
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  item.received
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-emerald-400 shrink-0"
                >
                  {item.received ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold ${item.received ? 'text-emerald-300 line-through' : 'text-slate-100'}`}>
                      {index + 1}. {item.title}
                    </span>
                    {item.isMandatory && (
                      <span className="text-[10px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-800/50 px-1.5 py-0.2 rounded shrink-0">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Regulatory IRDAI Callout */}
          <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200">
            <span className="font-semibold block text-purple-300 mb-0.5">
              📌 IRDAI Mandatory Compliance Note:
            </span>
            <span>
              All Proposer PAN Cards, Aadhaar Cards, and passport photographs have been made strictly mandatory by the Insurance Regulatory and Development Authority of India (IRDAI) since 1st January 2023 for all cashless health claims.
            </span>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 bg-rose-950/40 border border-rose-600/70 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-300">
                Notice: Late submission of documents may lead to cashless claim rejection or denial.
              </span>
              <span className="text-[11px] text-rose-300/80 mt-0.5 block">
                Please submit the above paperwork immediately upon admission to ensure timely pre-authorization.
              </span>
            </div>
          </div>

          {/* Desk Location Information */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="space-y-0.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Contact: {deskText}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {hospitalDetails.name} · {hospitalDetails.address}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Cashless Helpline:</span>
              <span className="font-mono text-emerald-400 font-semibold">{hospitalDetails.mobileNumber}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {checklist.filter((i) => i.received).length} of {checklist.length} documents collected
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendSMS}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors active:scale-95"
              title="Open Default Messaging App (SMS)"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Default SMS App</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="Open WhatsApp on Mobile Phone"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
