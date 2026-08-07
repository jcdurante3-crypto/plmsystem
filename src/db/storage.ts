import {
  ProductionSet,
  PlateMaster,
  PlateHistoryRecord,
  CycleEntry,
  ReplacementLog,
  AuditLog,
  DatabaseDump,
  RejectType,
  ReplacementReason
} from '../types';

const DB_NAME = 'PlateMonitoringDB';
const DB_VERSION = 1;

// Seed Initial Manufacturing Data
export const INITIAL_SETS: ProductionSet[] = [
  {
    id: 'set-1',
    setNumber: '001',
    machine: '500T Precision Injection Press #01',
    materialCode: 'SKD61 Premium Tool Steel',
    startDateFirstUse: '2025-11-10',
    previousTotalCycle: 125000,
    currentTotalSetCycle: 148500,
    cycleLimitWarning: 145000,
    cycleLimitMax: 160000,
    status: 'Active',
    notes: 'Main automotive connector housing core set (11 Component Plates). Requires regular inspection every 10,000 cycles.',
    createdAt: new Date('2025-11-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-01T10:30:00Z').toISOString(),
  },
  {
    id: 'set-2',
    setNumber: '002',
    machine: '200T High Speed Punch Machine B',
    materialCode: 'DC53 Cold Work Steel',
    startDateFirstUse: '2026-01-15',
    previousTotalCycle: 45000,
    currentTotalSetCycle: 78200,
    cycleLimitWarning: 80000,
    cycleLimitMax: 100000,
    status: 'Active',
    notes: 'Precision blanking die set for rotor laminations (11 Component Plates).',
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-05T14:15:00Z').toISOString(),
  },
  {
    id: 'set-3',
    setNumber: '003',
    machine: '350T Hydraulic Stamping Cell #3',
    materialCode: 'H13 Heat Treated Die Steel',
    startDateFirstUse: '2026-03-01',
    previousTotalCycle: 10000,
    currentTotalSetCycle: 32400,
    cycleLimitWarning: 50000,
    cycleLimitMax: 65000,
    status: 'Active',
    notes: 'Heavy duty chassis plate mold set (11 Component Plates).',
    createdAt: new Date('2026-03-01T07:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-06T11:00:00Z').toISOString(),
  }
];

// Helper to generate 11 plates for a set with Serial format: MMDDYY-(SET NO)-(PLATE) e.g. 062626-001-11
const generate11PlatesForSet = (
  setId: string,
  setIndexNum: number,
  installedAtCycle: number,
  startDate: string,
  engineer: string
): PlateMaster[] => {
  const plates: PlateMaster[] = [];
  const setNoStr = String(setIndexNum).padStart(3, '0');

  // Format date as MMDDYY (or default 062626)
  let mmddyy = '062626';
  try {
    const dObj = new Date(startDate);
    if (!isNaN(dObj.getTime())) {
      const mm = String(dObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dObj.getDate()).padStart(2, '0');
      const yy = String(dObj.getFullYear()).slice(-2);
      mmddyy = `${mm}${dd}${yy}`;
    }
  } catch (e) {
    mmddyy = '062626';
  }

  for (let i = 1; i <= 11; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const serial = `${mmddyy}-${setNoStr}-${numStr}`;
    plates.push({
      id: `plate-${setId}-${numStr}`,
      serialNumber: serial,
      setId: setId,
      position: `Plate #${numStr}`,
      installationDate: startDate,
      removalDate: null,
      status: 'Active',
      installedAtCycle: installedAtCycle,
      removedAtCycle: null,
      totalCyclesAchieved: 0,
      createdBy: engineer,
      modifiedBy: engineer,
      createdAt: new Date('2025-11-10T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-08-01T10:30:00Z').toISOString(),
    });
  }
  return plates;
};

