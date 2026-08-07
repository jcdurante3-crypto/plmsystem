import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Database, Layers, History, ArrowRightLeft, Calendar, Tag, User } from 'lucide-react';

export const SearchCenter: React.FC = () => {
  const {
    plates,
    sets,
    plateHistory,
    replacementLogs,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectTypeFilter, setRejectTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query = globalSearchQuery.toLowerCase().trim();

  // Matched Plates
  const matchedPlates = plates.filter((plate) => {
    const parentSet = sets.find((s) => s.id === plate.setId);
    const setNum = parentSet ? parentSet.setNumber : '';
    const matCode = parentSet ? parentSet.materialCode : '';
    const mach = parentSet ? parentSet.machine : '';

    const textMatch =
      !query ||
      plate.serialNumber.toLowerCase().includes(query) ||
      plate.position.toLowerCase().includes(query) ||
      setNum.toLowerCase().includes(query) ||
      matCode.toLowerCase().includes(query) ||
      mach.toLowerCase().includes(query) ||
      plate.createdBy.toLowerCase().includes(query);

    const statusMatch = statusFilter === 'ALL' || plate.status === statusFilter;

    let dateMatch = true;
    if (dateFrom && plate.installationDate < dateFrom) dateMatch = false;
    if (dateTo && plate.installationDate > dateTo) dateMatch = false;

    return textMatch && statusMatch && dateMatch;
  });

  // Matched Plate History Records
  const matchedHistory = plateHistory.filter((rec) => {
    const textMatch =
      !query ||
      rec.serialNumber.toLowerCase().includes(query) ||
      rec.setNumber.toLowerCase().includes(query) ||
      rec.position.toLowerCase().includes(query) ||
      rec.rejectDescription.toLowerCase().includes(query) ||
      rec.sourceOfReject.toLowerCase().includes(query) ||
      rec.evaluatedBy.toLowerCase().includes(query);

    const statusMatch = statusFilter === 'ALL' || rec.finalEvaluation === statusFilter;

    let rejectMatch = true;
    if (rejectTypeFilter !== 'ALL') {
      rejectMatch = rec.rejectTypes ? rec.rejectTypes.includes(rejectTypeFilter as any) : false;
    }

    let dateMatch = true;
    if (dateFrom && rec.removalDate < dateFrom) dateMatch = false;
    if (dateTo && rec.removalDate > dateTo) dateMatch = false;

    return textMatch && statusMatch && rejectMatch && dateMatch;
  });

  // Matched Replacement Logs
  const matchedReplacements = replacementLogs.filter((log) => {
    const textMatch =
      !query ||
      log.oldPlateSerialNumber.toLowerCase().includes(query) ||
      log.newPlateSerialNumber.toLowerCase().includes(query) ||
      log.setNumber.toLowerCase().includes(query) ||
      log.position.toLowerCase().includes(query) ||
      log.replacementReason.toLowerCase().includes(query) ||
      log.performedBy.toLowerCase().includes(query);

    let dateMatch = true;
    if (dateFrom && log.installDate < dateFrom) dateMatch = false;
    if (dateTo && log.installDate > dateTo) dateMatch = false;

    return textMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Global Search Center (Module 7)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-field deep search across Plate Serials, Positions, Sets, Machines, Materials, Reject Types & Date ranges.
          </p>
        </div>
      </div>

      {/* Advanced Filter Control Box */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4 shadow-lg">
        {/* Main Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Type serial number, position, set number, defect code, machine name, operator..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active / Installed</option>
              <option value="Replaced">Replaced</option>
              <option value="Rejected">Rejected</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reject Type Filter</label>
            <select
              value={rejectTypeFilter}
              onChange={(e) => setRejectTypeFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Reject Types</option>
              <option value="Excessive Wear">Excessive Wear</option>
              <option value="Crack">Crack</option>
              <option value="Chipping">Chipping</option>
              <option value="Surface Damage">Surface Damage</option>
              <option value="Dimension Failure">Dimension Failure</option>
              <option value="Dent">Dent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Results Sections */}
      <div className="space-y-6">
        {/* Section 1: Plate Master Results */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Plate Master Results ({matchedPlates.length})
            </h3>
          </div>

          {matchedPlates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedPlates.map((plate) => {
                const parentSet = sets.find((s) => s.id === plate.setId);
                return (
                  <div key={plate.id} className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-750 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-sm">{plate.serialNumber}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                        {plate.status}
                      </span>
                    </div>
                    <div className="text-slate-200 font-medium">{plate.position}</div>
                    <div className="text-slate-400 text-[11px]">Set: {parentSet?.setNumber} ({parentSet?.machine})</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-750">
                      <span>Installed: {plate.installationDate}</span>
                      <span className="font-mono font-bold text-cyan-300">{plate.totalCyclesAchieved.toLocaleString()} cycles</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">No matching plates found for criteria.</p>
          )}
        </div>

        {/* Section 2: History & Evaluation Records */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Plate History & Evaluation Results ({matchedHistory.length})
            </h3>
          </div>

          {matchedHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchedHistory.map((rec) => (
                <div key={rec.id} className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-750 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-100">{rec.serialNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rec.finalEvaluation === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {rec.finalEvaluation}
                    </span>
                  </div>
                  <div className="text-cyan-400 font-medium">{rec.position} • Set {rec.setNumber}</div>
                  <div className="text-slate-300 text-[11px]">
                    Achieved: <strong className="font-mono text-cyan-300">{rec.totalCyclesAchieved.toLocaleString()} cycles</strong> (Out @ {rec.removedAtCycle.toLocaleString()})
                  </div>
                  {rec.rejectDescription && (
                    <p className="text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-900/40">
                      "{rec.rejectDescription}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">No matching history records found.</p>
          )}
        </div>

        {/* Section 3: Replacement Logs */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              Replacement Event Logs ({matchedReplacements.length})
            </h3>
          </div>

          {matchedReplacements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchedReplacements.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-750 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-100">{log.setNumber} [{log.position}]</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {log.replacementReason}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-mono">
                    Swapped: <span className="line-through text-rose-400">{log.oldPlateSerialNumber}</span> &rarr;{' '}
                    <span className="text-emerald-400 font-bold">{log.newPlateSerialNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-750">
                    <span>Date: {log.installDate} (@ {log.installCycle.toLocaleString()} cycles)</span>
                    <span>By: {log.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">No matching replacement log entries found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
