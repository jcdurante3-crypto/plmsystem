import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Plus, Search, RefreshCw, Layers, Calculator, Calendar, User, CheckCircle2 } from 'lucide-react';

export const CycleMonitoring: React.FC = () => {
  const {
    sets,
    cycleEntries,
    setIsNewCycleModalOpen,
    setSelectedSetForModal,
  } = useApp();

  const [selectedSetId, setSelectedSetId] = useState<string>(sets[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const currentSet = sets.find((s) => s.id === selectedSetId) || sets[0];

  const setCycleEntries = cycleEntries.filter((e) => e.setId === (currentSet?.id || ''));

  const filteredEntries = setCycleEntries.filter((e) => {
    return (
      e.jobOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.checkedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.date.includes(searchTerm)
    );
  });

  const totalLoggedCycles = setCycleEntries.reduce((sum, e) => sum + e.cycles, 0);
  const calculatedSetTotal = currentSet ? currentSet.previousTotalCycle + totalLoggedCycles : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Cycle Monitoring Sheet (Module 5)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log shift production cycles per job order. Auto-calculates Set Total Cycle = Previous Total + Sum of Cycle Entries.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentSet) setSelectedSetForModal(currentSet);
            setIsNewCycleModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Cycle Entry (F4)</span>
        </button>
      </div>

      {/* Set Selector Dropdown & Header Card */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Set:</span>
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
            >
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.setNumber} - {s.machine}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Machine: <strong className="text-slate-200">{currentSet?.machine}</strong></span>
            <span>•</span>
            <span>Material: <strong className="text-slate-200">{currentSet?.materialCode}</strong></span>
          </div>
        </div>

        {/* Master Formula Calculation Card */}
        {currentSet && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-750">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Start Date First Use</span>
              <span className="text-sm font-bold font-mono text-slate-200 mt-1 block">{currentSet.startDateFirstUse}</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-750">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Previous Total Cycle</span>
              <span className="text-sm font-bold font-mono text-slate-200 mt-1 block">{currentSet.previousTotalCycle.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-750">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">+ Logged Cycle Entries</span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">+{totalLoggedCycles.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
              <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider block">= Current Total Set Cycle</span>
              <span className="text-lg font-bold font-mono text-emerald-300 mt-0.5 block">{calculatedSetTotal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cycle Log Entries Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Cycle Log Sheet Entries for {currentSet?.setNumber}
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Job Order, Operator..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-750">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Job Order #</th>
                <th className="px-4 py-3 text-right">Cycles Produced</th>
                <th className="px-4 py-3">Operator Name</th>
                <th className="px-4 py-3">Checked By</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{entry.date}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-100">
                    {entry.jobOrder}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    +{entry.cycles.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-slate-200">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{entry.operatorName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{entry.checkedBy}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-[10px] text-slate-500 font-mono">
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <Activity className="w-8 h-8 mx-auto text-slate-600 mb-1" />
            <p className="text-xs font-semibold text-slate-300">No Cycle Entries Logged For This Set Yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Click "Log New Cycle Entry" or press F4 to add production run cycles.</p>
          </div>
        )}
      </div>
    </div>
  );
};
