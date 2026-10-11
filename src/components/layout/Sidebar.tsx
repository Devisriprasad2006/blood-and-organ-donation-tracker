import React from 'react';
import { 
  Heart, 
  Droplet, 
  Users, 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Bell, 
  BarChart3, 
  ShieldCheck, 
  FileCheck2, 
  Home, 
  HelpCircle,
  X,
  Radio,
  FileSpreadsheet,
  LogOut,
  Building2,
  UserCheck
} from 'lucide-react';
import type { UserRole } from '../../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentRole: UserRole;
  emergencyCount: number;
  unreadNotifsCount: number;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
  currentRole,
  emergencyCount,
  unreadNotifsCount,
  onSignOut,
}) => {

  // Role-Separated Navigation Items
  const getRoleNavSections = (role: UserRole) => {
    switch (role) {
      case 'DONOR':
        return [
          {
            title: 'Donor Hub',
            items: [
              { id: 'dashboard', label: 'My Donor Dashboard', icon: Activity },
              { id: 'emergency', label: 'Emergency Blood Appeals', icon: ShieldAlert, badge: emergencyCount, badgeColor: 'bg-red-500' },
              { id: 'ai-matching', label: 'Matching & Eligibility', icon: MapPin },
              { id: 'organ-donation', label: 'Pledge Anatomical Gift', icon: Heart },
            ],
          },
          {
            title: 'Account & Settings',
            items: [
              { id: 'notifications', label: 'Alerts & Messages', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'profile-consent', label: 'Statutory Consent & Privacy', icon: FileCheck2 },
              { id: 'how-it-works', label: 'How LifeLink Works', icon: HelpCircle },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];

      case 'RECIPIENT':
        return [
          {
            title: 'Patient & Requester',
            items: [
              { id: 'dashboard', label: 'Recipient Dashboard', icon: Activity },
              { id: 'blood-requests', label: 'My Blood Requisitions', icon: Droplet },
              { id: 'emergency', label: 'Emergency Trauma SOS', icon: ShieldAlert, badge: emergencyCount, badgeColor: 'bg-red-500' },
            ],
          },
          {
            title: 'System & Tracking',
            items: [
              { id: 'notifications', label: 'Requisition Updates', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'how-it-works', label: 'How LifeLink Works', icon: HelpCircle },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];

      case 'HOSPITAL':
        return [
          {
            title: 'Clinical Operations',
            items: [
              { id: 'dashboard', label: 'Hospital Trauma Desk', icon: Building2 },
              { id: 'blood-requests', label: 'Blood Requisitions', icon: Droplet },
              { id: 'emergency', label: 'Trauma SOS Dispatcher', icon: ShieldAlert, badge: emergencyCount, badgeColor: 'bg-red-500' },
              { id: 'ai-matching', label: 'Clinical Donor Crossmatch', icon: MapPin },
            ],
          },
          {
            title: 'Supplies & Referrals',
            items: [
              { id: 'blood-inventory', label: 'Blood Bank Stock Lookup', icon: FileSpreadsheet },
              { id: 'organ-requests', label: 'Transplant Referrals', icon: Radio },
              { id: 'analytics', label: 'Trauma Unit Analytics', icon: BarChart3 },
              { id: 'notifications', label: 'Hospital Notifications', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];

      case 'BLOOD_BANK':
        return [
          {
            title: 'Cold Chain Management',
            items: [
              { id: 'dashboard', label: 'Blood Bank Hub', icon: Heart },
              { id: 'blood-inventory', label: 'Inventory Racks & Batches', icon: FileSpreadsheet },
              { id: 'blood-requests', label: 'Hospital Requisitions', icon: Droplet },
              { id: 'donor-directory', label: 'Registered Donor Network', icon: Users },
            ],
          },
          {
            title: 'Quality & Reports',
            items: [
              { id: 'analytics', label: 'Stock Levels & Analytics', icon: BarChart3 },
              { id: 'notifications', label: 'Low Stock & Expiry Alerts', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];

      case 'COORDINATOR':
        return [
          {
            title: 'Transplant Coordination',
            items: [
              { id: 'dashboard', label: 'Coordinator Hub', icon: UserCheck },
              { id: 'organ-donation', label: 'Statutory Anatomical Pledges', icon: Heart },
              { id: 'organ-requests', label: 'Transplant Waitlist Registry', icon: Radio },
            ],
          },
          {
            title: 'Governance',
            items: [
              { id: 'notifications', label: 'Case Alerts & Approvals', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];

      case 'ADMINISTRATOR':
      default:
        return [
          {
            title: 'Health Grid Governance',
            items: [
              { id: 'dashboard', label: 'Executive Admin Hub', icon: ShieldCheck },
              { id: 'audit-log', label: 'Cryptographic Audit Ledger', icon: ShieldCheck },
              { id: 'analytics', label: 'System Analytics & KPIs', icon: BarChart3 },
            ],
          },
          {
            title: 'Grid Supervisions',
            items: [
              { id: 'blood-inventory', label: 'Regional Blood Inventory', icon: FileSpreadsheet },
              { id: 'blood-requests', label: 'Regional Requisitions', icon: Droplet },
              { id: 'donor-directory', label: 'Master Donor Directory', icon: Users },
              { id: 'notifications', label: 'System Notifications', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-teal-600' },
              { id: 'landing', label: 'Public Portal', icon: Home },
            ],
          },
        ];
    }
  };

  const navSections = getRoleNavSections(currentRole);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div 
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight block">LifeLink Grid</span>
              <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider block">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {section.title}
              </span>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-slate-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info: Role badge & Sign Out */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 space-y-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logged In Persona</span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out to Landing</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
