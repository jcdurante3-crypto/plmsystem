import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { HardDriveDownload, Upload, Download, RefreshCw, Database, Terminal, ShieldCheck, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { db } from '../db/storage';
import { DatabaseDump } from '../types';

export const BackupRestore: React.FC = () => {
  const { addToast, refreshData, resetDatabase } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackupDatabase = () => {
    try {
      const dump = db.exportFullDatabase();
      const filename = `backup_plate_monitoring_${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast('success', 'Database Backup Exported', `Saved backup file: ${filename}`);
    } catch (err: any) {
      addToast('error', 'Backup Failed', err?.message || 'Failed to export database backup');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const dump: DatabaseDump = JSON.parse(content);
        db.restoreDatabase(dump, 'System Admin / Restore Tool');
        refreshData();
        addToast('success', 'Database Restored', 'System state successfully restored from backup file.');
      } catch (err: any) {
        addToast('error', 'Restore Failed', 'Invalid or corrupted backup JSON file.');
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-cyan-400" />
            Offline Backup, Restore & Electron EXE Specs (Module 10)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% offline data safety. Backup, restore, or port database files beside your Portable Windows EXE executable.
          </p>
        </div>
      </div>

      {/* Backup / Restore Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup Card */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Backup Database</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export full offline database state (Sets, Plates, History, Cycles, Replacement Logs, Audit Trail) into a local JSON / SQLite-compatible backup.
            </p>
          </div>

          <button
            onClick={handleBackupDatabase}
            className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.db / .json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Restore Database</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select or drop a previously exported database backup file to restore complete system records instantly.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.db"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isRestoring ? 'Restoring...' : 'Restore From File'}</span>
          </button>
        </div>

        {/* Reset Sample Data Card */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Reset Sample Dataset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset database to pre-populated industrial manufacturing sample data for testing set cycles & plate replacement workflows.
            </p>
          </div>

          <button
            onClick={resetDatabase}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Restore Default Sample Data</span>
          </button>
        </div>
      </div>

      {/* Electron & Portable EXE Integration Specifications */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Portable Windows EXE & Electron Build Specs</h3>
            <p className="text-xs text-slate-400">Packaging structure for offline single executable deployment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-750 space-y-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Local Folder Path</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When compiled into a Portable Windows EXE with Electron, local SQLite database files sit beside the executable:
            </p>
            <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-cyan-300 text-[11px] border border-slate-800 space-y-1">
              <div>/Data/plate_monitoring.db</div>
              <div>/Backup/backup_yyyy_mm_dd.db</div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-750 space-y-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Zero-Admin Execution Requirements</span>
            </div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Runs on Windows 10 & Windows 11 without admin rights.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>IndexedDB fallback for web/PWA mode + SQLite for Electron.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No cloud network connection required. Fully offline-first.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
