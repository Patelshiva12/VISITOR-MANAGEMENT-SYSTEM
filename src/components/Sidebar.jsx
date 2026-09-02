import React from 'react';
import { useVms } from '../context/VmsContext';
import {
  LayoutDashboard,
  ShieldAlert,
  UserPlus,
  CheckSquare,
  Users,
  Compass,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const { visits, activeAlerts, currentUserRole } = useVms();

  const insideCount = visits.filter(v => v.status === 'CHECKED_IN').length;
  const pendingCount = visits.filter(v => v.status === 'PENDING').length;
  const alertCount = activeAlerts.length;

  const menuItems = [
    {
      id: 'guard',
      label: 'Guard Kiosk & Terminal',
      icon: ShieldAlert,
      badge: insideCount > 0 ? insideCount + ' Inside' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      roles: ['guard', 'admin']
    },
    {
      id: 'dashboard',
      label: 'Admin Command Center',
      icon: LayoutDashboard,
      roles: ['admin', 'guard', 'host']
    },
    {
      id: 'pre-register',
      label: 'Visitor Registration',
      icon: UserPlus,
      roles: ['visitor', 'host', 'guard', 'admin']
    },
    {
      id: 'host-approvals',
      label: 'Host Approvals',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount + ' New' : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      roles: ['host', 'admin', 'guard']
    },
    {
      id: 'visitors',
      label: 'Visitor Directory',
      icon: Users,
      roles: ['admin', 'guard', 'host']
    },
    {
      id: 'zone-access',
      label: 'Zone Access Control',
      icon: Compass,
      badge: alertCount > 0 ? alertCount + ' Breach' : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse',
      roles: ['admin', 'guard']
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail & Reports',
      icon: FileSpreadsheet,
      roles: ['admin', 'guard']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUserRole));

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col justify-between shrink-0 no-print">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Navigation Portal
        </div>
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ' + 
                (isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50')}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={'w-4 h-4 ' + (isActive ? 'text-sky-400' : 'text-slate-400')} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={'text-[10px] px-2 py-0.5 rounded-full font-bold ' + item.badgeColor}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Mini Widget */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
          <span>HARDWARE STATUS</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
          </span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>8MP FR Camera:</span>
            <span className="text-slate-200 font-mono">SCRFD + ArcFace</span>
          </div>
          <div className="flex justify-between">
            <span>Liveness Mode:</span>
            <span className="text-sky-400 font-mono">Anti-Spoof v3</span>
          </div>
          <div className="flex justify-between">
            <span>Gate Pass Printer:</span>
            <span className="text-emerald-400 font-mono">Ready (Direct)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
