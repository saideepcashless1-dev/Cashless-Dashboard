import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Smartphone, 
  CheckCheck, 
  Lock, 
  Phone,
  ExternalLink
} from 'lucide-react';
import { NotificationLog, PatientClaim, HospitalDetails } from '../types';
import { 
  formatDateTime, 
  generateE2EHash, 
  getMessageTemplate, 
  getWhatsAppDeepLink, 
  getSmsDeepLink 
} from '../services/messagingService';

interface QuickWhatsAppModalProps {
  claim: PatientClaim | null;
  hospitalDetails?: HospitalDetails;
  initialTemplateKey?: string;
  onClose: () => void;
  onSend: (log: NotificationLog) => void;
  onUpdateClaim: (id: string, updates: Partial<PatientClaim>) => void;
}

export const QuickWhatsAppModal: React.FC<QuickWhatsAppModalProps> = ({
  claim,
  hospitalDetails,
  initialTemplateKey = 'approved',
  onClose,
  onSend,
  onUpdateClaim,
}) => {
  if (!claim) return null;

  const [templateKey, setTemplateKey] = useState<string>(initialTemplateKey);

  // Template text
  const initialBody = getMessageTemplate(templateKey, claim, undefined, hospitalDetails).body;
  const [messageText, setMessageText] = useState<string>(initialBody);
  const [customPhone, setCustomPhone] = useState(claim.phoneNumber);

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    const tmpl = getMessageTemplate(key, claim, undefined, hospitalDetails);
    setMessageText(tmpl.body);
  };

  const recordDispatch = async (channel: 'whatsapp' | 'sms') => {
    const hash = await generateE2EHash(messageText);
    const log: NotificationLog = {
      id: `log-${Date.now()}`,
      patientId: claim.id,
      patientName: claim.patientName,
      phoneNumber: customPhone,
      channel,
      templateName: getMessageTemplate(templateKey, claim, undefined, hospitalDetails).title,
      messageText,
      sentAt: formatDateTime(new Date()),
      status: 'delivered',
      encryptionHash: hash,
    };

    onSend(log);
    onUpdateClaim(claim.id, {
      phoneNumber: customPhone,
      lastMessageSent: formatDateTime(new Date()),
    });
  };

  const handleOpenWhatsApp = async () => {
    await recordDispatch('whatsapp');
    const url = getWhatsAppDeepLink(customPhone, messageText);
    window.location.href = url;
    setTimeout(() => onClose(), 800);
  };

  const handleOpenSMS = async () => {
    await recordDispatch('sms');
    const url = getSmsDeepLink(customPhone, messageText);
    window.location.href = url;
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Send Patient Notification</h3>
              <p className="text-[11px] text-slate-400">
                Direct WhatsApp or Default Messaging App for {claim.patientName}
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[75vh] text-xs">
          {/* Phone recipient field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recipient Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-purple-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          {/* Quick template selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Pre-Auth Status Template
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleTemplateChange('approved')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'approved'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Initial Approved
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('query_raised')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'query_raised'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Query Raised
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('docs_pending')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'docs_pending'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Documents Pending
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('enhancement_approved')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'enhancement_approved'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Enhancement Approved
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('denied_rejected')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'denied_rejected'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cashless Denied
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('welcome_checklist')}
                className={`p-2 rounded-lg text-left border text-[11px] font-medium transition-colors ${
                  templateKey === 'welcome_checklist'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Welcome + Docs Checklist
              </button>
            </div>
          </div>

          {/* Editable text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Message Body (Will be pre-filled in your mobile messaging app)
            </label>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
            />
          </div>

          {/* E2E Security Badge */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tap below to open WhatsApp app or Default SMS app on your phone</span>
            </div>
            <Lock className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        {/* Footer with Direct Mobile Messaging Options */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white w-full sm:w-auto text-center"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Open Default SMS App on Mobile */}
            <button
              onClick={handleOpenSMS}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-800/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors active:scale-95"
              title="Open Default Messaging App (SMS)"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Default SMS App</span>
            </button>

            {/* Open WhatsApp on Mobile Phone */}
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
              title="Open WhatsApp on Mobile Phone"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
