import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, RefreshCw, Calculator } from 'lucide-react';

export const NewCycleEntryModal: React.FC = () => {
  const {
    isNewCycleModalOpen,
    setIsNewCycleModalOpen,
    sets,
    addCycleEntry,
    selectedSetForModal,
    setSelectedSetForModal,
    currentUser,
  } = useApp();

  const [setId, setSetId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [jobOrder, setJobOrder] = useState('');
  const [cycles, setCycles] = useState<number>(1000);
  const [operatorName, setOperatorName] = useState('R. Martinez');
  const [checkedBy, setCheckedBy] = useState(currentUser);

  useEffect(() => {
    if (selectedSetForModal) {
      setSetId(selectedSetForModal.id);
    } else if (sets.length > 0 && !setId) {
      setSetId(sets[0].id);
    }
  }, [selectedSetForModal, sets]);

  if (!isNewCycleModalOpen) return null;

  const currentSet = sets.find((s) => s.id === setId);
  const previousTotalCycle = currentSet ? currentSet.currentTotalSetCycle : 0;
  const newTotalCycle = previousTotalCycle + (Number(cycles) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setId || !jobOrder.trim() || !cycles || cycles <= 0) return;

    addCycleEntry({
      setId,
      setNumber: currentSet?.setNumber || 'UNKNOWN',
      date,
      jobOrder: jobOrder.trim().toUpperCase(),
      cycles: Number(cycles),
      operatorName: operatorName.trim(),
      checkedBy: checkedBy.trim(),
    });

    setIsNewCycleModalOpen(false);
    setSelectedSetForModal(null);
    setJobOrder('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Log Production Cycles (F4)</h3>
              <p className="text-xs text-slate-400">Update set Total Set No. Cycle and active plate baselines</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNewCycleModalOpen(false);
              setSelectedSetForModal(null);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Production Set *
            </label>
            <select
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select Production Set --</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.setNumber} - {s.machine} ({s.currentTotalSetCycle.toLocaleString()} cycles)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Log Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Job Order # *
              </label>
              <input
                type="text"
                value={jobOrder}
                onChange={(e) => setJobOrder(e.target.value.toUpperCase())}
                placeholder="e.g. JO-88412"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 uppercase tracking-wide focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Production Cycles Produced *
            </label>
            <input
              type="number"
              min="1"
              value={cycles}
              onChange={(e) => setCycles(parseInt(e.target.value) || 0)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Operator Name *
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Checked By *
              </label>
              <input
                type="text"
                value={checkedBy}
                onChange={(e) => setCheckedBy(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Master Calculation Live Preview Box */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Master Reference Cycle Calculation
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Previous Total</span>
                <span className="font-mono font-semibold text-slate-200">
                  {previousTotalCycle.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">+ Added</span>
                <span className="font-mono font-semibold text-emerald-400">
                  +{(Number(cycles) || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-emerald-950/60 rounded border border-emerald-800/60">
                <span className="text-emerald-400 block text-[10px] font-bold">= New Set Total</span>
                <span className="font-mono font-bold text-emerald-300">
                  {newTotalCycle.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsNewCycleModalOpen(false);
                setSelectedSetForModal(null);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg font-semibold transition"
            >
              Commit Cycle Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
