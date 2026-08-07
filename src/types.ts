export type SetStatus = 'Active' | 'Archived' | 'Maintenance';

export type PlateStatus = 'Active' | 'Installed' | 'Removed' | 'Retired' | 'Rejected' | 'Replaced';

export type FinalEvaluation = 'Retired' | 'Rejected';

export type RejectType =
  | 'Excessive Wear'
  | 'Crack'
  | 'Chipping'
  | 'Surface Damage'
  | 'Dimension Failure'
  | 'Dent'
  | 'Other';

export type ReplacementReason =
  | 'Wear'
  | 'Crack'
  | 'Surface Damage'
  | 'Dent'
  | 'Chipping'
  | 'Dimension Failure'
  | 'Other';

export interface ProductionSet {
  id: string;
  setNumber: string;
  machine: string;
  materialCode: string;
  startDateFirstUse: string; // YYYY-MM-DD
  previousTotalCycle: number;
  currentTotalSetCycle: number;
  cycleLimitWarning?: number; // threshold when yellow alert triggers
  cycleLimitMax?: number; // threshold when replacement due alert triggers
  status: SetStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlateMaster {
  id: string;
  serialNumber: string;
  setId: string;
  position: string;
  installationDate: string; // YYYY-MM-DD
  removalDate: string | null; // YYYY-MM-DD
  status: PlateStatus;
  installedAtCycle: number;
  removedAtCycle: number | null;
  totalCyclesAchieved: number; // calculated: (removedAtCycle || currentTotalSetCycle) - installedAtCycle
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlateHistoryRecord {
  id: string;
  plateId: string;
  serialNumber: string;
  setId: string;
  setNumber: string;
  position: string;
  installationDate: string;
  removalDate: string;
  installedAtCycle: number;
  removedAtCycle: number;
  totalCyclesAchieved: number; // Removed At Cycle minus Installed At Cycle
  finalEvaluation: FinalEvaluation | 'Replaced';
  rejectTypes: RejectType[];
  rejectDescription: string;
  sourceOfReject: string;
  remarksCorrectiveAction: string;
  evaluatedBy: string;
  createdAt: string;
}

export interface CycleEntry {
  id: string;
  setId: string;
  setNumber: string;
  date: string; // YYYY-MM-DD
  jobOrder: string;
  cycles: number;
  operatorName: string;
  checkedBy: string;
  createdAt: string;
}

export interface ReplacementLog {
  id: string;
  setId: string;
  setNumber: string;
  position: string;
  oldPlateSerialNumber: string;
  newPlateSerialNumber: string;
  installDate: string;
  installCycle: number;
  replacementReason: ReplacementReason;
  notes: string;
  performedBy: string;
  createdAt: string;
}

export type AuditAction = 'Create' | 'Edit' | 'Delete' | 'Replace' | 'Reject' | 'Retire' | 'Cycle Log' | 'Restore';

export type AuditModule =
  | 'Dashboard'
  | 'Set Management'
  | 'Plate Master'
  | 'Plate History'
  | 'Cycle Monitoring'
  | 'Replacement Log'
  | 'Search'
  | 'System';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO datetime string
  user: string;
  action: AuditAction;
  module: AuditModule;
  recordId: string;
  details: string;
}

export interface DatabaseDump {
  version: string;
  exportedAt: string;
  sets: ProductionSet[];
  plates: PlateMaster[];
  plateHistory: PlateHistoryRecord[];
  cycleEntries: CycleEntry[];
  replacementLogs: ReplacementLog[];
  auditLogs: AuditLog[];
}

export type ActiveTab =
  | 'dashboard'
  | 'sets'
  | 'plates'
  | 'history'
  | 'cycles'
  | 'replacements'
  | 'search'
  | 'reports'
  | 'audit'
  | 'backup';
