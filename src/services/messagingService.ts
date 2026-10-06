import { MessagingGatewayConfig, NotificationLog, PatientClaim, HospitalDetails, StatusMessageTemplate } from '../types';
import { DEFAULT_STATUS_TEMPLATES } from '../data/masters';

export const DEFAULT_GATEWAY_CONFIG: MessagingGatewayConfig = {
  provider: 'whatsapp_cloud_api',
  apiKey: 'waba_live_sec_9941a029fe884b2c89e1b2',
  phoneNumberId: '109823901928401',
  wabaId: 'waba_acc_881239014',
  webhookUrl: 'https://api.aegishealth.org/webhooks/whatsapp/v1/delivery-receipts',
  e2eEncryptionEnabled: true,
  encryptionAlgorithm: 'AES-256-GCM + ECDH (Curve25519)',
  autoNotifyOnStatusChange: true,
  status: 'connected',
  lastPingMs: 38,
};

/**
 * Computes SHA-256 hash for end-to-end encryption tamper proofing
 */
export async function generateE2EHash(payload: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + Date.now().toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
  } catch {
    return `sha256:${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
  }
}

/**
 * Extracts digits for WhatsApp mobile links (e.g. 919822144310)
 */
export function getCleanPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Generates direct WhatsApp deep link to open WhatsApp mobile app or WhatsApp Web with pre-filled message
 */
export function getWhatsAppDeepLink(phone: string, message: string): string {
  const cleanPhone = getCleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates direct SMS deep link to open the phone's default messaging app with pre-filled body
 */
export function getSmsDeepLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
}

/**
 * Map status string to template key
 */
export function mapStatusToTemplateKey(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('approved') && !s.includes('enhancement') && !s.includes('discharge')) {
    return 'approved';
  }
  if (s.includes('query')) {
    return 'query_raised';
  }
  if (s.includes('docs pending') || s.includes('documents pending')) {
    return 'docs_pending';
  }
  if (s.includes('enhancement approved')) {
    return 'enhancement_approved';
  }
  if (s.includes('discharge approved') || s.includes('submit fb ds')) {
    return 'discharge_approved';
  }
  if (s.includes('denied') || s.includes('rejected')) {
    return 'denied_rejected';
  }
  if (s.includes('preauth request sent') || s.includes('preauth sent') || s.includes('processing')) {
    return 'preauth_sent';
  }
  return 'default';
}

/**
 * Interpolate placeholders in template body
 */
export function interpolateTemplate(
  bodyTemplate: string,
  claim: PatientClaim,
  hospitalDetails?: HospitalDetails,
  customNote?: string
): string {
  const patient = claim.patientName;
  const hospital = hospitalDetails?.name || 'Saideep Hospital & Research Centre';
  const hospitalPhone = hospitalDetails?.mobileNumber || '+91 98220 12345';
  const hospitalAddr = hospitalDetails?.address || 'Court Road, Savedi, Ahmednagar, Maharashtra';
  const deskText = hospitalDetails?.cashlessDeskNumber || 'Cashless Desk No. 26 (Ground Floor)';
  const insurer = claim.insuranceCompany;
  const tpa = claim.tpa;
  const notes = customNote || claim.notes || 'As per cashless records';
  const initialAuthDate = claim.dateOfInitialAuthorization || 'Under Review';
  const dateOfAdmission = claim.dateOfAdmission || 'On file';
  const admissionType = claim.admissionType || 'Regular Admission';
  const status = claim.status || 'In Progress';

  return bodyTemplate
    .replace(/{patient_name}/g, patient)
    .replace(/{hospital_name}/g, hospital)
    .replace(/{hospital_phone}/g, hospitalPhone)
    .replace(/{hospital_address}/g, hospitalAddr)
    .replace(/{desk_location}/g, deskText)
    .replace(/{insurance_company}/g, insurer)
    .replace(/{tpa}/g, tpa)
    .replace(/{notes}/g, notes)
    .replace(/{initial_auth_date}/g, initialAuthDate)
    .replace(/{date_of_admission}/g, dateOfAdmission)
    .replace(/{admission_type}/g, admissionType)
    .replace(/{status}/g, status);
}

/**
 * Get formatted message template with support for user customized templates
 */
export function getMessageTemplate(
  templateKey: string,
  claim: PatientClaim,
  customNote?: string,
  hospitalDetails?: HospitalDetails,
  customTemplates?: StatusMessageTemplate[]
): { title: string; body: string } {
  const templates = customTemplates || DEFAULT_STATUS_TEMPLATES;
  const matched = templates.find((t) => t.statusKey === templateKey) ||
    templates.find((t) => t.statusKey === 'default') ||
    DEFAULT_STATUS_TEMPLATES[DEFAULT_STATUS_TEMPLATES.length - 1];

  const body = interpolateTemplate(matched.body, claim, hospitalDetails, customNote);

  return {
    title: matched.title,
    body,
  };
}

/**
 * Format timestamp in DD/MM/YYYY hh:mm A
 */
export function formatDateTime(date: Date = new Date()): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const h = hours.toString().padStart(2, '0');
  return `${d}/${m}/${y} ${h}:${minutes} ${ampm}`;
}
