import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Boxes, 
  Calendar
} from 'lucide-react';

import type { 
  BloodInventoryItem, 
  BloodGroup, 
  BloodComponentType, 
  UserRole 
} from '../../types';

interface BloodBankInventoryViewProps {
  inventory: BloodInventoryItem[];
  currentRole: UserRole;
  onRestock: (newItem: Partial<BloodInventoryItem>) => void;
  onReserveUnits: (itemId: string, units: number, reason: string) => void;
  onDispatchUnits: (itemId: string, units: number, reason: string) => void;
}

export const BloodBankInventoryView: React.FC<BloodBankInventoryViewProps> = ({
  inventory,
  currentRole,
  onRestock,
  onReserveUnits,
  onDispatchUnits,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<BloodInventoryItem | null>(null);
  const [actionType, setActionType] = useState<'RESERVE' | 'DISPATCH'>('RESERVE');
  const [actionUnits, setActionUnits] = useState(1);
  const [actionReason, setActionReason] = useState('');

  // Restock form state
  const [restockGroup, setRestockGroup] = useState<BloodGroup>('O+');
  const [restockComponent, setRestockComponent] = useState<BloodComponentType>('Packed RBC');
  const [restockUnits, setRestockUnits] = useState(5);
  const [restockRack, setRestockRack] = useState('RACK-COLD-A01');
  const [restockBatch, setRestockBatch] = useState(() => 'BATCH-2026-A01');
  const [restockExpiry, setRestockExpiry] = useState('2026-11-20');


  const bloodGroups: (BloodGroup | 'ALL')[] = ['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const componentTypes: (BloodComponentType | 'ALL')[] = [
    'ALL', 
    'Packed RBC', 
    'Whole Blood', 
    'Platelets', 
    'Fresh Frozen Plasma', 
    'Cryoprecipitate'
  ];

  // Aggregate Metrics
  const totalUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);
  const totalReserved = inventory.reduce((sum, item) => sum + item.unitsReserved, 0);
  const lowStockCount = inventory.filter((item) => item.isLowStock).length;
  const expiredCount = inventory.filter((item) => item.isExpired).length;

  // Filtered List
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = 
      item.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.componentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storageRack.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bloodBankName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'ALL' || item.bloodGroup === selectedGroup;
    const matchesComponent = selectedComponent === 'ALL' || item.componentType === selectedComponent;
    const matchesLowStock = !showLowStockOnly || item.isLowStock;

    return matchesSearch && matchesGroup && matchesComponent && matchesLowStock;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRestock({
      bloodGroup: restockGroup,
      componentType: restockComponent,
      unitsAvailable: restockUnits,
      storageRack: restockRack,
      batchNumber: restockBatch,
      expiryDate: restockExpiry,
      collectionDate: new Date().toISOString().slice(0, 10),
      bloodBankName: 'City Central Blood Repository',
      isLowStock: restockUnits < 5,
      isExpired: false,
    });
    setIsRestockModalOpen(false);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction) return;

    if (actionType === 'RESERVE') {
      onReserveUnits(selectedItemForAction.id, actionUnits, actionReason || 'Emergency Request Hold');
    } else {
      onDispatchUnits(selectedItemForAction.id, actionUnits, actionReason || 'Hospital Ward Transfer');
    }
    setSelectedItemForAction(null);
    setActionUnits(1);
    setActionReason('');
  };

  const isAuthorizedManager = currentRole === 'BLOOD_BANK' || currentRole === 'ADMINISTRATOR' || currentRole === 'HOSPITAL';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Cold Chain Blood Bank Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Blood Bank Inventory Mesh</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Real-time monitoring of blood components, rack locations, expiry dates, and unit reservations. Database transaction locking prevents negative stock and duplicate allocation.
            </p>
          </div>

          {isAuthorizedManager && (
            <button
              onClick={() => setIsRestockModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Restock Blood Batch</span>
            </button>
          )}
        </div>

        {/* 4 Quick Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Available Units</span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{totalUnits}</span>
              <span className="text-xs font-normal text-emerald-600">units in storage</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Units Reserved</span>
            <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline gap-2">
              <span>{totalReserved}</span>
              <span className="text-xs font-normal text-slate-500">allocated to requests</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Low-Stock Warnings</span>
            <div className="text-2xl font-black text-amber-500 mt-1 flex items-baseline gap-2">
              <span>{lowStockCount}</span>
              <span className="text-xs font-normal text-slate-500">groups below threshold</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-500">Expired / Flagged</span>
            <div className="text-2xl font-black text-red-600 mt-1 flex items-baseline gap-2">
              <span>{expiredCount}</span>
              <span className="text-xs font-normal text-slate-500">units quarantined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings Banner if any low stock or expired */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">Inventory Buffer Alert</h4>
            <p className="mt-0.5 text-amber-800">
              {lowStockCount} inventory batch(es) have fallen below the mandatory 5-unit hospital emergency buffer. Consider scheduling targeted voluntary blood drives or requesting mutual aid.
            </p>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rack ID, batch #, group, or repository..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
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
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              {componentTypes.map((comp) => (
                <option key={comp} value={comp}>
                  {comp === 'ALL' ? 'All Components' : comp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span>Filter Low-Stock Batches Only</span>
          </label>

          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredInventory.length}</strong> items in inventory
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Blood Group & Component</th>
                <th className="px-5 py-3.5">Storage Rack</th>
                <th className="px-5 py-3.5">Batch Number</th>
                <th className="px-5 py-3.5 text-center">Available Units</th>
                <th className="px-5 py-3.5 text-center">Reserved Units</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5">Safety Status</th>
                {isAuthorizedManager && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Group & Component */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center justify-center text-sm">
                          {item.bloodGroup}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{item.componentType}</span>
                          <span className="text-[11px] text-slate-400">{item.bloodBankName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Storage Rack */}
                    <td className="px-5 py-4 font-mono font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.storageRack}</span>
                      </div>
                    </td>

                    {/* Batch Number */}
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                      {item.batchNumber}
                    </td>

                    {/* Units Available */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full font-bold text-xs ${
                        item.unitsAvailable < 5
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.unitsAvailable} units
                      </span>
                    </td>

                    {/* Units Reserved */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.unitsReserved} units
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={item.isExpired ? 'text-red-600 font-bold' : 'text-slate-700'}>
                          {item.expiryDate}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {item.isExpired ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          Quarantined / Expired
                        </span>
                      ) : item.isLowStock ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock Buffer
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Certified Safe
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    {isAuthorizedManager && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItemForAction(item);
                              setActionType('RESERVE');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItemForAction(item);
                              setActionType('DISPATCH');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium shadow-xs transition-colors"
                          >
                            Dispatch
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Restock Blood Inventory Batch</h3>
                  <p className="text-xs text-slate-500">Record certified collection and assign storage rack</p>
                </div>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={restockGroup}
                    onChange={(e) => setRestockGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {bloodGroups.filter(g => g !== 'ALL').map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Component Type</label>
                  <select
                    value={restockComponent}
                    onChange={(e) => setRestockComponent(e.target.value as BloodComponentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {componentTypes.filter(c => c !== 'ALL').map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Units Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={restockUnits}
                    onChange={(e) => setRestockUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Rack ID</label>
                  <input
                    type="text"
                    value={restockRack}
                    onChange={(e) => setRestockRack(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Transaction Guarantee:</strong> Restocked units are cryptographically recorded in the immutable audit log and available immediately for regional emergency matching.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm"
                >
                  Confirm & Commit Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reserve / Dispatch Action Modal */}
      {selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {actionType === 'RESERVE' ? 'Reserve Blood Units' : 'Dispatch Blood Units'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedItemForAction.bloodGroup} {selectedItemForAction.componentType} (Rack: {selectedItemForAction.storageRack})
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units to {actionType === 'RESERVE' ? 'Reserve' : 'Dispatch'} (Max: {selectedItemForAction.unitsAvailable})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItemForAction.unitsAvailable}
                  value={actionUnits}
                  onChange={(e) => setActionUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Reason / Requisition Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU OT-2 Patient Cross Match or Trauma Hold"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm ${
                    actionType === 'RESERVE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {actionType === 'RESERVE' ? 'Confirm Reservation' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
