import { 
  Heart, 
  Droplet, 
  ShieldAlert, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Building2,
  User,
  Radio,
  LogIn,
  UserPlus
} from 'lucide-react';
import type { UserRole } from '../../types';

interface PublicLandingPageProps {
  onSelectRoleLogin: (role: UserRole) => void;
  onSelectRoleRegister: (role: UserRole) => void;
  onOpenSOSModal: () => void;
  onExploreClick: () => void;
  onHowItWorksClick?: () => void;
  onOpenDonorWizard?: () => void;
}

export const PublicLandingPage = ({
  onSelectRoleLogin,
  onSelectRoleRegister,
  onOpenSOSModal,
  onExploreClick,
  onHowItWorksClick,
  onOpenDonorWizard,
}: PublicLandingPageProps) => {

  const rolePortals: {
    role: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
    accentBg: string;
    borderHover: string;
  }[] = [
    {
      role: 'DONOR',
      title: 'Voluntary Blood & Organ Donor',
      subtitle: 'Citizen Donor Hub',
      description: 'Register donor card, view eligibility countdowns, pledge organs, and receive SOS alerts for emergency patients near you.',
      icon: Droplet,
      color: 'text-teal-600',
      accentBg: 'bg-teal-50',
      borderHover: 'hover:border-teal-500',
    },
    {
      role: 'RECIPIENT',
      title: 'Patient & Family Requester',
      subtitle: 'Requisition & Tracking Desk',
      description: 'Submit emergency or scheduled blood requests, monitor real-time status progression, and locate nearby matching blood banks.',
      icon: User,
      color: 'text-sky-600',
      accentBg: 'bg-sky-50',
      borderHover: 'hover:border-sky-500',
    },
    {
      role: 'HOSPITAL',
      title: 'Hospital Surgical & Trauma Center',
      subtitle: 'Clinical Requisition Portal',
      description: 'Broadcast high-priority trauma SOS, query rule-based ABO cross-matches, reserve units, and track green corridor transit.',
      icon: Building2,
      color: 'text-indigo-600',
      accentBg: 'bg-indigo-50',
      borderHover: 'hover:border-indigo-500',
    },
    {
      role: 'BLOOD_BANK',
      title: 'Regional Blood Bank Authority',
      subtitle: 'Cold Chain Storage Management',
      description: 'Track blood components across storage racks and batches, log restock intakes, verify safe reservations, and prevent negative inventory.',
      icon: Heart,
      color: 'text-rose-600',
      accentBg: 'bg-rose-50',
      borderHover: 'hover:border-rose-500',
    },
    {
      role: 'COORDINATOR',
      title: 'Organ Transplant Coordinator',
      subtitle: 'Ethical NOTTO Protocol Desk',
      description: 'Manage voluntary expressions of anatomical gift intent, verify next-of-kin counseling, and manage transplant waiting list cases.',
      icon: Radio,
      color: 'text-purple-600',
      accentBg: 'bg-purple-50',
      borderHover: 'hover:border-purple-500',
    },
    {
      role: 'ADMINISTRATOR',
      title: 'System Health Grid Administrator',
      subtitle: 'Executive Governance & Telemetry',
      description: 'Review hospital credential accreditations, inspect platform telemetry, and audit tamper-evident SHA-256 cryptographic ledgers.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      accentBg: 'bg-emerald-50',
      borderHover: 'hover:border-emerald-500',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Top Header / Public App Bar */}
      <nav className="flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-600/20">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base block leading-none">LifeLink</span>
            <span className="text-[11px] text-slate-500 font-medium">Digital Blood & Organ Donation Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onHowItWorksClick && (
            <button
              onClick={onHowItWorksClick}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </button>
          )}

          <button
            onClick={onOpenSOSModal}
            className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Emergency SOS</span>
          </button>

          <button
            onClick={() => onSelectRoleLogin('DONOR')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-teal-600" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onOpenDonorWizard ? onOpenDonorWizard() : onSelectRoleRegister('DONOR')}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register Donor</span>
            <span className="sm:hidden">Register</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-50/90 via-white to-slate-50 border border-teal-100 p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-xs">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Real-Time Healthcare Coordination & Tracking Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Connecting Every Life in Critical Need with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
            Verified Blood & Organ Donors
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          LifeLink bridges voluntary donors, verified hospital trauma centers, accredited blood banks, and transplant coordinators 
          through explainable ABO/Rh cross-matching, cold-chain inventory concurrency, and tamper-evident audit transparency.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenSOSModal}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Raise Emergency Blood SOS</span>
          </button>

          <button
            onClick={() => onOpenDonorWizard ? onOpenDonorWizard() : onSelectRoleRegister('DONOR')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Register as Voluntary Donor</span>
          </button>

          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Live Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-teal-100/80 max-w-4xl mx-auto text-left">
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">1,420+</span>
            <span className="text-xs text-slate-500 font-medium">Verified Active Donors</span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-black text-teal-700 block font-mono">18 mins</span>
            <span className="text-xs text-slate-500 font-medium">Avg. Trauma SOS Response</span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">12+</span>
            <span className="text-xs text-slate-500 font-medium">Accredited Trauma Facilities</span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block font-mono">100%</span>
            <span className="text-xs text-slate-500 font-medium">Verifiable Audit Ledger</span>
          </div>
        </div>

      </section>

      {/* Role-Specific Portal Selection Cards */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Role-Based Access Portals</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Choose Your Healthcare Persona</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in or create an account under your specific healthcare role to access customized dashboards, workflows, and operational capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.role}
                className={`p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-5 transition-all hover:shadow-md ${portal.borderHover}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${portal.accentBg} ${portal.color} flex items-center justify-center font-bold`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {portal.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{portal.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {portal.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectRoleLogin(portal.role)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => portal.role === 'DONOR' && onOpenDonorWizard ? onOpenDonorWizard() : onSelectRoleRegister(portal.role)}
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Engine Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Built for Operational Medical Reliability</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered to replace fragmented manual logs with transactional cold-chain integrity and auditable coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Droplet className="w-6 h-6 fill-teal-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cold Chain Inventory Mesh</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time stock monitoring by blood group and component type (Packed RBC, Platelets, FFP). 
              Automated low-stock flags and ACID reservation locks prevent duplicate allocations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6 fill-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ethical Organ Coordination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strictly separate statutory coordination module. Next-of-kin documentation verification, 
              hospital coordinator review, and transparent compliance with national transplant frameworks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Explainable Clinical Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explainable rule-based scoring factoring ABO/Rh rules, donor availability, cooldown intervals, 
              and approximate geospatial distance decay without compromising private coordinates.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Protocol */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 space-y-8">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Streamlined Protocol</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">How LifeLink Coordinates Donation</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Request Initiated', desc: 'Authorized hospital or patient advocate creates emergency blood or organ requisition.' },
            { step: '02', title: 'Clinical Crossmatch', desc: 'Engine discovers compatible nearby donors and verifies blood bank stock buffers.' },
            { step: '03', title: 'Real-Time Dispatch', desc: 'Secure in-app and simulated alerts dispatched to matched available volunteers.' },
            { step: '04', title: 'Fulfillment & Audit', desc: 'Transfusion certified at facility bedside with tamper-evident cryptographic logging.' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 relative">
              <span className="text-xl font-black text-teal-600/40 font-mono block">{item.step}</span>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statutory Regulatory Notice */}
      <section className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold text-amber-950">Statutory Healthcare Coordination Notice</h4>
          <p className="text-amber-800 leading-relaxed">
            LifeLink is an independent healthcare technology platform engineered to facilitate real-time discovery and inventory tracking. 
            In strict compliance with national hemovigilance and anatomical gift frameworks (THOA / NOTTO), final clinical compatibility cross-matching, 
            blood safety screening, and organ transplant authorizations must be executed by certified medical personnel and statutory authorities.
          </p>
        </div>
      </section>

    </div>
  );
};
