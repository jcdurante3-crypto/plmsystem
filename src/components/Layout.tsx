import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Database,
  History,
  Activity,
  ArrowRightLeft,
  Search,
  FileSpreadsheet,
  ShieldCheck,
  HardDriveDownload,
  Sun,
  Moon,
  Plus,
  RefreshCw,
  Keyboard,
  Printer,
  WifiOff,
  User,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const {
    activeTab,
    setActiveTab,
    darkMode,
    setDarkMode,
    currentUser,
    setCurrentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsNewPlateModalOpen,
    setIsNewCycleModalOpen,
    setIsReplacementModalOpen,
    setIsKeyboardHelpOpen,
    sets,
    plates,
    replacementLogs,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'sets', label: 'Set Management', icon: <Layers className="w-4 h-4" />, badge: sets.length },
    { id: 'plates', label: 'Plate Master', icon: <Database className="w-4 h-4" />, badge: plates.length },
    { id: 'history', label: 'Plate History', icon: <History className="w-4 h-4" /> },
    { id: 'cycles', label: 'Cycle Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'replacements', label: 'Replacement Log', icon: <ArrowRightLeft className="w-4 h-4" />, badge: replacementLogs.length },
    { id: 'search', label: 'Search Center', icon: <Search className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Exports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <HardDriveDownload className="w-4 h-4" /> },
  ];

  const getBreadcrumbTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard': return 'Operational Dashboard';
      case 'sets': return 'Production Set Management';
      case 'plates': return 'Plate Master Database';
      case 'history': return 'Plate Lifecycle History Record';
      case 'cycles': return 'Cycle Monitoring Sheet';
      case 'replacements': return 'Replacement Plate Log & Automation';
      case 'search': return 'Global Search Center';
      case 'reports': return 'Printable Reports & Data Exports';
      case 'audit': return 'System Audit Trail';
      case 'backup': return 'Offline Backup & Electron Local DB';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar (Bento Theme) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        {/* Brand & System Status */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden transition"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-600/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xs sm:text-sm leading-none tracking-tight text-white uppercase">
                Plate Lifecycle Monitor
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                OFFLINE DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 hidden sm:block font-mono">
              SYSTEM V2.4.0 <span className="mx-1 text-slate-700">|</span> MASTER REF: <span className="text-slate-300 font-semibold">TOTAL SET NO. CYCLE</span>
            </p>
          </div>
        </div>

        {/* Header Center: Global Search Input */}
        <div className="hidden md:flex items-center max-w-sm w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              if (activeTab !== 'search') setActiveTab('search');
            }}
            placeholder="Search Serial, Set #, Machine, Defect... (F3)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-14 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-750 rounded">
            CTRL+K
          </kbd>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPlateModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition"
            title="Register New Plate (F2)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>F2 Plate</span>
          </button>

          <button
            onClick={() => setIsNewCycleModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition"
            title="Log Production Cycles (F4)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>F4 Cycle</span>
          </button>

          <button
            onClick={() => setIsReplacementModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition"
            title="Replace Plate Wizard (F5)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>F5 Replace</span>
          </button>

          <button
            onClick={() => setIsKeyboardHelpOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Keyboard Shortcuts Guide"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User selector */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2.5 border-l border-slate-800 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              className="bg-transparent border-none text-slate-300 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="J. Davis (Lead Tooling Engineer)" className="bg-slate-900 text-slate-200">
                J. Davis (Engineer)
              </option>
              <option value="M. Chen (Maintenance Supervisor)" className="bg-slate-900 text-slate-200">
                M. Chen (Maintenance)
              </option>
              <option value="S. Wilson (QA Manager)" className="bg-slate-900 text-slate-200">
                S. Wilson (QA)
              </option>
              <option value="Operator Terminal #01" className="bg-slate-900 text-slate-200">
                Operator Terminal
              </option>
            </select>
          </div>
        </div>
      </header>

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Bento Integrated Navigation Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-30 ${
            isMobileMenuOpen
              ? 'fixed inset-y-14 left-0 w-64 shadow-2xl z-40'
              : 'hidden lg:flex w-56'
          }`}
        >
          <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-1.5">
              Modules & Navigation
            </p>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400 border border-slate-750'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Shortcuts & System Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">HOTKEY SHORTCUTS</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-750">F2: New Plate</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-750">F4: Log Cycle</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-750">F5: Replace</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-750">F7: Reports</span>
            </div>
          </div>
        </aside>

        {/* Main Workspace Canvas */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Breadcrumb Navigation Bar */}
          <div className="px-6 py-2.5 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Plate Lifecycle</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-bold text-slate-100">{getBreadcrumbTitle(activeTab)}</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="hidden md:inline text-slate-400">
                ACTIVE USER: <strong className="text-indigo-400">{currentUser}</strong>
              </span>
              <button
                onClick={() => setIsKeyboardHelpOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                Hotkeys Guide
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-3 sm:p-4 md:p-6 flex-1">{children}</div>
        </main>
      </div>

      {/* Mobile Quick Actions Dock (visible on mobile screens) */}
      <div className="sm:hidden bg-slate-900 border-t border-slate-800 p-2 flex items-center justify-around gap-1 shrink-0 z-20">
        <button
          onClick={() => setIsNewPlateModalOpen(true)}
          className="flex-1 py-1.5 px-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Plate</span>
        </button>
        <button
          onClick={() => setIsNewCycleModalOpen(true)}
          className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Log Cycle</span>
        </button>
        <button
          onClick={() => setIsReplacementModalOpen(true)}
          className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Replace</span>
        </button>
      </div>

      {/* Footer Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-6 font-mono text-[10px]">
          <span className="text-slate-500">LOCAL_IP: 127.0.0.1:4402</span>
          <span className="text-slate-500 hidden sm:inline">APP_DIR: C:\Tools\Monitoring\App</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> DB: ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition font-mono"
          >
            EXPORT CSV (F8)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition font-mono"
          >
            MANUAL BACKUP (F6)
          </button>
        </div>
      </footer>
    </div>
  );
};
