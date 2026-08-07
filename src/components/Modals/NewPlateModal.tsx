import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PlusCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PlateMaster } from '../../types';

export const NewPlateModal: React.FC = () => {
  const { isNewPlateModalOpen, setIsNewPlateModalOpen, sets, addOrUpdatePlate, isSerialNumberTaken, currentUser } = useApp();

  const [serialNumber, setSerialNumber] = useState('');
  const [setId, setSetId] = useState('');
  const [position, setPosition] = useState('');
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isNewPlateModalOpen) return null;

  const isDuplicate = serialNumber.trim().length > 0 && isSerialNumberTaken(serialNumber.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() || !setId || !position.trim()) return;

    if (isDuplicate) {
      return;
    }

    const targetSet = sets.find((s) => s.id === setId);
    const setCycle = targetSet ? targetSet.currentTotalSetCycle : 0;

    const newPlate: PlateMaster = {
      id: `plate-${Date.now()}`,
      serialNumber: serialNumber.trim().toUpperCase(),
      setId,
      position: position.trim(),
      installationDate,
      removalDate: null,
      status: 'Active',
      installedAtCycle: setCycle,
      removedAtCycle: null,
      totalCyclesAchieved: 0,
      createdBy: currentUser,
      modifiedBy: currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOrUpdatePlate(newPlate);
    setIsNewPlateModalOpen(false);
    // Reset form
    setSerialNumber('');
    setPosition('');
  };

  const handleAutoGenerateSerial = () => {
    const selectedSet = sets.find((s) => s.id === setId);
    const setDigits = selectedSet ? (selectedSet.setNumber.replace(/\D/g, '') || '001') : '001';
    const setNoStr = setDigits.slice(-3).padStart(3, '0');

    // Extract plate digits from position (e.g. "Plate #11" -> "11")
    const plateDigits = position.replace(/\D/g, '') || '11';
    const plateNoStr = plateDigits.slice(-2).padStart(2, '0');

    // MMDDYY from installationDate
    let mmddyy = '062626';
    try {
      const dObj = new Date(installationDate || new Date());
      if (!isNaN(dObj.getTime())) {
        const mm = String(dObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dObj.getDate()).padStart(2, '0');
        const yy = String(dObj.getFullYear()).slice(-2);
        mmddyy = `${mm}${dd}${yy}`;
      }
    } catch (e) {
      mmddyy = '062626';
    }

    setSerialNumber(`${mmddyy}-${setNoStr}-${plateNoStr}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Register New Plate (F2)</h3>
              <p className="text-xs text-slate-400">Add a unique component serial to a production set</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewPlateModalOpen(false)}
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Select Production Set --</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.setNumber} - {set.machine} ({set.materialCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Position / Component Location (Plate 1 of 11) *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Plate #01, Plate #02, Plate #11"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-500 font-mono"
              />
              <div className="flex flex-wrap gap-1 text-[10px]">
                {Array.from({ length: 11 }, (_, i) => {
                  const numStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                  const posVal = `Plate #${numStr}`;
                  return (
                    <button
                      key={posVal}
                      type="button"
                      onClick={() => setPosition(posVal)}
                      className={`px-2 py-0.5 rounded font-mono border transition ${
                        position === posVal
                          ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      #{numStr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Plate Serial Number *
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateSerial}
                className="text-xs text-cyan-400 hover:underline font-medium"
              >
                Auto Generate ID
              </button>
            </div>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 062626-001-11"
              required
              className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-slate-100 font-mono tracking-wide focus:outline-none placeholder:text-slate-500 uppercase ${
                isDuplicate
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {isDuplicate && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                Serial number "{serialNumber}" is already in use. Duplicate serial numbers are not allowed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Installation Date *
            </label>
            <input
              type="date"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-750 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Installed cycle baseline will automatically bind to the target set's current total cycle (
              {setId ? sets.find((s) => s.id === setId)?.currentTotalSetCycle.toLocaleString() || 0 : 0} cycles).
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewPlateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicate}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                isDuplicate
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                  : 'text-slate-950 bg-cyan-400 hover:bg-cyan-300'
              }`}
            >
              Register Plate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
