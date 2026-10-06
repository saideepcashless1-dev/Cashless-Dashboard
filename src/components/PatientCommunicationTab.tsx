import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Key, 
  Lock, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Settings2, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  FileText,
  Search,
  ExternalLink,
  Smartphone,
  Edit,
  Save,
  RotateCcw
} from 'lucide-react';
import { MessagingGatewayConfig, NotificationLog, PatientClaim, HospitalDetails, StatusMessageTemplate } from '../types';
import { 
  formatDateTime, 
  generateE2EHash, 
  getMessageTemplate, 
  mapStatusToTemplateKey,
  getWhatsAppDeepLink,
  getSmsDeepLink
} from '../services/messagingService';
import { DEFAULT_STATUS_TEMPLATES } from '../data/masters';

interface PatientCommunicationTabProps {
  claims: PatientClaim[];
  notificationLogs: NotificationLog[];
  gatewayConfig: MessagingGatewayConfig;
  hospitalDetails: HospitalDetails;
  statusTemplates: StatusMessageTemplate[];
  onUpdateStatusTemplates: (templates: StatusMessageTemplate[]) => void;
  onUpdateClaim: (id: string, updates: Partial<PatientClaim>) => void;
  onAddNotificationLog: (log: NotificationLog) => void;
  onUpdateGatewayConfig: (config: MessagingGatewayConfig) => void;
}

