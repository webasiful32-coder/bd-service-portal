export type ServiceCategory = 
  | 'all'
  | 'nid'
  | 'birth'
  | 'birth_death'
  | 'tax'
  | 'tax_tin'
  | 'mobile'
  | 'telecom'
  | 'location'
  | 'cert'
  | 'certificate'
  | 'land'
  | 'education'
  | 'trade'
  | 'other'
  | 'others'
  | (string & {});

export type ServiceType = string;

export interface ServiceDefinition {
  id: ServiceType;
  title: string;
  banglaTitle: string;
  category: string;
  description: string;
  fee: number;
  icon?: string;
  iconName?: string;
  color?: string;
  titleEn?: string;
  popular?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  placeholder?: string;
  price?: number;
  [key: string]: any;
}

export type ServiceItem = ServiceDefinition;

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'service';
  serviceName?: string;
  amount: number;
  method?: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'System' | string;
  trxId?: string;
  accountNo?: string;
  status: 'Completed' | 'Pending' | 'Rejected' | string;
  timestamp: string;
}

export interface BirthCertificateInput {
  regNo: string;
  dob: string;
  nameBangla: string;
  nameEnglish: string;
  fatherBangla: string;
  fatherEnglish: string;
  motherBangla: string;
  motherEnglish: string;
  birthPlaceBangla: string;
  birthPlaceEnglish: string;
}

export interface DeathCertificateInput {
  regNo: string;
  deathDate: string;
  nameBangla: string;
  nameEnglish: string;
  fatherBangla: string;
  motherBangla: string;
  spouseBangla: string;
  deathPlaceBangla: string;
  deathPlaceEnglish: string;
  cause: string;
}

export interface NIDInput {
  nidNo: string;
  pin: string;
  nameBangla: string;
  nameEnglish: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  dob: string;
  birthPlace: string;
  address: string;
  bloodGroup: string;
  photoUrl?: string;
  signatureBase64?: string;
}

export interface LocationTrackerState {
  phone: string;
  isTracking: boolean;
  progress: number;
  latitude: number;
  longitude: number;
  operator: string;
  signalStrength: string;
  locationName: string;
  cellId: string;
}

export interface SMSBomberState {
  phone: string;
  count: number;
  sentCount: number;
  isBombing: boolean;
  logs: string[];
}

export interface DeviceLockState {
  phone: string;
  message: string;
  bkashNumber: string;
  amount: string;
  isLockedSimulation: boolean;
}

// --- ব্যবসা ও সার্টিফিকেশন ইন্টারফেস ---
export interface BusinessInput {
  businessName: string;
  ownerName: string;
  address: string;
  tradeLicenseNo?: string;
  tinNumber?: string;
}

export interface CertificationInput {
  nidNo: string;
  fullName: string;
  permanentAddress: string;
  referenceNo?: string;
  educationDetails?: string; // SSC/HSC এর জন্য
}

// --- ইউটিলিটি ও সাধারণ সেবা ---
export interface UtilityBillInput {
  consumerNo: string;
  billMonth: string;
  meterNo?: string;
  amount?: number;
}

export interface CVInput {
  fullName: string;
  profession: string;
  phone: string;
  email: string;
  address: string;
  education: string;
  experience?: string;
}

export interface MarriageCertInput {
  groomName: string;
  brideName: string;
  marriageDate: string;
  kaziOfficeName: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceBanglaTitle: string;
  info: string;
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  deliveryNote?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  timestamp: string;
  method?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  balance: number;
}