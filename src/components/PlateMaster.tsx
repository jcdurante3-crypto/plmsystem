import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Plus, Search, ArrowRightLeft, ShieldCheck, Clock, User, Calendar, Tag } from 'lucide-react';
import { PlateStatus } from '../types';

export const PlateMaster: React.FC = () => {
  const {
    plates,
    sets,
    setIsNewPlateModalOpen,
    setIsReplacementModalOpen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [setFilter, setSetFilter] = useState<string>('ALL');

  const filteredPlates = plates.filter((plate) => {
    const parentSet = sets.find((s) => s.id === plate.setId);
    const setNumber = parentSet ? parentSet.setNumber : '';

    const matchesSearch =
      plate.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || plate.status === statusFilter;
    const matchesSet = setFilter === 'ALL' || plate.setId === setFilter;

    return matchesSearch && matchesStatus && matchesSet;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Plate Master Database (Module 3)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Central repository of all plate serial numbers, positions, current statuses & lifecycle cycle accumulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPlateModalOpen(true)}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Plate (F2)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Serial Number, Position, Set Number, Operator..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Set:</span>
            <select
              value={setFilter}
              onChange={(e) => setSetFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sets</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.setNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active / Installed</option>
              <option value="Replaced">Replaced</option>
              <option value="Rejected">Rejected</option>
              <option value="Retired">Retired</option>
              <option value="Removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plates Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-750">
                <th className="px-4 py-3">Plate Serial Number</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Set Number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Install Date</th>
                <th className="px-4 py-3 text-right">Removal Date</th>
                <th className="px-4 py-3 text-right">Achieved Cycles</th>
                <th className="px-4 py-3 text-right">System Info</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredPlates.map((plate) => {
                const parentSet = sets.find((s) => s.id === plate.setId);

                return (
                  <tr key={plate.id} className="hover:bg-slate-800/40 transition">
                    {/* Serial Number */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{plate.serialNumber}</span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {plate.position}
                    </td>

                    {/* Set Number */}
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      {parentSet?.setNumber || 'N/A'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          plate.status === 'Active' || plate.status === 'Installed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : plate.status === 'Replaced'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : plate.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {plate.status}
                      </span>
                    </td>

                    {/* Installation Date */}
                    <td className="px-4 py-3 text-right text-slate-300 font-mono">
                      {plate.installationDate}
                    </td>

                    {/* Removal Date */}
                    <td className="px-4 py-3 text-right text-slate-400 font-mono">
                      {plate.removalDate || '—'}
                    </td>

                    {/* Total Cycles Achieved */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {plate.totalCyclesAchieved.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-500">cycles</span>
                    </td>

                    {/* System Fields */}
                    <td className="px-4 py-3 text-right text-[10px] text-slate-400">
                      <div className="flex items-center justify-end gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{plate.createdBy}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(plate.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-center">
                      {plate.status === 'Active' || plate.status === 'Installed' ? (
                        <button
                          onClick={() => setIsReplacementModalOpen(true)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Replace
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlates.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Database className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No Plates Matched Filter</h3>
            <p className="text-xs mt-1">Adjust search input or register a new plate serial number.</p>
          </div>
        )}
      </div>
    </div>
  );
};