// Initial plates populated with 11 plates per set
export const INITIAL_PLATES: PlateMaster[] = [
  ...generate11PlatesForSet('set-1', 1, 125000, '2025-11-10', 'J. Davis (Chief Tooling Engineer)'),
  ...generate11PlatesForSet('set-2', 2, 45000, '2026-01-15', 'A. Tanaka (Tool Room Supervisor)'),
  ...generate11PlatesForSet('set-3', 3, 10000, '2026-03-01', 'E. Smith (Production Lead)'),
  // Replaced / History plate sample records
  {
    id: 'plate-old-1',
    serialNumber: '062626-001-02-OLD',
    setId: 'set-1',
    position: 'Plate #02',
    installationDate: '2025-11-10',
    removalDate: '2026-06-12',
    status: 'Replaced',
    installedAtCycle: 125000,
    removedAtCycle: 138000,
    totalCyclesAchieved: 13000,
    createdBy: 'J. Davis (Chief Tooling Engineer)',
    modifiedBy: 'M. Chen (Maintenance Supervisor)',
    createdAt: new Date('2025-11-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-12T10:00:00Z').toISOString(),
  },
  {
    id: 'plate-old-2',
    serialNumber: '062626-002-05-OLD',
    setId: 'set-2',
    position: 'Plate #05',
    installationDate: '2026-01-15',
    removalDate: '2026-05-20',
    status: 'Rejected',
    installedAtCycle: 45000,
    removedAtCycle: 68000,
    totalCyclesAchieved: 23000,
    createdBy: 'A. Tanaka (Tool Room Supervisor)',
    modifiedBy: 'S. Wilson (QA Manager)',
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-05-20T16:00:00Z').toISOString(),
  }
];

export const INITIAL_PLATE_HISTORY: PlateHistoryRecord[] = [
  {
    id: 'hist-1',
    plateId: 'plate-3',
    serialNumber: 'PL-M801-BOT01-OLD',
    setId: 'set-1',
    setNumber: 'SET-MOLD-801',
    position: 'Bottom Ejector Plate #2',
    installationDate: '2025-11-10',
    removalDate: '2026-06-12',
    installedAtCycle: 125000,
    removedAtCycle: 138000,
    totalCyclesAchieved: 13000,
    finalEvaluation: 'Replaced',
    rejectTypes: ['Excessive Wear', 'Surface Damage'],
    rejectDescription: 'Micro-pitting and surface scuffing along ejector pin sleeve contact zone.',
    sourceOfReject: 'Routine Scheduled Maintenance Inspection',
    remarksCorrectiveAction: 'Replaced with updated coated unit PL-M801-BOT02. Old unit sent to polishing bay for assessment.',
    evaluatedBy: 'M. Chen (Maintenance Supervisor)',
    createdAt: new Date('2026-06-12T10:00:00Z').toISOString(),
  },
  {
    id: 'hist-2',
    plateId: 'plate-5',
    serialNumber: 'PL-DIE204-DIE-B',
    setId: 'set-2',
    setNumber: 'SET-DIE-204',
    position: 'Matrix Die Plate B',
    installationDate: '2026-01-15',
    removalDate: '2026-05-20',
    installedAtCycle: 45000,
    removedAtCycle: 68000,
    totalCyclesAchieved: 23000,
    finalEvaluation: 'Rejected',
    rejectTypes: ['Crack', 'Dimension Failure'],
    rejectDescription: 'Hairline stress fracture detected on corner radius under 50x optical microscope during QA sampling.',
    sourceOfReject: 'Quality Control Inspection (Out of Tolerance Burrs)',
    remarksCorrectiveAction: 'Scrapped immediately. Root cause analysis identified thermal fatigue. Heat treat spec revised.',
    evaluatedBy: 'S. Wilson (QA Manager)',
    createdAt: new Date('2026-05-20T16:00:00Z').toISOString(),
  },
  {
    id: 'hist-3',
    plateId: 'plate-8',
    serialNumber: 'PL-OLD-RETIRED-99',
    setId: 'set-3',
    setNumber: 'SET-PRESS-305',
    position: 'Guide Plate West',
    installationDate: '2025-08-01',
    removalDate: '2026-02-28',
    installedAtCycle: 0,
    removedAtCycle: 10000,
    totalCyclesAchieved: 10000,
    finalEvaluation: 'Retired',
    rejectTypes: [],
    rejectDescription: 'Normal end-of-life cycle completion. Exceeded recommended manufacturing operational window.',
    sourceOfReject: 'Engineering Lifecycle Threshold Audit',
    remarksCorrectiveAction: 'Decommissioned safely and placed in archiving rack #4.',
    evaluatedBy: 'E. Smith (Production Lead)',
    createdAt: new Date('2026-02-28T17:00:00Z').toISOString(),
  }
];

