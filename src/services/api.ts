// =============================================================================
// LifeLink: Unified API Client connecting to Node.js / Express REST API Engine
// Base URL: http://localhost:5000/api/v1 with resilient client fallback
// =============================================================================

import axios from 'axios';
import type { 
  User, 
  DonorProfile, 
  BloodRequest, 
  BloodInventoryItem, 
  OrganDonationIntent, 
  OrganRequest, 
  AppNotification, 
  AuditRecord, 
  VerificationRequest 
} from '../types';
import { 
  DEMO_USERS, 
  INITIAL_DONOR_PROFILES, 
  INITIAL_BLOOD_REQUESTS, 
  INITIAL_BLOOD_INVENTORY, 
  INITIAL_ORGAN_INTENTS, 
  INITIAL_ORGAN_REQUESTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_VERIFICATIONS 
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifelink_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// REST API Service Methods
export const healthcareApi = {
  // Authentication & Profile
  auth: {
    async login(email: string, password: string) {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    async register(userData: any) {
      const res = await apiClient.post('/auth/register', userData);
      return res.data;
    },
    async getMe() {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    async updateDonorProfile(updates: any) {
      const res = await apiClient.put('/auth/donor-profile', updates);
      return res.data;
    },
  },

  // Blood Inventory
  inventory: {
    async getAll(filters?: { bloodGroup?: string; componentType?: string; isLowStock?: boolean; search?: string }) {
      const res = await apiClient.get('/blood/inventory', { params: filters });
      return res.data;
    },
    async restock(data: any) {
      const res = await apiClient.post('/blood/inventory/restock', data);
      return res.data;
    },
    async reserve(itemId: string, unitsToReserve: number, reason: string) {
      const res = await apiClient.post('/blood/inventory/reserve', { itemId, unitsToReserve, reason });
      return res.data;
    },
    async dispatch(itemId: string, unitsToDispatch: number, destinationHospital: string) {
      const res = await apiClient.post('/blood/inventory/dispatch', { itemId, unitsToDispatch, destinationHospital });
      return res.data;
    },
  },

  // Blood Requests & Emergency SOS
  requests: {
    async getAll(filters?: { status?: string; bloodGroup?: string; urgency?: string; search?: string }) {
      const res = await apiClient.get('/blood/requests', { params: filters });
      return res.data;
    },
    async getById(id: string) {
      const res = await apiClient.get(`/blood/requests/${id}`);
      return res.data;
    },
    async create(requestData: any) {
      const res = await apiClient.post('/blood/requests', requestData);
      return res.data;
    },
    async updateStatus(id: string, newStatus: string, note: string) {
      const res = await apiClient.put(`/blood/requests/${id}/status`, { newStatus, note });
      return res.data;
    },
    async emergencySos(data: any) {
      const res = await apiClient.post('/blood/requests/emergency-sos', data);
      return res.data;
    },
  },

  // Matching Engine
  matching: {
    async findDonors(query: { recipientBloodGroup: string; componentType?: string; urgency?: string; radiusKm?: number }) {
      const res = await apiClient.post('/matching/find-donors', query);
      return res.data;
    },
  },

  // Organ Donation Coordination (Separated Ethical Workflow)
  organs: {
    async getIntents(filters?: { status?: string; search?: string }) {
      const res = await apiClient.get('/organs/intents', { params: filters });
      return res.data;
    },
    async createIntent(data: any) {
      const res = await apiClient.post('/organs/intents', data);
      return res.data;
    },
    async updateIntentStatus(id: string, data: any) {
      const res = await apiClient.put(`/organs/intents/${id}/status`, data);
      return res.data;
    },
    async getRequests() {
      const res = await apiClient.get('/organs/requests');
      return res.data;
    },
  },

  // Notifications
  notifications: {
    async getAll(unreadOnly = false) {
      const res = await apiClient.get('/notifications', { params: { unread: unreadOnly } });
      return res.data;
    },
    async markAsRead(id: string) {
      const res = await apiClient.put(`/notifications/${id}/read`);
      return res.data;
    },
    async markAllAsRead() {
      const res = await apiClient.put('/notifications/read-all');
      return res.data;
    },
  },

  // Audit Logs & Analytics
  audit: {
    async getLogs(limit = 50, offset = 0) {
      const res = await apiClient.get('/audit/logs', { params: { limit, offset } });
      return res.data;
    },
  },
  analytics: {
    async getOverview() {
      const res = await apiClient.get('/analytics/overview');
      return res.data;
    },
  },
};

// Resilient Local Store fallback
class LocalDemoStore {
  private users: Record<string, User>;
  private donors: DonorProfile[];
  private bloodRequests: BloodRequest[];
  private inventory: BloodInventoryItem[];
  private organIntents: OrganDonationIntent[];
  private organRequests: OrganRequest[];
  private notifications: AppNotification[];
  private auditLogs: AuditRecord[];
  private verifications: VerificationRequest[];

  constructor() {
    this.users = this.load('lifelink_users', DEMO_USERS);
    this.donors = this.load('lifelink_donors', INITIAL_DONOR_PROFILES);
    this.bloodRequests = this.load('lifelink_requests', INITIAL_BLOOD_REQUESTS);
    this.inventory = this.load('lifelink_inventory', INITIAL_BLOOD_INVENTORY);
    this.organIntents = this.load('lifelink_organ_intents', INITIAL_ORGAN_INTENTS);
    this.organRequests = this.load('lifelink_organ_requests', INITIAL_ORGAN_REQUESTS);
    this.notifications = this.load('lifelink_notifications', INITIAL_NOTIFICATIONS);
    this.auditLogs = this.load('lifelink_audit', INITIAL_AUDIT_LOGS);
    this.verifications = this.load('lifelink_verifications', INITIAL_VERIFICATIONS);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Getters
  getUsers() { return { ...this.users }; }
  getDonors() { return [...this.donors]; }
  getBloodRequests() { return [...this.bloodRequests]; }
  getInventory() { return [...this.inventory]; }
  getOrganIntents() { return [...this.organIntents]; }
  getOrganRequests() { return [...this.organRequests]; }
  getNotifications() { return [...this.notifications]; }
  getAuditLogs() { return [...this.auditLogs]; }
  getVerifications() { return [...this.verifications]; }

  // Mutations
  addDonor(donor: DonorProfile) {
    this.donors.unshift(donor);
    this.save('lifelink_donors', this.donors);
    return donor;
  }

  updateDonor(id: string, updates: Partial<DonorProfile>) {
    this.donors = this.donors.map(d => d.id === id ? { ...d, ...updates } : d);
    this.save('lifelink_donors', this.donors);
  }

  addBloodRequest(req: BloodRequest) {
    this.bloodRequests.unshift(req);
    this.save('lifelink_requests', this.bloodRequests);
    return req;
  }

  updateBloodRequestStatus(id: string, status: BloodRequest['status'], note: string, actor: string) {
    this.bloodRequests = this.bloodRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          updatedAt: new Date().toISOString(),
          timeline: [...r.timeline, { status, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note, actor }],
        };
      }
      return r;
    });
    this.save('lifelink_requests', this.bloodRequests);
  }

  updateInventory(id: string, deltaAvailable: number, deltaReserved: number) {
    this.inventory = this.inventory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          unitsAvailable: Math.max(0, item.unitsAvailable + deltaAvailable),
          unitsReserved: Math.max(0, item.unitsReserved + deltaReserved),
          isLowStock: (item.unitsAvailable + deltaAvailable) <= 5,
        };
      }
      return item;
    });
    this.save('lifelink_inventory', this.inventory);
  }

  addOrganIntent(intent: OrganDonationIntent) {
    this.organIntents.unshift(intent);
    this.save('lifelink_organ_intents', this.organIntents);
    return intent;
  }

  updateOrganIntentStatus(id: string, status: OrganDonationIntent['status'], note: string, actor: string) {
    this.organIntents = this.organIntents.map(intent => {
      if (intent.id === id) {
        return {
          ...intent,
          status,
          timeline: [...intent.timeline, { status, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note, actor }],
        };
      }
      return intent;
    });
    this.save('lifelink_organ_intents', this.organIntents);
  }

  addNotification(notif: AppNotification) {
    this.notifications.unshift(notif);
    this.save('lifelink_notifications', this.notifications);
  }

  markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.save('lifelink_notifications', this.notifications);
  }

  addAuditLog(log: Omit<AuditRecord, 'id' | 'timestamp' | 'hashSignature'>) {
    const newLog: AuditRecord = {
      ...log,
      id: `audit-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      hashSignature: `0x${Math.random().toString(16).slice(2, 10)}`,
    };
    this.auditLogs.unshift(newLog);
    this.save('lifelink_audit', this.auditLogs);
    return newLog;
  }

  updateVerification(id: string, status: 'APPROVED' | 'REJECTED') {
    this.verifications = this.verifications.map(v => v.id === id ? { ...v, status } : v);
    this.save('lifelink_verifications', this.verifications);
  }
}

export const localStore = new LocalDemoStore();
