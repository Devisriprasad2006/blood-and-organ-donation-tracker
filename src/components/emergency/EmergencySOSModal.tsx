import { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Radio, 
  Volume2, 
  VolumeX, 
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BloodGroup, OrganType, RequestUrgency, BloodComponentType, EmergencyRequest } from '../../types';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSOS: (req: Partial<EmergencyRequest>) => void;
  playSirenSound: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onSubmitSOS,
  playSirenSound,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(32);
  const [requestType, setRequestType] = useState<'Blood' | 'Organ'>('Blood');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [bloodComponent, setBloodComponent] = useState<BloodComponentType>('Packed RBC');
  const [organType, setOrganType] = useState<OrganType>('Heart');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<RequestUrgency>('CRITICAL SOS');
  const [hospitalName, setHospitalName] = useState('Rajiv Gandhi Government General Hospital');
  const [doctorInCharge, setDoctorInCharge] = useState('Dr. Sundaram, Head of Trauma');
  const [contactPhone, setContactPhone] = useState('+91 44 2530 5111');
  const [medicalDiagnosis, setMedicalDiagnosis] = useState('Critical trauma hemorrhage with unstable vitals');
  const [broadcastRadiusKm, setBroadcastRadiusKm] = useState(30);
  const [sirenActive, setSirenActive] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;

    if (sirenActive) {
      playSirenSound();
    }

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#dc2626', '#f87171', '#38bdf8']
    });

    onSubmitSOS({
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
      status: 'Broadcasted',
      medicalDiagnosis,
      broadcastRadiusKm,
      matchedCandidatesCount: requestType === 'Blood' ? 4 : 1,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500 text-white animate-pulse">
                  CRITICAL BROADCAST
                </span>
                <span className="text-xs text-slate-400">LifeLink Regional Emergency Mesh</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">Emergency SOS Network Broadcast</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-red-200 font-medium">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Broadcasts real-time siren alert to all registered donors and hospital blood banks within radius</span>
            </div>
            <button
              type="button"
              onClick={() => setSirenActive(!sirenActive)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              {sirenActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Siren Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Siren Muted</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh S."
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Patient Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Requirement Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as 'Blood' | 'Organ')}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="Blood">Blood Components</option>
                <option value="Organ">Solid Organ (Transplant)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Blood Group *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-mono font-bold"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {requestType === 'Blood' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Component Needed</label>
                <select
                  value={bloodComponent}
                  onChange={(e) => setBloodComponent(e.target.value as BloodComponentType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Packed RBC">Packed RBC</option>
                  <option value="Platelets">Platelets</option>
                  <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                  <option value="Cryoprecipitate">Cryoprecipitate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Units Required</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Solid Organ Required</label>
                <select
                  value={organType}
                  onChange={(e) => setOrganType(e.target.value as OrganType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500 font-semibold"
                >
                  {['Heart', 'Kidney', 'Liver', 'Lung', 'Pancreas', 'Cornea'].map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organ Count</label>
                <input
                  type="number"
                  value={unitsNeeded}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Clinical Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-red-400 font-bold focus:outline-none focus:border-red-500"
              >
                <option value="CRITICAL SOS">CRITICAL SOS (Life-threatening &lt; 2 hrs)</option>
                <option value="URGENT">URGENT (&lt; 6 hrs)</option>
                <option value="HIGH">HIGH (&lt; 24 hrs)</option>
                <option value="ROUTINE">ROUTINE (Scheduled Surgery)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Broadcast Radius (km)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={broadcastRadiusKm}
                  onChange={(e) => setBroadcastRadiusKm(Number(e.target.value))}
                  className="flex-1 accent-red-500"
                />
                <span className="font-mono text-xs font-bold text-red-400 w-14 text-right">
                  {broadcastRadiusKm} km
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Clinical Diagnosis & Urgency Justification *</label>
            <textarea
              rows={2}
              required
              value={medicalDiagnosis}
              onChange={(e) => setMedicalDiagnosis(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hospital Facility</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Doctor In Charge</label>
              <input
                type="text"
                value={doctorInCharge}
                onChange={(e) => setDoctorInCharge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Est. {Math.round(broadcastRadiusKm * 1.8)} donors alerted</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-600/40 transition-all hover:scale-102 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span>Launch Immediate SOS</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
