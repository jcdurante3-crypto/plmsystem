import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRightLeft, Search, Plus, CheckCircle2, AlertTriangle, Calendar, User, Tag } from 'lucide-react';

export const ReplacementLog: React.FC = () => {
  const { replacementLogs, setIsReplacementModalOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');

  const filteredLogs = replacementLogs.filter((log) => {
    const matchesSearch =
      log.oldPlateSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newPlateSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.setNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason = reasonFilter === 'ALL' || log.replacementReason === reasonFilter;

    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            Replacement Plate Log & Automation (Module 6)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete record of all component swaps. Automated 8-step workflow closes old plate records, logs history & registers new active units.
          </p>
        </div>

        <button
          onClick={() => setIsReplacementModalOpen(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Execute Replacement Wizard (F5)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Old/New Serial #, Set Number, Position, Technician..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Reason:</span>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Reasons</option>
            <option value="Wear">Wear</option>
            <option value="Crack">Crack</option>
            <option value="Surface Damage">Surface Damage</option>
            <option value="Dent">Dent</option>
            <option value="Chipping">Chipping</option>
            <option value="Dimension Failure">Dimension Failure</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Replacement Logs Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-750">
                <th className="px-4 py-3">Set Number & Position</th>
                <th className="px-4 py-3">Old Serial Number (Removed)</th>
                <th className="px-4 py-3">New Serial Number (Active)</th>
                <th className="px-4 py-3 text-right">Install Date & Cycle</th>
                <th className="px-4 py-3">Replacement Reason</th>
                <th className="px-4 py-3">Technician / Engineer</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  {/* Set Number & Position */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-100">{log.setNumber}</div>
                    <div className="text-[11px] text-amber-400 font-medium">{log.position}</div>
                  </td>

                  {/* Old Serial */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-rose-300 line-through decoration-rose-500/80">
                      {log.oldPlateSerialNumber}
                    </div>
                    <span className="text-[10px] text-slate-500">Decommissioned</span>
                  </td>

                  {/* New Serial */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{log.newPlateSerialNumber}</span>
                    </div>
                    <span className="text-[10px] text-emerald-500/80 font-medium">New Active Unit</span>
                  </td>

                  {/* Install Date & Cycle */}
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    <div>{log.installDate}</div>
                    <div className="text-cyan-400 text-[11px]">
                      @ {log.installCycle.toLocaleString()} cycles
                    </div>
                  </td>

                  {/* Reason Badge */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {log.replacementReason}
                    </span>
                    {log.notes && (
                      <p className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">{log.notes}</p>
                    )}
                  </td>

                  {/* Performed By */}
                  <td className="px-4 py-3 text-slate-200">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.performedBy}</span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-3 text-right text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <ArrowRightLeft className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No Replacement Logs Found</h3>
            <p className="text-xs mt-1">Plate replacement events automatically log here when using the Replacement Wizard.</p>
          </div>
        )}
      </div>
    </div>
  );
};
