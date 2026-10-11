import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Droplet, 
  Info, 
  Clock, 
  Sparkles
} from 'lucide-react';
import type { AppNotification } from '../../types';


interface NotificationCenterViewProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendSimulatedAlert: (title: string, message: string, type: AppNotification['type']) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSendSimulatedAlert,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simTitle, setSimTitle] = useState('Critical Blood Group SOS Alert');
  const [simMessage, setSimMessage] = useState('Immediate requirement for 2 units of O- Negative blood at Rajiv Gandhi Hospital OT-4.');
  const [simType, setSimType] = useState<AppNotification['type']>('EMERGENCY_ALERT');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendSimulatedAlert(simTitle, simMessage, simType);
    setShowSimulateModal(false);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'EMERGENCY_ALERT':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'INVENTORY_WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'REQUEST_UPDATE':
        return <Droplet className="w-5 h-5 text-teal-600" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              <span>Real-Time Alert Dispatcher</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Track emergency broadcasts, low-inventory alerts, and donor status updates. Simulated channels ensure zero unverified external SMS/email costs during development and demonstrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Alert Dispatch</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Filter by:</span>
          {['ALL', 'UNREAD', 'EMERGENCY_ALERT', 'INVENTORY_WARNING', 'REQUEST_UPDATE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === filter
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'ALL' && `All (${notifications.length})`}
              {filter === 'UNREAD' && `Unread (${unreadCount})`}
              {filter === 'EMERGENCY_ALERT' && 'Emergency Alerts'}
              {filter === 'INVENTORY_WARNING' && 'Inventory Warnings'}
              {filter === 'REQUEST_UPDATE' && 'Request Updates'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex items-start justify-between gap-4 ${
              !item.isRead ? 'border-teal-300 bg-teal-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    item.deliveryStatus === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {item.channel} • {item.deliveryStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{item.message}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.createdAt}
                  </span>
                  <span>•</span>
                  <span>Delivery Verified</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!item.isRead && (
                <button
                  onClick={() => onMarkAsRead(item.id)}
                  title="Mark as read"
                  className="p-2 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No notifications to display</h3>
            <p className="text-xs text-slate-500 mt-1">You are all caught up on system broadcasts and updates.</p>
          </div>
        )}
      </div>

      {/* Simulate Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Simulate Dispatch Broadcast</h3>
                <p className="text-xs text-slate-500">Inject simulated notification into the real-time event pipeline</p>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Category</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value as AppNotification['type'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="EMERGENCY_ALERT">Emergency Alert (Critical SOS)</option>
                  <option value="INVENTORY_WARNING">Inventory Warning (Buffer Depleted)</option>
                  <option value="REQUEST_UPDATE">Request Lifecycle Update</option>
                  <option value="GOVERNANCE_AUDIT">System Governance Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm"
                >
                  Dispatch to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
