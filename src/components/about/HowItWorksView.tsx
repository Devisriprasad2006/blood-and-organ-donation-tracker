import React from 'react';
import { 
  Heart, 
  Droplet, 
  ShieldCheck, 
  Building2, 
  FileCheck2, 
  Lock, 
  Cpu
} from 'lucide-react';


export const HowItWorksView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
          <span>LifeLink Healthcare Protocol Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          How LifeLink Coordinates Life-Saving Care
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          A dual-track healthcare management platform bridging verified voluntary blood donors, cold-chain blood banks, and hospital organ transplant coordinators with transparent auditability.
        </p>
      </div>

      {/* Track 1: Blood Donation Lifecycle */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Droplet className="w-5 h-5 fill-rose-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Track 1: Blood Request & Matching Lifecycle</h2>
            <p className="text-xs text-slate-500">Rapid emergency blood dispatch from request to bedside transfusion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="font-bold text-slate-800 text-sm">Hospital Request</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hospital trauma desks log required blood component (Packed RBC, Platelets, FFP), urgency tier, and units required.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="font-bold text-slate-800 text-sm">Rule-Based Discovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Medical compatibility rules (ABO/Rh) and distance decay evaluate nearby available donors and blood bank inventories.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="font-bold text-slate-800 text-sm">Donor Contact & Hold</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Volunteers receive targeted perimeter alerts. Blood bank inventories reserve units with concurrency transaction locks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h3 className="font-bold text-slate-800 text-sm">Cross-Match & Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Certified cross-matching and transfusion completed; request lifecycle status transitions to Fulfilled with immutable audit hash.
            </p>
          </div>
        </div>
      </div>

      {/* Track 2: Dedicated Organ Workflow */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Track 2: Organ Donation & Transplant Governance</h2>
            <p className="text-xs text-slate-500">Statutory anatomical donation protocol strictly separated from commercial workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
              <span>Step A: Expression of Intent</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Voluntary Citizen Pledge</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donors submit voluntary pledge for specific organs (Kidney, Liver, Heart, Cornea) with mandatory next-of-kin counseling declarations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <Building2 className="w-4 h-4" />
              <span>Step B: Transplant Coordinator Verification</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Hospital Credential Gate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Certified hospital coordinators review next-of-kin consent records and identity credentials, advancing status to Verified.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Step C: National Statutory Oversight</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">NOTTO Regulatory Mesh</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All transplant actions conform to statutory organ sharing grids. Allocation occurs solely through qualified medical teams.
            </p>
          </div>
        </div>
      </div>

      {/* AI Matching Architecture Explanation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explainable AI Matching Criteria</h2>
            <p className="text-xs text-slate-500">Transparent, deterministic scoring mechanism with clear medical rationale</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>1. Blood Group Compatibility</span>
              <span className="text-teal-700">40 Points (Strict Filter)</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              O- is the universal Packed RBC donor; AB+ is the universal plasma donor. Incompatible groups receive 0 score and are immediately excluded.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>2. Geographic Distance Decay</span>
              <span className="text-teal-700">25 Points</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Scores decay exponentially beyond 15 km to prioritize rapid transit time for trauma resuscitation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>3. 90-Day Clinical Cooldown</span>
              <span className="text-teal-700">20 Points</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Donors who have donated within the last 90 days are automatically placed on safe biological recovery cooldown to protect donor health.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>4. Historical Reliability Score</span>
              <span className="text-teal-700">15 Points</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Recognizes frequent voluntary donors with verified digital donor cards who regularly honor scheduled donations.
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Disclaimer Card */}
      <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 text-amber-900 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold">Statutory Medical Disclaimer</h4>
          <p className="text-amber-800 leading-relaxed">
            LifeLink is a healthcare coordination and prototype management system. It does not certify medical compatibility, determine transplant eligibility, or authorize organ allocation. Final clinical decisions must be executed by qualified medical doctors and authorized statutory healthcare organizations.
          </p>
        </div>
      </div>
    </div>
  );
};
