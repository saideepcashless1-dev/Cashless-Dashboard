import { StatusItem, HospitalDetails, RequiredDocumentItem, StatusMessageTemplate } from '../types';

export const DEFAULT_HOSPITAL_DETAILS: HospitalDetails = {
  name: 'Saideep Hospital & Research Centre',
  address: 'Court Road, Savedi, Ahmednagar, Maharashtra 414001, India',
  mobileNumber: '+91 98220 12345',
  email: 'saideepcashless1@gmail.com',
  tpaDeskExt: 'Cashless TPA Desk (Ext. 401)',
  cashlessDeskNumber: 'Cashless Desk No. 26 (Ground Floor)',
};

export const DEFAULT_ADMISSION_TYPES: string[] = [
  'Regular Admission',
  'Planned admission',
  'Emergency Admission',
  'Day Care Procedure',
];

export const DEFAULT_STATUSES: StatusItem[] = [
  {
    id: 'not_started',
    name: 'Not started',
    colorBg: 'bg-slate-700/80',
    colorText: 'text-slate-200',
    borderColor: 'border-slate-500',
    category: 'initial',
  },
  {
    id: 'docs_pending',
    name: 'Documents Pending',
    colorBg: 'bg-amber-900/60',
    colorText: 'text-amber-300',
    borderColor: 'border-amber-600',
    category: 'in_progress',
  },
  {
    id: 'docs_received',
    name: 'Documents received',
    colorBg: 'bg-sky-900/60',
    colorText: 'text-sky-300',
    borderColor: 'border-sky-600',
    category: 'in_progress',
  },
  {
    id: 'filework_pending',
    name: 'Filework Pending',
    colorBg: 'bg-amber-950/70',
    colorText: 'text-amber-400',
    borderColor: 'border-amber-700',
    category: 'in_progress',
  },
  {
    id: 'investigations_pending',
    name: 'Investigations Pending',
    colorBg: 'bg-orange-950/70',
    colorText: 'text-orange-400',
    borderColor: 'border-orange-600',
    category: 'in_progress',
  },
  {
    id: 'preauth_sent',
    name: 'Preauth Request Sent',
    colorBg: 'bg-blue-900/70',
    colorText: 'text-blue-300',
    borderColor: 'border-blue-500',
    category: 'in_progress',
  },
  {
    id: 'approved',
    name: 'Approved',
    colorBg: 'bg-emerald-800/80',
    colorText: 'text-emerald-100 font-semibold',
    borderColor: 'border-emerald-500',
    category: 'approved',
  },
  {
    id: 'query_raised',
    name: 'Query Raised',
    colorBg: 'bg-amber-800/80',
    colorText: 'text-amber-200 font-medium',
    borderColor: 'border-amber-500',
    category: 'query',
  },
  {
    id: 'query_replied',
    name: 'Query replied',
    colorBg: 'bg-teal-900/70',
    colorText: 'text-teal-300',
    borderColor: 'border-teal-500',
    category: 'query',
  },
  {
    id: 'kyc_pending',
    name: 'KYC or ID Policy Pending',
    colorBg: 'bg-yellow-950/70',
    colorText: 'text-yellow-300',
    borderColor: 'border-yellow-600',
    category: 'in_progress',
  },
  {
    id: 'processing',
    name: 'Processing',
    colorBg: 'bg-indigo-900/60',
    colorText: 'text-indigo-300',
    borderColor: 'border-indigo-500',
    category: 'in_progress',
  },
  {
    id: 'not_approved_not_denied',
    name: 'Not Approved or Not Denied',
    colorBg: 'bg-purple-950/70',
    colorText: 'text-purple-300',
    borderColor: 'border-purple-600',
    category: 'in_progress',
  },
  {
    id: 'submit_fb_ds',
    name: 'Submit FB DS at Discharge',
    colorBg: 'bg-cyan-900/70',
    colorText: 'text-cyan-300',
    borderColor: 'border-cyan-500',
    category: 'discharge',
  },
  {
    id: 'denied_rejected',
    name: 'Cashless Denied or Rejected',
    colorBg: 'bg-red-900/90',
    colorText: 'text-red-100 font-bold',
    borderColor: 'border-red-600',
    category: 'rejected',
  },
  {
    id: 'admission_postponed',
    name: 'Admission postponed',
    colorBg: 'bg-stone-800/80',
    colorText: 'text-stone-300',
    borderColor: 'border-stone-600',
    category: 'initial',
  },
  {
    id: 'approval_cancelled',
    name: 'Approval cancelled',
    colorBg: 'bg-rose-950/80',
    colorText: 'text-rose-300',
    borderColor: 'border-rose-600',
    category: 'rejected',
  },
  {
    id: 'reconsideration_sent',
    name: 'Reconsideration Sent',
    colorBg: 'bg-fuchsia-950/70',
    colorText: 'text-fuchsia-300',
    borderColor: 'border-fuchsia-600',
    category: 'query',
  },
  {
    id: 'facility_not_utilized',
    name: 'Cashless Facility not utilized',
    colorBg: 'bg-rose-950/90',
    colorText: 'text-rose-200 font-medium',
    borderColor: 'border-rose-700',
    category: 'rejected',
  },
  {
    id: 'enhancement_sent',
    name: 'Enhancement Request Sent',
    colorBg: 'bg-violet-900/70',
    colorText: 'text-violet-300',
    borderColor: 'border-violet-500',
    category: 'enhancement',
  },
  {
    id: 'enhancement_approved',
    name: 'Enhancement Approved',
    colorBg: 'bg-emerald-900/80',
    colorText: 'text-emerald-200 font-semibold',
    borderColor: 'border-emerald-400',
    category: 'enhancement',
  },
  {
    id: 'discharge_approved',
    name: 'Discharge Approved',
    colorBg: 'bg-green-800/90',
    colorText: 'text-green-100 font-bold',
    borderColor: 'border-green-400',
    category: 'discharge',
  },
];

