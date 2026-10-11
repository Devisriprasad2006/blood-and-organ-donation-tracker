import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Plus, 
  PhoneCall, 
  Radio, 
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EmergencyRequest, BloodGroup, OrganType, RequestUrgency, BloodComponentType } from '../../types';

interface EmergencyAlertsProps {
  requests: EmergencyRequest[];
  onCreateEmergency: (req: Partial<EmergencyRequest>) => void;
  onFulfillEmergency: (id: string) => void;
}

export const EmergencyAlerts: React.FC<EmergencyAlertsProps> = ({
  requests,
  onCreateEmergency,
  onFulfillEmergency
}) => {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(28);
  const [requestType, setRequestType] = useState<'Blood' | 'Organ'>('Blood');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [bloodComponent, setBloodComponent] = useState<BloodComponentType>('Packed RBC');
  const [organType, setOrganType] = useState<OrganType>('Heart');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<RequestUrgency>('CRITICAL SOS');
  const [hospitalName, setHospitalName] = useState('Rajiv Gandhi Government General Hospital');
  const [doctorInCharge, setDoctorInCharge] = useState('Dr. Sundaram, Trauma Care');
  const [contactPhone, setContactPhone] = useState('+91 44 2530 5111');
  const [medicalDiagnosis, setMedicalDiagnosis] = useState('Emergency polytrauma resuscitation');
  const [broadcastRadiusKm, setBroadcastRadiusKm] = useState(25);

  const [simulatedSirens, setSimulatedSirens] = useState<string[]>([]);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;

    onCreateEmergency({
      patientName,
      patientAge,
      requestType,
      bloodGroup,
      bloodComponent: requestType === 'Blood' ? bloodComponent : undefined,
      organType: requestType === 'Organ' ? organType : undefined,
      unitsNeeded,
      urgency,
      hospitalName,
      hospitalLatitude: 13.0827,
      hospitalLongitude: 80.2707,
      doctorInCharge,
      contactPhone,
      medicalDiagnosis,
      broadcastRadiusKm,
      status: 'Broadcasted',
      createdAt: 'Just now',
      matchedCandidatesCount: 5,
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 }
    });

    setShowBroadcastModal(false);
    setPatientName('');
  };

  const playSirenSimulation = (requestId: string) => {
    setSimulatedSirens((prev) => [...prev, requestId]);
    setTimeout(() => {
      setSimulatedSirens((prev) => prev.filter(id => id !== requestId));
    }, 5000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/70 border border-red-500/30">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-bounce" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Emergency Request & SOS Broadcast Hub</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Slide 6 Emergency Notification Module: Rapid broadcast to matching donors within GPS perimeter to eliminate critical delays.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Emergency SOS</span>
        </button>
      </div>

      {/* Active Broadcasts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            Live Emergency Beacons ({requests.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Multi-Channel Push: SMS & In-App Alerts</span>
        </div>

        <div className="space-y-4">
          {requests.map((req) => {
            const isCritical = req.urgency === 'CRITICAL SOS';
            const isSirenPlaying = simulatedSirens.includes(req.id);
            const isFulfilled = req.status === 'Fulfilled';

            return (
              <div
                key={req.id}
                className={`p-6 rounded-2xl border transition-all relative overflow-hidden bg-slate-900/90 ${
                  isFulfilled
                    ? 'border-slate-800 opacity-60'
                    : isCritical
                    ? 'border-red-500/60 shadow-xl shadow-red-950/30'
                    : 'border-amber-500/40 shadow-lg'
                }`}
              >
                {/* Alert Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono tracking-wider border ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {req.urgency}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">REQ #{req.id} • {req.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playSirenSimulation(req.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSirenPlaying
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSirenPlaying ? 'Siren Active...' : 'Test Siren'}</span>
                    </button>

                    {!isFulfilled && (
                      <button
                        onClick={() => onFulfillEmergency(req.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/30"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient and Hospital Clinical Payload */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  
                  {/* Column 1: Patient & Requirement */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Patient Requirement</span>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 font-black text-xl font-mono flex items-center justify-center">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{req.patientName} (Age {req.patientAge})</h4>
                        <p className="text-xs text-slate-300">
                          {req.requestType === 'Blood' ? `${req.unitsNeeded} Units of ${req.bloodComponent}` : `Organ: ${req.organType}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 italic pt-1">"{req.medicalDiagnosis}"</p>
                  </div>

                  {/* Column 2: Hospital & Physician */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Hospital & Doctor in Charge</span>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      {req.hospitalName}
                    </p>
                    <p className="text-slate-400">Doctor: {req.doctorInCharge}</p>
                    <p className="text-sky-400 font-mono flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5" />
                      Direct Line: {req.contactPhone}
                    </p>
                  </div>

                  {/* Column 3: Dispatch Radius & Live Matching Status */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Broadcast Radius:</span>
                      <span className="font-mono text-white font-bold">{req.broadcastRadiusKm} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Eligible Donors Alerted:</span>
                      <span className="font-mono text-emerald-400 font-bold">{req.matchedCandidatesCount} Donors</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Workflow Status:</span>
                      <span className="font-semibold text-amber-300">{req.status}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast SOS Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Broadcast Emergency SOS to Donor Network</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white text-xs font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand R."
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Patient Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Need Type</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as 'Blood' | 'Organ')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Blood">Blood Units</option>
                    <option value="Organ">Solid Organ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {requestType === 'Blood' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Component</label>
                    <select
                      value={bloodComponent}
                      onChange={(e) => setBloodComponent(e.target.value as BloodComponentType)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Packed RBC">Packed RBC</option>
                      <option value="Platelets">Platelets</option>
                      <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={unitsNeeded}
                      onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organ Required</label>
                  <select
                    value={organType}
                    onChange={(e) => setOrganType(e.target.value as OrganType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  >
                    {['Heart', 'Kidney', 'Liver', 'Lung', 'Pancreas', 'Cornea'].map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Medical Diagnosis / Trauma Summary</label>
                <textarea
                  rows={2}
                  required
                  value={medicalDiagnosis}
                  onChange={(e) => setMedicalDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hospital Facility</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinical Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-bold text-xs"
                  >
                    <option value="CRITICAL SOS">CRITICAL SOS</option>
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="ROUTINE">ROUTINE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Doctor In Charge</label>
                  <input
                    type="text"
                    value={doctorInCharge}
                    onChange={(e) => setDoctorInCharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Radius (Km)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={broadcastRadiusKm}
                    onChange={(e) => setBroadcastRadiusKm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30"
                >
                  Trigger Live SOS Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
