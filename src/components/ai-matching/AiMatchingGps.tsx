import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Info, 
  Compass
} from 'lucide-react';

import type { 
  BloodGroup, 
  BloodComponentType, 
  RequestUrgency, 
  DonorProfile, 
  BloodInventoryItem, 
  AiDonorMatch 
} from '../../types';
import { rankDonorsIntelligently } from '../../services/aiMatchingEngine';

interface AiMatchingGpsProps {
  donors: DonorProfile[];
  inventory: BloodInventoryItem[];
  onDispatchAlert: (candidateName: string) => void;
}

export const AiMatchingGps: React.FC<AiMatchingGpsProps> = ({
  donors,
  inventory,
  onDispatchAlert,
}) => {
  const [targetBloodGroup, setTargetBloodGroup] = useState<BloodGroup>('O-');
  const [componentType, setComponentType] = useState<BloodComponentType>('Packed RBC');
  const [urgency, setUrgency] = useState<RequestUrgency>('CRITICAL_EMERGENCY');
  const [radiusKm, setRadiusKm] = useState<number>(30);
  const [dispatchedDonors, setDispatchedDonors] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AiDonorMatch | null>(null);

  // Hospital Reference Center (Chennai Metro Trauma Center)
  const hospitalLat = 13.0827;
  const hospitalLng = 80.2707;

  // Run explainable matching engine
  const matches: AiDonorMatch[] = rankDonorsIntelligently({
    targetLatitude: hospitalLat,
    targetLongitude: hospitalLng,
    recipientBloodGroup: targetBloodGroup,
    componentType,
    urgency,
    maxRadiusKm: radiusKm,
    donors,
  });

  // Also query inventory availability for this blood group
  const matchingInventory = inventory.filter(
    (item) => item.bloodGroup === targetBloodGroup && item.unitsAvailable > 0
  );

  const handleDispatch = (match: AiDonorMatch) => {
    setDispatchedDonors((prev) => [...prev, match.donorId]);
    onDispatchAlert(match.donorName);
  };

  const handleDispatchAll = () => {
    const ids = matches.map((m) => m.donorId);
    setDispatchedDonors(ids);
    onDispatchAlert(`All ${matches.length} Compatible Donors`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Intelligent Rule-Based Discovery</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Donor Matching & Spatial Discovery</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Deterministic scoring based on clinical blood compatibility rules, donor availability, distance decay, and safe 90-day biological cooldown intervals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
              Reference: <strong className="text-slate-800">Metro Trauma Center (13.08°N, 80.27°E)</strong>
            </span>
          </div>
        </div>

        {/* Search Controls Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Patient Blood Group</label>
            <select
              value={targetBloodGroup}
              onChange={(e) => setTargetBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
            >
              {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Component</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as BloodComponentType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
            >
              <option value="Packed RBC">Packed RBC</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="Platelets">Platelets</option>
              <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
              <option value="Cryoprecipitate">Cryoprecipitate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
            >
              <option value="CRITICAL_EMERGENCY">Critical SOS (&lt; 2 hrs)</option>
              <option value="URGENT">Urgent (&lt; 8 hrs)</option>
              <option value="HIGH">High Priority (&lt; 24 hrs)</option>
              <option value="ROUTINE">Routine Scheduling</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Perimeter Radius</label>
              <span className="text-xs font-mono font-bold text-teal-700">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer mt-2"
            />
          </div>
        </div>
      </div>

      {/* Grid: Matches & Cold Storage Inventory Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: AI Donor Match Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Ranked Compatible Donors ({matches.length})
              </h3>
              <span className="text-xs text-slate-400">• Sorted by Explainable Match Score</span>
            </div>

            {matches.length > 0 && (
              <button
                onClick={handleDispatchAll}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Alert to All</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {matches.map((match) => {
              const isDispatched = dispatchedDonors.includes(match.donorId);

              return (
                <div
                  key={match.donorId}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Score Circle */}
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col items-center justify-center flex-shrink-0 text-teal-800">
                      <span className="text-base font-black leading-none">{match.compatibilityScore}</span>
                      <span className="text-[9px] uppercase font-bold text-teal-600 mt-0.5">Score</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{match.donorName}</h4>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                          {match.bloodGroup}
                        </span>
                        <span className="text-xs text-slate-400">• ~{match.approxDistanceKm} km away</span>
                      </div>

                      {/* Explainable Criteria Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {match.reasons.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Explain
                    </button>

                    <button
                      disabled={isDispatched}
                      onClick={() => handleDispatch(match)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                        isDispatched
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No compatible donors in perimeter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try expanding the search radius slider or check the blood bank cold storage units listed on the right.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Instant Blood Bank Inventory Ready Units */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Cold Storage Inventory ({matchingInventory.length} Available)
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Immediate Shelf-Ready Stock
            </span>

            {matchingInventory.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                No immediate {targetBloodGroup} units in local cold chain storage. Volunteer donor mobilization required.
              </div>
            ) : (
              matchingInventory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{item.componentType}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {item.unitsAvailable} units ready
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{item.bloodBankName}</span>
                    <span className="font-mono text-slate-400">Rack: {item.storageRack}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-200/60">
                    <span>Batch: {item.batchNumber}</span>
                    <span>Exp: {item.expiryDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clinical Transparency Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Algorithmic Safeguards</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This intelligent ranking service uses deterministic medical rules and does not hallucinate fictional availability. Final cross-matching must be performed in-lab prior to infusion.
            </p>
          </div>
        </div>

      </div>

      {/* Explanation Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Match Score Explanation</h3>
                <p className="text-xs text-slate-500">{selectedMatch.donorName} • Score: {selectedMatch.compatibilityScore}/100</p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-5">
              <h4 className="text-xs font-bold text-slate-700">Detailed Medical Factor Breakdown:</h4>
              <div className="space-y-1.5">
                {selectedMatch.reasons.map((r, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm"
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
