import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Droplet, 
  Heart, 
  PhoneCall, 
  Lock, 
  CheckCircle2,
  Eye, 
  SlidersHorizontal
} from 'lucide-react';

import type { DonorProfile, BloodGroup, UserRole } from '../../types';

interface DonorDirectoryProps {
  donors: DonorProfile[];
  currentRole: UserRole;
  onRequestDonation: (donor: DonorProfile) => void;
}

export const DonorDirectory: React.FC<DonorDirectoryProps> = ({
  donors,
  currentRole,
  onRequestDonation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedDonationType, setSelectedDonationType] = useState<string>('ALL');
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(true);
  const [selectedDonorForModal, setSelectedDonorForModal] = useState<DonorProfile | null>(null);

  const bloodGroups: (BloodGroup | 'ALL')[] = ['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // Filter donors according to search, blood group, donation type, availability
  const filteredDonors = donors.filter((d) => {
    const matchesSearch = 
      d.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBloodGroup = selectedBloodGroup === 'ALL' || d.bloodGroup === selectedBloodGroup;
    const matchesDonationType = selectedDonationType === 'ALL' || d.donationType === selectedDonationType || d.donationType === 'BOTH';
    const matchesAvailability = !availabilityOnly || (d.isAvailable && !d.isMatchingPaused);

    return matchesSearch && matchesBloodGroup && matchesDonationType && matchesAvailability;
  });

  const isHospitalOrAdmin = currentRole === 'HOSPITAL' || currentRole === 'ADMINISTRATOR' || currentRole === 'BLOOD_BANK';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Volunteer Network</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Donor Directory & Discovery</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Discover verified blood and organ donors with privacy preservation. Direct phone coordinates are masked to protect personal data in compliance with healthcare data protection principles.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Privacy Active:</strong> {isHospitalOrAdmin ? 'Authorized Hospital View' : 'Public Anonymized View'}
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by donor name, city, or blood group..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === 'ALL' ? 'All Blood Groups' : `Blood Group ${bg}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDonationType}
              onChange={(e) => setSelectedDonationType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="ALL">All Donation Types</option>
              <option value="BLOOD_ONLY">Blood Donors</option>
              <option value="ORGAN_ONLY">Organ Pledges</option>
              <option value="BOTH">Blood & Organ Pledged</option>
            </select>
          </div>
        </div>

        {/* Second Filter Line */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => setAvailabilityOnly(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span>Show Only Ready & Available Donors</span>
          </label>

          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredDonors.length}</strong> registered donors
          </span>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDonors.map((donor) => {
          const isAvailable = donor.isAvailable && !donor.isMatchingPaused;
          const displayPhone = isHospitalOrAdmin
            ? donor.user.phone
            : `${donor.user.phone.slice(0, 6)} •••• ${donor.user.phone.slice(-2)}`;

          return (
            <div
              key={donor.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 transition-all p-5 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Top Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-800 text-base">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {donor.privacySetting === 'ANONYMOUS_TO_PUBLIC' && !isHospitalOrAdmin
                            ? `${donor.user.fullName.split(' ')[0]} (Volunteer)`
                            : donor.user.fullName}
                        </h3>
                        {donor.user.isVerified && (
                          <span title="Identity Verified">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                          </span>
                        )}

                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{donor.user.city}, {donor.user.region}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isAvailable ? 'Ready' : 'Cooldown'}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {donor.donationType !== 'ORGAN_ONLY' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> Blood Donor
                    </span>
                  )}
                  {donor.donationType !== 'BLOOD_ONLY' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Organ Pledged
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                    Age {donor.age} • {donor.weightKg} kg
                  </span>
                </div>

                {/* Metadata list */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Donor Card:</span>
                    <span className="font-mono font-medium text-slate-700">{donor.donorCardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Donations:</span>
                    <span className="font-semibold text-teal-700">{donor.totalDonationsCount} donations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Donated:</span>
                    <span className="text-slate-700">{donor.lastDonationDate || 'First time donor'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-mono text-slate-700 flex items-center gap-1">
                      {isHospitalOrAdmin ? (
                        <PhoneCall className="w-3 h-3 text-teal-600" />
                      ) : (
                        <Lock className="w-3 h-3 text-amber-600" />
                      )}
                      {displayPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedDonorForModal(donor)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Details</span>
                </button>

                <button
                  disabled={!isAvailable}
                  onClick={() => onRequestDonation(donor)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    isAvailable
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Request Donor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDonors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching donors found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, blood group filter, or toggle the ready availability filter.
          </p>
        </div>
      )}

      {/* Detailed Donor Modal */}
      {selectedDonorForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-lg">
                  {selectedDonorForModal.bloodGroup}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {selectedDonorForModal.user.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedDonorForModal.user.city}, {selectedDonorForModal.user.region}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDonorForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Digital Donor Card:</span>
                <span className="font-mono font-semibold">{selectedDonorForModal.donorCardNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Donation Registration:</span>
                <span className="font-semibold text-teal-700">{selectedDonorForModal.donationType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Age & Body Weight:</span>
                <span>{selectedDonorForModal.age} years • {selectedDonorForModal.weightKg} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Self-Reported Health Clear:</span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Self-Declaration Validated
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Location Coordinate Sharing:</span>
                <span>{selectedDonorForModal.locationPermissionGranted ? 'Approximate GPS Authorized' : 'City-Level Only'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Consent Withdrawal:</span>
                <span className="text-teal-700 font-medium">Guaranteed at any time by user</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2 mb-5">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Healthcare Privacy Notice:</strong> This profile reflects voluntary donor self-declarations. Clinical compatibility, cross-matching, and transplant clearance must be executed at authorized medical facilities.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDonorForModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onRequestDonation(selectedDonorForModal);
                  setSelectedDonorForModal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
              >
                Initiate Donation Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
