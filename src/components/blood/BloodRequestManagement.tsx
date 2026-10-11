import { useState } from 'react';
import { 
  Droplet, 
  Plus, 
  Search, 
  AlertCircle, 
  X
} from 'lucide-react';
import type { 
  BloodRequest, 
  BloodGroup, 
  BloodComponentType, 
  RequestUrgency, 
  BloodRequestStatus,
  UserRole 
} from '../../types';

interface BloodRequestManagementProps {
  requests: BloodRequest[];
  onCreateRequest: (req: Partial<BloodRequest>) => void;
  onUpdateStatus: (id: string, newStatus: BloodRequestStatus, note: string) => void;
  currentRole: UserRole;
  onOpenSOSModal: () => void;
}

export const BloodRequestManagement: React.FC<BloodRequestManagementProps> = ({
  requests,
  onCreateRequest,
  onUpdateStatus,
  currentRole,
  onOpenSOSModal,
}) => {
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(35);
  const [hospitalName, setHospitalName] = useState('Rajiv Gandhi Government General Hospital');
  const [hospitalCity, setHospitalCity] = useState('Chennai');
  const [doctorInCharge, setDoctorInCharge] = useState('Dr. Sundaram, Head of Trauma');
  const [contactPhone, setContactPhone] = useState('+91 44 2530 5111');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [componentType, setComponentType] = useState<BloodComponentType>('Packed RBC');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [urgency, setUrgency] = useState<RequestUrgency>('URGENT');
  const [requiredByDate, setRequiredByDate] = useState('2026-10-12T12:00');
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');

  const filteredRequests = requests.filter((r) => {
    const matchSearch = 
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === 'ALL' || r.bloodGroup === filterGroup;
    const matchUrgency = filterUrgency === 'ALL' || r.urgency === filterUrgency;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchSearch && matchGroup && matchUrgency && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !clinicalDiagnosis) return;

    onCreateRequest({
      patientName,
      patientAge,
      hospitalName,
      hospitalCity,
      hospitalLatitude: 13.0827,
      hospitalLongitude: 80.2707,
      doctorInCharge,
      contactPhone,
      bloodGroup,
      componentType,
      unitsRequired,
      unitsAllocated: 0,
      urgency,
      status: 'Submitted',
      requiredByDate,
      clinicalDiagnosis,
      matchedDonorsCount: 3,
    });

    setShowCreateModal(false);
    setPatientName('');
    setClinicalDiagnosis('');
  };

  const getUrgencyBadge = (u: RequestUrgency) => {
    switch (u) {
      case 'CRITICAL_EMERGENCY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">CRITICAL</span>;
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">ROUTINE</span>;
    }
  };

  const getStatusBadge = (s: BloodRequestStatus) => {
    switch (s) {
      case 'Fulfilled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Fulfilled</span>;
      case 'Matching':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Matching</span>;
      case 'Donor Contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Donor Contacted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-teal-600 fill-teal-600" />
            <h1 className="text-xl font-extrabold text-slate-900">Blood Request Lifecycle & Tracking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end request management from clinical triage to donor dispatch and blood bank fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create Blood Request</span>
          </button>

          <button
            onClick={onOpenSOSModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs shadow-xs transition-all"
          >
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>SOS Broadcast</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, hospital, or request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL_EMERGENCY">Critical Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High Priority</option>
            <option value="ROUTINE">Routine</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Matching">Matching</option>
            <option value="Donor Contacted">Donor Contacted</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Patient / Hospital</th>
                <th className="py-3 px-4">Blood Requirement</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Allocation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    #{req.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{req.patientName} ({req.patientAge}y)</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{req.hospitalName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {req.bloodGroup}
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {req.unitsRequired} units ({req.componentType})
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {getUrgencyBadge(req.urgency)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(req.unitsAllocated / req.unitsRequired) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {req.unitsAllocated} of {req.unitsRequired} units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Timeline Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Droplet className="w-5 h-5 fill-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request #{selectedRequest.id}</h3>
                  <p className="text-[11px] text-slate-500">Clinical Lifecycle & Verification Timeline</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Patient</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRequest.patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-teal-700 text-sm font-mono">{selectedRequest.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Units Needed</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRequest.unitsRequired} Units</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Clinical Diagnosis & Notes</h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedRequest.clinicalDiagnosis}
                </p>
              </div>

              {/* Status Transition Control (Authorized Roles) */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
                <span className="font-bold text-teal-900 block">Update Request Lifecycle (Authorized Transition)</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['Under Review', 'Matching', 'Donor Contacted', 'Fulfilled', 'Cancelled'] as BloodRequestStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(selectedRequest.id, st, `Status updated to ${st} by ${currentRole}`);
                        setSelectedRequest({
                          ...selectedRequest,
                          status: st,
                          timeline: [
                            ...selectedRequest.timeline,
                            { status: st, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `Transitioned to ${st}`, actor: currentRole }
                          ]
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedRequest.status === st
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audited Action Timeline</h4>
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedRequest.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-8 text-xs space-y-0.5">
                      <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">{item.actor}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">New Clinical Blood Requirement</h3>
                  <p className="text-[11px] text-slate-500">Initiate verified blood matching ticket</p>
                </div>
              </div>

              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh K."
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-teal-600"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Component</label>
                  <select
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value as BloodComponentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Packed RBC">Packed RBC</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsRequired}
                    onChange={(e) => setUnitsRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-teal-600"
                  >
                    <option value="CRITICAL_EMERGENCY">Critical Emergency (&lt; 2 hrs)</option>
                    <option value="URGENT">Urgent (&lt; 8 hrs)</option>
                    <option value="HIGH">High Priority (&lt; 24 hrs)</option>
                    <option value="ROUTINE">Routine Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital / Collection Facility</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility City</label>
                  <input
                    type="text"
                    value={hospitalCity}
                    onChange={(e) => setHospitalCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required By Date</label>
                  <input
                    type="datetime-local"
                    value={requiredByDate}
                    onChange={(e) => setRequiredByDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor In Charge</label>
                  <input
                    type="text"
                    value={doctorInCharge}
                    onChange={(e) => setDoctorInCharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis & Justification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Acute trauma bleeding / scheduled major vascular resection"
                  value={clinicalDiagnosis}
                  onChange={(e) => setClinicalDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-xs"
                >
                  Submit Request
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