/**
 * Required documents for cashless health insurance claims (Translated to English from user specification)
 */
export const DEFAULT_REQUIRED_DOCUMENTS: RequiredDocumentItem[] = [
  {
    id: 'req-doc-1',
    category: 'patient',
    title: "Patient's Health Insurance Policy Paper / Health Card",
    description: 'Original or digital policy schedule / TPA cashless e-card showing active coverage.',
    isMandatory: true,
    received: true,
  },
  {
    id: 'req-doc-2',
    category: 'patient',
    title: "Patient's Photo Identity Proof (Any One)",
    description: 'Aadhaar Card, PAN Card, or Driving License of the admitted patient.',
    isMandatory: true,
    received: true,
  },
  {
    id: 'req-doc-3',
    category: 'proposer',
    title: "Primary Policy Member / Proposer PAN Card",
    description: 'PAN card of the main policy holder / proposer (Mandated by IRDAI since 1st Jan 2023).',
    isMandatory: true,
    received: true,
  },
  {
    id: 'req-doc-4',
    category: 'proposer',
    title: "Primary Policy Member / Proposer Aadhaar Card",
    description: 'Aadhaar card of the main policy holder / proposer (Mandated by IRDAI since 1st Jan 2023).',
    isMandatory: true,
    received: false,
  },
  {
    id: 'req-doc-5',
    category: 'proposer',
    title: "Primary Policy Member / Proposer Passport Size Photograph",
    description: 'Recent passport photo of policy proposer (Mandated by IRDAI since 1st Jan 2023).',
    isMandatory: true,
    received: false,
  },
  {
    id: 'req-doc-6',
    category: 'corporate',
    title: "Corporate Policy Employee ID Card",
    description: 'Valid company employee ID card (Applicable in case of Corporate / Group Mediclaim).',
    isMandatory: false,
    received: false,
  },
  {
    id: 'req-doc-7',
    category: 'name_change',
    title: "Proof of Name Change (if applicable)",
    description: 'Marriage Certificate, Official Gazette notification, or Notarized Affidavit in case of name discrepancy.',
    isMandatory: false,
    received: false,
  },
];

/**
 * Customizable status message templates
 */