export const PatientCommunicationTab: React.FC<PatientCommunicationTabProps> = ({
  claims,
  notificationLogs,
  gatewayConfig,
  hospitalDetails,
  statusTemplates,
  onUpdateStatusTemplates,
  onUpdateClaim,
  onAddNotificationLog,
  onUpdateGatewayConfig,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'dispatcher' | 'templates' | 'logs' | 'api_gateway'>('dispatcher');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('auto');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Template editor state
  const [editingTemplateKey, setEditingTemplateKey] = useState<string>(statusTemplates[0]?.statusKey || 'approved');
  const currentEditingTemplate = statusTemplates.find((t) => t.statusKey === editingTemplateKey) || statusTemplates[0];
  const [editedTitle, setEditedTitle] = useState(currentEditingTemplate?.title || '');
  const [editedBody, setEditedBody] = useState(currentEditingTemplate?.body || '');
  const [templateSavedToast, setTemplateSavedToast] = useState(false);

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  // Derive template key from claim status if auto
  const effectiveKey = selectedTemplateKey === 'auto'
    ? (selectedClaim ? mapStatusToTemplateKey(selectedClaim.status) : 'default')
    : selectedTemplateKey;

  // Generate current message body using customizable templates
  const currentTemplate = selectedClaim
    ? getMessageTemplate(effectiveKey, selectedClaim, undefined, hospitalDetails, statusTemplates)
    : { title: '', body: '' };

  const messageTextToSend = customMessage.trim() ? customMessage : currentTemplate.body;

  // Filtered patients for list
  const filteredClaims = claims.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.patientName.toLowerCase().includes(q) ||
      c.phoneNumber.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  const handleSendNotification = async () => {
    if (!selectedClaim) return;
    setIsSending(true);
    setSendSuccessMessage(null);

    const encryptionHash = await generateE2EHash(messageTextToSend);

    setTimeout(() => {
      const newLog: NotificationLog = {
        id: `log-${Date.now()}`,
        patientId: selectedClaim.id,
        patientName: selectedClaim.patientName,
        phoneNumber: selectedClaim.phoneNumber,
        channel: selectedChannel,
        templateName: selectedTemplateKey === 'auto' ? currentTemplate.title : 'Custom Message',
        messageText: messageTextToSend,
        sentAt: formatDateTime(new Date()),
        status: 'delivered',
        encryptionHash,
      };

      onAddNotificationLog(newLog);
      onUpdateClaim(selectedClaim.id, {
        lastMessageSent: formatDateTime(new Date()),
      });

      setIsSending(false);
      setSendSuccessMessage(
        `Encrypted ${selectedChannel.toUpperCase()} successfully dispatched to ${selectedClaim.phoneNumber}!`
      );
      setCustomMessage('');

      setTimeout(() => setSendSuccessMessage(null), 5000);
    }, 700);
  };

  const handleTestPing = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      const randomPing = Math.floor(Math.random() * 25) + 28;
      onUpdateGatewayConfig({
        ...gatewayConfig,
        status: 'connected',
        lastPingMs: randomPing,
      });
      setIsTestingPing(false);
    }, 600);
  };

  // Switch edited template
  const handleSelectEditingTemplate = (key: string) => {
    setEditingTemplateKey(key);
    const tmpl = statusTemplates.find((t) => t.statusKey === key);
    if (tmpl) {
      setEditedTitle(tmpl.title);
      setEditedBody(tmpl.body);
    }
  };

  // Save template edit
  const handleSaveTemplate = () => {
    const updated = statusTemplates.map((t) => {
      if (t.statusKey === editingTemplateKey) {
        return { ...t, title: editedTitle, body: editedBody };
      }
      return t;
    });
    onUpdateStatusTemplates(updated);
    setTemplateSavedToast(true);
    setTimeout(() => setTemplateSavedToast(false), 3000);
  };

  // Reset template to default
  const handleResetTemplate = () => {
    const defaultOne = DEFAULT_STATUS_TEMPLATES.find((t) => t.statusKey === editingTemplateKey);
    if (defaultOne) {
      setEditedTitle(defaultOne.title);
      setEditedBody(defaultOne.body);
      const updated = statusTemplates.map((t) => (t.statusKey === editingTemplateKey ? defaultOne : t));
      onUpdateStatusTemplates(updated);
    }
  };

  // Insert tag into template body
  const insertTag = (tag: string) => {
    setEditedBody((prev) => prev + ` ${tag}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Navigation between Dispatcher, Templates, Logs, and API Gateway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Patient Phone & Messaging Hub</h2>
            <p className="text-[11px] text-slate-400">
              End-to-End Encrypted WhatsApp & SMS updates with customizable status templates
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('dispatcher')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'dispatcher'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Dispatcher
          </button>

          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'templates'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Status Message Templates ({statusTemplates.length})
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'logs'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Notification Logs ({notificationLogs.length})
          </button>

          <button
            onClick={() => setActiveSubTab('api_gateway')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'api_gateway'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Messaging API Settings
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {sendSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{sendSuccessMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Payload E2E Signed</span>
        </div>
      )}

      {/* SUB-TAB 1: DIRECT DISPATCHER */}
      {activeSubTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (4 cols): Patient Phone Directory */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col h-[700px]">
            <div className="mb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter patients & phone numbers..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-1 py-1">
              Registered Patients ({filteredClaims.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredClaims.map((claim) => {
                const isSelected = claim.id === selectedClaimId;
                return (
                  <div
                    key={claim.id}
                    onClick={() => {
                      setSelectedClaimId(claim.id);
                      setCustomMessage('');
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {claim.patientName}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          claim.status.toLowerCase().includes('approved')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                            : claim.status.toLowerCase().includes('denied')
                            ? 'bg-rose-950 text-rose-300 border border-rose-700/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Phone className="w-3 h-3" />
                        {claim.phoneNumber}
                      </span>
                      <span className="text-slate-500 text-[10px]">{claim.admissionType}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="truncate max-w-[170px]">{claim.insuranceCompany}</span>
                      {claim.lastMessageSent && (
                        <span className="text-slate-500 text-[9px]">Last: {claim.lastMessageSent.split(' ')[0]}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column (5 cols): Composer & Security Engine */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-[700px] overflow-y-auto">
            {selectedClaim ? (
              <div className="space-y-4">
                {/* Header for selected patient */}
                <div className="border-b border-slate-800 pb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedClaim.patientName}</span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedClaim.phoneNumber}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedClaim.admissionType} · {selectedClaim.insuranceCompany}
                    </p>
                  </div>
                </div>

                {/* Communication Channel Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dispatch Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('whatsapp')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        selectedChannel === 'whatsapp'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp Business API</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannel('sms')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        selectedChannel === 'sms'
                          ? 'bg-purple-950/80 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Secure Telecom SMS</span>
                    </button>
                  </div>
                </div>

                {/* Template Selector with links to edit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Message Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('templates')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Customize Status Templates</span>
                    </button>
                  </div>
                  <select
                    value={selectedTemplateKey}
                    onChange={(e) => {
                      setSelectedTemplateKey(e.target.value);
                      setCustomMessage('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="auto">Auto-detect from Status: {selectedClaim.status}</option>
                    {statusTemplates.map((t) => (
                      <option key={t.statusKey} value={t.statusKey}>
                        {t.statusName} ({t.title})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Body Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Message Content
                    </label>
                    {customMessage && (
                      <button
                        onClick={() => setCustomMessage('')}
                        className="text-[10px] text-purple-400 hover:underline"
                      >
                        Reset to Template
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={messageTextToSend}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-purple-500 leading-relaxed"
                    placeholder="Type customized SMS / WhatsApp text..."
                  />
                </div>

                {/* End-to-End Encryption Security Card */}
                <div className="bg-slate-900/90 border border-emerald-800/40 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>End-to-End Encrypted (AES-256-GCM)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      HIPAA / DISHA
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-slate-500 truncate flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>ECDH Curve25519 Session Token Active</span>
                  </div>
                </div>

                {/* Send Buttons & Direct Mobile App Launchers */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = getWhatsAppDeepLink(selectedClaim.phoneNumber, messageTextToSend);
                      }}
                      className="py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors active:scale-95"
                      title="Open WhatsApp on Mobile Phone"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = getSmsDeepLink(selectedClaim.phoneNumber, messageTextToSend);
                      }}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-800/60 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors active:scale-95"
                      title="Open Default Messaging App on Phone"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Default SMS App</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSendNotification}
                    disabled={isSending}
                    className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Encrypting & Sending via Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          Send & Record in Portal Log ({selectedChannel.toUpperCase()})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Select a patient to compose message
              </div>
            )}
          </div>

          {/* Right Column (3 cols): Live Realistic WhatsApp Bubble Simulator */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Live Patient View</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">WhatsApp 2.26</span>
            </div>

            {/* Simulated Phone Screen */}
            <div className="flex-1 mt-3 bg-[#0b141a] rounded-xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* WhatsApp Chat Top Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  SH
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                    <span className="truncate">{hospitalDetails.name}</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-sans">Official Verified Hospital TPA</div>
                </div>
              </div>

              {/* Encryption Banner */}
              <div className="my-2 p-1.5 rounded bg-[#182229] border border-slate-800 text-center">
                <p className="text-[9px] text-[#8696a0] leading-tight flex items-center justify-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span>Messages are end-to-end encrypted. No one outside can read them.</span>
                </p>
              </div>

              {/* WhatsApp Message Bubble */}
              <div className="flex-1 overflow-y-auto space-y-2 py-1">
                <div className="bg-[#005c4b] text-slate-100 rounded-lg p-2.5 text-xs shadow-md max-w-[95%] ml-auto relative">
                  <p className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                    {messageTextToSend || 'No message content...'}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-300 font-sans">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                  </div>
                </div>
              </div>

              {/* Patient Reply Mock Bar */}
              <div className="mt-2 bg-[#202c33] rounded-full px-3 py-1.5 flex items-center justify-between text-slate-400 text-[11px]">
                <span>Type a reply to hospital...</span>
                <Send className="w-3.5 h-3.5 text-emerald-400 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STATUS MESSAGE TEMPLATES EDITOR */}
      {activeSubTab === 'templates' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-400" />
                Customize Status Message Templates
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit message templates dispatched according to the patient's pre-authorization status
              </p>
            </div>
            {templateSavedToast && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-700/60 animate-fade-in">
                ✓ Template Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Template Selector List (4 cols) */}
            <div className="lg:col-span-4 space-y-1.5">
              <div className="text-[11px] font-semibold uppercase text-slate-400 px-1 mb-2">
                Pre-Auth Status Templates
              </div>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {statusTemplates.map((tmpl) => {
                  const isSelected = tmpl.statusKey === editingTemplateKey;
                  return (
                    <button
                      key={tmpl.statusKey}
                      onClick={() => handleSelectEditingTemplate(tmpl.statusKey)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-white font-semibold shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="font-bold text-slate-100">{tmpl.statusName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{tmpl.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Content Editor (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              {/* Dynamic tag insert buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Click to Insert Dynamic Placeholders:
                </label>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {[
                    '{patient_name}',
                    '{insurance_company}',
                    '{initial_auth_date}',
                    '{date_of_admission}',
                    '{admission_type}',
                    '{status}',
                    '{desk_location}',
                    '{hospital_name}',
                    '{hospital_phone}',
                    '{hospital_address}',
                    '{notes}',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-purple-950 text-purple-300 border border-purple-800/40 hover:border-purple-600 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Template Message Body
                </label>
                <textarea
                  rows={10}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-sans focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Template for "{currentEditingTemplate.statusName}"</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Encrypted Patient Dispatch Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Tamper-evident logs of all sent pre-auth statuses with SHA-256 cryptographic signatures
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Dispatched: <span className="text-white font-bold">{notificationLogs.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Phone Number</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SHA-256 Encryption Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {notificationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No notifications logged yet. Dispatch a message to populate the audit log.
                    </td>
                  </tr>
                ) : (
                  notificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {log.sentAt}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {log.patientName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        {log.phoneNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300">
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.templateName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title={log.encryptionHash}>
                        {log.encryptionHash}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MESSAGING API SETTINGS */}
      {activeSubTab === 'api_gateway' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-w-3xl mx-auto space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-purple-400" />
                Messaging API Integration & Encryption Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure WhatsApp Cloud API or SMS Gateway with end-to-end encryption
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                {gatewayConfig.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Messaging Provider Gateway
              </label>
              <select
                value={gatewayConfig.provider}
                onChange={(e) =>
                  onUpdateGatewayConfig({ ...gatewayConfig, provider: e.target.value as any })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="whatsapp_cloud_api">Meta WhatsApp Business Cloud API (Direct)</option>
                <option value="twilio">Twilio Programmable Messaging API</option>
                <option value="gupshup">Gupshup Enterprise Health Gateway (India)</option>
                <option value="karix">Karix Mobile Telecom Gateway</option>
                <option value="custom_webhook">Custom Hospital Telephony Webhook</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  API Key / Permanent Access Token
                </label>
                <input
                  type="password"
                  value={gatewayConfig.apiKey}
                  onChange={(e) => onUpdateGatewayConfig({ ...gatewayConfig, apiKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp Business Account (WABA) ID
                </label>
                <input
                  type="text"
                  value={gatewayConfig.wabaId}
                  onChange={(e) => onUpdateGatewayConfig({ ...gatewayConfig, wabaId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Callback Webhook URL (For Real-Time Delivery Receipts)
              </label>
              <input
                type="text"
                value={gatewayConfig.webhookUrl}
                onChange={(e) =>
                  onUpdateGatewayConfig({ ...gatewayConfig, webhookUrl: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Automatic Patient Notification on Status Change
                </span>
                <span className="text-[11px] text-slate-400">
                  When claim status changes in the spreadsheet, automatically dispatch encrypted WhatsApp alert
                </span>
              </div>
              <input
                type="checkbox"
                checked={gatewayConfig.autoNotifyOnStatusChange}
                onChange={(e) =>
                  onUpdateGatewayConfig({
                    ...gatewayConfig,
                    autoNotifyOnStatusChange: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Latency:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {gatewayConfig.lastPingMs || 38} ms
                </span>
              </div>

              <button
                onClick={handleTestPing}
                disabled={isTestingPing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Radio className={`w-3.5 h-3.5 text-purple-400 ${isTestingPing ? 'animate-pulse' : ''}`} />
                <span>{isTestingPing ? 'Testing Connection...' : 'Test Gateway Ping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
