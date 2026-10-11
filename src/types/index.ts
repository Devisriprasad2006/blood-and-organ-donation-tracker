// =============================================================================
// LifeLink: Digital Blood & Organ Donation Management and Tracking System
// Comprehensive Domain Types and Contracts
// =============================================================================

export type UserRole = 
  | 'DONOR' 
  | 'RECIPIENT' 
  | 'HOSPITAL' 
  | 'BLOOD_BANK' 
  | 'COORDINATOR'
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
  | 'CRITICAL_EMERGENCY' // Life-threatening (< 2h)
  | 'CRITICAL SOS'       // Urgent SOS broadcast
  | 'URGENT'             // Urgent scheduling (< 8h)
  | 'HIGH'               // Standard hospital priority (< 24h)
  | 'ROUTINE';           // Scheduled surgery


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

export type NotificationChannel = 'IN_APP' | 'SIMULATED_SMS' | 'SIMULATED_EMAIL';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  region: string;
  approxLatitude: number;
  approxLongitude: number;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  user: User;
  bloodGroup: BloodGroup;
  donationType: 'BLOOD_ONLY' | 'ORGAN_ONLY' | 'BOTH';
  isAvailable: boolean;
  isMatchingPaused: boolean;
  preferredContact: 'IN_APP' | 'PHONE' | 'EMAIL';
  lastDonationDate?: string;
  totalDonationsCount: number;
  donorCardNumber: string;
  age: number;
  weightKg: number;
  medicalSelfDeclarationAccepted: boolean;
  consentWithdrawalAllowed: boolean;
  locationPermissionGranted: boolean;
  privacySetting: 'ANONYMOUS_TO_PUBLIC' | 'AUTHORIZED_HOSPITALS_ONLY';
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  patientName: string;
  patientAge: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalLatitude: number;
  hospitalLongitude: number;
  doctorInCharge: string;
  contactPhone: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponentType;
  unitsRequired: number;
  unitsAllocated: number;
  urgency: RequestUrgency;
  status: BloodRequestStatus;
  requiredByDate: string;
  clinicalDiagnosis: string;
  createdAt: string;
  updatedAt: string;
  matchedDonorsCount: number;
  timeline: {
    status: BloodRequestStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
}

export interface BloodInventoryItem {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponentType;
  unitsAvailable: number;
  unitsReserved: number;
  storageRack: string;
  batchNumber: string;
  collectionDate: string;
  expiryDate: string;
  isLowStock: boolean;
  isExpired: boolean;
  lastAuditedDate: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  bloodGroup: BloodGroup;
  componentType: BloodComponentType;
  action: 'RESTOCK' | 'RESERVE' | 'DISPATCH' | 'DISCARD_EXPIRED';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface OrganDonationIntent {
  id: string;
  donorId: string;
  donorName: string;
  donorAge: number;
  donorBloodGroup: BloodGroup;
  donorCity: string;
  organsIntended: OrganType[];
  status: OrganWorkflowStatus;
  consentFormSigned: boolean;
  nokConsentRecorded: boolean; // Next of Kin consent
  primaryHospitalId: string;
  primaryHospitalName: string;
  transplantCoordinator?: string;
  submittedAt: string;
  verifiedAt?: string;
  authorizedApprovalNumber?: string;
  notes?: string;
  timeline: {
    status: OrganWorkflowStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
}

export interface OrganRequest {
  id: string;
  recipientName: string;
  recipientAge: number;
  bloodGroup: BloodGroup;
  organNeeded: OrganType;
  hospitalId: string;
  hospitalName: string;
  attendingSurgeon: string;
  urgency: RequestUrgency;
  status: OrganWorkflowStatus;
  clinicalAssessment: string;
  waitingListRegistrationNumber: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'EMERGENCY_ALERT' | 'REQUEST_UPDATE' | 'INVENTORY_WARNING' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  deliveryStatus: 'DELIVERED' | 'SIMULATED' | 'PENDING';
  channel: NotificationChannel;
  actionUrl?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  entityType: 'BLOOD_REQUEST' | 'ORGAN_WORKFLOW' | 'INVENTORY' | 'SECURITY' | 'VERIFICATION';
  details: string;
  ipAddress: string;
  status: 'VERIFIED' | 'FLAGGED';
  hashSignature: string;
}

export interface VerificationRequest {
  id: string;
  facilityType: 'HOSPITAL' | 'BLOOD_BANK';
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AiDonorMatch {
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  approxDistanceKm: number;
  compatibilityScore: number;
  isAvailable: boolean;
  lastDonationDate?: string;
  reasons: string[];
  contactMethod: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  patientAge: number;
  hospitalName: string;
  hospitalLatitude: number;
  hospitalLongitude: number;
  doctorInCharge: string;
  contactPhone: string;
  requestType: 'Blood' | 'Organ';
  bloodGroup: BloodGroup;
  bloodComponent?: BloodComponentType;
  organType?: OrganType;
  unitsNeeded: number;
  urgency: RequestUrgency;
  status: string;
  medicalDiagnosis: string;
  broadcastRadiusKm: number;
  createdAt?: string;
  matchedCandidatesCount?: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyHotline: string;
  bloodBankAffiliated: boolean;
  transplantCenter: boolean;
  availableBeds?: number;
}

