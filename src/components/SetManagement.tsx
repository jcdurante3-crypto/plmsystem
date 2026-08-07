import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Search, Edit3, Archive, Activity, RefreshCw, X, ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';
import { ProductionSet, SetStatus } from '../types';

export const SetManagement: React.FC = () => {
  const { sets, plates, addOrUpdateSet, removeSet, setIsNewCycleModalOpen, setSelectedSetForModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for New / Edit Set
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<ProductionSet | null>(null);
  const [setToDeleteForModal, setSetToDeleteForModal] = useState<ProductionSet | null>(null);

  const [setNumber, setSetNumber] = useState('');
  const [machine, setMachine] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [startDateFirstUse, setStartDateFirstUse] = useState(new Date().toISOString().split('T')[0]);
  const [previousTotalCycle, setPreviousTotalCycle] = useState(0);
  const [cycleLimitWarning, setCycleLimitWarning] = useState(80000);
  const [cycleLimitMax, setCycleLimitMax] = useState(100000);
  const [status, setStatus] = useState<SetStatus>('Active');
  const [notes, setNotes] = useState('');

  const handleOpenCreateModal = () => {
    setEditingSet(null);
    const nextNum = sets.length + 1;
    setSetNumber(String(nextNum).padStart(3, '0'));
    setMachine('');
    setMaterialCode('');
    setStartDateFirstUse(new Date().toISOString().split('T')[0]);
    setPreviousTotalCycle(0);
    setCycleLimitWarning(80000);
    setCycleLimitMax(100000);
    setStatus('Active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (set: ProductionSet) => {
    setEditingSet(set);
    setSetNumber(set.setNumber);
    setMachine(set.machine);
    setMaterialCode(set.materialCode);
    setStartDateFirstUse(set.startDateFirstUse);
    setPreviousTotalCycle(set.previousTotalCycle);
    setCycleLimitWarning(set.cycleLimitWarning || 80000);
    setCycleLimitMax(set.cycleLimitMax || 100000);
    setStatus(set.status);
    setNotes(set.notes);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setNumber.trim() || !machine.trim() || !materialCode.trim()) return;

    const currentTotal = editingSet
      ? editingSet.currentTotalSetCycle
      : Number(previousTotalCycle);

    const savedSet: ProductionSet = {
      id: editingSet ? editingSet.id : `set-${Date.now()}`,
      setNumber: setNumber.trim().toUpperCase(),
      machine: machine.trim(),
      materialCode: materialCode.trim(),
      startDateFirstUse,
      previousTotalCycle: Number(previousTotalCycle),
      currentTotalSetCycle: currentTotal,
      cycleLimitWarning: Number(cycleLimitWarning),
      cycleLimitMax: Number(cycleLimitMax),
      status,
      notes: notes.trim(),
      createdAt: editingSet ? editingSet.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdateSet(savedSet);
    setIsModalOpen(false);
  };

  const handleArchiveSet = (set: ProductionSet) => {
    const updated: ProductionSet = {
      ...set,
      status: set.status === 'Archived' ? 'Active' : 'Archived',
      updatedAt: new Date().toISOString(),
    };
    addOrUpdateSet(updated);
  };

  const filteredSets = sets.filter((set) => {
    const matchesSearch =
      set.setNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || set.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Production Set Management (Module 2)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, configure, and monitor tool, die, and mold production sets. Master reference: Total Set No. Cycle.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Production Set</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Set Number, Machine, Material Code, Notes..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Sets</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSets.map((set) => {
          const isWarning = set.cycleLimitWarning && set.currentTotalSetCycle >= set.cycleLimitWarning;
          const isMaxHit = set.cycleLimitMax && set.currentTotalSetCycle >= set.cycleLimitMax;

          return (
            <div
              key={set.id}
              className={`p-5 bg-slate-900 rounded-xl border transition-all flex flex-col justify-between ${
                isMaxHit
                  ? 'border-rose-500/80 shadow-rose-950/20 shadow-lg'
                  : isWarning
                  ? 'border-amber-500/80 shadow-amber-950/20 shadow-md'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base font-mono tracking-wide">
                      {set.setNumber}
                    </h3>
                    <p className="text-xs text-cyan-400 font-medium mt-0.5">{set.machine}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      set.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : set.status === 'Maintenance'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {set.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="my-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Material Code:</span>
                    <span className="text-slate-200 font-medium">{set.materialCode}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Start Date First Use:</span>
                    <span className="text-slate-200 font-medium">{set.startDateFirstUse}</span>
                  </div>

                  {/* Total Set Cycle Master Counter */}
                  <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-750 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" /> Total Set No. Cycle
                      </span>
                      {isMaxHit ? (
                        <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> REPLACEMENT DUE
                        </span>
                      ) : isWarning ? (
                        <span className="text-[10px] font-bold text-amber-400">NEAR LIMIT</span>
                      ) : null}
                    </div>
                    <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                      {set.currentTotalSetCycle.toLocaleString()} <span className="text-xs font-normal text-slate-400">cycles</span>
                    </div>

                    {set.cycleLimitMax && (
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isMaxHit ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
                          }`}
                          style={{
                            width: `${Math.min(100, (set.currentTotalSetCycle / set.cycleLimitMax) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 11 Component Plates Layout Matrix */}
                  {(() => {
                    const setPlates = plates.filter(
                      (p) => p.setId === set.id && (p.status === 'Active' || p.status === 'Installed')
                    );
                    return (
                      <div className="mt-3 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            11-Plate Component Layout
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {setPlates.length}/11 Active
                          </span>
                        </div>
                        <div className="grid grid-cols-11 gap-1">
                          {Array.from({ length: 11 }, (_, i) => {
                            const numStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                            const posName = `Plate #${numStr}`;
                            const matchedPlate = setPlates.find(
                              (p) => p.position === posName || p.position.includes(`#${numStr}`)
                            );
                            const isActive = matchedPlate && (matchedPlate.status === 'Active' || matchedPlate.status === 'Installed');
                            return (
                              <div
                                key={numStr}
                                title={matchedPlate ? `${posName}: ${matchedPlate.serialNumber}` : `${posName}: Unregistered`}
                                className={`h-6 rounded flex items-center justify-center font-mono text-[9px] font-bold border transition-all ${
                                  isActive
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                                    : 'bg-slate-900 text-slate-600 border-slate-800'
                                }`}
                              >
                                #{numStr}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {set.notes && <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">"{set.notes}"</p>}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedSetForModal(set);
                    setIsNewCycleModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-semibold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Log Entry</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(set)}
                    className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
                    title="Edit Set Configuration"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveSet(set)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                    title={set.status === 'Archived' ? 'Unarchive Set' : 'Archive Set'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSetToDeleteForModal(set)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                    title="Remove Production Set"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400/80 hover:text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSets.length === 0 && (
        <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-200">No Production Sets Found</h3>
          <p className="text-xs mt-1">Try adjusting your search criteria or create a new set.</p>
        </div>
      )}

      {/* Modal for Create / Edit Set */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
              <h3 className="font-bold text-slate-100">
                {editingSet ? `Edit Set ${editingSet.setNumber}` : 'Create New Production Set'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Set Number *
                  </label>
                  <input
                    type="text"
                    value={setNumber}
                    onChange={(e) => setSetNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 001, 002, 003"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono tracking-wide focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SetStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Machine Designation *
                </label>
                <input
                  type="text"
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  placeholder="e.g. 500T Precision Injection Press #01"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Material Code *
                  </label>
                  <input
                    type="text"
                    value={materialCode}
                    onChange={(e) => setMaterialCode(e.target.value)}
                    placeholder="e.g. SKD61, DC53, H13"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Start Date First Use *
                  </label>
                  <input
                    type="date"
                    value={startDateFirstUse}
                    onChange={(e) => setStartDateFirstUse(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-750">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Previous Total Cycle
                  </label>
                  <input
                    type="number"
                    value={previousTotalCycle}
                    onChange={(e) => setPreviousTotalCycle(parseInt(e.target.value) || 0)}
                    disabled={!!editingSet}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Warning Threshold
                  </label>
                  <input
                    type="number"
                    value={cycleLimitWarning}
                    onChange={(e) => setCycleLimitWarning(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                    Max Replacement Due
                  </label>
                  <input
                    type="number"
                    value={cycleLimitMax}
                    onChange={(e) => setCycleLimitMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-rose-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Set Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Critical automotive housing die set. Maintain strict PM logs."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  Save Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Remove Set */}
      {setToDeleteForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-rose-500/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-100 text-sm">Confirm Remove Set</h3>
              </div>
              <button
                onClick={() => setSetToDeleteForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Production Set:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">
                    #{setToDeleteForModal.setNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                  <span>Assigned Machine:</span>
                  <span className="font-semibold text-slate-200">{setToDeleteForModal.machine}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                  <span>Current Set Cycle:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {setToDeleteForModal.currentTotalSetCycle.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                  <span>Component Plates:</span>
                  <span className="font-semibold text-amber-400">
                    {plates.filter((p) => p.setId === setToDeleteForModal.id).length} Plates
                  </span>
                </div>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 leading-relaxed">
                <p className="font-semibold mb-1">⚠️ Permanent Action Warning:</p>
                Are you sure you want to remove <strong>Production Set #{setToDeleteForModal.setNumber}</strong>?
                This action will delete the set entry along with all associated 11 plate records and cycle logs.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSetToDeleteForModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeSet(setToDeleteForModal.id);
                    setSetToDeleteForModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Remove Production Set</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