export const INITIAL_CYCLES: CycleEntry[] = [
  {
    id: 'cyc-1',
    setId: 'set-1',
    setNumber: 'SET-MOLD-801',
    date: '2026-08-01',
    jobOrder: 'JO-88210-AUTO',
    cycles: 8500,
    operatorName: 'R. Martinez',
    checkedBy: 'M. Chen',
    createdAt: new Date('2026-08-01T16:00:00Z').toISOString(),
  },
  {
    id: 'cyc-2',
    setId: 'set-1',
    setNumber: 'SET-MOLD-801',
    date: '2026-08-03',
    jobOrder: 'JO-88214-AUTO',
    cycles: 15000,
    operatorName: 'T. Kowalski',
    checkedBy: 'M. Chen',
    createdAt: new Date('2026-08-03T16:30:00Z').toISOString(),
  },
  {
    id: 'cyc-3',
    setId: 'set-2',
    setNumber: 'SET-DIE-204',
    date: '2026-08-02',
    jobOrder: 'JO-77301-STAMP',
    cycles: 18200,
    operatorName: 'L. Zhang',
    checkedBy: 'A. Tanaka',
    createdAt: new Date('2026-08-02T15:00:00Z').toISOString(),
  },
  {
    id: 'cyc-4',
    setId: 'set-2',
    setNumber: 'SET-DIE-204',
    date: '2026-08-05',
    jobOrder: 'JO-77319-STAMP',
    cycles: 15000,
    operatorName: 'L. Zhang',
    checkedBy: 'A. Tanaka',
    createdAt: new Date('2026-08-05T14:00:00Z').toISOString(),
  },
  {
    id: 'cyc-5',
    setId: 'set-3',
    setNumber: 'SET-PRESS-305',
    date: '2026-08-04',
    jobOrder: 'JO-55102-CHASSIS',
    cycles: 12400,
    operatorName: 'K. Patel',
    checkedBy: 'E. Smith',
    createdAt: new Date('2026-08-04T17:10:00Z').toISOString(),
  },
  {
    id: 'cyc-6',
    setId: 'set-3',
    setNumber: 'SET-PRESS-305',
    date: '2026-08-06',
    jobOrder: 'JO-55115-CHASSIS',
    cycles: 10000,
    operatorName: 'K. Patel',
    checkedBy: 'E. Smith',
    createdAt: new Date('2026-08-06T11:00:00Z').toISOString(),
  }
];

