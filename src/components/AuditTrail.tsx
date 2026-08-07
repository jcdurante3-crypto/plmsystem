import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, Clock, User, Layers, Filter } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const textMatch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase());

    const actionMatch = actionFilter === 'ALL' || log.action === actionFilter;
    const moduleMatch = moduleFilter === 'ALL' || log.module === moduleFilter;

    return textMatch && actionMatch && moduleMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            System Audit Trail (Module 9)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable offline event log capturing all creation, modification, replacement, rejection, and cycle logging actions.
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
            placeholder="Search User, Details, Record ID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Actions</option>
              <option value="Create">Create</option>
              <option value="Edit">Edit</option>
              <option value="Replace">Replace</option>
              <option value="Reject">Reject</option>
              <option value="Retire">Retire</option>
              <option value="Cycle Log">Cycle Log</option>
              <option value="Restore">Restore</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Modules</option>
              <option value="Set Management">Set Management</option>
              <option value="Plate Master">Plate Master</option>
              <option value="Plate History">Plate History</option>
              <option value="Cycle Monitoring">Cycle Monitoring</option>
              <option value="Replacement Log">Replacement Log</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-750">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Activity Description</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-mono text-slate-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-200 font-semibold">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.user}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action === 'Create'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.action === 'Replace'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.action === 'Reject'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-300 font-medium">
                    {log.module}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                    {log.recordId}
                  </td>

                  <td className="px-4 py-3 text-slate-200 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No Audit Events Matched</h3>
            <p className="text-xs mt-1">Adjust search parameters or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
