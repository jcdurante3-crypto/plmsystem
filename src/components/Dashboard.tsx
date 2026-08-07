import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Archive,
  ArrowRightLeft,
  Activity,
  AlertTriangle,
  Flame,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    sets,
    plates,
    plateHistory,
    cycleEntries,
    replacementLogs,
    auditLogs,
    setIsNewPlateModalOpen,
    setIsNewCycleModalOpen,
    setIsReplacementModalOpen,
    setActiveTab,
    setSelectedSetForModal,
  } = useApp();

  const [trendView, setTrendView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  // Metrics Calculations
  const totalSets = sets.length;
  const activePlates = plates.filter((p) => p.status === 'Active' || p.status === 'Installed').length;
  const retiredPlates = plates.filter((p) => p.status === 'Retired').length + plateHistory.filter((h) => h.finalEvaluation === 'Retired').length;
  const rejectedPlates = plates.filter((p) => p.status === 'Rejected').length + plateHistory.filter((h) => h.finalEvaluation === 'Rejected').length;
  const totalReplacements = replacementLogs.length;

  const totalCyclesAchieved = sets.reduce((sum, s) => sum + s.currentTotalSetCycle, 0);

  // Plates near or due cycle limits
  const platesNearLimit = plates.filter((p) => {
    if (p.status !== 'Active' && p.status !== 'Installed') return false;
    const parentSet = sets.find((s) => s.id === p.setId);
    if (!parentSet || !parentSet.cycleLimitWarning) return false;
    return parentSet.currentTotalSetCycle >= parentSet.cycleLimitWarning && parentSet.currentTotalSetCycle < (parentSet.cycleLimitMax || Infinity);
  });

  const platesDueReplacement = plates.filter((p) => {
    if (p.status !== 'Active' && p.status !== 'Installed') return false;
    const parentSet = sets.find((s) => s.id === p.setId);
    if (!parentSet || !parentSet.cycleLimitMax) return false;
    return parentSet.currentTotalSetCycle >= parentSet.cycleLimitMax;
  });

  // Recharts Data - Distribution
  const pieDistributionData = [
    { name: 'Active Plates', value: activePlates, color: '#6366f1' },
    { name: 'Retired Plates', value: retiredPlates, color: '#a855f7' },
    { name: 'Rejected Plates', value: rejectedPlates, color: '#f43f5e' },
    { name: 'Replaced Units', value: totalReplacements, color: '#f59e0b' },
  ];

  // Cycle Trend Data based on logged entries
  const trendDataMap: { [key: string]: number } = {};
  cycleEntries.forEach((entry) => {
    let key = entry.date;
    if (trendView === 'Weekly') {
      const d = new Date(entry.date);
      key = `Week ${Math.ceil(d.getDate() / 7)} - ${d.toLocaleString('default', { month: 'short' })}`;
    } else if (trendView === 'Monthly') {
      const d = new Date(entry.date);
      key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    }
    trendDataMap[key] = (trendDataMap[key] || 0) + entry.cycles;
  });

  const cycleTrendChartData = Object.keys(trendDataMap).map((key) => ({
    timeframe: key,
    cycles: trendDataMap[key],
  })).reverse();

  // Fallback sample chart data if entries are few
  const displayTrendData = cycleTrendChartData.length > 0 ? cycleTrendChartData : [
    { timeframe: '2026-08-01', cycles: 8500 },
    { timeframe: '2026-08-02', cycles: 18200 },
    { timeframe: '2026-08-03', cycles: 15000 },
    { timeframe: '2026-08-04', cycles: 12400 },
    { timeframe: '2026-08-05', cycles: 15000 },
    { timeframe: '2026-08-06', cycles: 10000 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Operational Bento Dashboard</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              REAL-TIME
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time plate lifecycle status, set cycle accumulation & wear alerts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNewPlateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Plate (F2)</span>
          </button>
          <button
            onClick={() => setIsNewCycleModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Log Cycles (F4)</span>
          </button>
          <button
            onClick={() => setIsReplacementModalOpen(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-amber-600/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Replace Plate (F5)</span>
          </button>
        </div>
      </div>

      {/* Alert Notices (if any plates near/due limits) */}
      {(platesDueReplacement.length > 0 || platesNearLimit.length > 0) && (
        <div className="space-y-3">
          {platesDueReplacement.map((plate) => {
            const set = sets.find((s) => s.id === plate.setId);
            return (
              <div
                key={plate.id}
                className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-xl flex items-center justify-between gap-4 shadow-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-slate-950 uppercase tracking-wider">
                      CRITICAL: REPLACEMENT DUE
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">
                      Plate {plate.serialNumber} ({plate.position}) on Set {set?.setNumber}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-mono">
                      Current Set Cycle: <span className="font-bold text-rose-300">{set?.currentTotalSetCycle.toLocaleString()}</span> / Limit Max: {set?.cycleLimitMax?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReplacementModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg transition shrink-0"
                >
                  Swap Plate Now
                </button>
              </div>
            );
          })}

          {platesNearLimit.map((plate) => {
            const set = sets.find((s) => s.id === plate.setId);
            return (
              <div
                key={plate.id}
                className="p-4 bg-amber-950/30 border border-amber-600/50 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                      WARNING: NEAR CYCLE LIMIT
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">
                      Plate {plate.serialNumber} ({plate.position}) on Set {set?.setNumber}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-mono">
                      Current Set Cycle: <span className="font-bold text-amber-300">{set?.currentTotalSetCycle.toLocaleString()}</span> / Warning Threshold: {set?.cycleLimitWarning?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (set) {
                      setSelectedSetForModal(set);
                      setIsNewCycleModalOpen(true);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shrink-0"
                >
                  Review Set Cycles
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 8 Bento KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sets</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">{totalSets}</div>
          <span className="text-[10px] text-slate-500">Active Molds & Dies</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Plates</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">{activePlates}</div>
          <span className="text-[10px] text-slate-500">In Production</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retired</span>
            <Archive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-2">{retiredPlates}</div>
          <span className="text-[10px] text-slate-500">Decommissioned</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-2">{rejectedPlates}</div>
          <span className="text-[10px] text-slate-500">Defect Scrapped</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Replacements</span>
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-2">{totalReplacements}</div>
          <span className="text-[10px] text-slate-500">Swapped Events</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cycles</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-indigo-300 mt-2 truncate">
            {totalCyclesAchieved.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Cumulative Cycles</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Near Limit</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-2">{platesNearLimit.length}</div>
          <span className="text-[10px] text-slate-500">Warning Threshold</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Swap</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-2">{platesDueReplacement.length}</div>
          <span className="text-[10px] text-slate-500">Max Limit Hit</span>
        </div>
      </div>

      {/* Analytics Bento Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cycle Accumulation Trend Chart */}
        <div className="lg:col-span-7 bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Cycle Accumulation Trend</h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setTrendView(view)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    trendView === view ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="timeframe" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} Cycles`, 'Production']}
                />
                <Area type="monotone" dataKey="cycles" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#cycleGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plate Status Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Plate Lifecycle Distribution</h3>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800 font-mono">
            {pieDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log & Active Sets Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Operational Activity Feed */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Recent Operational Audit Log</h3>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Full Trail <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-3 bg-slate-800/40 rounded-lg border border-slate-750 flex items-start gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700 shrink-0">
                  {log.action}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-200 leading-relaxed">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>User: {log.user}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Production Sets Status */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Production Set Master Status</h3>
            </div>
            <button
              onClick={() => setActiveTab('sets')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Manage Sets <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sets.map((set) => {
              const activeCount = plates.filter((p) => p.setId === set.id && (p.status === 'Active' || p.status === 'Installed')).length;
              return (
                <div key={set.id} className="p-3 bg-slate-800/40 rounded-lg border border-slate-750 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-mono">{set.setNumber}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {set.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{set.machine} • {set.materialCode}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-indigo-400">
                      {set.currentTotalSetCycle.toLocaleString()} cycles
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {activeCount}/11 Active Component Plates
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
