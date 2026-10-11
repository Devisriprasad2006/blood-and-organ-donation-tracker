import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Heart,
  Trash2,
  Save
} from 'lucide-react';
import type { DonorProfile, UserRole } from '../../types';

interface ProfileAndConsentViewProps {
  donorProfile: DonorProfile;
  currentRole?: UserRole;
  onUpdateProfile: (updated: Partial<DonorProfile>) => void;
  onWithdrawConsent: () => void;
}

export const ProfileAndConsentView: React.FC<ProfileAndConsentViewProps> = ({
  donorProfile,
  onUpdateProfile,
  onWithdrawConsent,
}) => {

  const [fullName, setFullName] = useState(donorProfile.user.fullName);
  const [phone, setPhone] = useState(donorProfile.user.phone);
  const [city, setCity] = useState(donorProfile.user.city);
  const [region, setRegion] = useState(donorProfile.user.region);
  const [isAvailable, setIsAvailable] = useState(donorProfile.isAvailable);
  const [isMatchingPaused, setIsMatchingPaused] = useState(donorProfile.isMatchingPaused);
  const [privacySetting, setPrivacySetting] = useState(donorProfile.privacySetting);
  const [preferredContact, setPreferredContact] = useState(donorProfile.preferredContact);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      isAvailable,
      isMatchingPaused,
      privacySetting,
      preferredContact,
      user: {
        ...donorProfile.user,
        fullName,
        phone,
        city,
        region,
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Identity & Consent Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Donor Profile & Privacy Settings</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Control your donation availability, manage approximate coordinate permissions, and exercise statutory healthcare consent rights at any time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              ID: {donorProfile.donorCardNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Donor Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-lg border border-teal-700/50 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <Heart className="w-48 h-48 text-white fill-white" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                  <Droplet className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">LIFELINK</h3>
                  <p className="text-[10px] text-teal-200">Digital Donor Card</p>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-white text-teal-900 font-black text-xl flex items-center justify-center shadow-md">
                {donorProfile.bloodGroup}
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <div>
                <span className="text-[10px] text-teal-300 uppercase tracking-wider block">Donor Name</span>
                <span className="font-bold text-base text-white">{fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-teal-300 uppercase block">Card Number</span>
                  <span className="font-mono text-white">{donorProfile.donorCardNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300 uppercase block">Status</span>
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-700/60 flex items-center justify-between text-[11px] text-teal-200">
                <span>{donorProfile.donationType === 'BOTH' ? 'Blood & Organ Pledged' : 'Blood Donor'}</span>
                <span className="font-mono">{city}, IN</span>
              </div>
            </div>
          </div>

          {/* Availability Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Donation Availability Controls</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Ready for Matching</h4>
                  <p className="text-[11px] text-slate-500">Receive nearby emergency blood alerts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className="text-teal-600 focus:outline-none"
                >
                  {isAvailable ? (
                    <ToggleRight className="w-8 h-8 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Pause Matching Temporarily</h4>
                  <p className="text-[11px] text-slate-500">Halt notifications (e.g. travel or recovery)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMatchingPaused(!isMatchingPaused)}
                  className="text-amber-600 focus:outline-none"
                >
                  {isMatchingPaused ? (
                    <ToggleRight className="w-8 h-8 text-amber-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Contact & Privacy Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Region</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Contact Channel</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as 'IN_APP' | 'PHONE' | 'EMAIL')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="IN_APP">In-App Notification</option>
                  <option value="PHONE">Direct Phone Call</option>
                  <option value="EMAIL">Verified Email</option>
                </select>
              </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Privacy & Visibility Mode</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPrivacySetting('ANONYMOUS_TO_PUBLIC')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    privacySetting === 'ANONYMOUS_TO_PUBLIC'
                      ? 'border-teal-600 bg-teal-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Anonymous to Public</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phone & full identity masked; revealed strictly to authorized hospital staff upon emergency match.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setPrivacySetting('AUTHORIZED_HOSPITALS_ONLY')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    privacySetting === 'AUTHORIZED_HOSPITALS_ONLY'
                      ? 'border-teal-600 bg-teal-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Authorized Hospitals Only</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hidden completely from public directory; visible exclusively to verified hospital desks.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

          {/* Statutory Consent Withdrawal Box */}
          <div className="bg-red-50/60 rounded-2xl border border-red-200 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 text-sm">Statutory Consent Rights</h4>
                <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                  Under healthcare data protection regulations, your participation as a blood or organ donor is 100% voluntary. You maintain the unconditional right to withdraw consent and deactivate your donor profile from matching at any moment.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-red-300 bg-white hover:bg-red-100 text-red-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Withdraw Consent & Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Withdrawal Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Withdraw Donation Consent?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Withdrawing consent will immediately remove your donor profile from active regional discovery grids and pause all incoming matching broadcasts. You can re-enroll at any time in the future.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={() => {
                  onWithdrawConsent();
                  setIsWithdrawModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
