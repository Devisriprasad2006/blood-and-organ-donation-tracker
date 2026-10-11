import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Building2, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

import type { 
  OrganDonationIntent, 
  OrganRequest, 
  OrganWorkflowStatus, 
  OrganType, 
  BloodGroup, 
  UserRole 
} from '../../types';

interface OrganWorkflowManagementProps {
  organIntents: OrganDonationIntent[];
  organRequests: OrganRequest[];
  currentRole: UserRole;
  onUpdateIntentStatus: (intentId: string, status: OrganWorkflowStatus, note: string) => void;
  onAddIntent: (newIntent: Partial<OrganDonationIntent>) => void;
  onRequestStatusChange: (requestId: string, status: OrganWorkflowStatus) => void;
}

export const OrganWorkflowManagement: React.FC<OrganWorkflowManagementProps> = ({
  organIntents,
  organRequests,
  currentRole,
  onUpdateIntentStatus,
  onAddIntent,
  onRequestStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'INTENTS' | 'REQUESTS'>('INTENTS');
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedIntentForDetail, setSelectedIntentForDetail] = useState<OrganDonationIntent | null>(null);

  // New Pledge Form State
  const [donorFullName, setDonorFullName] = useState('Ananya Deshmukh');
  const [donorAge, setDonorAge] = useState(24);
  const [donorBloodGroup, setDonorBloodGroup] = useState<BloodGroup>('O+');
  const [donorCity, setDonorCity] = useState('Chennai');
  const [selectedOrgans, setSelectedOrgans] = useState<OrganType[]>(['Kidney', 'Cornea']);
  const [nokConsentConfirmed, setNokConsentConfirmed] = useState(true);
  const [legalDeclarationSigned, setLegalDeclarationSigned] = useState(true);

  const availableOrgans: OrganType[] = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea'];
  const bloodGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const isCoordinatorOrAdmin = currentRole === 'HOSPITAL' || currentRole === 'ADMINISTRATOR';


  const toggleOrgan = (organ: OrganType) => {
    setSelectedOrgans((prev) => 
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrgans.length === 0 || !legalDeclarationSigned) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onAddIntent({
      donorName: donorFullName,
      donorAge: Number(donorAge),
      donorBloodGroup,
      donorCity,
      organsIntended: selectedOrgans,
      status: 'Registration Submitted',
      consentFormSigned: true,
      nokConsentRecorded: nokConsentConfirmed,
      primaryHospitalName: 'Government General Hospital Transplant Desk',
      transplantCoordinator: 'State Organ Registry Coordinator',
      submittedAt: new Date().toISOString(),
      notes: 'Initial expression of voluntary anatomical donation intent submitted.',
      timeline: [
        {
          status: 'Registration Submitted',
          timestamp: new Date().toISOString().slice(0, 10),
          note: 'Expression of intent received with digital consent acknowledgement.',
          actor: 'Donor',
        }
      ]
    });

    setIsPledgeModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Strict Healthcare & Legal Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Dedicated Organ Donation Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Organ Intent & Transplant Tracking</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Ethical, multi-checkpoint registry separating organ expression of intent from blood matching. All actions follow national transplant authority guidelines with explicit verification gates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPledgeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pledge Organ Donation</span>
            </button>
          </div>
        </div>

        {/* Regulatory Alert */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800">Transplantation Regulatory Compliance Notice</h4>
            <p className="text-slate-500 leading-relaxed">
              In accordance with national anatomical gift and organ donation regulations (THOA Framework & NOTTO protocols), LifeLink serves exclusively as a digital coordination and workflow tracking platform. This system <strong>does not autonomously approve matches, allocate organs, or override clinical assessments</strong>. Final clinical matching, cross-matching, HLA compatibility, and allocation decisions are made solely by certified transplant surgeons and statutory organ sharing organizations.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('INTENTS')}
            className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'INTENTS'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Donation Intent Pledges ({organIntents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'REQUESTS'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Transplant Waitlist Registry ({organRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Donation Intent Pledges */}
      {activeTab === 'INTENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {organIntents.map((intent) => {
            const isVerified = intent.status === 'Verified' || intent.status === 'Approved by Authorized Authority';

            return (
              <div
                key={intent.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        {intent.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">
                        {intent.donorName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Age {intent.donorAge} • Blood Group <strong className="text-teal-700">{intent.donorBloodGroup}</strong> • {intent.donorCity}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {intent.status}
                    </span>
                  </div>

                  {/* Pledged Organs Tags */}
                  <div className="space-y-1.5 my-3">
                    <span className="text-[11px] font-medium text-slate-400">Pledged Organs & Tissues:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {intent.organsIntended.map((organ) => (
                        <span
                          key={organ}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {organ}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coordinator & Hospital */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1 my-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Facility:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{intent.primaryHospitalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinator:</span>
                      <span className="text-slate-700 truncate max-w-[180px]">{intent.transplantCoordinator || 'Pending Assignment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next-of-Kin Consent:</span>
                      <span className={intent.nokConsentRecorded ? 'text-emerald-700 font-semibold' : 'text-amber-600'}>
                        {intent.nokConsentRecorded ? 'Recorded & Confirmed' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedIntentForDetail(intent)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 text-center transition-colors"
                  >
                    View Audit Trail
                  </button>

                  {isCoordinatorOrAdmin && intent.status !== 'Approved by Authorized Authority' && (
                    <button
                      onClick={() => onUpdateIntentStatus(
                        intent.id, 
                        intent.status === 'Registration Submitted' ? 'Awaiting Verification' : 'Verified',
                        'Status transitioned by authorized transplant desk'
                      )}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold text-center transition-all shadow-xs"
                    >
                      Advance Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Transplant Waitlist Registry */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Official Transplant Recipient Registry</span>
            <span className="text-xs text-slate-500 font-mono">Synced with State Organ Grid</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Recipient & Registration ID</th>
                  <th className="px-5 py-3.5">Organ Required</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5">Hospital & Surgeon</th>
                  <th className="px-5 py-3.5">Clinical Urgency</th>
                  <th className="px-5 py-3.5">Workflow Status</th>
                  {isCoordinatorOrAdmin && <th className="px-5 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{req.recipientName}</span>
                        <span className="text-[11px] font-mono text-slate-400">{req.waitingListRegistrationNumber || req.id}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {req.organNeeded}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800">
                      {req.bloodGroup}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-slate-800 block">{req.hospitalName}</span>
                        <span className="text-[11px] text-slate-400">{req.attendingSurgeon}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        req.urgency === 'CRITICAL_EMERGENCY'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.urgency}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {req.status}
                      </span>
                    </td>

                    {isCoordinatorOrAdmin && (
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onRequestStatusChange(req.id, 'Coordination in Progress')}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                        >
                          Update Clinical Stage
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pledge Organ Modal */}
      {isPledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Register Organ Donation Intent</h3>
                  <p className="text-xs text-slate-500">Voluntary pledge under National Anatomical Gift Guidelines</p>
                </div>
              </div>
              <button
                onClick={() => setIsPledgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={donorFullName}
                    onChange={(e) => setDonorFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={donorBloodGroup}
                    onChange={(e) => setDonorBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (18+)</label>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    value={donorAge}
                    onChange={(e) => setDonorAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={donorCity}
                    onChange={(e) => setDonorCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Organs & Tissues You Wish to Pledge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableOrgans.map((organ) => {
                    const isSelected = selectedOrgans.includes(organ);
                    return (
                      <button
                        type="button"
                        key={organ}
                        onClick={() => toggleOrgan(organ)}
                        className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSelected ? 'fill-white' : 'text-slate-400'}`} />
                        <span>{organ}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nokConsentConfirmed}
                    onChange={(e) => setNokConsentConfirmed(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                  />
                  <span>
                    I have discussed my donation wish with my family / next-of-kin.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={legalDeclarationSigned}
                    onChange={(e) => setLegalDeclarationSigned(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                  />
                  <span>
                    I understand that this is a voluntary expression of intent and final medical clearance is carried out by licensed transplant authorities.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPledgeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedOrgans.length === 0 || !legalDeclarationSigned}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-sm"
                >
                  Confirm & Generate Pledge Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Timeline Modal */}
      {selectedIntentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Organ Pledge Lifecycle History</h3>
                <p className="text-xs text-slate-500">Record #{selectedIntentForDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedIntentForDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">Donor: {selectedIntentForDetail.donorName}</div>
                <div className="text-slate-500 mt-1">Organs: {selectedIntentForDetail.organsIntended.join(', ')}</div>
                <div className="text-slate-500 mt-0.5">Primary Desk: {selectedIntentForDetail.primaryHospitalName}</div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Verification Timeline:</h4>
                <div className="border-l-2 border-teal-500 pl-4 space-y-3 ml-2">
                  {selectedIntentForDetail.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white" />
                      <div className="text-xs font-bold text-slate-800">{step.status}</div>
                      <div className="text-[11px] text-slate-500">{step.note}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{step.timestamp} • By {step.actor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIntentForDetail(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
