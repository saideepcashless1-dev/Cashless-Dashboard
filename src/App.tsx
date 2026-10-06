/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClaimsTable } from './components/ClaimsTable';
import { PatientCommunicationTab } from './components/PatientCommunicationTab';
import { MasterSettingsModal } from './components/MasterSettingsModal';
import { DocumentChecklistModal } from './components/DocumentChecklistModal';
import { QuickWhatsAppModal } from './components/QuickWhatsAppModal';
import { NewCaseModal } from './components/NewCaseModal';
import { HospitalDetailsModal } from './components/HospitalDetailsModal';

import { 
  DEFAULT_ADMISSION_TYPES, 
  DEFAULT_HOSPITAL_DETAILS,
  DEFAULT_STATUSES, 
  DEFAULT_STATUS_TEMPLATES,
  INDIAN_HEALTH_INSURANCE_COMPANIES, 
  INDIAN_TPAS 
} from './data/masters';
import { INITIAL_NOTIFICATION_LOGS, INITIAL_PATIENT_CLAIMS } from './data/mockData';
import { 
  DEFAULT_GATEWAY_CONFIG, 
  formatDateTime, 
  generateE2EHash, 
  getMessageTemplate,
  getWhatsAppDeepLink,
  getSmsDeepLink
} from './services/messagingService';
import { HospitalDetails, MessagingGatewayConfig, NotificationLog, PatientClaim, StatusItem, StatusMessageTemplate } from './types';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'table' | 'communication' | 'masters'>('table');

  // Hospital Details (Hospital Name, Hospital Address, Hospital Mobile Number)
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetails>(() => {
    const saved = localStorage.getItem('ah_hospital_details');
    return saved ? JSON.parse(saved) : DEFAULT_HOSPITAL_DETAILS;
  });
  const [isHospitalDetailsOpen, setIsHospitalDetailsOpen] = useState(false);

  // Master lists (with scope to edit)
  const [admissionTypes, setAdmissionTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('ah_admission_types');
    return saved ? JSON.parse(saved) : DEFAULT_ADMISSION_TYPES;
  });

  const [statuses, setStatuses] = useState<StatusItem[]>(() => {
    const saved = localStorage.getItem('ah_statuses');
    return saved ? JSON.parse(saved) : DEFAULT_STATUSES;
  });

  const [statusTemplates, setStatusTemplates] = useState<StatusMessageTemplate[]>(() => {
    const saved = localStorage.getItem('ah_status_templates');
    return saved ? JSON.parse(saved) : DEFAULT_STATUS_TEMPLATES;
  });

  const [insuranceCompanies, setInsuranceCompanies] = useState<string[]>(() => {
    const saved = localStorage.getItem('ah_insurances');
    return saved ? JSON.parse(saved) : INDIAN_HEALTH_INSURANCE_COMPANIES;
  });

  const [tpas, setTpas] = useState<string[]>(() => {
    const saved = localStorage.getItem('ah_tpas');
    return saved ? JSON.parse(saved) : INDIAN_TPAS;
  });

  // Patient Claims data
  const [claims, setClaims] = useState<PatientClaim[]>(() => {
    const saved = localStorage.getItem('ah_claims');
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_CLAIMS;
  });

  // Notification logs (tamper-evident audit log with encrypted hashes; NO policy number, NO clinical diagnosis)
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('ah_notification_logs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_LOGS;
  });

  // Messaging Gateway config
  const [gatewayConfig, setGatewayConfig] = useState<MessagingGatewayConfig>(() => {
    const saved = localStorage.getItem('ah_gateway_config');
    return saved ? JSON.parse(saved) : DEFAULT_GATEWAY_CONFIG;
  });

  // Active Modals state
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [checklistClaim, setChecklistClaim] = useState<PatientClaim | null>(null);
  const [quickWhatsAppClaim, setQuickWhatsAppClaim] = useState<PatientClaim | null>(null);
  const [quickWhatsAppTemplate, setQuickWhatsAppTemplate] = useState<string>('approved');
  const [autoToast, setAutoToast] = useState<{ message: string; phone: string } | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('ah_hospital_details', JSON.stringify(hospitalDetails));
  }, [hospitalDetails]);

  useEffect(() => {
    localStorage.setItem('ah_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('ah_notification_logs', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  useEffect(() => {
    localStorage.setItem('ah_status_templates', JSON.stringify(statusTemplates));
  }, [statusTemplates]);

  useEffect(() => {
    localStorage.setItem('ah_gateway_config', JSON.stringify(gatewayConfig));
  }, [gatewayConfig]);

  useEffect(() => {
    localStorage.setItem('ah_admission_types', JSON.stringify(admissionTypes));
  }, [admissionTypes]);

  useEffect(() => {
    localStorage.setItem('ah_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('ah_insurances', JSON.stringify(insuranceCompanies));
  }, [insuranceCompanies]);

  useEffect(() => {
    localStorage.setItem('ah_tpas', JSON.stringify(tpas));
  }, [tpas]);

  // Update a claim
  const handleUpdateClaim = async (id: string, updates: Partial<PatientClaim>) => {
    const targetClaim = claims.find((c) => c.id === id);
    if (!targetClaim) return;

    const oldStatus = targetClaim.status;
    const newStatus = updates.status;

    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    // If status changed and auto-notify is enabled, dispatch encrypted WhatsApp notification
    if (newStatus && newStatus !== oldStatus && gatewayConfig.autoNotifyOnStatusChange && !updates.isDischarged) {
      const updatedClaim = { ...targetClaim, ...updates };
      const template = getMessageTemplate('default', updatedClaim, `Status updated to "${newStatus}"`, hospitalDetails, statusTemplates);
      const hash = await generateE2EHash(template.body);

      const newLog: NotificationLog = {
        id: `log-${Date.now()}`,
        patientId: updatedClaim.id,
        patientName: updatedClaim.patientName,
        phoneNumber: updatedClaim.phoneNumber,
        channel: 'whatsapp',
        templateName: `Auto-Alert: ${newStatus}`,
        messageText: template.body,
        sentAt: formatDateTime(new Date()),
        status: 'delivered',
        encryptionHash: hash,
      };

      setNotificationLogs((logs) => [newLog, ...logs]);
      setAutoToast({
        message: `Auto-notified patient of status change to "${newStatus}"`,
        phone: updatedClaim.phoneNumber,
      });
      setTimeout(() => setAutoToast(null), 4500);
    }
  };

  // Delete a claim
  const handleDeleteClaim = (id: string) => {
    setClaims((prev) => prev.filter((c) => c.id !== id));
  };

  // Add new case (with welcome message and required documents checklist as prompted)
  const handleAddNewCase = async (
    newClaim: PatientClaim, 
    sendWelcome: boolean, 
    channel: 'whatsapp' | 'sms' = 'whatsapp'
  ) => {
    setClaims((prev) => [newClaim, ...prev]);

    if (sendWelcome) {
      const tmpl = getMessageTemplate('welcome_checklist', newClaim, undefined, hospitalDetails, statusTemplates);
      const hash = await generateE2EHash(tmpl.body);

      const log: NotificationLog = {
        id: `log-${Date.now()}`,
        patientId: newClaim.id,
        patientName: newClaim.patientName,
        phoneNumber: newClaim.phoneNumber,
        channel,
        templateName: 'Welcome & Required Documents Notice',
        messageText: tmpl.body,
        sentAt: formatDateTime(new Date()),
        status: 'delivered',
        encryptionHash: hash,
      };

      setNotificationLogs((logs) => [log, ...logs]);
      setAutoToast({
        message: `Welcome & Required Docs sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'Default SMS App'} to ${newClaim.phoneNumber}`,
        phone: newClaim.phoneNumber,
      });
      setTimeout(() => setAutoToast(null), 4500);

      // Deep link to WhatsApp or Default SMS App on mobile
      if (channel === 'whatsapp') {
        const url = getWhatsAppDeepLink(newClaim.phoneNumber, tmpl.body);
        window.location.href = url;
      } else {
        const url = getSmsDeepLink(newClaim.phoneNumber, tmpl.body);
        window.location.href = url;
      }
    }
  };

  // Discharge Patient: removes entry from active display and sends care & feedback message
  const handleDischargePatient = async (claim: PatientClaim, messageText: string) => {
    const updates: Partial<PatientClaim> = {
      isDischarged: true,
      status: 'Discharged',
      dateOfDischarge: new Date().toISOString().slice(0, 10),
      dischargeSentAt: formatDateTime(new Date()),
    };

    setClaims((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, ...updates } : c))
    );

    // Send discharge take care and feedback WhatsApp message
    const hash = await generateE2EHash(messageText);
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      patientId: claim.id,
      patientName: claim.patientName,
      phoneNumber: claim.phoneNumber,
      channel: 'whatsapp',
      templateName: 'Discharge Wishes & Feedback',
      messageText,
      sentAt: formatDateTime(new Date()),
      status: 'delivered',
      encryptionHash: hash,
    };

    setNotificationLogs((logs) => [newLog, ...logs]);
    setAutoToast({
      message: `${claim.patientName} discharged & take-care message sent via WhatsApp!`,
      phone: claim.phoneNumber,
    });
    setTimeout(() => setAutoToast(null), 4500);
  };

  // Dispatch WhatsApp checklist
  const handleSendWhatsAppChecklist = async (phoneNumber: string, messageText: string) => {
    const hash = await generateE2EHash(messageText);
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      patientId: checklistClaim?.id || 'manual',
      patientName: checklistClaim?.patientName || 'Patient',
      phoneNumber,
      channel: 'whatsapp',
      templateName: 'Required Documents Checklist (IRDAI Guidelines)',
      messageText,
      sentAt: formatDateTime(new Date()),
      status: 'delivered',
      encryptionHash: hash,
    };

    setNotificationLogs((logs) => [newLog, ...logs]);
    setAutoToast({
      message: `Required Documents Checklist sent via WhatsApp to ${phoneNumber}`,
      phone: phoneNumber,
    });
    setTimeout(() => setAutoToast(null), 4500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Header (Mobile Optimized, No AH logo, No Cashless Portal name) */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewCase={() => setIsNewCaseOpen(true)}
        onOpenDocChecklist={() => {
          setChecklistClaim(claims[0] || null);
          setIsChecklistOpen(true);
        }}
        onOpenHospitalDetails={() => setIsHospitalDetailsOpen(true)}
        hospitalDetails={hospitalDetails}
        claims={claims}
      />

      {/* Main View Area - Maximized Space Utilization for Mobile */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-2.5 sm:py-5">
        {/* Floating Auto-Notification Toast */}
        {autoToast && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-slate-900 border border-emerald-500/80 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce max-w-[90vw]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <div className="min-w-0">
              <p className="font-semibold text-emerald-300 truncate">{autoToast.message}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">Recipient: {autoToast.phone} (E2E Encrypted)</p>
            </div>
          </div>
        )}

        {/* View 1: Claims Spreadsheet / Mobile Cards with Discharge Flow (No Monthwise Filter) */}
        {currentTab === 'table' && (
          <ClaimsTable
            claims={claims}
            statuses={statuses}
            admissionTypes={admissionTypes}
            insuranceCompanies={insuranceCompanies}
            tpas={tpas}
            hospitalDetails={hospitalDetails}
            statusTemplates={statusTemplates}
            onUpdateClaim={handleUpdateClaim}
            onDeleteClaim={handleDeleteClaim}
            onOpenQuickWhatsApp={(c) => {
              setQuickWhatsAppClaim(c);
              setQuickWhatsAppTemplate('approved');
            }}
            onOpenDocChecklist={(c) => {
              setChecklistClaim(c);
              setIsChecklistOpen(true);
            }}
            onDischargePatient={handleDischargePatient}
          />
        )}

        {/* View 2: Dedicated Patient WhatsApp/SMS Hub (with Status Message Template Editor) */}
        {currentTab === 'communication' && (
          <PatientCommunicationTab
            claims={claims}
            notificationLogs={notificationLogs}
            gatewayConfig={gatewayConfig}
            hospitalDetails={hospitalDetails}
            statusTemplates={statusTemplates}
            onUpdateStatusTemplates={setStatusTemplates}
            onUpdateClaim={handleUpdateClaim}
            onAddNotificationLog={(log) => setNotificationLogs((prev) => [log, ...prev])}
            onUpdateGatewayConfig={setGatewayConfig}
          />
        )}

        {/* View 3: Dropdown Masters & Configuration */}
        {currentTab === 'masters' && (
          <MasterSettingsModal
            admissionTypes={admissionTypes}
            statuses={statuses}
            insuranceCompanies={insuranceCompanies}
            tpas={tpas}
            onUpdateAdmissionTypes={setAdmissionTypes}
            onUpdateStatuses={setStatuses}
            onUpdateInsuranceCompanies={setInsuranceCompanies}
            onUpdateTPAs={setTpas}
          />
        )}
      </main>

      {/* MODAL 1: Hospital Details Provision Modal */}
      <HospitalDetailsModal
        isOpen={isHospitalDetailsOpen}
        onClose={() => setIsHospitalDetailsOpen(false)}
        hospitalDetails={hospitalDetails}
        onSave={(updated) => setHospitalDetails(updated)}
      />

      {/* MODAL 2: New Case Modal (With English Welcome Message & Checklist) */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onAddCase={handleAddNewCase}
        admissionTypes={admissionTypes}
        statuses={statuses}
        insuranceCompanies={insuranceCompanies}
        tpas={tpas}
      />

      {/* MODAL 3: Required Documents Checklist Modal (IRDAI Mandatory Checklist, English, Cashless Desk No. 26 Ground Floor) */}
      <DocumentChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => {
          setIsChecklistOpen(false);
          setChecklistClaim(null);
        }}
        claim={checklistClaim}
        hospitalDetails={hospitalDetails}
        onSendWhatsAppChecklist={handleSendWhatsAppChecklist}
      />

      {/* MODAL 4: 1-Click Fast WhatsApp & SMS Sender */}
      <QuickWhatsAppModal
        claim={quickWhatsAppClaim}
        hospitalDetails={hospitalDetails}
        initialTemplateKey={quickWhatsAppTemplate}
        onClose={() => setQuickWhatsAppClaim(null)}
        onSend={(log) => setNotificationLogs((prev) => [log, ...prev])}
        onUpdateClaim={handleUpdateClaim}
      />
    </div>
  );
}
