export type AdmissionType = string;

export interface StatusItem {
  id: string;
  name: string;
  colorBg: string;
  colorText: string;
  borderColor?: string;
  category: 'initial' | 'in_progress' | 'query' | 'approved' | 'rejected' | 'enhancement' | 'discharge';
}

export interface StatusMessageTemplate {
  statusKey: string;
  statusName: string;
  title: string;
  body: string;
}

export interface HospitalDetails {
  name: string;
  address: string;
  mobileNumber: string;
  email?: string;
  tpaDeskExt?: string;
  cashlessDeskNumber?: string;
}

export interface RequiredDocumentItem {
  id: string;
  category: 'patient' | 'proposer' | 'corporate' | 'name_change';
  title: string;
  description: string;
  isMandatory: boolean;
  received: boolean;
}

export interface NotificationLog {
  id: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  channel: 'whatsapp' | 'sms';
  templateName: string;
  messageText: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  encryptionHash: string;
}

export interface PatientClaim {
  id: string;
  uhid: string; // Unique Hospital Identifier
  patientName: string;
  phoneNumber: string;
  admissionType: AdmissionType;
  status: string;
  dateOfAdmission: string;
  dateOfInitialAuthorization?: string;
  dateOfDischarge?: string;
  insuranceCompany: string; // Indian insurance companies
  tpa: string;
  notes: string;
  policyNumber?: string;
  diagnosis?: string;
  estimatedAmount?: number;
  sanctionedAmount?: number;
  documentsChecklist?: Record<string, boolean>;
  whatsappAutoNotify: boolean;
  lastMessageSent?: string;
  isDischarged?: boolean;
  dischargeSentAt?: string;
}

export interface MessagingGatewayConfig {
  provider: 'whatsapp_cloud_api' | 'twilio' | 'gupshup' | 'karix' | 'custom_webhook';
  apiKey: string;
  phoneNumberId: string;
  wabaId: string;
  webhookUrl: string;
  e2eEncryptionEnabled: boolean;
  encryptionAlgorithm: string;
  autoNotifyOnStatusChange: boolean;
  status: 'connected' | 'idle' | 'testing';
  lastPingMs?: number;
}