export const INITIAL_REPLACEMENTS: ReplacementLog[] = [
  {
    id: 'repl-1',
    setId: 'set-1',
    setNumber: 'SET-MOLD-801',
    position: 'Bottom Ejector Plate #2',
    oldPlateSerialNumber: 'PL-M801-BOT01-OLD',
    newPlateSerialNumber: 'PL-M801-BOT02',
    installDate: '2026-06-12',
    installCycle: 138000,
    replacementReason: 'Surface Damage',
    notes: 'Old plate exhibited excessive surface friction during high-temp molding.',
    performedBy: 'M. Chen (Maintenance Supervisor)',
    createdAt: new Date('2026-06-12T10:00:00Z').toISOString(),
  },
  {
    id: 'repl-2',
    setId: 'set-2',
    setNumber: 'SET-DIE-204',
    position: 'Matrix Die Plate B',
    oldPlateSerialNumber: 'PL-DIE204-DIE-B',
    newPlateSerialNumber: 'PL-DIE204-DIE-B2',
    installDate: '2026-05-20',
    installCycle: 68000,
    replacementReason: 'Crack',
    notes: 'Urgent die insert swap performed following optical crack detection in QA batch check.',
    performedBy: 'A. Tanaka (Tool Room Supervisor)',
    createdAt: new Date('2026-05-20T16:00:00Z').toISOString(),
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: new Date('2026-08-06T11:00:00Z').toISOString(),
    user: 'E. Smith',
    action: 'Cycle Log',
    module: 'Cycle Monitoring',
    recordId: 'cyc-6',
    details: 'Logged 10,000 production cycles for Set SET-PRESS-305 under JO-55115-CHASSIS.',
  },
  {
    id: 'audit-2',
    timestamp: new Date('2026-08-05T14:15:00Z').toISOString(),
    user: 'A. Tanaka',
    action: 'Cycle Log',
    module: 'Cycle Monitoring',
    recordId: 'cyc-4',
    details: 'Logged 15,000 production cycles for Set SET-DIE-204 under JO-77319-STAMP.',
  },
  {
    id: 'audit-3',
    timestamp: new Date('2026-06-12T10:00:00Z').toISOString(),
    user: 'M. Chen',
    action: 'Replace',
    module: 'Replacement Log',
    recordId: 'repl-1',
    details: 'Automated replacement executed on SET-MOLD-801 position Bottom Ejector Plate #2. Old: PL-M801-BOT01-OLD, New: PL-M801-BOT02.',
  },
  {
    id: 'audit-4',
    timestamp: new Date('2026-05-20T16:00:00Z').toISOString(),
    user: 'S. Wilson',
    action: 'Reject',
    module: 'Plate History',
    recordId: 'hist-2',
    details: 'Evaluated plate PL-DIE204-DIE-B as REJECTED due to Crack and Dimension Failure.',
  }
];

// Offline LocalStorage / IndexedDB helper
class StorageEngine {
  private memoryCache: {
    sets: ProductionSet[];
    plates: PlateMaster[];
    plateHistory: PlateHistoryRecord[];
    cycleEntries: CycleEntry[];
    replacementLogs: ReplacementLog[];
    auditLogs: AuditLog[];
  } | null = null;

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public async init(): Promise<void> {
    if (!this.isBrowser()) return;

    try {
      const stored = localStorage.getItem('plate_monitoring_db');
      if (stored) {
        const parsed: DatabaseDump = JSON.parse(stored);
        
        // If version is older or plates are missing, reseed/ensure 11 plates per set
        if (!parsed.version || parsed.version !== '2.1.0' || (parsed.plates && parsed.plates.length < 20)) {
          this.memoryCache = {
            sets: INITIAL_SETS,
            plates: INITIAL_PLATES,
            plateHistory: INITIAL_PLATE_HISTORY,
            cycleEntries: INITIAL_CYCLES,
            replacementLogs: INITIAL_REPLACEMENTS,
            auditLogs: INITIAL_AUDIT_LOGS,
          };
          this.saveToStorage();
        } else {
          this.memoryCache = {
            sets: parsed.sets || [],
            plates: parsed.plates || [],
            plateHistory: parsed.plateHistory || [],
            cycleEntries: parsed.cycleEntries || [],
            replacementLogs: parsed.replacementLogs || [],
            auditLogs: parsed.auditLogs || [],
          };
        }
      } else {
        // Initialize with default sample data
        this.memoryCache = {
          sets: INITIAL_SETS,
          plates: INITIAL_PLATES,
          plateHistory: INITIAL_PLATE_HISTORY,
          cycleEntries: INITIAL_CYCLES,
          replacementLogs: INITIAL_REPLACEMENTS,
          auditLogs: INITIAL_AUDIT_LOGS,
        };
        this.saveToStorage();
      }

      this.ensure11PlatesForAllSets();
    } catch (err) {
      console.error('Storage initialization failed, loading fallback default data:', err);
      this.memoryCache = {
        sets: INITIAL_SETS,
        plates: INITIAL_PLATES,
        plateHistory: INITIAL_PLATE_HISTORY,
        cycleEntries: INITIAL_CYCLES,
        replacementLogs: INITIAL_REPLACEMENTS,
        auditLogs: INITIAL_AUDIT_LOGS,
      };
      this.ensure11PlatesForAllSets();
    }
  }

