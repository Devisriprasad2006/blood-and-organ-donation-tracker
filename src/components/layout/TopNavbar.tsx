import { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ShieldAlert, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Check,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import type { UserRole, AppNotification, User } from '../../types';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  onOpenSOSModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
  onSignOut?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  currentRole,
  setCurrentRole,
  currentUser,
  onOpenSOSModal,
  soundEnabled,
  onToggleSound,
  notifications,
  onMarkNotificationRead,
  onSearch,
  onNavigate,
  onSignOut,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'DONOR', label: 'Donor Profile', desc: 'Ananya Deshmukh (O+ Registered Donor)' },
    { role: 'RECIPIENT', label: 'Recipient / Requester', desc: 'Rahul Verma (Patient Family)' },
    { role: 'HOSPITAL', label: 'Hospital Authority', desc: 'Dr. Meera Nambiar (Trauma ICU Head)' },
    { role: 'BLOOD_BANK', label: 'Blood Bank Director', desc: 'City Blood Bank Regional Admin' },
    { role: 'COORDINATOR', label: 'Transplant Coordinator', desc: 'Dr. Suresh Rao (NOTTO Authorized Desk)' },
    { role: 'ADMINISTRATOR', label: 'System Administrator', desc: 'Health Grid Governance Lead' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search donors, blood groups (e.g. O-), requests, or hospitals..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        
        {/* Emergency SOS Button */}
        <button
          onClick={onOpenSOSModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-2xs hover:scale-102"
        >
          <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
          <span className="hidden md:inline">Raise Emergency SOS</span>
          <span className="md:hidden">SOS</span>
        </button>

        {/* Audio Siren Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Emergency Siren Sound Active' : 'Siren Sound Muted'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-teal-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] text-teal-600 font-semibold">{unreadCount} Unread</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No notifications</div>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-teal-50/40' : ''}`}
                      onClick={() => onMarkNotificationRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-xs">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                          {n.deliveryStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    onNavigate('notifications');
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              {currentRole[0]}
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Role</span>
              <span className="text-xs font-semibold text-slate-800 block -mt-0.5">
                {currentRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 block">Switch Role Access</span>
                <span className="text-[10px] text-slate-400">Enforces RBAC views & authorized actions</span>
              </div>

              <div className="divide-y divide-slate-100 py-1">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
                      currentRole === item.role ? 'bg-teal-50/60' : ''
                    }`}
                  >
                    <div>
                      <span className={`font-bold block ${currentRole === item.role ? 'text-teal-800' : 'text-slate-800'}`}>
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block leading-tight">{item.desc}</span>
                    </div>
                    {currentRole === item.role && (
                      <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="text-left hidden xl:block">
            <span className="text-xs font-bold text-slate-800 block leading-tight">{currentUser.fullName}</span>
            <span className="text-[10px] text-slate-400 block">{currentUser.email}</span>
          </div>
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign out and return to Public Landing Page"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-all shadow-2xs hover:scale-102"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}

      </div>

    </header>
  );
};

