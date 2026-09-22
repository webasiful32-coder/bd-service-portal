export type ServiceCategory = 
  | 'all'
  | 'nid'
  | 'birth'
  | 'birth_death'
  | 'tin'
  | 'tax'
  | 'tax_tin'
  | 'sim'
  | 'mobile'
  | 'telecom'
  | 'location'
  | 'cert'
  | 'certificate'
  | 'passport'
  | 'land'
  | 'education'
  | 'trade'
  | 'other'
  | 'others'
  | (string & {});

export type ServiceType = string;

export interface ServiceField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  options?: string[];
  required?: boolean;
}

export interface ServiceDefinition {
  id: ServiceType;
  title: string;
  banglaTitle?: string;
  titleEn?: string;          // <--- optional করা হয়েছে
  category: ServiceCategory;
  description: string;
  fee?: number;
  price: number;
  icon?: string;             // <--- ইমোজি আইকন সাপোর্ট
  iconType?: string;         // <--- optional করা হয়েছে যাতে এরর না আসে
  iconName?: string;
  color?: string;
  popular?: boolean;
  isPopular?: boolean;
  tag?: string;
  deliveryTime?: string;     // <--- ৩ দিন সময় বা ২৪ ঘণ্টা অনলাইন ব্যাজ
  processingTime?: string;
  badge?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  placeholder?: string;
  fields?: ServiceField[];
  [key: string]: any;
}

export type ServiceItem = ServiceDefinition;

export interface UserAccount {
  username: string;
  displayName: string;
  phone?: string;
  email?: string;
  walletBalance: number;
  isVerified: boolean;
  isGuest: boolean;
  rechargeHistory: WalletRechargeRecord[];
}

export interface WalletRechargeRecord {
  id: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay';
  amount: number;
  senderNumber: string;
  trxId: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

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

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceBanglaTitle: string;
  info: string;
  details?: Record<string, string>;
  files?: string[];
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryTime?: string;
  completedAt?: string;
  deliveryNote?: string;
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
  educationDetails?: string;
}

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

export interface GeneratedDocData {
  serviceId: string;
  serviceTitle: string;
  fullNameBn: string;
  fullNameEn: string;
  nidNumber?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  qrCodeUrl?: string;
  barcode?: string;
  issuedDate: string;
  trackingId: string;
  operatorName?: string;
  simNumber?: string;
  photoUrl?: string;
}