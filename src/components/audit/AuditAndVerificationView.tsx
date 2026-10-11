import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Search, 
  Check, 
  X, 
  Clock, 
  Download
} from 'lucide-react';

import type { AuditRecord, VerificationRequest, UserRole } from '../../types';

interface AuditAndVerificationViewProps {
  auditLogs: AuditRecord[];
  verifications: VerificationRequest[];
  currentRole: UserRole;
  onApproveVerification: (id: string) => void;
  onRejectVerification: (id: string) => void;
}

export const AuditAndVerificationView: React.FC<AuditAndVerificationViewProps> = ({
  auditLogs,
  verifications,
  currentRole,
  onApproveVerification,
  onRejectVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'VERIFICATION'>('AUDIT');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hashSignature.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || log.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const pendingVerifications = verifications.filter(v => v.status === 'PENDING');

  const exportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity Type', 'Details', 'IP Address', 'Hash Signature'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actor}"`,
      l.role,
      l.action,
      l.entityType,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.hashSignature
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeLink_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = currentRole === 'ADMINISTRATOR';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Immutable Regulatory Ledger & Credentialing</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Facility Verification</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Cryptographically signed activity records for clinical accountability, paired with administrator verification checkpoints for healthcare facilities and blood repositories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditCSV}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'AUDIT'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Cryptographic Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'VERIFICATION'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Facility Credential Verification ({pendingVerifications.length} Pending)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit ledger by actor, action type, hash signature, or IP..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="BLOOD_BANK">Blood Bank</option>
                <option value="DONOR">Donor</option>
                <option value="RECIPIENT">Recipient</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Actor & Role</th>
                    <th className="px-5 py-3.5">Action Executed</th>
                    <th className="px-5 py-3.5">Clinical Event Details</th>
                    <th className="px-5 py-3.5">IP Address</th>
                    <th className="px-5 py-3.5">Hash Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{log.actor}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {log.role}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-teal-800 font-bold text-[11px]">
                        {log.action}
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <p className="text-slate-700 text-xs leading-relaxed">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          Entity: {log.entityType}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-500 text-[11px]">
                        {log.ipAddress}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">
                          {log.hashSignature}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facility Verifications */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {verifications.map((item) => {
              const isPending = item.status === 'PENDING';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                          {item.id} • {item.facilityType}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-0.5">{item.name}</h3>
                        <p className="text-xs text-slate-500">{item.address}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5 my-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory License #:</span>
                        <span className="font-mono font-bold text-slate-800">{item.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Official Email:</span>
                        <span className="text-slate-700">{item.contactEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Direct Desk Phone:</span>
                        <span className="text-slate-700 font-mono">{item.contactPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date Submitted:</span>
                        <span className="text-slate-700">{item.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Admin */}
                  {isPending && isAdmin ? (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onRejectVerification(item.id)}
                        className="flex-1 py-2 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject License</span>
                      </button>

                      <button
                        onClick={() => onApproveVerification(item.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Facility</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
                      {isPending ? 'Administrator authorization required to approve credentials' : `Status locked as ${item.status}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
