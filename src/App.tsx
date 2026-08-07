import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';
import { NewPlateModal } from './components/Modals/NewPlateModal';
import { NewCycleEntryModal } from './components/Modals/NewCycleEntryModal';
import { ReplacementModal } from './components/Modals/ReplacementModal';
import { KeyboardHelpModal } from './components/Modals/KeyboardHelpModal';

import { Dashboard } from './components/Dashboard';
import { SetManagement } from './components/SetManagement';
import { PlateMaster } from './components/PlateMaster';
import { PlateHistory } from './components/PlateHistory';
import { CycleMonitoring } from './components/CycleMonitoring';
import { ReplacementLog } from './components/ReplacementLog';
import { SearchCenter } from './components/SearchCenter';
import { Reports } from './components/Reports';
import { AuditTrail } from './components/AuditTrail';
import { BackupRestore } from './components/BackupRestore';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'sets':
      return <SetManagement />;
    case 'plates':
      return <PlateMaster />;
    case 'history':
      return <PlateHistory />;
    case 'cycles':
      return <CycleMonitoring />;
    case 'replacements':
      return <ReplacementLog />;
    case 'search':
      return <SearchCenter />;
    case 'reports':
      return <Reports />;
    case 'audit':
      return <AuditTrail />;
    case 'backup':
      return <BackupRestore />;
    default:
      return <Dashboard />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
      <ToastContainer />
      <NewPlateModal />
      <NewCycleEntryModal />
      <ReplacementModal />
      <KeyboardHelpModal />
    </AppProvider>
  );
}
