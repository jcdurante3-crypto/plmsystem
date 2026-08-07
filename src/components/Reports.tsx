import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileSpreadsheet, Printer, Download, FileText, CheckCircle2, Layers, History, ArrowRightLeft, Activity, Database } from 'lucide-react';

type ReportType =
  | 'Plate History Report'
  | 'Active Plate Report'
  | 'Rejected Plate Report'
  | 'Retired Plate Report'
  | 'Replacement History Report'
  | 'Cycle Monitoring Report'
  | 'Set Summary Report';

export const Reports: React.FC = () => {
  const { plates, sets, plateHistory, cycleEntries, replacementLogs } = useApp();

  const [selectedReport, setSelectedReport] = useState<ReportType>('Plate History Report');

  const reportTypes: { id: ReportType; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'Plate History Report', label: 'Plate History Report', description: 'Comprehensive history of evaluated, replaced, and retired plates', icon: <History className="w-4 h-4 text-cyan-400" /> },
    { id: 'Active Plate Report', label: 'Active Plate Report', description: 'Currently installed active plates across all production sets', icon: <Database className="w-4 h-4 text-emerald-400" /> },
    { id: 'Rejected Plate Report', label: 'Rejected Plate Report', description: 'Defect breakdown report for scrapped and rejected plates', icon: <FileText className="w-4 h-4 text-rose-400" /> },
    { id: 'Retired Plate Report', label: 'Retired Plate Report', description: 'Normal end-of-life decommissioned plate lifecycle summary', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    { id: 'Replacement History Report', label: 'Replacement History Report', description: 'Audit log of component swap events and reasons', icon: <ArrowRightLeft className="w-4 h-4 text-amber-400" /> },
    { id: 'Cycle Monitoring Report', label: 'Cycle Monitoring Report', description: 'Shift-by-shift job order cycle logs and totals', icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { id: 'Set Summary Report', label: 'Set Summary Report', description: 'Master set overview with Total Set No. Cycle tracking', icon: <Layers className="w-4 h-4 text-indigo-400" /> },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `${selectedReport.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReport === 'Plate History Report') {
      rows = [
        ['Serial Number', 'Set Number', 'Position', 'Install Date', 'Removal Date', 'Installed Cycle', 'Removed Cycle', 'Achieved Cycles', 'Evaluation', 'Reject Types', 'Description'],
        ...plateHistory.map((h) => [
          h.serialNumber,
          h.setNumber,
          h.position,
          h.installationDate,
          h.removalDate,
          String(h.installedAtCycle),
          String(h.removedAtCycle),
          String(h.totalCyclesAchieved),
          h.finalEvaluation,
          (h.rejectTypes || []).join('; '),
          `"${(h.rejectDescription || '').replace(/"/g, '""')}"`,
        ]),
      ];
    } else if (selectedReport === 'Active Plate Report') {
      const active = plates.filter((p) => p.status === 'Active' || p.status === 'Installed');
      rows = [
        ['Serial Number', 'Set Number', 'Position', 'Install Date', 'Installed Cycle', 'Current Set Cycle', 'Achieved Cycles', 'Created By'],
        ...active.map((p) => {
          const s = sets.find((set) => set.id === p.setId);
          return [
            p.serialNumber,
            s ? s.setNumber : '',
            p.position,
            p.installationDate,
            String(p.installedAtCycle),
            String(s ? s.currentTotalSetCycle : 0),
            String(p.totalCyclesAchieved),
            p.createdBy,
          ];
        }),
      ];
    } else if (selectedReport === 'Rejected Plate Report') {
      const rejected = plateHistory.filter((h) => h.finalEvaluation === 'Rejected');
      rows = [
        ['Serial Number', 'Set Number', 'Position', 'Removal Date', 'Achieved Cycles', 'Reject Types', 'Description', 'Source', 'Evaluated By'],
        ...rejected.map((h) => [
          h.serialNumber,
          h.setNumber,
          h.position,
          h.removalDate,
          String(h.totalCyclesAchieved),
          (h.rejectTypes || []).join('; '),
          `"${(h.rejectDescription || '').replace(/"/g, '""')}"`,
          h.sourceOfReject || '',
          h.evaluatedBy,
        ]),
      ];
    } else if (selectedReport === 'Retired Plate Report') {
      const retired = plateHistory.filter((h) => h.finalEvaluation === 'Retired');
      rows = [
        ['Serial Number', 'Set Number', 'Position', 'Removal Date', 'Achieved Cycles', 'Evaluated By'],
        ...retired.map((h) => [
          h.serialNumber,
          h.setNumber,
          h.position,
          h.removalDate,
          String(h.totalCyclesAchieved),
          h.evaluatedBy,
        ]),
      ];
    } else if (selectedReport === 'Replacement History Report') {
      rows = [
        ['Set Number', 'Position', 'Old Plate Serial', 'New Plate Serial', 'Install Date', 'Install Cycle', 'Replacement Reason', 'Performed By'],
        ...replacementLogs.map((r) => [
          r.setNumber,
          r.position,
          r.oldPlateSerialNumber,
          r.newPlateSerialNumber,
          r.installDate,
          String(r.installCycle),
          r.replacementReason,
          r.performedBy,
        ]),
      ];
    } else if (selectedReport === 'Cycle Monitoring Report') {
      rows = [
        ['Date', 'Set Number', 'Job Order', 'Cycles', 'Operator Name', 'Checked By'],
        ...cycleEntries.map((c) => [
          c.date,
          c.setNumber,
          c.jobOrder,
          String(c.cycles),
          c.operatorName,
          c.checkedBy,
        ]),
      ];
    } else if (selectedReport === 'Set Summary Report') {
      rows = [
        ['Set Number', 'Machine', 'Material Code', 'Start Date First Use', 'Previous Total Cycle', 'Current Total Set Cycle', 'Status'],
        ...sets.map((s) => [
          s.setNumber,
          s.machine,
          s.materialCode,
          s.startDateFirstUse,
          String(s.previousTotalCycle),
          String(s.currentTotalSetCycle),
          s.status,
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Printable CSS block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px;
          }
          #printable-report table {
            border-collapse: collapse;
            width: 100%;
          }
          #printable-report th, #printable-report td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            color: #000000 !important;
          }
          #printable-report th {
            background-color: #f1f5f9 !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Printable Reports & Data Exports (Module 8)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate industrial manufacturing reports for Quality Control, Audit compliance, and Tooling Management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (F7)</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {reportTypes.map((r) => {
          const isSelected = selectedReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                {r.icon}
                <span className="text-xs tracking-tight line-clamp-1">{r.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Printable Report Canvas Area */}
      <div id="printable-report" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        {/* Report Header Block */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              PLATE LIFECYCLE MONITORING SYSTEM • INDUSTRIAL REPORT
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">{selectedReport}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Generated Date: <span className="font-mono font-medium text-slate-300">{new Date().toLocaleString()}</span>
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-750 text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Master Reference Standard</span>
            <span className="text-cyan-400 font-bold font-mono">TOTAL SET NO. CYCLE</span>
            <span className="text-[10px] text-slate-500 block">Offline Local Database Sync</span>
          </div>
        </div>

        {/* Dynamic Report Content Table */}
        <div className="overflow-x-auto">
          {selectedReport === 'Plate History Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Serial Number</th>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Position</th>
                  <th className="p-2.5">Install Date</th>
                  <th className="p-2.5">Removal Date</th>
                  <th className="p-2.5 text-right">In Cycle</th>
                  <th className="p-2.5 text-right">Out Cycle</th>
                  <th className="p-2.5 text-right font-bold text-cyan-400">Achieved</th>
                  <th className="p-2.5">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plateHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="p-2.5 font-mono font-bold text-slate-100">{h.serialNumber}</td>
                    <td className="p-2.5 font-mono text-slate-300">{h.setNumber}</td>
                    <td className="p-2.5 text-slate-300">{h.position}</td>
                    <td className="p-2.5 font-mono text-slate-400">{h.installationDate}</td>
                    <td className="p-2.5 font-mono text-slate-400">{h.removalDate}</td>
                    <td className="p-2.5 text-right font-mono text-slate-400">{h.installedAtCycle.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono text-slate-400">{h.removedAtCycle.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-cyan-400">{h.totalCyclesAchieved.toLocaleString()}</td>
                    <td className="p-2.5 font-bold uppercase text-[10px] text-amber-400">{h.finalEvaluation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'Active Plate Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Serial Number</th>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Position</th>
                  <th className="p-2.5">Install Date</th>
                  <th className="p-2.5 text-right">Install Cycle</th>
                  <th className="p-2.5 text-right">Current Set Cycle</th>
                  <th className="p-2.5 text-right font-bold text-emerald-400">Achieved Cycles</th>
                  <th className="p-2.5">Registered By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plates.filter((p) => p.status === 'Active' || p.status === 'Installed').map((p) => {
                  const s = sets.find((set) => set.id === p.setId);
                  return (
                    <tr key={p.id}>
                      <td className="p-2.5 font-mono font-bold text-emerald-400">{p.serialNumber}</td>
                      <td className="p-2.5 font-mono text-slate-300">{s?.setNumber || '—'}</td>
                      <td className="p-2.5 text-slate-300">{p.position}</td>
                      <td className="p-2.5 font-mono text-slate-400">{p.installationDate}</td>
                      <td className="p-2.5 text-right font-mono text-slate-400">{p.installedAtCycle.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">{s?.currentTotalSetCycle.toLocaleString() || 0}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400">{p.totalCyclesAchieved.toLocaleString()}</td>
                      <td className="p-2.5 text-slate-400">{p.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedReport === 'Rejected Plate Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Serial Number</th>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Position</th>
                  <th className="p-2.5">Removal Date</th>
                  <th className="p-2.5 text-right font-bold text-rose-400">Achieved Cycles</th>
                  <th className="p-2.5">Reject Defect Types</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Evaluated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plateHistory.filter((h) => h.finalEvaluation === 'Rejected').map((h) => (
                  <tr key={h.id}>
                    <td className="p-2.5 font-mono font-bold text-rose-300">{h.serialNumber}</td>
                    <td className="p-2.5 font-mono text-slate-300">{h.setNumber}</td>
                    <td className="p-2.5 text-slate-300">{h.position}</td>
                    <td className="p-2.5 font-mono text-slate-400">{h.removalDate}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-rose-400">{h.totalCyclesAchieved.toLocaleString()}</td>
                    <td className="p-2.5 text-rose-300 font-medium">{(h.rejectTypes || []).join(', ')}</td>
                    <td className="p-2.5 text-slate-300 max-w-xs">{h.rejectDescription || 'N/A'}</td>
                    <td className="p-2.5 text-slate-400">{h.evaluatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'Retired Plate Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Serial Number</th>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Position</th>
                  <th className="p-2.5">Removal Date</th>
                  <th className="p-2.5 text-right font-bold text-purple-400">Achieved Cycles</th>
                  <th className="p-2.5">Evaluated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plateHistory.filter((h) => h.finalEvaluation === 'Retired').map((h) => (
                  <tr key={h.id}>
                    <td className="p-2.5 font-mono font-bold text-purple-300">{h.serialNumber}</td>
                    <td className="p-2.5 font-mono text-slate-300">{h.setNumber}</td>
                    <td className="p-2.5 text-slate-300">{h.position}</td>
                    <td className="p-2.5 font-mono text-slate-400">{h.removalDate}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-purple-400">{h.totalCyclesAchieved.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-400">{h.evaluatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'Replacement History Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Set Number</th>
                  <th className="p-2.5">Position</th>
                  <th className="p-2.5">Old Serial (Removed)</th>
                  <th className="p-2.5">New Serial (Active)</th>
                  <th className="p-2.5">Install Date</th>
                  <th className="p-2.5 text-right">Install Cycle</th>
                  <th className="p-2.5">Replacement Reason</th>
                  <th className="p-2.5">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {replacementLogs.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-mono font-bold text-slate-100">{r.setNumber}</td>
                    <td className="p-2.5 text-slate-300">{r.position}</td>
                    <td className="p-2.5 font-mono line-through text-rose-400">{r.oldPlateSerialNumber}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-400">{r.newPlateSerialNumber}</td>
                    <td className="p-2.5 font-mono text-slate-400">{r.installDate}</td>
                    <td className="p-2.5 text-right font-mono text-slate-300">{r.installCycle.toLocaleString()}</td>
                    <td className="p-2.5 font-bold text-amber-400">{r.replacementReason}</td>
                    <td className="p-2.5 text-slate-400">{r.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'Cycle Monitoring Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Set #</th>
                  <th className="p-2.5">Job Order</th>
                  <th className="p-2.5 text-right font-bold text-emerald-400">Cycles Produced</th>
                  <th className="p-2.5">Operator Name</th>
                  <th className="p-2.5">Checked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cycleEntries.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2.5 font-mono text-slate-300">{c.date}</td>
                    <td className="p-2.5 font-mono text-slate-100 font-bold">{c.setNumber}</td>
                    <td className="p-2.5 font-mono text-slate-200">{c.jobOrder}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-400">+{c.cycles.toLocaleString()}</td>
                    <td className="p-2.5 text-slate-300">{c.operatorName}</td>
                    <td className="p-2.5 text-slate-400">{c.checkedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'Set Summary Report' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-bold uppercase text-[10px] border-b border-slate-700">
                  <th className="p-2.5">Set Number</th>
                  <th className="p-2.5">Machine</th>
                  <th className="p-2.5">Material Code</th>
                  <th className="p-2.5">Start Date First Use</th>
                  <th className="p-2.5 text-right">Previous Total Cycle</th>
                  <th className="p-2.5 text-right font-bold text-cyan-400">Current Total Set Cycle</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sets.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2.5 font-mono font-bold text-slate-100">{s.setNumber}</td>
                    <td className="p-2.5 text-slate-200">{s.machine}</td>
                    <td className="p-2.5 text-slate-300">{s.materialCode}</td>
                    <td className="p-2.5 font-mono text-slate-400">{s.startDateFirstUse}</td>
                    <td className="p-2.5 text-right font-mono text-slate-400">{s.previousTotalCycle.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-cyan-400">{s.currentTotalSetCycle.toLocaleString()}</td>
                    <td className="p-2.5 font-bold uppercase text-[10px] text-emerald-400">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Report Signatures Footer */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <div className="border-b border-slate-700 h-10 w-48 mb-1"></div>
            <p className="font-semibold text-slate-300">Tooling Engineer Signature / Date</p>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="border-b border-slate-700 h-10 w-48 mb-1"></div>
            <p className="font-semibold text-slate-300">QA / Maintenance Manager Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};
