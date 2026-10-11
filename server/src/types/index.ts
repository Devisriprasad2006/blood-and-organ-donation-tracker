// =============================================================================
// LifeLink Healthcare Platform: Backend Core Domain Types and DB Entities
// =============================================================================

export type UserRole = 
  | 'DONOR' 
  | 'RECIPIENT' 
  | 'HOSPITAL' 
  | 'BLOOD_BANK' 
  | 'COORDINATOR'
  | 'REVIEWER'
  | 'ADMINISTRATOR';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponentType = 
  | 'Whole Blood' 
  | 'Packed RBC' 
  | 'Platelets' 
  | 'Fresh Frozen Plasma' 
  | 'Cryoprecipitate';

export type OrganType = 
  | 'Kidney' 
  | 'Liver' 
  | 'Heart' 
  | 'Lung' 
  | 'Pancreas' 
  | 'Cornea';

export type RequestUrgency = 
  | 'CRITICAL_EMERGENCY' 
  | 'CRITICAL_SOS' 
  | 'URGENT' 
  | 'HIGH' 
  | 'ROUTINE';

export type BloodRequestStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Matching' 
  | 'Donor Contacted' 
  | 'Fulfilled' 
  | 'Rejected' 
  | 'Cancelled' 
  | 'Expired';

export type OrganWorkflowStatus = 
  | 'Registration Submitted' 
  | 'Awaiting Verification' 
  | 'Verified' 
  | 'Coordination in Progress' 
  | 'Awaiting Authorized Review' 
  | 'Approved by Authorized Authority' 
  | 'Completed' 
  | 'Cancelled';

export type NotificationType = 
  | 'EMERGENCY_ALERT' 
  | 'REQUEST_UPDATE' 
  | 'INVENTORY_WARNING' 
  | 'SYSTEM'
  | 'ORGAN_UPDATE';

export type NotificationChannel = 'IN_APP' | 'SMS_SIMULATED' | 'EMAIL_SIMULATED';

export interface UserEntity {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: UserRole;
  city: string;
  region: string;
  approx_latitude: number;
  approx_longitude: number;
  is_verified: boolean;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DonorProfileEntity {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  donation_type: 'BLOOD_ONLY' | 'ORGAN_ONLY' | 'BOTH';
  is_available: boolean;
  is_matching_paused: boolean;
  preferred_contact: 'IN_APP' | 'PHONE' | 'EMAIL';
  last_donation_date?: string | null;
  total_donations_count: number;
  donor_card_number: string;
  age: number;
  weight_kg: number;
  medical_self_declaration_accepted: boolean;
  consent_withdrawal_allowed: boolean;
  location_permission_granted: boolean;
  privacy_setting: 'ANONYMOUS_TO_PUBLIC' | 'AUTHORIZED_HOSPITALS_ONLY';
  created_at?: string;
  updated_at?: string;
}

export interface BloodInventoryEntity {
  id: string;
  blood_bank_id: string;
  blood_bank_name: string;
  blood_group: BloodGroup;
  component_type: BloodComponentType;
  units_available: number;
  units_reserved: number;
  storage_rack: string;
  batch_number: string;
  collection_date: string;
  expiry_date: string;
  is_low_stock: boolean;
  is_expired: boolean;
  last_audited_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface BloodRequestEntity {
  id: string;
  requester_id: string;
  patient_name: string;
  patient_age: number;
  hospital_name: string;
  hospital_city: string;
  hospital_latitude: number;
  hospital_longitude: number;
  doctor_in_charge: string;
  contact_phone: string;
  blood_group: BloodGroup;
  component_type: BloodComponentType;
  units_required: number;
  units_allocated: number;
  urgency: RequestUrgency;
  status: BloodRequestStatus;
  required_by_date: string;
  clinical_diagnosis: string;
  matched_donors_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrganDonationIntentEntity {
  id: string;
  donor_id: string;
  donor_name: string;
  donor_age: number;
  donor_blood_group: BloodGroup;
  donor_city: string;
  organs_intended: string; // JSON array of OrganType
  status: OrganWorkflowStatus;
  consent_form_signed: boolean;
  nok_consent_recorded: boolean;
  primary_hospital_id: string;
  primary_hospital_name: string;
  transplant_coordinator?: string | null;
  authorized_approval_number?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationEntity {
  id: string;
  recipient_user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  delivery_status: 'DELIVERED' | 'SIMULATED' | 'PENDING';
  channel: NotificationChannel;
  action_url?: string | null;
  created_at?: string;
}

export interface AuditLogEntity {
  id: string;
  timestamp?: string;
  actor: string;
  role: string;
  action: string;
  entity_type: 'BLOOD_REQUEST' | 'ORGAN_WORKFLOW' | 'INVENTORY' | 'SECURITY' | 'VERIFICATION';
  details: string;
  ip_address: string;
  status: 'VERIFIED' | 'FLAGGED';
  hash_signature: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}
