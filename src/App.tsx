import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { UnifiedRoleDashboard } from './components/dashboard/UnifiedRoleDashboard';
import { getSocket } from './services/socket';
import { healthcareApi } from './services/api';
import { BloodRequestManagement } from './components/blood/BloodRequestManagement';
import { DonorDirectory } from './components/donor/DonorDirectory';
import { BloodBankInventoryView } from './components/inventory/BloodBankInventoryView';
import { OrganWorkflowManagement } from './components/organ/OrganWorkflowManagement';
import { AnalyticsReportsView } from './components/analytics/AnalyticsReportsView';
import { AuditAndVerificationView } from './components/audit/AuditAndVerificationView';
import { NotificationCenterView } from './components/notifications/NotificationCenterView';
import { ProfileAndConsentView } from './components/profile/ProfileAndConsentView';
import { PublicLandingPage } from './components/landing/PublicLandingPage';
import { HowItWorksView } from './components/about/HowItWorksView';
import { AiMatchingGps } from './components/ai-matching/AiMatchingGps';
import { EmergencyAlerts } from './components/emergency/EmergencyAlerts';
import { EmergencySOSModal } from './components/emergency/EmergencySOSModal';
import { MultiStepDonorRegistrationModal } from './components/auth/MultiStepDonorRegistrationModal';
import { AuthModal } from './components/auth/AuthModal';

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
} from './data/mockData';

import type { 
  UserRole, 
  BloodRequest, 
  BloodInventoryItem, 
  OrganDonationIntent, 
  OrganRequest, 
  AppNotification, 
  AuditRecord, 
  VerificationRequest, 
  DonorProfile, 
  BloodRequestStatus, 
  OrganWorkflowStatus,
  EmergencyRequest
} from './types';

import { 
  Heart, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  X, 
  Lock
} from 'lucide-react';


interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info';
}

