import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, FileText, CheckSquare, AlertTriangle, ShieldCheck, User, Calendar, X } from 'lucide-react';
import { PlateHistoryRecord, FinalEvaluation, RejectType } from '../types';

export const PlateHistory: React.FC = () => {
  const { plateHistory } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<PlateHistoryRecord | null>(null);

  const filteredHistory = plateHistory.filter((rec) => {
    const matchesSearch =
      rec.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.setNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.rejectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.evaluatedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEval = evaluationFilter === 'ALL' || rec.finalEvaluation === evaluationFilter;

    return matchesSearch && matchesEval;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Plate History Record (Module 4)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal historical evaluation records with achieved cycle calculations and defect breakdown.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Serial, Set #, Position, Defect Cause, Inspector..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Evaluation:</span>
          <select
            value={evaluationFilter}
            onChange={(e) => setEvaluationFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Evaluations</option>
            <option value="Rejected">Rejected</option>
            <option value="Retired">Retired</option>
            <option value="Replaced">Replaced</option>
          </select>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-750">
                <th className="px-4 py-3">Serial & Position</th>
                <th className="px-4 py-3">Set Number</th>
                <th className="px-4 py-3">Installation / Removal</th>
                <th className="px-4 py-3 text-right">Cycle Info</th>
                <th className="px-4 py-3 text-right font-bold text-cyan-400">Total Cycles Achieved</th>
                <th className="px-4 py-3">Final Evaluation</th>
                <th className="px-4 py-3">Reject Types</th>
                <th className="px-4 py-3 text-center">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  {/* Serial & Position */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-100 text-sm">{rec.serialNumber}</div>
                    <div className="text-[11px] text-cyan-400 font-medium">{rec.position}</div>
                  </td>

                  {/* Set Number */}
                  <td className="px-4 py-3 font-mono text-slate-300 font-semibold">
                    {rec.setNumber}
                  </td>

                  {/* Install / Removal */}
                  <td className="px-4 py-3 text-slate-300 text-[11px] font-mono">
                    <div>In: {rec.installationDate}</div>
                    <div className="text-slate-400">Out: {rec.removalDate}</div>
                  </td>

                  {/* Cycle Info */}
                  <td className="px-4 py-3 text-right text-[11px] font-mono text-slate-400">
                    <div>In @ {rec.installedAtCycle.toLocaleString()}</div>
                    <div>Out @ {rec.removedAtCycle.toLocaleString()}</div>
                  </td>

                  {/* Total Cycles Achieved */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono font-bold text-cyan-400 text-base">
                      {rec.totalCyclesAchieved.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Formula: Out - In
                    </span>
                  </td>

                  {/* Final Evaluation Badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rec.finalEvaluation === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rec.finalEvaluation === 'Retired'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.finalEvaluation}
                    </span>
                  </td>

                  {/* Reject Types */}
                  <td className="px-4 py-3 max-w-xs">
                    {rec.rejectTypes && rec.rejectTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rec.rejectTypes.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">None / Normal Retirement</span>
                    )}
                  </td>

                  {/* Inspect Button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
                      title="View Detailed History Record Sheet"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No History Records Found</h3>
            <p className="text-xs mt-1">Plate history records are automatically created upon plate replacement or retirement.</p>
          </div>
        )}
      </div>

      {/* Detail Record Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100">Plate History Record Sheet</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Top Summary */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-750 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Plate Serial Number</span>
                  <span className="text-base font-bold font-mono text-slate-100">{selectedRecord.serialNumber}</span>
                  <span className="text-cyan-400 block font-medium mt-0.5">{selectedRecord.position}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Production Set</span>
                  <span className="text-base font-bold font-mono text-slate-100">{selectedRecord.setNumber}</span>
                  <span className="text-slate-400 block mt-0.5">Evaluated By: {selectedRecord.evaluatedBy}</span>
                </div>
              </div>

              {/* Cycle Math Box */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-slate-400 text-[10px] block">Installed At Cycle</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{selectedRecord.installedAtCycle.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Removed At Cycle</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{selectedRecord.removedAtCycle.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                  <span className="text-cyan-400 text-[10px] block font-bold">Total Cycles Achieved</span>
                  <span className="font-mono font-bold text-cyan-300 text-lg">{selectedRecord.totalCyclesAchieved.toLocaleString()}</span>
                </div>
              </div>

              {/* Evaluation & Defect Details */}
              <div className="space-y-2 p-4 bg-slate-800/40 rounded-xl border border-slate-750">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Final Plate Evaluation</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedRecord.finalEvaluation === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {selectedRecord.finalEvaluation}
                  </span>
                </div>

                {selectedRecord.rejectTypes && selectedRecord.rejectTypes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block mb-1">Defect Flag Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecord.rejectTypes.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.rejectDescription && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">Reject Description:</span>
                    <p className="text-slate-200 font-medium">{selectedRecord.rejectDescription}</p>
                  </div>
                )}

                {selectedRecord.sourceOfReject && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px] block">Source Of Reject:</span>
                    <p className="text-slate-200 font-medium">{selectedRecord.sourceOfReject}</p>
                  </div>
                )}

                {selectedRecord.remarksCorrectiveAction && (
                  <div className="pt-2 border-t border-slate-750">
                    <span className="text-slate-400 text-[11px] block">Remarks / Corrective Action:</span>
                    <p className="text-slate-200 font-medium">{selectedRecord.remarksCorrectiveAction}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg"
                >
                  Close Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