  public ensure11PlatesForAllSets(): void {
    if (!this.memoryCache) return;
    let addedAny = false;

    for (const set of this.memoryCache.sets) {
      const activePlatesInSet = this.memoryCache.plates.filter(
        (p) => p.setId === set.id && (p.status === 'Active' || p.status === 'Installed')
      );

      // We want positions 01 to 11 for every set
      for (let i = 1; i <= 11; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const posName = `Plate #${numStr}`;
        const exists = activePlatesInSet.some((p) => p.position === posName);

        if (!exists) {
          const setDigits = set.setNumber.replace(/\D/g, '');
          const setNoStr = setDigits.length > 0 ? setDigits.slice(-3).padStart(3, '0') : '001';

          let mmddyy = '062626';
          try {
            const dObj = new Date(set.startDateFirstUse || new Date());
            if (!isNaN(dObj.getTime())) {
              const mm = String(dObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dObj.getDate()).padStart(2, '0');
              const yy = String(dObj.getFullYear()).slice(-2);
              mmddyy = `${mm}${dd}${yy}`;
            }
          } catch (e) {
            mmddyy = '062626';
          }

          this.memoryCache.plates.push({
            id: `plate-${set.id}-${numStr}-${Date.now()}`,
            serialNumber: `${mmddyy}-${setNoStr}-${numStr}`,
            setId: set.id,
            position: posName,
            installationDate: set.startDateFirstUse || new Date().toISOString().split('T')[0],
            removalDate: null,
            status: 'Active',
            installedAtCycle: set.previousTotalCycle || 0,
            removedAtCycle: null,
            totalCyclesAchieved: Math.max(0, set.currentTotalSetCycle - (set.previousTotalCycle || 0)),
            createdBy: 'System Auto-Populate',
            modifiedBy: 'System Auto-Populate',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          addedAny = true;
        }
      }
    }

    if (addedAny) {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser() || !this.memoryCache) return;
    try {
      const dump: DatabaseDump = {
        version: '2.1.0',
        exportedAt: new Date().toISOString(),
        ...this.memoryCache,
      };
      localStorage.setItem('plate_monitoring_db', JSON.stringify(dump));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  // --- SETS ---
  public getSets(): ProductionSet[] {
    if (!this.memoryCache) return INITIAL_SETS;
    return this.memoryCache.sets;
  }

  public saveSet(set: ProductionSet, user = 'System'): void {
    if (!this.memoryCache) return;
    const index = this.memoryCache.sets.findIndex((s) => s.id === set.id);
    const isEdit = index >= 0;

    if (isEdit) {
      this.memoryCache.sets[index] = { ...set, updatedAt: new Date().toISOString() };
    } else {
      this.memoryCache.sets.unshift(set);
    }

    this.addAuditLog({
      user,
      action: isEdit ? 'Edit' : 'Create',
      module: 'Set Management',
      recordId: set.id,
      details: `${isEdit ? 'Updated' : 'Created'} set ${set.setNumber} for machine ${set.machine}`,
    });

    this.saveToStorage();
  }

  public deleteSet(setId: string, user = 'System'): void {
    if (!this.memoryCache) return;
    const setToRemove = this.memoryCache.sets.find((s) => s.id === setId);
    if (!setToRemove) return;

    // Delete set
    this.memoryCache.sets = this.memoryCache.sets.filter((s) => s.id !== setId);
    // Remove or delete plates belonging to this set
    this.memoryCache.plates = this.memoryCache.plates.filter((p) => p.setId !== setId);
    // Remove cycle entries for this set
    this.memoryCache.cycleEntries = this.memoryCache.cycleEntries.filter((c) => c.setId !== setId);

    this.addAuditLog({
      user,
      action: 'Delete',
      module: 'Set Management',
      recordId: setId,
      details: `Removed Production Set ${setToRemove.setNumber} (${setToRemove.machine}) and its associated component plates and logs`,
    });

    this.saveToStorage();
  }

  // --- PLATES ---
  public isSerialNumberTaken(serialNumber: string, excludePlateId?: string): boolean {
    if (!this.memoryCache) return false;
    const cleanSerial = serialNumber.trim().toUpperCase();
    if (!cleanSerial) return false;

    // Check active/installed plates in memory cache
    const duplicateInPlates = this.memoryCache.plates.some(
      (p) => p.serialNumber.trim().toUpperCase() === cleanSerial && p.id !== excludePlateId
    );

    if (duplicateInPlates) return true;

    // Check plate history
    const duplicateInHistory = this.memoryCache.plateHistory.some(
      (h) => h.serialNumber.trim().toUpperCase() === cleanSerial
    );

    return duplicateInHistory;
  }

  public getPlates(): PlateMaster[] {
    if (!this.memoryCache) return INITIAL_PLATES;

    // Recalculate dynamic totalCyclesAchieved for active plates
    const setsMap = new Map(this.getSets().map((s) => [s.id, s.currentTotalSetCycle]));

    return this.memoryCache.plates.map((plate) => {
      const currentSetCycle = setsMap.get(plate.setId) || 0;
      let achieved = plate.totalCyclesAchieved;

      if (plate.status === 'Active' || plate.status === 'Installed') {
        achieved = Math.max(0, currentSetCycle - plate.installedAtCycle);
      } else if (plate.removedAtCycle !== null) {
        achieved = Math.max(0, plate.removedAtCycle - plate.installedAtCycle);
      }

      return {
        ...plate,
        totalCyclesAchieved: achieved,
      };
    });
  }

  public savePlate(plate: PlateMaster, user = 'System'): void {
    if (!this.memoryCache) return;

    const trimmedSerial = plate.serialNumber.trim().toUpperCase();
    if (this.isSerialNumberTaken(trimmedSerial, plate.id)) {
      throw new Error(`Serial Number "${plate.serialNumber}" is already in use. Duplicate serial numbers are strictly forbidden.`);
    }

    const index = this.memoryCache.plates.findIndex((p) => p.id === plate.id);
    const isEdit = index >= 0;

    const plateToSave = { ...plate, serialNumber: trimmedSerial };

    if (isEdit) {
      this.memoryCache.plates[index] = { ...plateToSave, updatedAt: new Date().toISOString() };
    } else {
      this.memoryCache.plates.unshift(plateToSave);
    }

    this.addAuditLog({
      user,
      action: isEdit ? 'Edit' : 'Create',
      module: 'Plate Master',
      recordId: plate.id,
      details: `${isEdit ? 'Updated' : 'Created'} plate ${plateToSave.serialNumber} at position ${plateToSave.position}`,
    });

    this.saveToStorage();
  }

  // --- PLATE HISTORY RECORDS ---
  public getPlateHistory(): PlateHistoryRecord[] {
    if (!this.memoryCache) return INITIAL_PLATE_HISTORY;
    return this.memoryCache.plateHistory;
  }

  public addPlateHistory(history: PlateHistoryRecord, user = 'System'): void {
    if (!this.memoryCache) return;
    this.memoryCache.plateHistory.unshift(history);

    this.addAuditLog({
      user,
      action: history.finalEvaluation === 'Rejected' ? 'Reject' : history.finalEvaluation === 'Retired' ? 'Retire' : 'Replace',
      module: 'Plate History',
      recordId: history.id,
      details: `Plate history record created for ${history.serialNumber} (${history.finalEvaluation}).`,
    });

    this.saveToStorage();
  }

  // --- CYCLE ENTRIES ---
  public getCycleEntries(): CycleEntry[] {
    if (!this.memoryCache) return INITIAL_CYCLES;
    return this.memoryCache.cycleEntries;
  }

  public addCycleEntry(entry: CycleEntry, user = 'System'): void {
    if (!this.memoryCache) return;
    this.memoryCache.cycleEntries.unshift(entry);

    // Auto update Set Total Cycle: Current Set Total Cycle = Previous Total Cycle + Sum of Cycle Entries
    const set = this.memoryCache.sets.find((s) => s.id === entry.setId);
    if (set) {
      const allSetEntries = this.memoryCache.cycleEntries.filter((e) => e.setId === entry.setId);
      const totalLogged = allSetEntries.reduce((sum, e) => sum + e.cycles, 0);
      set.currentTotalSetCycle = set.previousTotalCycle + totalLogged;
      set.updatedAt = new Date().toISOString();
    }

    this.addAuditLog({
      user,
      action: 'Cycle Log',
      module: 'Cycle Monitoring',
      recordId: entry.id,
      details: `Added ${entry.cycles.toLocaleString()} cycles to set ${entry.setNumber} for Job Order ${entry.jobOrder}.`,
    });

    this.saveToStorage();
  }

  // --- REPLACEMENT PLATE AUTOMATION ---
  /**
   * REPLACEMENT AUTOMATION:
   * 1. Close old plate record
   * 2. Populate removal date
   * 3. Record removed cycle (current set cycle)
   * 4. Calculate achieved cycles
   * 5. Create history record
   * 6. Mark old plate as Replaced
   * 7. Create new active plate record
   * 8. Insert entry into Replacement Log
   */
  public executePlateReplacement(params: {
    setId: string;
    position: string;
    oldPlateId: string;
    newSerialNumber: string;
    installDate: string;
    replacementReason: ReplacementReason;
    rejectTypes?: RejectType[];
    rejectDescription?: string;
    sourceOfReject?: string;
    remarksCorrectiveAction?: string;
    performedBy: string;
  }): { newPlate: PlateMaster; replacementLog: ReplacementLog; historyRecord: PlateHistoryRecord } {
    if (!this.memoryCache) {
      throw new Error('Database memory cache not initialized');
    }

    const cleanNewSerial = params.newSerialNumber.trim().toUpperCase();
    if (this.isSerialNumberTaken(cleanNewSerial)) {
      throw new Error(`Serial Number "${params.newSerialNumber}" is already in use by another plate. Serial numbers must be unique.`);
    }

    const set = this.memoryCache.sets.find((s) => s.id === params.setId);
    if (!set) throw new Error('Target Production Set not found');

    const oldPlate = this.memoryCache.plates.find((p) => p.id === params.oldPlateId);
    if (!oldPlate) throw new Error('Old plate record not found');

    const currentCycle = set.currentTotalSetCycle;
    const achievedCycles = Math.max(0, currentCycle - oldPlate.installedAtCycle);

    // 1 & 2 & 3 & 4 & 6: Close old plate record
    oldPlate.removalDate = params.installDate;
    oldPlate.removedAtCycle = currentCycle;
    oldPlate.totalCyclesAchieved = achievedCycles;
    oldPlate.status = 'Replaced';
    oldPlate.modifiedBy = params.performedBy;
    oldPlate.updatedAt = new Date().toISOString();

    // 5. Create History Record
    const historyId = `hist-${Date.now()}`;
    const evaluation = (params.rejectTypes && params.rejectTypes.length > 0) ? 'Rejected' : 'Retired';
    const historyRecord: PlateHistoryRecord = {
      id: historyId,
      plateId: oldPlate.id,
      serialNumber: oldPlate.serialNumber,
      setId: set.id,
      setNumber: set.setNumber,
      position: params.position,
      installationDate: oldPlate.installationDate,
      removalDate: params.installDate,
      installedAtCycle: oldPlate.installedAtCycle,
      removedAtCycle: currentCycle,
      totalCyclesAchieved: achievedCycles,
      finalEvaluation: evaluation,
      rejectTypes: params.rejectTypes || [],
      rejectDescription: params.rejectDescription || '',
      sourceOfReject: params.sourceOfReject || 'Replacement Evaluation',
      remarksCorrectiveAction: params.remarksCorrectiveAction || `Replaced with ${params.newSerialNumber}. Reason: ${params.replacementReason}`,
      evaluatedBy: params.performedBy,
      createdAt: new Date().toISOString(),
    };
    this.memoryCache.plateHistory.unshift(historyRecord);

    // 7. Create new active plate record
    const newPlateId = `plate-${Date.now()}`;
    const newPlate: PlateMaster = {
      id: newPlateId,
      serialNumber: params.newSerialNumber,
      setId: set.id,
      position: params.position,
      installationDate: params.installDate,
      removalDate: null,
      status: 'Active',
      installedAtCycle: currentCycle,
      removedAtCycle: null,
      totalCyclesAchieved: 0,
      createdBy: params.performedBy,
      modifiedBy: params.performedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryCache.plates.unshift(newPlate);

    // 8. Insert entry into Replacement Log
    const replId = `repl-${Date.now()}`;
    const replacementLog: ReplacementLog = {
      id: replId,
      setId: set.id,
      setNumber: set.setNumber,
      position: params.position,
      oldPlateSerialNumber: oldPlate.serialNumber,
      newPlateSerialNumber: params.newSerialNumber,
      installDate: params.installDate,
      installCycle: currentCycle,
      replacementReason: params.replacementReason,
      notes: `Automated replacement executed on position ${params.position}. Reason: ${params.replacementReason}.`,
      performedBy: params.performedBy,
      createdAt: new Date().toISOString(),
    };
    this.memoryCache.replacementLogs.unshift(replacementLog);

    // Audit Trail
    this.addAuditLog({
      user: params.performedBy,
      action: 'Replace',
      module: 'Replacement Log',
      recordId: replId,
      details: `Executed replacement on set ${set.setNumber} [${params.position}]. Swapped ${oldPlate.serialNumber} for ${params.newSerialNumber}. Reason: ${params.replacementReason}.`,
    });

    this.saveToStorage();

    return { newPlate, replacementLog, historyRecord };
  }

  // --- REPLACEMENT LOGS ---
  public getReplacementLogs(): ReplacementLog[] {
    if (!this.memoryCache) return INITIAL_REPLACEMENTS;
    return this.memoryCache.replacementLogs;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    if (!this.memoryCache) return INITIAL_AUDIT_LOGS;
    return this.memoryCache.auditLogs;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    if (!this.memoryCache) return;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.memoryCache.auditLogs.unshift(newLog);
    this.saveToStorage();
  }

  // --- BACKUP & RESTORE ---
  public exportFullDatabase(): DatabaseDump {
    if (!this.memoryCache) {
      return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        sets: INITIAL_SETS,
        plates: INITIAL_PLATES,
        plateHistory: INITIAL_PLATE_HISTORY,
        cycleEntries: INITIAL_CYCLES,
        replacementLogs: INITIAL_REPLACEMENTS,
        auditLogs: INITIAL_AUDIT_LOGS,
      };
    }

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      sets: this.memoryCache.sets,
      plates: this.memoryCache.plates,
      plateHistory: this.memoryCache.plateHistory,
      cycleEntries: this.memoryCache.cycleEntries,
      replacementLogs: this.memoryCache.replacementLogs,
      auditLogs: this.memoryCache.auditLogs,
    };
  }

  public restoreDatabase(dump: DatabaseDump, user = 'System Admin'): boolean {
    if (!dump || !Array.isArray(dump.sets) || !Array.isArray(dump.plates)) {
      throw new Error('Invalid database backup JSON structure.');
    }

    this.memoryCache = {
      sets: dump.sets,
      plates: dump.plates,
      plateHistory: dump.plateHistory || [],
      cycleEntries: dump.cycleEntries || [],
      replacementLogs: dump.replacementLogs || [],
      auditLogs: dump.auditLogs || [],
    };

    this.addAuditLog({
      user,
      action: 'Restore',
      module: 'System',
      recordId: `restore-${Date.now()}`,
      details: `Full database restored from backup file exported at ${dump.exportedAt || 'Unknown Date'}.`,
    });

    this.saveToStorage();
    return true;
  }

  public resetToSampleData(): void {
    this.memoryCache = {
      sets: INITIAL_SETS,
      plates: INITIAL_PLATES,
      plateHistory: INITIAL_PLATE_HISTORY,
      cycleEntries: INITIAL_CYCLES,
      replacementLogs: INITIAL_REPLACEMENTS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    this.saveToStorage();
  }
}

export const db = new StorageEngine();
