import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowRightLeft, AlertTriangle, CheckSquare } from 'lucide-react';
import { RejectType, ReplacementReason } from '../../types';

const REJECT_TYPE_OPTIONS: RejectType[] = [
  'Excessive Wear',
  'Crack',
  'Chipping',
  'Surface Damage',
  'Dimension Failure',
  'Dent',
  'Other',
];

const REASON_OPTIONS: ReplacementReason[] = [
  'Wear',
  'Crack',
  'Surface Damage',
  'Dent',
  'Chipping',
  'Dimension Failure',
  'Other',
];

export const ReplacementModal: React.FC = () => {
  const {
    isReplacementModalOpen,
    setIsReplacementModalOpen,
    sets,
    plates,
    executeReplacement,
    isSerialNumberTaken,
    currentUser,
  } = useApp();

  const [setId, setSetId] = useState('');
  const [oldPlateId, setOldPlateId] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
  const [replacementReason, setReplacementReason] = useState<ReplacementReason>('Wear');
  const [selectedRejectTypes, setSelectedRejectTypes] = useState<RejectType[]>([]);
  const [rejectDescription, setRejectDescription] = useState('');
  const [sourceOfReject, setSourceOfReject] = useState('Quality Control Inspection');
  const [remarksCorrectiveAction, setRemarksCorrectiveAction] = useState('');

  // Active plates for selected set
  const activePlatesInSet = plates.filter(
    (p) => p.setId === setId && (p.status === 'Active' || p.status === 'Installed')
  );

  const selectedOldPlate = plates.find((p) => p.id === oldPlateId);
  const selectedSet = sets.find((s) => s.id === setId);

  useEffect(() => {
    if (sets.length > 0 && !setId) {
      setSetId(sets[0].id);
    }
  }, [sets]);

  useEffect(() => {
    if (activePlatesInSet.length > 0) {
      setOldPlateId(activePlatesInSet[0].id);
    } else {
      setOldPlateId('');
    }
  }, [setId]);

  if (!isReplacementModalOpen) return null;

  const isDuplicate = newSerialNumber.trim().length > 0 && isSerialNumberTaken(newSerialNumber.trim());

  const toggleRejectType = (type: RejectType) => {
    if (selectedRejectTypes.includes(type)) {
      setSelectedRejectTypes(selectedRejectTypes.filter((t) => t !== type));
    } else {
      setSelectedRejectTypes([...selectedRejectTypes, type]);
    }
  };

  const handleGenerateNewSerial = () => {
    if (!selectedOldPlate) return;

    const setDigits = selectedSet ? (selectedSet.setNumber.replace(/\D/g, '') || '001') : '001';
    const setNoStr = setDigits.slice(-3).padStart(3, '0');

    // Extract plate digits from selected position
    const plateDigits = selectedOldPlate.position.replace(/\D/g, '') || '11';
    const plateNoStr = plateDigits.slice(-2).padStart(2, '0');

    // MMDDYY from installDate
    let mmddyy = '062626';
    try {
      const dObj = new Date(installDate || new Date());
      if (!isNaN(dObj.getTime())) {
        const mm = String(dObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dObj.getDate()).padStart(2, '0');
        const yy = String(dObj.getFullYear()).slice(-2);
        mmddyy = `${mm}${dd}${yy}`;
      }
    } catch (e) {
      mmddyy = '062626';
    }

    setNewSerialNumber(`${mmddyy}-${setNoStr}-${plateNoStr}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setId || !oldPlateId || !newSerialNumber.trim()) return;

    executeReplacement({
      setId,
      position: selectedOldPlate?.position || 'Default Position',
      oldPlateId,
      newSerialNumber: newSerialNumber.trim().toUpperCase(),
      installDate,
      replacementReason,
      rejectTypes: selectedRejectTypes,
      rejectDescription,
      sourceOfReject,
      remarksCorrectiveAction,
    });

    setIsReplacementModalOpen(false);
    setNewSerialNumber('');
    setSelectedRejectTypes([]);
    setRejectDescription('');
    setRemarksCorrectiveAction('');
  };

  const currentSetCycle = selectedSet ? selectedSet.currentTotalSetCycle : 0;
  const installedAtCycle = selectedOldPlate ? selectedOldPlate.installedAtCycle : 0;
  const achievedCycles = Math.max(0, currentSetCycle - installedAtCycle);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Automated Plate Replacement Wizard (F5)</h3>
              <p className="text-xs text-slate-400">Swaps component, calculates achieved cycles, and creates history record</p>
            </div>
          </div>
          <button
            onClick={() => setIsReplacementModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Production Set *
              </label>
              <select
                value={setId}
                onChange={(e) => setSetId(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Set --</option>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.setNumber} ({s.machine})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Plate Position to Replace *
              </label>
              <select
                value={oldPlateId}
                onChange={(e) => setOldPlateId(e.target.value)}
                required
                disabled={activePlatesInSet.length === 0}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              >
                {activePlatesInSet.length === 0 ? (
                  <option value="">No Active Plates in Set</option>
                ) : (
                  activePlatesInSet.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.position} - [{p.serialNumber}]
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Replacement Calculation Summary Bar */}
          {selectedOldPlate && selectedSet && (
            <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-xl grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Install Cycle</span>
                <span className="font-mono font-semibold text-slate-200">
                  {installedAtCycle.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Removal Set Cycle</span>
                <span className="font-mono font-semibold text-amber-300">
                  {currentSetCycle.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-amber-400 block text-[10px] font-bold">Achieved Cycles</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {achievedCycles.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Old Serial</span>
                <span className="font-mono font-semibold text-slate-300 truncate block">
                  {selectedOldPlate.serialNumber}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  New Plate Serial Number *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNewSerial}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  Suggest ID
                </button>
              </div>
              <input
                type="text"
                value={newSerialNumber}
                onChange={(e) => setNewSerialNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 062626-001-11"
                required
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-slate-100 font-mono tracking-wide uppercase focus:outline-none placeholder:text-slate-500 ${
                  isDuplicate
                    ? 'border-rose-500 ring-1 ring-rose-500/50'
                    : 'border-slate-700 focus:border-amber-500'
                }`}
              />
              {isDuplicate && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  Serial number "{newSerialNumber}" already exists in system. Must be unique.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Replacement Date *
              </label>
              <input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Primary Replacement Reason *
            </label>
            <select
              value={replacementReason}
              onChange={(e) => setReplacementReason(e.target.value as ReplacementReason)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Reject Evaluation Details */}
          <div className="p-4 bg-slate-800/60 border border-slate-750 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Reject Evaluation & Defect Flags (If Applicable)
              </span>
              <span className="text-[11px] text-slate-400">Multiple selection allowed</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {REJECT_TYPE_OPTIONS.map((type) => {
                const isSelected = selectedRejectTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleRejectType(type)}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <CheckSquare className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                    {type}
                  </button>
                );
              })}
            </div>

            {selectedRejectTypes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-750">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Reject Description</label>
                  <input
                    type="text"
                    value={rejectDescription}
                    onChange={(e) => setRejectDescription(e.target.value)}
                    placeholder="Describe specific crack location, wear depth, burr formation..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Source Of Reject</label>
                  <input
                    type="text"
                    value={sourceOfReject}
                    onChange={(e) => setSourceOfReject(e.target.value)}
                    placeholder="e.g. Quality Control Inspection, Shift Preventive Maintenance"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Remarks / Corrective Action
            </label>
            <textarea
              rows={2}
              value={remarksCorrectiveAction}
              onChange={(e) => setRemarksCorrectiveAction(e.target.value)}
              placeholder="e.g. Sent old plate to polish bay. Installed new coated replacement plate."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsReplacementModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!oldPlateId || !newSerialNumber || isDuplicate}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
                isDuplicate || !oldPlateId || !newSerialNumber
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                  : 'text-slate-950 bg-amber-400 hover:bg-amber-300'
              }`}
            >
              Execute Replacement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