export function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('DONOR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core Datasets
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_DONOR_PROFILES);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(INITIAL_BLOOD_REQUESTS);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>(INITIAL_BLOOD_INVENTORY);
  const [organIntents, setOrganIntents] = useState<OrganDonationIntent[]>(INITIAL_ORGAN_INTENTS);
  const [organRequests, setOrganRequests] = useState<OrganRequest[]>(INITIAL_ORGAN_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(INITIAL_VERIFICATIONS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyRequest[]>([
    {
      id: 'sos-901',
      patientName: 'Karthik Narayanan (Polytrauma)',
      patientAge: 29,
      hospitalName: 'Rajiv Gandhi Government General Hospital',
      hospitalLatitude: 13.0827,
      hospitalLongitude: 80.2707,
      doctorInCharge: 'Dr. Sundaram, Head of Trauma',
      contactPhone: '+91 44 2530 5111',
      requestType: 'Blood',
      bloodGroup: 'O-',
      bloodComponent: 'Packed RBC',
      unitsNeeded: 3,
      urgency: 'CRITICAL_EMERGENCY',
      status: 'Broadcasted',
      medicalDiagnosis: 'Massive blood loss following highway accident',
      broadcastRadiusKm: 25,
      createdAt: '10 mins ago',
      matchedCandidatesCount: 4,
    }
  ]);

  // Modals, Auth & Toasts
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('DONOR');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const currentUser = DEMO_USERS[currentRole] || DEMO_USERS.DONOR;

  const addToast = useCallback((title: string, message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectRoleLogin = useCallback((role: UserRole) => {
    setAuthRole(role);
    setAuthMode('LOGIN');
    setIsAuthModalOpen(true);
  }, []);

  const handleSelectRoleRegister = useCallback((role: UserRole) => {
    setAuthRole(role);
    setAuthMode('REGISTER');
    setIsAuthModalOpen(true);
  }, []);

  const handleSignOut = useCallback(() => {
    try {
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_user');
    } catch {
      // ignore
    }
    setActivePage('landing');
    addToast('Signed Out', 'You have been safely returned to the Public Portal.', 'info');
  }, [addToast]);

  const handleLoginSuccess = useCallback((role: UserRole, user?: any) => {
    setCurrentRole(role);
    setIsAuthModalOpen(false);

    // Route directly to the persona's customized workspace
    switch (role) {
      case 'DONOR':
        setActivePage('dashboard');
        break;
      case 'RECIPIENT':
        setActivePage('blood-requests');
        break;
      case 'HOSPITAL':
        setActivePage('dashboard');
        break;
      case 'BLOOD_BANK':
        setActivePage('blood-inventory');
        break;
      case 'COORDINATOR':
        setActivePage('organ-donation');
        break;
      case 'ADMINISTRATOR':
        setActivePage('dashboard');
        break;
      default:
        setActivePage('dashboard');
    }

    addToast(
      'Authenticated',
      `Session established for ${user?.fullName || role.replace('_', ' ')}.`,
      'success'
    );
  }, [addToast]);

  // Pure Web Audio API Ambulance Siren Synthesizer
  const playSirenSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      const startTime = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        osc.frequency.setValueAtTime(880, startTime + i * 0.4); // High pitch (A5)
        osc.frequency.setValueAtTime(659.25, startTime + i * 0.4 + 0.2); // Low pitch (E5)
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(startTime + 1.6);
    } catch (e) {
      console.warn('Audio siren preview suppressed by browser policy:', e);
    }
  }, [soundEnabled]);

  // Synchronize state with real-time Socket.IO events and REST API
  useEffect(() => {
    async function hydrateFromServer() {
      try {
        const [reqRes, invRes, organRes, notifRes, auditRes] = await Promise.allSettled([
          healthcareApi.requests.getAll(),
          healthcareApi.inventory.getAll(),
          healthcareApi.organs.getIntents(),
          healthcareApi.notifications.getAll(),
          healthcareApi.audit.getLogs(50),
        ]);

        if (reqRes.status === 'fulfilled' && reqRes.value?.requests?.length) {
          setBloodRequests(reqRes.value.requests);
        }
        if (invRes.status === 'fulfilled' && invRes.value?.items?.length) {
          setInventory(invRes.value.items.map((i: any) => ({
            id: i.id,
            bloodBankId: i.blood_bank_id || i.bloodBankId,
            bloodBankName: i.blood_bank_name || i.bloodBankName,
            bloodGroup: i.blood_group || i.bloodGroup,
            componentType: i.component_type || i.componentType,
            unitsAvailable: i.units_available ?? i.unitsAvailable,
            unitsReserved: i.units_reserved ?? i.unitsReserved,
            storageRack: i.storage_rack || i.storageRack,
            batchNumber: i.batch_number || i.batchNumber,
            collectionDate: i.collection_date || i.collectionDate,
            expiryDate: i.expiry_date || i.expiryDate,
            isLowStock: Boolean(i.is_low_stock ?? i.isLowStock),
            isExpired: Boolean(i.is_expired ?? i.isExpired),
            lastAuditedDate: i.last_audited_date || i.lastAuditedDate,
          })));
        }
        if (organRes.status === 'fulfilled' && organRes.value?.intents?.length) {
          setOrganIntents(organRes.value.intents.map((oi: any) => ({
            id: oi.id,
            donorId: oi.donor_id || oi.donorId,
            donorName: oi.donor_name || oi.donorName,
            donorAge: oi.donor_age || oi.donorAge,
            donorBloodGroup: oi.donor_blood_group || oi.donorBloodGroup,
            donorCity: oi.donor_city || oi.donorCity,
            organsIntended: oi.organs_intended || oi.organsIntended,
            status: oi.status,
            consentFormSigned: Boolean(oi.consent_form_signed ?? oi.consentFormSigned),
            nokConsentRecorded: Boolean(oi.nok_consent_recorded ?? oi.nokConsentRecorded),
            primaryHospitalId: oi.primary_hospital_id || oi.primaryHospitalId,
            primaryHospitalName: oi.primary_hospital_name || oi.primaryHospitalName,
            transplantCoordinator: oi.transplant_coordinator || oi.transplantCoordinator,
            authorizedApprovalNumber: oi.authorized_approval_number || oi.authorizedApprovalNumber,
            submittedAt: oi.created_at || new Date().toISOString(),
            notes: oi.notes || 'Pledged online under NOTTO framework',
            timeline: [{
              status: oi.status,
              timestamp: (oi.created_at || new Date().toISOString()).slice(0, 10),
              note: oi.notes || 'Registered in digital grid',
              actor: oi.transplant_coordinator || 'Coordination Center',
            }]
          })));
        }
        if (notifRes.status === 'fulfilled' && notifRes.value?.notifications?.length) {
          setNotifications(notifRes.value.notifications.map((n: any) => ({
            id: n.id,
            recipientUserId: n.recipient_user_id || n.recipientUserId,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: Boolean(n.is_read ?? n.isRead),
            createdAt: n.created_at || 'Recently',
            deliveryStatus: n.delivery_status || 'DELIVERED',
            channel: n.channel || 'IN_APP',
            actionUrl: n.action_url || n.actionUrl,
          })));
        }
        if (auditRes.status === 'fulfilled' && auditRes.value?.logs?.length) {
          setAuditLogs(auditRes.value.logs.map((a: any) => ({
            id: a.id,
            timestamp: a.timestamp,
            actor: a.actor,
            role: a.role,
            action: a.action,
            entityType: a.entity_type || a.entityType,
            details: a.details,
            ipAddress: a.ip_address || a.ipAddress,
            status: a.status,
            hashSignature: a.hash_signature || a.hashSignature,
          })));
        }
      } catch (err) {
        console.warn('Initial server state hydration gracefully completed:', err);
      }
    }

    hydrateFromServer();

    // Socket.IO event listeners
    const socket = getSocket();

    const handleSosBroadcast = (sos: any) => {
      console.log('[Socket.IO] Emergency SOS Broadcast received:', sos);
      playSirenSound();
      addToast(
        'EMERGENCY SOS BROADCAST',
        `Urgent call for ${sos.bloodGroup} (${sos.componentType}) at ${sos.hospitalName}, ${sos.hospitalCity}!`,
        'alert'
      );
      setEmergencyAlerts((prev) => [
        {
          id: sos.id,
          patientName: 'Emergency Trauma Patient',
          patientAge: 30,
          hospitalName: sos.hospitalName,
          hospitalLatitude: sos.hospitalLatitude || 13.0827,
          hospitalLongitude: sos.hospitalLongitude || 80.2707,
          doctorInCharge: 'Trauma ICU Specialist',
          contactPhone: '+91 44 2530 5111',
          requestType: 'Blood',
          bloodGroup: sos.bloodGroup,
          bloodComponent: sos.componentType,
          unitsNeeded: sos.unitsRequired,
          urgency: sos.urgency,
          status: 'Broadcasted',
          medicalDiagnosis: 'Severe trauma resuscitation',
          broadcastRadiusKm: 25,
          createdAt: 'Just now',
          matchedCandidatesCount: 3,
        },
        ...prev,
      ]);
    };

    const handleInventoryUpdate = (item: any) => {
      console.log('[Socket.IO] Inventory item updated:', item);
      setInventory((prev) => {
        const mappedItem: BloodInventoryItem = {
          id: item.id,
          bloodBankId: item.blood_bank_id || item.bloodBankId,
          bloodBankName: item.blood_bank_name || item.bloodBankName,
          bloodGroup: item.blood_group || item.bloodGroup,
          componentType: item.component_type || item.componentType,
          unitsAvailable: item.units_available ?? item.unitsAvailable,
          unitsReserved: item.units_reserved ?? item.unitsReserved,
          storageRack: item.storage_rack || item.storageRack,
          batchNumber: item.batch_number || item.batchNumber,
          collectionDate: item.collection_date || item.collectionDate,
          expiryDate: item.expiry_date || item.expiryDate,
          isLowStock: Boolean(item.is_low_stock ?? item.isLowStock),
          isExpired: Boolean(item.is_expired ?? item.isExpired),
          lastAuditedDate: item.last_audited_date || item.lastAuditedDate,
        };
        const idx = prev.findIndex((i) => i.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = mappedItem;
          return next;
        }
        return [mappedItem, ...prev];
      });
    };

    const handleNotification = (notif: any) => {
      addToast(notif.title, notif.message, notif.type === 'EMERGENCY_ALERT' ? 'alert' : 'info');
      setNotifications((prev) => [
        {
          id: notif.id,
          recipientUserId: notif.recipient_user_id || notif.recipientUserId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: false,
          createdAt: 'Just now',
          deliveryStatus: 'DELIVERED',
          channel: 'IN_APP',
          actionUrl: notif.action_url,
        },
        ...prev,
      ]);
    };

    const handleAuditLogAdded = (log: any) => {
      setAuditLogs((prev) => [
        {
          id: log.id,
          timestamp: log.timestamp,
          actor: log.actor,
          role: log.role,
          action: log.action,
          entityType: log.entity_type || log.entityType,
          details: log.details,
          ipAddress: log.ip_address || log.ipAddress,
          status: log.status,
          hashSignature: log.hash_signature || log.hashSignature,
        },
        ...prev,
      ]);
    };

    socket.on('emergency_sos_broadcast', handleSosBroadcast);
    socket.on('inventory_updated', handleInventoryUpdate);
    socket.on('notification_received', handleNotification);
    socket.on('audit_log_added', handleAuditLogAdded);

    return () => {
      socket.off('emergency_sos_broadcast', handleSosBroadcast);
      socket.off('inventory_updated', handleInventoryUpdate);
      socket.off('notification_received', handleNotification);
      socket.off('audit_log_added', handleAuditLogAdded);
    };
  }, [playSirenSound, addToast]);

  // Audit Log Recorder
  const handleAddAuditLog = useCallback((logData: Omit<AuditRecord, 'id' | 'timestamp' | 'hashSignature'>) => {
    const hash = '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
    const newLog: AuditRecord = {
      ...logData,
      id: `audit-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      hashSignature: hash,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // --- Handlers ---
  const handleCreateBloodRequest = useCallback((reqData: Partial<BloodRequest>) => {
    const newReq: BloodRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterRole: currentRole,
      patientName: reqData.patientName || 'Emergency Patient',
      patientAge: reqData.patientAge || 35,
      hospitalName: reqData.hospitalName || 'Rajiv Gandhi General Hospital',
      hospitalCity: reqData.hospitalCity || 'Chennai',
      hospitalLatitude: reqData.hospitalLatitude || 13.0827,
      hospitalLongitude: reqData.hospitalLongitude || 80.2707,
      doctorInCharge: reqData.doctorInCharge || 'Dr. Sundaram (Trauma)',
      contactPhone: reqData.contactPhone || '+91 44 2530 5111',
      bloodGroup: reqData.bloodGroup || 'O-',
      componentType: reqData.componentType || 'Packed RBC',
      unitsRequired: reqData.unitsRequired || 2,
      unitsAllocated: 0,
      urgency: reqData.urgency || 'CRITICAL_EMERGENCY',
      status: 'Submitted',
      requiredByDate: reqData.requiredByDate || new Date().toISOString().slice(0, 16),
      clinicalDiagnosis: reqData.clinicalDiagnosis || 'Acute trauma resuscitation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchedDonorsCount: reqData.matchedDonorsCount || 3,
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString().slice(0, 16),
          note: 'Request created and verified by hospital staff',
          actor: currentUser.fullName,
        }
      ]
    };

    setBloodRequests((prev) => [newReq, ...prev]);

    // Asynchronously dispatch to real REST API backend
    healthcareApi.requests.create({
      patientName: newReq.patientName,
      patientAge: newReq.patientAge,
      hospitalName: newReq.hospitalName,
      hospitalCity: newReq.hospitalCity,
      hospitalLatitude: newReq.hospitalLatitude,
      hospitalLongitude: newReq.hospitalLongitude,
      doctorInCharge: newReq.doctorInCharge,
      contactPhone: newReq.contactPhone,
      bloodGroup: newReq.bloodGroup,
      componentType: newReq.componentType,
      unitsRequired: newReq.unitsRequired,
      urgency: newReq.urgency,
      requiredByDate: newReq.requiredByDate,
      clinicalDiagnosis: newReq.clinicalDiagnosis,
    }).catch(e => console.warn('Backend API request persistence note:', e.message));

    // Also inject notification for relevant donors
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: 'all-donors',
      title: `Emergency Need: ${newReq.bloodGroup} ${newReq.componentType}`,
      message: `${newReq.hospitalName} requires ${newReq.unitsRequired} units (${newReq.urgency}).`,
      type: 'EMERGENCY_ALERT',
      isRead: false,
      createdAt: 'Just now',
      deliveryStatus: 'DELIVERED',
      channel: 'IN_APP',
      actionUrl: '/requests'
    };
    setNotifications((prev) => [notif, ...prev]);

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'CREATE_BLOOD_REQUEST',
      entityType: 'BLOOD_REQUEST',
      details: `Generated request #${newReq.id} for ${newReq.unitsRequired} units of ${newReq.bloodGroup} (${newReq.componentType}) at ${newReq.hospitalName}.`,
      ipAddress: '103.21.144.12',
      status: 'VERIFIED',
    });

    addToast('Request Submitted', `Blood requisition #${newReq.id} broadcasted to regional network!`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleUpdateBloodRequestStatus = useCallback((id: string, newStatus: BloodRequestStatus, note: string) => {
    healthcareApi.requests.updateStatus(id, newStatus, note)
      .catch(e => console.warn('Backend API update status note:', e.message));
    setBloodRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...r.timeline,
              {
                status: newStatus,
                timestamp: new Date().toISOString().slice(0, 16),
                note,
                actor: currentUser.fullName,
              }
            ]
          };
        }
        return r;
      })
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'UPDATE_BLOOD_REQUEST_STATUS',
      entityType: 'BLOOD_REQUEST',
      details: `Request #${id} transitioned to status "${newStatus}": ${note}`,
      ipAddress: '192.168.1.108',
      status: 'VERIFIED',
    });

    addToast('Status Updated', `Request #${id} updated to "${newStatus}"`, 'info');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleRestockInventory = useCallback((itemData: Partial<BloodInventoryItem>) => {
    const bg = itemData.bloodGroup || 'O+';
    const comp = itemData.componentType || 'Packed RBC';
    const units = itemData.unitsAvailable || 5;

    setInventory((prev) => {
      const existing = prev.find(i => i.bloodGroup === bg && i.componentType === comp);
      if (existing) {
        return prev.map(i =>
          i.id === existing.id
            ? { ...i, unitsAvailable: i.unitsAvailable + units, isLowStock: (i.unitsAvailable + units) < 5 }
            : i
        );
      }
      const newItem: BloodInventoryItem = {
        id: `inv-${Date.now()}`,
        bloodBankId: 'bb-1',
        bloodBankName: itemData.bloodBankName || 'City Central Blood Repository',
        bloodGroup: bg,
        componentType: comp,
        unitsAvailable: units,
        unitsReserved: 0,
        storageRack: itemData.storageRack || 'RACK-COLD-A01',
        batchNumber: itemData.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        collectionDate: itemData.collectionDate || new Date().toISOString().slice(0, 10),
        expiryDate: itemData.expiryDate || '2026-11-20',
        isLowStock: units < 5,
        isExpired: false,
        lastAuditedDate: new Date().toISOString().slice(0, 10),
      };
      return [newItem, ...prev];
    });

    healthcareApi.inventory.restock({
      bloodBankId: 'bb-1',
      bloodBankName: itemData.bloodBankName || 'Stanley Medical College Regional Blood Bank',
      bloodGroup: bg,
      componentType: comp,
      unitsToAdd: units,
      batchNumber: itemData.batchNumber,
      storageRack: itemData.storageRack,
      collectionDate: itemData.collectionDate,
      expiryDate: itemData.expiryDate,
    }).catch(e => console.warn('Backend restock note:', e.message));

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'RESTOCK_BLOOD_INVENTORY',
      entityType: 'INVENTORY',
      details: `Restocked ${units} units of ${bg} (${comp}) into cold chain storage.`,
      ipAddress: '10.0.4.15',
      status: 'VERIFIED',
    });

    addToast('Inventory Restocked', `Added ${units} units of ${bg} (${comp})`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleReserveUnits = useCallback((itemId: string, units: number, reason: string) => {
    healthcareApi.inventory.reserve(itemId, units, reason)
      .catch(e => console.warn('Backend reserve note:', e.message));

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const available = Math.max(0, item.unitsAvailable - units);
          return {
            ...item,
            unitsAvailable: available,
            unitsReserved: item.unitsReserved + units,
            isLowStock: available < 5,
          };
        }
        return item;
      })
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'RESERVE_INVENTORY_UNITS',
      entityType: 'INVENTORY',
      details: `Locked ${units} units for item #${itemId}. Reason: ${reason}`,
      ipAddress: '10.0.4.15',
      status: 'VERIFIED',
    });

    addToast('Units Reserved', `Reserved ${units} units with transaction lock.`, 'info');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleDispatchUnits = useCallback((itemId: string, units: number, reason: string) => {
    healthcareApi.inventory.dispatch(itemId, units, reason)
      .catch(e => console.warn('Backend dispatch note:', e.message));

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const available = Math.max(0, item.unitsAvailable - units);
          return {
            ...item,
            unitsAvailable: available,
            isLowStock: available < 5,
          };
        }
        return item;
      })
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'DISPATCH_INVENTORY_UNITS',
      entityType: 'INVENTORY',
      details: `Dispatched ${units} units for item #${itemId}. Clinical requisition: ${reason}`,
      ipAddress: '10.0.4.15',
      status: 'VERIFIED',
    });

    addToast('Units Dispatched', `Dispatched ${units} units for hospital transfusion.`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleAddOrganIntent = useCallback((intentData: Partial<OrganDonationIntent>) => {
    const newIntent: OrganDonationIntent = {
      id: `org-intent-${Date.now().toString().slice(-4)}`,
      donorId: currentUser.id,
      donorName: intentData.donorName || currentUser.fullName,
      donorAge: intentData.donorAge || 24,
      donorBloodGroup: intentData.donorBloodGroup || 'O+',
      donorCity: intentData.donorCity || 'Chennai',
      organsIntended: intentData.organsIntended || ['Kidney', 'Cornea'],
      status: 'Registration Submitted',
      consentFormSigned: true,
      nokConsentRecorded: intentData.nokConsentRecorded ?? true,
      primaryHospitalId: 'hosp-1',
      primaryHospitalName: intentData.primaryHospitalName || 'General Hospital Transplant Desk',
      transplantCoordinator: 'State Organ Registry Coordinator',
      submittedAt: new Date().toISOString(),
      notes: intentData.notes || 'Voluntary anatomical donation intent pledged.',
      timeline: [
        {
          status: 'Registration Submitted',
          timestamp: new Date().toISOString().slice(0, 10),
          note: 'Pledge enrolled into digital organ registry',
          actor: currentUser.fullName,
        }
      ]
    };

    healthcareApi.organs.createIntent({
      donorName: newIntent.donorName,
      donorAge: newIntent.donorAge,
      donorBloodGroup: newIntent.donorBloodGroup,
      donorCity: newIntent.donorCity,
      organsIntended: newIntent.organsIntended,
      primaryHospitalId: newIntent.primaryHospitalId,
      primaryHospitalName: newIntent.primaryHospitalName,
      notes: newIntent.notes,
    }).catch(e => console.warn('Backend organ intent note:', e.message));

    setOrganIntents((prev) => [newIntent, ...prev]);

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'REGISTER_ORGAN_INTENT',
      entityType: 'ORGAN_WORKFLOW',
      details: `Enrolled organ intent pledge #${newIntent.id} for organs [${newIntent.organsIntended.join(', ')}].`,
      ipAddress: '49.37.211.89',
      status: 'VERIFIED',
    });

    addToast('Organ Pledge Enrolled', `Thank you for pledging anatomical donation! Digital certificate generated.`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleUpdateOrganIntentStatus = useCallback((intentId: string, status: OrganWorkflowStatus, note: string) => {
    healthcareApi.organs.updateIntentStatus(intentId, {
      status,
      notes: note,
    }).catch(e => console.warn('Backend update organ status note:', e.message));
    setOrganIntents((prev) =>
      prev.map((intent) => {
        if (intent.id === intentId) {
          return {
            ...intent,
            status,
            timeline: [
              ...intent.timeline,
              {
                status,
                timestamp: new Date().toISOString().slice(0, 10),
                note,
                actor: currentUser.fullName,
              }
            ]
          };
        }
        return intent;
      })
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'ADVANCE_ORGAN_STATUS',
      entityType: 'ORGAN_WORKFLOW',
      details: `Pledge #${intentId} updated to status "${status}". Note: ${note}`,
      ipAddress: '192.168.1.100',
      status: 'VERIFIED',
    });

    addToast('Organ Status Updated', `Pledge #${intentId} transitioned to ${status}`, 'info');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleCreateEmergencySOS = useCallback((reqData: Partial<EmergencyRequest>) => {
    const newSOS: EmergencyRequest = {
      id: `sos-${Date.now().toString().slice(-4)}`,
      patientName: reqData.patientName || 'Emergency Trauma Patient',
      patientAge: reqData.patientAge || 30,
      hospitalName: reqData.hospitalName || 'Rajiv Gandhi General Hospital',
      hospitalLatitude: 13.0827,
      hospitalLongitude: 80.2707,
      doctorInCharge: reqData.doctorInCharge || 'Dr. Sundaram, Trauma Care',
      contactPhone: reqData.contactPhone || '+91 44 2530 5111',
      requestType: reqData.requestType || 'Blood',
      bloodGroup: reqData.bloodGroup || 'O-',
      bloodComponent: reqData.bloodComponent || 'Packed RBC',
      organType: reqData.organType,
      unitsNeeded: reqData.unitsNeeded || 2,
      urgency: reqData.urgency || 'CRITICAL_EMERGENCY',
      status: 'Broadcasted',
      medicalDiagnosis: reqData.medicalDiagnosis || 'Massive trauma resuscitation',
      broadcastRadiusKm: reqData.broadcastRadiusKm || 30,
      createdAt: 'Just now',
      matchedCandidatesCount: 4,
    };

    setEmergencyAlerts((prev) => [newSOS, ...prev]);

    // Also record into bloodRequests
    const newBloodReq: BloodRequest = {
      id: `req-sos-${Date.now().toString().slice(-4)}`,
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterRole: currentRole,
      patientName: newSOS.patientName,
      patientAge: newSOS.patientAge,
      hospitalName: newSOS.hospitalName,
      hospitalCity: 'Chennai',
      hospitalLatitude: 13.0827,
      hospitalLongitude: 80.2707,
      doctorInCharge: newSOS.doctorInCharge,
      contactPhone: newSOS.contactPhone,
      bloodGroup: newSOS.bloodGroup,
      componentType: newSOS.bloodComponent || 'Packed RBC',
      unitsRequired: newSOS.unitsNeeded,
      unitsAllocated: 0,
      urgency: 'CRITICAL_EMERGENCY',
      status: 'Submitted',
      requiredByDate: new Date().toISOString().slice(0, 16),
      clinicalDiagnosis: newSOS.medicalDiagnosis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchedDonorsCount: 4,
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString().slice(0, 16),
          note: 'Critical SOS broadcast triggered via LifeLink Mesh',
          actor: currentUser.fullName,
        }
      ]
    };
    setBloodRequests((prev) => [newBloodReq, ...prev]);

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'CRITICAL_SOS_BROADCAST',
      entityType: 'BLOOD_REQUEST',
      details: `Dispatched critical SOS for ${newSOS.unitsNeeded} units of ${newSOS.bloodGroup} within ${newSOS.broadcastRadiusKm} km perimeter.`,
      ipAddress: '103.21.144.12',
      status: 'VERIFIED',
    });

    addToast('Emergency SOS Broadcasted!', `Dispatched siren alert for patient ${newSOS.patientName} (${newSOS.bloodGroup})!`, 'alert');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleRegisterDonor = useCallback((newDonorProfile: DonorProfile) => {
    setDonors((prev) => [newDonorProfile, ...prev]);

    handleAddAuditLog({
      actor: newDonorProfile.user.fullName,
      role: 'DONOR',
      action: 'DONOR_ENROLLMENT',
      entityType: 'SECURITY',
      details: `Enrolled verified voluntary donor #${newDonorProfile.donorCardNumber} for group ${newDonorProfile.bloodGroup}.`,
      ipAddress: '192.168.1.108',
      status: 'VERIFIED',
    });

    addToast('Registration Successful', `Welcome ${newDonorProfile.user.fullName}! Donor card #${newDonorProfile.donorCardNumber} active.`, 'success');
  }, [handleAddAuditLog, addToast]);

  const handleApproveVerification = useCallback((id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'APPROVED', reviewedBy: currentUser.fullName } : v))
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'APPROVE_FACILITY_LICENSE',
      entityType: 'VERIFICATION',
      details: `Validated and approved hospital license credentials #${id}.`,
      ipAddress: '192.168.1.1',
      status: 'VERIFIED',
    });

    addToast('Facility Approved', `Credential verification #${id} approved!`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleRejectVerification = useCallback((id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'REJECTED', reviewedBy: currentUser.fullName } : v))
    );

    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'REJECT_FACILITY_LICENSE',
      entityType: 'VERIFICATION',
      details: `Rejected facility license application #${id} due to verification discrepancy.`,
      ipAddress: '192.168.1.1',
      status: 'FLAGGED',
    });

    addToast('Facility Rejected', `Application #${id} rejected.`, 'info');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const handleToggleDonorAvailability = useCallback((donorId: string) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, isAvailable: !d.isAvailable } : d))
    );
    addToast('Availability Toggled', 'Donor availability status updated in real time.', 'info');
  }, [addToast]);

  const handleDispatchAiCandidate = useCallback((candidateName: string) => {
    handleAddAuditLog({
      actor: currentUser.fullName,
      role: currentRole,
      action: 'AI_DISPATCH_ALERT',
      entityType: 'BLOOD_REQUEST',
      details: `Dispatched perimeter emergency alert to ${candidateName}.`,
      ipAddress: '192.168.1.5',
      status: 'VERIFIED',
    });
    addToast('Alert Dispatched', `Notification dispatched to ${candidateName}!`, 'success');
  }, [currentUser, currentRole, handleAddAuditLog, addToast]);

  const activeSOSCount = bloodRequests.filter(r => r.urgency === 'CRITICAL_EMERGENCY' && r.status !== 'Fulfilled').length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Collapsible Responsive Sidebar */}
      {activePage !== 'landing' && (
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          currentRole={currentRole}
          emergencyCount={activeSOSCount}
          unreadNotifsCount={unreadNotifsCount}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        {activePage !== 'landing' && (
          <TopNavbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentRole={currentRole}
            setCurrentRole={(role) => {
              setCurrentRole(role);
              addToast('Role Switched', `Logged in with ${role} permissions.`, 'info');
            }}
            currentUser={currentUser}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            notifications={notifications}
            onMarkNotificationRead={(id) => {
              setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }}
            onSearch={(query) => {
              if (query.trim().length > 2) {
                setActivePage('blood-requests');
              }
            }}
            onNavigate={(page) => setActivePage(page)}
            onSignOut={handleSignOut}
          />
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          
          {/* Dashboard View */}
          {activePage === 'dashboard' && (
            <UnifiedRoleDashboard
              currentRole={currentRole}
              donors={donors}
              bloodRequests={bloodRequests}
              inventory={inventory}
              organIntents={organIntents}
              verifications={verifications}
              onOpenSOSModal={() => setIsSOSModalOpen(true)}
              onNavigate={(page) => setActivePage(page)}
              onToggleAvailability={handleToggleDonorAvailability}
            />
          )}

          {/* Blood Requests View */}
          {activePage === 'blood-requests' && (
            <BloodRequestManagement
              requests={bloodRequests}
              onCreateRequest={handleCreateBloodRequest}
              onUpdateStatus={handleUpdateBloodRequestStatus}
              currentRole={currentRole}
              onOpenSOSModal={() => setIsSOSModalOpen(true)}
            />
          )}

          {/* Donor Directory View */}
          {activePage === 'donor-directory' && (
            <DonorDirectory
              donors={donors}
              currentRole={currentRole}
              onRequestDonation={(donor) => {
                handleCreateBloodRequest({
                  patientName: 'Clinical Candidate',
                  bloodGroup: donor.bloodGroup,
                  clinicalDiagnosis: 'Directed donor match requisition',
                  unitsRequired: 1,
                  urgency: 'HIGH',
                });
              }}
            />
          )}

          {/* Blood Bank Inventory View */}
          {activePage === 'blood-inventory' && (
            <BloodBankInventoryView
              inventory={inventory}
              currentRole={currentRole}
              onRestock={handleRestockInventory}
              onReserveUnits={handleReserveUnits}
              onDispatchUnits={handleDispatchUnits}
            />
          )}

          {/* Organ Coordination & Transplant Registry */}
          {(activePage === 'organ-donation' || activePage === 'organ-requests') && (
            <OrganWorkflowManagement
              organIntents={organIntents}
              organRequests={organRequests}
              currentRole={currentRole}
              onUpdateIntentStatus={handleUpdateOrganIntentStatus}
              onAddIntent={handleAddOrganIntent}
              onRequestStatusChange={(id, status) => {
                setOrganRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
                addToast('Transplant Stage Updated', `Request #${id} status: ${status}`, 'info');
              }}
            />
          )}

          {/* Emergency SOS Center View */}
          {activePage === 'emergency' && (
            <EmergencyAlerts
              requests={emergencyAlerts}
              onCreateEmergency={handleCreateEmergencySOS}
              onFulfillEmergency={(id) => {
                setEmergencyAlerts(prev => prev.map(r => r.id === id ? { ...r, status: 'Fulfilled' } : r));
                addToast('SOS Resolved', `Emergency #${id} marked Fulfilled!`, 'success');
              }}
            />
          )}

          {/* AI Matching & GPS View */}
          {activePage === 'ai-matching' && (
            <AiMatchingGps
              donors={donors}
              inventory={inventory}
              onDispatchAlert={handleDispatchAiCandidate}
            />
          )}

          {/* Reports & Analytics View */}
          {activePage === 'analytics' && (
            <AnalyticsReportsView
              bloodRequests={bloodRequests}
              inventory={inventory}
              donors={donors}
              organIntents={organIntents}
            />
          )}

          {/* Audit Ledger & Verification View */}
          {activePage === 'audit-log' && (
            <AuditAndVerificationView
              auditLogs={auditLogs}
              verifications={verifications}
              currentRole={currentRole}
              onApproveVerification={handleApproveVerification}
              onRejectVerification={handleRejectVerification}
            />
          )}

          {/* Notification Center View */}
          {activePage === 'notifications' && (
            <NotificationCenterView
              notifications={notifications}
              onMarkAsRead={(id) => {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
              }}
              onMarkAllAsRead={() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                addToast('Notifications Cleared', 'All marked as read.', 'info');
              }}
              onClearAll={() => {
                setNotifications([]);
                addToast('Notifications Cleared', 'All notifications removed.', 'info');
              }}
              onSendSimulatedAlert={(title, message, type) => {
                const newNotif: AppNotification = {
                  id: `sim-notif-${Date.now()}`,
                  recipientUserId: currentUser.id,
                  title,
                  message,
                  type,
                  isRead: false,
                  createdAt: 'Just now',
                  deliveryStatus: 'SIMULATED',
                  channel: 'IN_APP',
                };
                setNotifications(prev => [newNotif, ...prev]);
                addToast(title, message, type === 'EMERGENCY_ALERT' ? 'alert' : 'info');
              }}
            />
          )}

          {/* Profile & Consent Governance View */}
          {activePage === 'profile-consent' && (
            <ProfileAndConsentView
              donorProfile={donors[0]}
              currentRole={currentRole}
              onUpdateProfile={(updated) => {
                setDonors(prev => prev.map((d, i) => i === 0 ? { ...d, ...updated } : d));
                addToast('Profile Saved', 'Consent & privacy settings updated.', 'success');
              }}
              onWithdrawConsent={() => {
                setDonors(prev => prev.map((d, i) => i === 0 ? { ...d, isAvailable: false, isMatchingPaused: true } : d));
                addToast('Consent Withdrawn', 'Profile deactivated from active matching grid.', 'info');
              }}
            />
          )}

          {/* Public Landing Page View */}
          {activePage === 'landing' && (
            <PublicLandingPage
              onSelectRoleLogin={handleSelectRoleLogin}
              onSelectRoleRegister={handleSelectRoleRegister}
              onOpenSOSModal={() => setIsSOSModalOpen(true)}
              onExploreClick={() => setActivePage('dashboard')}
              onHowItWorksClick={() => setActivePage('how-it-works')}
            />
          )}

          {/* How LifeLink Works View */}
          {activePage === 'how-it-works' && (
            <HowItWorksView />
          )}

        </main>

        {/* Production Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-600/20">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">LifeLink Central Healthcare Grid</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    v2.5 PRODUCTION STYLE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Digital Blood & Organ Donation Management and Tracking System
                </p>
              </div>
            </div>

            <div className="text-center md:text-left text-[11px] text-slate-500 max-w-xl">
              <p>
                <strong>Statutory Notice:</strong> LifeLink is a healthcare coordination platform. Final clinical compatibility, cross-matching, and organ transplant authorizations must be executed by certified medical personnel and statutory organ allocation authorities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthRole('DONOR');
                  setAuthMode('LOGIN');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Auth Portal</span>
              </button>
              <button
                onClick={() => {
                  setAuthRole('DONOR');
                  setAuthMode('REGISTER');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Volunteer Register</span>
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Global Interactive Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmitSOS={handleCreateEmergencySOS}
        playSirenSound={playSirenSound}
      />

      {/* 4-Step Multi-Step Donor Enrollment Modal */}
      <MultiStepDonorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterDonor={handleRegisterDonor}
      />

      {/* Auth & 1-Click Role Switcher Modal */}
      <AuthModal
        key={`${authRole}-${authMode}-${isAuthModalOpen}`}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authRole}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onOpenMultiStepRegister={() => setIsRegisterModalOpen(true)}
      />

      {/* Real-Time Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start justify-between gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'alert'
                ? 'bg-red-50 border-red-200 text-red-900 shadow-red-500/10'
                : toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-500/10'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'alert' && <Activity className="w-5 h-5 text-red-600 flex-shrink-0 animate-bounce mt-0.5" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'info' && <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />}
              <div>
                <h4 className="text-xs font-bold">{toast.title}</h4>
                <p className="text-[11px] opacity-90 leading-tight mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;
