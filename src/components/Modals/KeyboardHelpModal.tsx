import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Keyboard, Command } from 'lucide-react';

export const KeyboardHelpModal: React.FC = () => {
  const { isKeyboardHelpOpen, setIsKeyboardHelpOpen } = useApp();

  if (!isKeyboardHelpOpen) return null;

  const shortcuts = [
    { key: 'F2', label: 'New Plate Registration', description: 'Quickly register a new plate serial number to a set' },
    { key: 'F3', label: 'Global Search Everywhere', description: 'Jump directly to global multi-field search center' },
    { key: 'F4', label: 'New Cycle Entry Sheet', description: 'Log production cycles for a production set' },
    { key: 'F5', label: 'Replacement Plate Log', description: 'Open automated plate replacement wizard' },
    { key: 'F6', label: 'Backup & Database Tools', description: 'Export JSON/SQLite local database backup or restore' },
    { key: 'F7', label: 'Print Reports', description: 'Generate and print lifecycle, audit, or set reports' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Industrial Hotkeys (F2 - F7)</h3>
              <p className="text-xs text-slate-400">High-speed keyboard navigation for shop floor terminals</p>
            </div>
          </div>
          <button
            onClick={() => setIsKeyboardHelpOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center gap-3 p-2.5 bg-slate-800/60 rounded-lg border border-slate-750">
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-slate-950 bg-cyan-400 rounded shadow-sm shrink-0">
                {sc.key}
              </kbd>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-200">{sc.label}</h4>
                <p className="text-[11px] text-slate-400 truncate">{sc.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsKeyboardHelpOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
