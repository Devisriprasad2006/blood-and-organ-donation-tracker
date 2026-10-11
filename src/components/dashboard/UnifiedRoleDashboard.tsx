import { 
  Heart, 
  Droplet, 
  Users, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  FileCheck, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import type { 
  UserRole, 
  DonorProfile, 
  BloodRequest, 
  BloodInventoryItem, 
  OrganDonationIntent,
  VerificationRequest 
} from '../../types';

interface UnifiedRoleDashboardProps {
  currentRole: UserRole;
  donors: DonorProfile[];
  bloodRequests: BloodRequest[];
  inventory: BloodInventoryItem[];
  organIntents: OrganDonationIntent[];
  verifications: VerificationRequest[];
  onOpenSOSModal: () => void;
  onNavigate: (page: string) => void;
  onToggleAvailability: (donorId: string) => void;
}

export const UnifiedRoleDashboard: React.FC<UnifiedRoleDashboardProps> = ({
  currentRole,
  donors,
  bloodRequests,
  inventory,
  organIntents,
  verifications,
  onOpenSOSModal,
  onNavigate,
  onToggleAvailability,
}) => {
  // Aggregate Metrics
  const activeDonors = donors.filter(d => d.isAvailable && !d.isMatchingPaused);
  const totalUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);
  const openRequests = bloodRequests.filter(r => r.status !== 'Fulfilled' && r.status !== 'Cancelled');
  const criticalRequests = bloodRequests.filter(r => r.urgency === 'CRITICAL_EMERGENCY' && r.status !== 'Fulfilled');
  const lowStockItems = inventory.filter(i => i.isLowStock);
  const pendingVerifications = verifications.filter(v => v.status === 'PENDING');

  // Chart Data: Blood Group Inventory Distribution
  const bloodGroupStats = [
    { name: 'O+', units: inventory.filter(i => i.bloodGroup === 'O+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'O-', units: inventory.filter(i => i.bloodGroup === 'O-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'A+', units: inventory.filter(i => i.bloodGroup === 'A+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'A-', units: inventory.filter(i => i.bloodGroup === 'A-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'B+', units: inventory.filter(i => i.bloodGroup === 'B+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'B-', units: inventory.filter(i => i.bloodGroup === 'B-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'AB+', units: inventory.filter(i => i.bloodGroup === 'AB+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { name: 'AB-', units: inventory.filter(i => i.bloodGroup === 'AB-').reduce((s, i) => s + i.unitsAvailable, 0) },
  ];

  // Component Types Pie Chart Data
  const componentStats = [
    { name: 'Packed RBC', value: inventory.filter(i => i.componentType === 'Packed RBC').reduce((s, i) => s + i.unitsAvailable, 0), color: '#0d9488' },
    { name: 'Whole Blood', value: inventory.filter(i => i.componentType === 'Whole Blood').reduce((s, i) => s + i.unitsAvailable, 0), color: '#10b981' },
    { name: 'Platelets', value: inventory.filter(i => i.componentType === 'Platelets').reduce((s, i) => s + i.unitsAvailable, 0), color: '#f59e0b' },
    { name: 'FFP', value: inventory.filter(i => i.componentType === 'Fresh Frozen Plasma').reduce((s, i) => s + i.unitsAvailable, 0), color: '#3b82f6' },
  ];

  const primaryDonor = donors[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/40 text-teal-100 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LifeLink Central Healthcare Grid • Live Status</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentRole === 'DONOR' && `Welcome back, ${primaryDonor?.user?.fullName || 'Valued Donor'}!`}
            {currentRole === 'RECIPIENT' && 'Patient & Requester Portal'}
            {currentRole === 'HOSPITAL' && 'Hospital Trauma & Surgical Desk'}
            {currentRole === 'BLOOD_BANK' && 'Blood Bank Inventory Operations'}
            {currentRole === 'COORDINATOR' && 'Organ Transplant Coordination Desk'}
            {currentRole === 'ADMINISTRATOR' && 'System Health & Governance Hub'}
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {currentRole === 'DONOR' && `Your voluntary donor card #${primaryDonor?.donorCardNumber || 'LIFE-DON-001'} is verified and active in the healthcare grid.`}
            {currentRole === 'RECIPIENT' && 'Monitor verified blood requests, search compatible donors, and track status transitions in real time.'}
            {currentRole === 'HOSPITAL' && 'Create patient blood requirements, evaluate preliminary matching results, and coordinate authorized organ intents.'}
            {currentRole === 'BLOOD_BANK' && 'Maintain inventory integrity, process reservations, and manage low-stock and expiry warnings.'}
            {currentRole === 'COORDINATOR' && 'Review expressions of anatomical gift intent, verify next-of-kin documentation, and coordinate authorized transplant allocations.'}
            {currentRole === 'ADMINISTRATOR' && 'Monitor network integrity, review facility license verifications, and audit critical allocations.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <button
            onClick={onOpenSOSModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS Request</span>
          </button>

          <button
            onClick={() => onNavigate('blood-requests')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all"
          >
            <Droplet className="w-4 h-4 text-teal-200" />
            <span>View Blood Requests</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentRole === 'DONOR' ? 'My Donor Status' : 'Available Blood Units'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              {currentRole === 'DONOR' ? <Heart className="w-4 h-4 fill-teal-600" /> : <Droplet className="w-4 h-4 fill-teal-600" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentRole === 'DONOR' ? (primaryDonor?.isAvailable ? 'Available' : 'Paused') : totalUnits}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {currentRole === 'DONOR' ? `Card #${primaryDonor?.donorCardNumber || 'LIFE-DON-001'}` : 'Ready in Storage'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {currentRole === 'DONOR' ? `${primaryDonor?.bloodGroup || 'O+'} Blood Group • Voluntary Donor Active` : 'Across 4 registered blood banks'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Requests</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{openRequests.length}</span>
            <span className="text-xs font-semibold text-slate-500">Open Tracking</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {criticalRequests.length > 0 ? `${criticalRequests.length} critical emergency priorities` : 'All normal status'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentRole === 'BLOOD_BANK' ? 'Low Stock Alerts' : 'Registered Donors'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lowStockItems.length > 0 && currentRole === 'BLOOD_BANK' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {currentRole === 'BLOOD_BANK' ? <AlertTriangle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentRole === 'BLOOD_BANK' ? lowStockItems.length : activeDonors.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {currentRole === 'BLOOD_BANK' ? 'Items Flagged' : 'Active Donors'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {currentRole === 'BLOOD_BANK' ? 'O- and A- units below buffer' : 'Approximate perimeter matched'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentRole === 'ADMINISTRATOR' ? 'Pending Verifications' : 'Organ Pledges'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {currentRole === 'ADMINISTRATOR' ? pendingVerifications.length : organIntents.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {currentRole === 'ADMINISTRATOR' ? 'Facilities' : 'Consents Verified'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {currentRole === 'ADMINISTRATOR' ? 'Hospital license checks pending' : 'Authorized legal documentation'}
          </p>
        </div>

      </div>

      {/* Role-Specific Interactive Workflows */}
      {currentRole === 'DONOR' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Donation Availability Controls</h3>
              <p className="text-xs text-slate-500">
                You are currently marked as {primaryDonor?.isAvailable ? 'Available for emergency blood matching' : 'Paused / Resting'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => primaryDonor && onToggleAvailability(primaryDonor.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              primaryDonor?.isAvailable 
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {primaryDonor?.isAvailable ? (
              <>
                <ToggleRight className="w-4 h-4 text-amber-600" />
                <span>Pause Matching (Cooldown)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-emerald-600" />
                <span>Resume Availability</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Blood Group Inventory Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Blood Units Available by Blood Group</h3>
              <p className="text-xs text-slate-500">Live inventory across authorized blood banks in Chennai mesh</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Live Stock
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodGroupStats}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} units`, 'Available Stock']}
                />

                <Bar dataKey="units" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Component Distribution Donut */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Component Types</h3>
            <p className="text-xs text-slate-500">Blood product distribution</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={componentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {componentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {componentStats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Urgent Requests Feed */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Healthcare Requests</h3>
          </div>
          <button
            onClick={() => onNavigate('blood-requests')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All ({bloodRequests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {bloodRequests.slice(0, 4).map((req: any) => {
            const bloodGrp = req.bloodGroup || req.blood_group || 'O+';
            const patName = req.patientName || req.patient_name || 'Emergency Patient';
            const hospName = req.hospitalName || req.hospital_name || 'Trauma Center';
            const units = req.unitsRequired ?? req.units_required ?? 1;
            const comp = req.componentType || req.component_type || 'Packed RBC';
            const rawTime = req.createdAt || req.created_at || '';
            const timeStr = rawTime.includes('T') ? rawTime.slice(11, 16) : rawTime.includes(' ') ? rawTime.split(' ')[1]?.slice(0, 5) : (rawTime || 'Recently');

            return (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 ${
                    req.urgency === 'CRITICAL_EMERGENCY' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : req.urgency === 'URGENT'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {bloodGrp}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{patName}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        req.status === 'Fulfilled' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : req.status === 'Matching'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {req.status || 'Submitted'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{req.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {hospName} • Needs <strong>{units} units</strong> ({comp})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[11px] text-slate-400">{timeStr}</span>
                  <button
                    onClick={() => onNavigate('blood-requests')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Track Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