export const DEFAULT_STATUS_TEMPLATES: StatusMessageTemplate[] = [
  {
    statusKey: 'welcome_checklist',
    statusName: 'Welcome & Required Documents Checklist',
    title: 'Welcome & Required Documents Notice',
    body: `Dear {patient_name},

Welcome to {hospital_name}. Your pre-authorization registration for {insurance_company} has been initiated.

*Required Documents for Cashless Health Insurance Claim:*
1. Patient Documents:
   - Health Insurance Policy Paper / Cashless Health Card
   - Patient Photo ID Proof (Aadhaar Card, PAN Card, or Driving License - Any one)

2. Primary Policy Member / Proposer Documents:
   - PAN Card
   - Aadhaar Card
   - Passport-size Photograph
   *(Mandatory as per IRDAI guidelines effective since 1st Jan 2023)*

3. Corporate Policy (if applicable):
   - Valid Employee ID Card

4. In case of Name Discrepancy (if applicable):
   - Marriage Certificate, Gazette Notification, or Notarized Affidavit

⚠️ *IMPORTANT: Late submission of documents may lead to cashless claim denial.*

Please submit the documents at the earliest to:
📍 {desk_location}
📍 {hospital_address}
📞 Helpline / WhatsApp: {hospital_phone}
- {hospital_name} Pre-Auth Desk`,
  },
  {
    statusKey: 'discharge_take_care',
    statusName: 'Discharge, Well Wishes & Service Feedback',
    title: 'Discharge Wishes & Feedback',
    body: `Dear {patient_name},

Wishing you a speedy recovery and good health from all of us at {hospital_name}!

We hope your stay and cashless claim assistance were smooth and comfortable.

Please take care and stay healthy! If there was any deficiency in our service, or if you have any suggestions to help us improve, please reply directly to this message or share your thoughts with our team. Your feedback is deeply valued!

Warm regards,
{hospital_name}
📞 Helpline / Feedback: {hospital_phone}
📍 {hospital_address}`,
  },
  {
    statusKey: 'approved',
    statusName: 'Approved / Cashless Approved',
    title: 'Initial Pre-Auth Approved',
    body: `Dear {patient_name},

Good news! Your Cashless Pre-Authorization has been APPROVED by {insurance_company}.

Admission Type: {admission_type}
Date of Initial Authorization: {initial_auth_date}

Please visit {desk_location} with your original Aadhaar card and signed pre-authorization form.

Helpline / Mobile: {hospital_phone}
- {hospital_name} Cashless Desk
📍 {hospital_address}`,
  },
  {
    statusKey: 'query_raised',
    statusName: 'Query Raised / Deficiency',
    title: 'Urgent: Insurance Query Raised',
    body: `Dear {patient_name},

{insurance_company} / {tpa} has raised an urgent query regarding your pre-authorization claim.

Status Note: {notes}

Please submit the required documents immediately to {desk_location} or WhatsApp them back on {hospital_phone} to avoid delay.

- {hospital_name} Cashless TPA Desk
📍 {hospital_address}`,
  },
  {
    statusKey: 'preauth_sent',
    statusName: 'Preauth Request Sent',
    title: 'Pre-Auth Submitted to Insurer',
    body: `Dear {patient_name},

Greetings from {hospital_name}.

Your cashless pre-authorization request for {insurance_company} has been submitted to the TPA portal.

Date of Admission: {date_of_admission}
Estimated Turnaround: 2 to 4 hours. You will receive real-time updates as soon as the insurance referee reviews the docket.

Desk Contact: {hospital_phone}
- {hospital_name} Cashless Desk`,
  },
  {
    statusKey: 'denied_rejected',
    statusName: 'Cashless Denied or Rejected',
    title: 'Cashless Facility Denied / Rejected',
    body: `Dear {patient_name},

We regret to inform you that {insurance_company} has denied cashless pre-authorization for your admission.

Insurer Remark: {notes}

Please note: You can still claim reimbursement directly from the insurance company post-discharge. Please visit {desk_location} to collect the certified document dossier.

Contact: {hospital_phone}
- {hospital_name} Cashless Desk`,
  },
  {
    statusKey: 'docs_pending',
    statusName: 'Documents Pending',
    title: 'Documents Pending for Cashless Claim',
    body: `Dear {patient_name},

Greetings from {hospital_name}.

Your cashless insurance claim process is currently on hold as mandatory documents are pending.

Required Documents:
1. Patient Health Policy Paper / Health Card
2. Patient Photo ID (Aadhaar / PAN / Driving License)
3. Proposer PAN & Aadhaar Card + Passport Photo (IRDAI Mandatory)

*Late submission of documents may lead to cashless claim denial.*
Please submit immediately to {desk_location}.

Helpline: {hospital_phone}
- {hospital_name}`,
  },
  {
    statusKey: 'enhancement_approved',
    statusName: 'Enhancement Approved',
    title: 'Enhancement Approved',
    body: `Dear {patient_name},

Your cashless enhancement request has been APPROVED by {insurance_company}.

Our billing desk has updated your indoor account. Thank you for your cooperation.

Desk Contact: {hospital_phone}
- {hospital_name} Cashless Desk`,
  },
  {
    statusKey: 'discharge_approved',
    statusName: 'Discharge Approved',
    title: 'Final Discharge Clearance Approved',
    body: `Dear {patient_name},

Final cashless settlement authorization has been granted by {insurance_company} for your admission.

Please proceed to {desk_location} for final settlement and to collect your discharge summary & original reports.

Wishing you a speedy recovery!
- {hospital_name}`,
  },
  {
    statusKey: 'default',
    statusName: 'General Status Update',
    title: 'Status Update',
    body: `Dear {patient_name},

Status update for your cashless claim at {hospital_name}:
Current Status: {status}
Admission Date: {date_of_admission}
{notes}

For queries, visit {desk_location} or contact {hospital_phone}.
- {hospital_name}`,
  },
];

