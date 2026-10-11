import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BloodGroup, DonorProfile } from '../../types';

interface MultiStepDonorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDonor: (donor: DonorProfile) => void;
}

export const MultiStepDonorRegistrationModal: React.FC<MultiStepDonorRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterDonor,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1998-05-14');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Chennai');
  const [region, setRegion] = useState('Tamil Nadu');

  // Step 2: Donation Preferences
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [donationType, setDonationType] = useState<'BLOOD_ONLY' | 'ORGAN_ONLY' | 'BOTH'>('BOTH');
  const [preferredContact, setPreferredContact] = useState<'IN_APP' | 'PHONE' | 'EMAIL'>('IN_APP');

  // Step 3: Health & Consent
  const [weightKg, setWeightKg] = useState(65);
  const [medicalDeclaration, setMedicalDeclaration] = useState(false);
  const [clinicalEligibilityConsent, setClinicalEligibilityConsent] = useState(false);

  // Step 4: Location & Privacy
  const [locationPermission, setLocationPermission] = useState(true);
  const [privacySetting, setPrivacySetting] = useState<'ANONYMOUS_TO_PUBLIC' | 'AUTHORIZED_HOSPITALS_ONLY'>('ANONYMOUS_TO_PUBLIC');

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !medicalDeclaration || !clinicalEligibilityConsent) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#0d9488', '#10b981', '#14b8a6']
    });

    const newDonor: DonorProfile = {
      id: `dp-${Date.now()}`,
      userId: `usr-reg-${Date.now()}`,
      user: {
        id: `usr-reg-${Date.now()}`,
        fullName,
        email,
        phone,
        role: 'DONOR',
        city,
        region,
        approxLatitude: 13.0827,
        approxLongitude: 80.2707,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      bloodGroup,
      donationType,
      isAvailable: true,
      isMatchingPaused: false,
      preferredContact,
      totalDonationsCount: 0,
      donorCardNumber: `LIFE-DON-${Date.now().toString().slice(-4)}`,
      age: 26,
      weightKg,
      medicalSelfDeclarationAccepted: true,
      consentWithdrawalAllowed: true,
      locationPermissionGranted: locationPermission,
      privacySetting,
    };

    onRegisterDonor(newDonor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Donor Registration</h2>
              <p className="text-[11px] text-slate-500 font-medium">Step {step} of 4: Multi-Step Enrollment</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 w-full">
          <div 
            className="h-full bg-teal-600 transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
                <p className="text-slate-500">Enter your name and contact details for verification.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Deshmukh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Region *</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Donation Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Donation Preferences</h3>
                <p className="text-slate-500">Specify your blood group and willingness to donate.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setBloodGroup(bg)}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                        bloodGroup === bg 
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donation Registration Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BLOOD_ONLY', label: 'Blood Only' },
                    { id: 'ORGAN_ONLY', label: 'Organ Pledge' },
                    { id: 'BOTH', label: 'Blood & Organ' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setDonationType(t.id as 'BLOOD_ONLY' | 'ORGAN_ONLY' | 'BOTH')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        donationType === t.id 
                          ? 'bg-teal-50 border-teal-600 text-teal-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Contact Method</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as 'IN_APP' | 'PHONE' | 'EMAIL')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                >
                  <option value="IN_APP">In-App Notification (Recommended for Privacy)</option>
                  <option value="PHONE">Direct Phone Call</option>
                  <option value="EMAIL">Email Dispatch</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Health & Consent */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Health Screening & Legal Consent</h3>
                <p className="text-slate-500">Preliminary screening acknowledgment.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approximate Body Weight (Kg)</label>
                <input
                  type="number"
                  min="45"
                  max="150"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standard safe donation guideline is ≥ 50 kg.</span>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medicalDeclaration}
                    onChange={(e) => setMedicalDeclaration(e.target.checked)}
                    className="mt-0.5 accent-teal-600"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I declare that I am in sound physical health, free from infectious blood-borne conditions, and haven't donated blood in the past 90 days.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/50 border border-teal-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalEligibilityConsent}
                    onChange={(e) => setClinicalEligibilityConsent(e.target.checked)}
                    className="mt-0.5 accent-teal-600"
                  />
                  <span className="text-[11px] text-teal-900 leading-snug font-medium">
                    I understand that LifeLink provides preliminary discovery only. Final clinical eligibility, cross-matching, and clearance must be verified by hospital physicians prior to collection.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Location & Privacy */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Location & Privacy Settings</h3>
                <p className="text-slate-500">Control how hospitals and the public view your donor card.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Approximate Geolocation Matching</span>
                  <input
                    type="checkbox"
                    checked={locationPermission}
                    onChange={(e) => setLocationPermission(e.target.checked)}
                    className="accent-teal-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Allows LifeLink to calculate approximate distance from trauma centers without ever exposing your exact home address.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Directory Privacy Mode</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacySetting === 'ANONYMOUS_TO_PUBLIC'}
                      onChange={() => setPrivacySetting('ANONYMOUS_TO_PUBLIC')}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Anonymous to Public (Recommended)</span>
                      <span className="text-[10px] text-slate-500">Only authorized doctors can request contact dispatch; public sees 'Verified Donor'.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacySetting === 'AUTHORIZED_HOSPITALS_ONLY'}
                      onChange={() => setPrivacySetting('AUTHORIZED_HOSPITALS_ONLY')}
                      className="accent-teal-600"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Verified Hospitals Only</span>
                      <span className="text-[10px] text-slate-500">Hidden from general public directory completely.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && (!fullName || !email)}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!medicalDeclaration || !clinicalEligibilityConsent}
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Enrollment</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
