import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ActiveTab,
  ProductionSet,
  PlateMaster,
  PlateHistoryRecord,
  CycleEntry,
  ReplacementLog,
  AuditLog,
  RejectType,
  ReplacementReason
} from '../types';
import { db } from '../db/storage';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;

  // DB States
  sets: ProductionSet[];
  plates: PlateMaster[];
  plateHistory: PlateHistoryRecord[];
  cycleEntries: CycleEntry[];
  replacementLogs: ReplacementLog[];
  auditLogs: AuditLog[];
  refreshData: () => void;

  // Global Search state
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Quick Action Modals
  isNewPlateModalOpen: boolean;
  setIsNewPlateModalOpen: (open: boolean) => void;
  isNewCycleModalOpen: boolean;
  setIsNewCycleModalOpen: (open: boolean) => void;
  isReplacementModalOpen: boolean;
  setIsReplacementModalOpen: (open: boolean) => void;
  isKeyboardHelpOpen: boolean;
  setIsKeyboardHelpOpen: (open: boolean) => void;

  // Selected Set for modal pre-filling
  selectedSetForModal: ProductionSet | null;
  setSelectedSetForModal: (set: ProductionSet | null) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // DB Actions
  addOrUpdateSet: (set: ProductionSet) => void;
  removeSet: (setId: string) => void;
  addOrUpdatePlate: (plate: PlateMaster) => void;
  isSerialNumberTaken: (serialNumber: string, excludePlateId?: string) => boolean;
  addCycleEntry: (entry: Omit<CycleEntry, 'id' | 'createdAt'>) => void;
  executeReplacement: (params: {
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
  }) => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<string>('J. Davis (Lead Tooling Engineer)');

  const [sets, setSets] = useState<ProductionSet[]>([]);
  const [plates, setPlates] = useState<PlateMaster[]>([]);
  const [plateHistory, setPlateHistory] = useState<PlateHistoryRecord[]>([]);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [replacementLogs, setReplacementLogs] = useState<ReplacementLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Modals
  const [isNewPlateModalOpen, setIsNewPlateModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [selectedSetForModal, setSelectedSetForModal] = useState<ProductionSet | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    await db.init();
    setSets(db.getSets());
    setPlates(db.getPlates());
    setPlateHistory(db.getPlateHistory());
    setCycleEntries(db.getCycleEntries());
    setReplacementLogs(db.getReplacementLogs());
    setAuditLogs(db.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync html dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard Shortcuts listener (F2 - F7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['F2', 'F3', 'F4', 'F5', 'F6', 'F7'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'F2':
          setIsNewPlateModalOpen(true);
          addToast('info', 'Keyboard Shortcut: F2', 'Opened New Plate Registration');
          break;
        case 'F3':
          setActiveTab('search');
          addToast('info', 'Keyboard Shortcut: F3', 'Navigated to Global Search Center');
          break;
        case 'F4':
          setIsNewCycleModalOpen(true);
          addToast('info', 'Keyboard Shortcut: F4', 'Opened New Cycle Entry Sheet');
          break;
        case 'F5':
          setActiveTab('replacements');
          addToast('info', 'Keyboard Shortcut: F5', 'Navigated to Replacement Log');
          break;
        case 'F6':
          setActiveTab('backup');
          addToast('info', 'Keyboard Shortcut: F6', 'Navigated to Backup & Database Tools');
          break;
        case 'F7':
          setActiveTab('reports');
          addToast('info', 'Keyboard Shortcut: F7', 'Navigated to Print Reports');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action wrappers
  const addOrUpdateSet = (set: ProductionSet) => {
    db.saveSet(set, currentUser);
    refreshData();
    addToast('success', 'Production Set Saved', `Set ${set.setNumber} saved successfully.`);
  };

  const removeSet = (setId: string) => {
    const setToRemove = sets.find((s) => s.id === setId);
    db.deleteSet(setId, currentUser);
    refreshData();
    addToast('warning', 'Production Set Removed', `Set ${setToRemove?.setNumber || setId} has been permanently removed.`);
  };

  const isSerialNumberTaken = (serialNumber: string, excludePlateId?: string) => {
    return db.isSerialNumberTaken(serialNumber, excludePlateId);
  };

  const addOrUpdatePlate = (plate: PlateMaster) => {
    try {
      db.savePlate(plate, currentUser);
      refreshData();
      addToast('success', 'Plate Saved', `Plate ${plate.serialNumber} saved successfully.`);
    } catch (err: any) {
      addToast('error', 'Plate Save Failed', err?.message || 'Failed to save plate.');
    }
  };

  const addCycleEntry = (entry: Omit<CycleEntry, 'id' | 'createdAt'>) => {
    const newEntry: CycleEntry = {
      ...entry,
      id: `cyc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.addCycleEntry(newEntry, currentUser);
    refreshData();
    addToast('success', 'Cycle Logged', `Added ${entry.cycles.toLocaleString()} cycles to set ${entry.setNumber}.`);
  };

  const executeReplacement = (params: {
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
  }) => {
    try {
      const res = db.executePlateReplacement({
        ...params,
        performedBy: currentUser,
      });
      refreshData();
      addToast(
        'success',
        'Plate Replacement Executed',
        `Swapped old plate for new active plate ${res.newPlate.serialNumber}. History & Replacement logs created.`
      );
    } catch (err: any) {
      addToast('error', 'Replacement Failed', err?.message || 'Failed to execute plate replacement.');
    }
  };

  const resetDatabase = () => {
    db.resetToSampleData();
    refreshData();
    addToast('warning', 'Database Reset', 'System data restored to default sample manufacturing records.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        currentUser,
        setCurrentUser,
        sets,
        plates,
        plateHistory,
        cycleEntries,
        replacementLogs,
        auditLogs,
        refreshData,
        globalSearchQuery,
        setGlobalSearchQuery,
        isNewPlateModalOpen,
        setIsNewPlateModalOpen,
        isNewCycleModalOpen,
        setIsNewCycleModalOpen,
        isReplacementModalOpen,
        setIsReplacementModalOpen,
        isKeyboardHelpOpen,
        setIsKeyboardHelpOpen,
        selectedSetForModal,
        setSelectedSetForModal,
        toasts,
        addToast,
        removeToast,
        addOrUpdateSet,
        removeSet,
        addOrUpdatePlate,
        isSerialNumberTaken,
        addCycleEntry,
        executeReplacement,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