/**
 * Comprehensive list of Indian Insurance Companies operating in the health sector
 */
export const INDIAN_HEALTH_INSURANCE_COMPANIES: string[] = [
  'Star Health and Allied Insurance',
  'Care Health Insurance (formerly Religare)',
  'Niva Bupa Health Insurance (formerly Max Bupa)',
  'New India Assurance (NIA)',
  'National Insurance Company (NIC)',
  'Oriental Insurance Company (OICL)',
  'United India Insurance (UIIC)',
  'ICICI Lombard General Insurance',
  'HDFC ERGO General Insurance',
  'Bajaj Allianz General Insurance',
  'Tata AIG General Insurance',
  'SBI General Insurance',
  'Reliance General Insurance',
  'Aditya Birla Health Insurance',
  'ManipalCigna Health Insurance',
  'Narayana Health Insurance',
  'Kotak Mahindra General Insurance (Zurich Kotak)',
  'Universal Sompo General Insurance',
  'Future Generali India Insurance',
  'Cholamandalam MS General Insurance',
  'Royal Sundaram General Insurance',
  'IFFCO Tokio General Insurance',
  'Go Digit General Insurance',
  'Acko General Insurance',
  'Zuno General Insurance (Edelweiss)',
  'Magma HDI General Insurance',
  'Navi General Insurance',
  'Shriram General Insurance',
  'Liberty General Insurance',
  'Raheja QBE General Insurance',
];

/**
 * Comprehensive list of Third-Party Administrators (TPAs) operating in India
 */
export const INDIAN_TPAS: string[] = [
  'Medi Assist Insurance TPA Pvt Ltd (MediAssist)',
  'MDIndia Health Insurance TPA Pvt Ltd (MD India)',
  'Paramount Health Services & Insurance TPA Pvt Ltd',
  'Vidal Health Insurance TPA Pvt Ltd',
  'Heritage Health Insurance TPA Pvt Ltd',
  'Health Insurance TPA of India Ltd (HITPA)',
  'Family Health Plan Insurance TPA Ltd (FHPL)',
  'Raksha Health Insurance TPA Pvt Ltd',
  'Vipul Medcorp Insurance TPA Pvt Ltd',
  'Park Mediclaim Insurance TPA Pvt Ltd',
  'Ericson Insurance TPA Pvt Ltd',
  'Genins India Insurance TPA Ltd',
  'Health India Insurance TPA Services Pvt Ltd',
  'Safeway Insurance TPA Pvt Ltd',
  'Dedicated Healthcare Services TPA (India) Pvt Ltd',
  'United Health Care Parekh TPA',
  'Rothshield Healthcare TPA Services Ltd',
  'Vision Digital TPA',
  'In-House TPA (Star Health In-House)',
  'In-House TPA (ICICI Lombard In-House)',
  'In-House TPA (HDFC ERGO In-House)',
  'In-House TPA (Bajaj Allianz In-House)',
  'In-House TPA (Care Health In-House)',
  'In-House TPA (Niva Bupa In-House)',
  'In-House TPA (Aditya Birla In-House)',
  'In-House (General)',
];
