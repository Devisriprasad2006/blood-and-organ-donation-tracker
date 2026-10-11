import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp
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
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import type { 
  BloodRequest, 
  BloodInventoryItem, 
  DonorProfile, 
  OrganDonationIntent 
} from '../../types';

interface AnalyticsReportsViewProps {
  bloodRequests: BloodRequest[];
  inventory: BloodInventoryItem[];
  donors: DonorProfile[];
  organIntents: OrganDonationIntent[];
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  bloodRequests,
  inventory,
  donors,
  organIntents,
}) => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y'>('30D');

  // Blood group stock distribution data
  const stockByGroupData = [
    { group: 'O+', units: inventory.filter(i => i.bloodGroup === 'O+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'O-', units: inventory.filter(i => i.bloodGroup === 'O-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'A+', units: inventory.filter(i => i.bloodGroup === 'A+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'A-', units: inventory.filter(i => i.bloodGroup === 'A-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'B+', units: inventory.filter(i => i.bloodGroup === 'B+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'B-', units: inventory.filter(i => i.bloodGroup === 'B-').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'AB+', units: inventory.filter(i => i.bloodGroup === 'AB+').reduce((s, i) => s + i.unitsAvailable, 0) },
    { group: 'AB-', units: inventory.filter(i => i.bloodGroup === 'AB-').reduce((s, i) => s + i.unitsAvailable, 0) },
  ];

  // Request status breakdown
  const requestStatusData = [
    { name: 'Fulfilled', count: bloodRequests.filter(r => r.status === 'Fulfilled').length, color: '#10b981' },
    { name: 'Matching / Active', count: bloodRequests.filter(r => r.status === 'Matching' || r.status === 'Donor Contacted').length, color: '#0d9488' },
    { name: 'Under Review', count: bloodRequests.filter(r => r.status === 'Under Review' || r.status === 'Submitted').length, color: '#f59e0b' },
    { name: 'Cancelled / Expired', count: bloodRequests.filter(r => r.status === 'Cancelled' || r.status === 'Expired').length, color: '#ef4444' },
  ];

  // Monthly trends mock data
  const monthlyTrendsData = [
    { month: 'May', bloodUnits: 142, requests: 120, organPledges: 12 },
    { month: 'Jun', bloodUnits: 185, requests: 154, organPledges: 18 },
    { month: 'Jul', bloodUnits: 210, requests: 190, organPledges: 25 },
    { month: 'Aug', bloodUnits: 195, requests: 175, organPledges: 22 },
    { month: 'Sep', bloodUnits: 240, requests: 215, organPledges: 34 },
    { month: 'Oct', bloodUnits: 280, requests: 250, organPledges: 41 },
  ];

  // Component Distribution
  const componentPieData = [
    { name: 'Packed RBC', value: inventory.filter(i => i.componentType === 'Packed RBC').reduce((s, i) => s + i.unitsAvailable, 0), color: '#0d9488' },
    { name: 'Whole Blood', value: inventory.filter(i => i.componentType === 'Whole Blood').reduce((s, i) => s + i.unitsAvailable, 0), color: '#10b981' },
    { name: 'Platelets', value: inventory.filter(i => i.componentType === 'Platelets').reduce((s, i) => s + i.unitsAvailable, 0), color: '#f59e0b' },
    { name: 'Plasma (FFP)', value: inventory.filter(i => i.componentType === 'Fresh Frozen Plasma').reduce((s, i) => s + i.unitsAvailable, 0), color: '#3b82f6' },
  ];

  const totalInventoryUnits = inventory.reduce((s, i) => s + i.unitsAvailable, 0);
  const totalFulfilled = bloodRequests.filter(r => r.status === 'Fulfilled').length;
  const fulfillmentRate = bloodRequests.length > 0 ? Math.round((totalFulfilled / bloodRequests.length) * 100) : 0;

  const exportCSV = () => {
    const csvRows = [
      ['Report Category', 'Metric', 'Value'],
      ['Blood Inventory', 'Total Available Units', totalInventoryUnits.toString()],
      ['Blood Requests', 'Total Requests Logged', bloodRequests.length.toString()],
      ['Blood Requests', 'Fulfilled Requests', totalFulfilled.toString()],
      ['Fulfillment Rate', 'Percentage', `${fulfillmentRate}%`],
      ['Registered Donors', 'Total Donors', donors.length.toString()],
      ['Organ Pledges', 'Total Enrolled Pledges', organIntents.length.toString()],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeLink_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Executive Telemetry & Clinical Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics Engine</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Transparent, database-backed performance indices tracking donation turnaround time, inventory distribution, and regional organ donor enrollment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setTimeRange('30D')}
                className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '30D' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90D')}
                className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '90D' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                90 Days
              </button>
              <button
                onClick={() => setTimeRange('1Y')}
                className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === '1Y' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                1 Year
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Total Blood In-Stock</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{totalInventoryUnits}</span>
              <span className="text-xs font-normal text-emerald-600">units</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across partner blood repositories</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Request Fulfillment Rate</span>
            <div className="text-2xl font-black text-teal-700 mt-1 flex items-baseline gap-2">
              <span>{fulfillmentRate}%</span>
              <span className="text-xs font-normal text-teal-600">success</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{totalFulfilled} of {bloodRequests.length} completed</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Active Volunteers</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{donors.length}</span>
              <span className="text-xs font-normal text-slate-500">donors</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Verified with digital donor cards</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Organ Intent Pledges</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
              <span>{organIntents.length}</span>
              <span className="text-xs font-normal text-slate-500">pledges</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Next-of-kin verified records</p>
          </div>
        </div>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Availability Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Blood Group Inventory Mesh (Units)</h3>
              <p className="text-xs text-slate-400">Available cold storage units ready for allocation</p>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              {totalInventoryUnits} Total Units
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByGroupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="units" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Month Activity Trends Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">6-Month Activity Telemetry</h3>
              <p className="text-xs text-slate-400">Monthly blood units collected vs hospital requests</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% MoM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="bloodUnits" name="Units Collected" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="requests" name="Patient Requests" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Distribution Pies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Blood Component Inventory Proportion</h3>
          <p className="text-xs text-slate-400 mb-4">Packed Red Blood Cells vs Whole Blood vs Platelets vs Plasma</p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={componentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {componentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              {componentPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Blood Request Lifecycle Status</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown of requests across fulfillment stages</p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {requestStatusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              {requestStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count} requests</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
