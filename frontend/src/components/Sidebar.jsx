import React from 'react';
import { useVms } from '../context/VmsContext';
import {
  LayoutDashboard,
  ShieldAlert,
  CheckSquare,
  Users,
  Building2,
  Compass,
  FileSpreadsheet,
  Sliders,
  LogOut,
  Sparkles,
  Shield,
  Layers,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  onOpenStages,
  isMobileOpen = false,
  onCloseMobile
}) {
  const { 
    visits, 
    activeAlerts, 
    currentUserRole, 
    departments,
    currentUser,
    currentGate,
    logout
  } = useVms();

  const insideCount = visits.filter(v => v.status === 'CHECKED_IN').length;
  const pendingCount = visits.filter(v => v.status === 'PENDING').length;
  const alertCount = activeAlerts.length;

  const menuItems = [
    {
      id: 'guard',
      label: 'Guard Kiosk Terminal',
      icon: ShieldAlert,
      badge: insideCount > 0 ? insideCount + ' Inside' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      roles: ['guard', 'admin']
    },
    {
      id: 'departments',
      label: 'Department Master',
      icon: Building2,
      badge: departments.length > 0 ? `${departments.length} Depts` : null,
      badgeColor: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      roles: ['admin', 'guard', 'host']
    },
    {
      id: 'dashboard',
      label: 'Analytics & Biometrics',
      icon: LayoutDashboard,
      roles: ['admin', 'guard']
    },
    {
      id: 'host-approvals',
      label: 'Host Approvals',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount + ' New' : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      roles: ['host', 'admin']
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
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Biometric Calibration',
      icon: Sliders,
      roles: ['admin']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUserRole));
  const userName = currentUser?.name || 'Officer Sandeep Sharma';
  const userInitials = userName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'SS';

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-900 transition-colors duration-150">
      {/* Mobile Header with Close Button */}
      {isMobile && (
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-sm">Navigation</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scrollable Navigation Area (Independent Scrolling) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        
        {/* Navigation Section Title */}
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>Staff Navigation</span>
          <button 
            onClick={() => handleNavigate('landing')} 
            className="text-sky-400 hover:underline text-[10px] cursor-pointer font-semibold transition-colors"
          >
            Public Home
          </button>
        </div>

        {/* Dynamic Role-Based Menu Items */}
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ' + 
                (isActive
                  ? 'bg-sky-500/10  text-sky-400 border border-sky-500/30 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50')}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={'w-4 h-4 ' + (isActive ? 'text-sky-400' : 'text-slate-400 ')} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={'text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ' + item.badgeColor}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* 10 Stages Proposal Compliance Directory Item in Sidebar */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-800/80">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenStages();
            }}
            title="View 10 Stages RFP Proposal Compliance Architecture"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sky-400 bg-slate-950 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-tight">Proposal Directory</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
              10 Stages
            </span>
          </button>
        </div>

      </div>

      {/* Pinned / Fixed Bottom User Profile Card with Logout */}
      <div className="shrink-0 p-3 bg-slate-950/95 border-t border-slate-800">
        <div className="p-2.5 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-2.5">
          
          {/* User Profile Info & Avatar */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={userName} 
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-sky-500/40 shadow-sm"
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none'; 
                    const next = e.currentTarget.nextElementSibling;
                    if (next) next.style.display = 'flex'; 
                  }}
                />
              ) : null}
              <div 
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 items-center justify-center text-white text-xs font-black shadow-md ring-1 ring-sky-400/40 ${currentUser?.avatar ? 'hidden' : 'flex'}`}
              >
                {userInitials}
              </div>
              <span 
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" 
                title="Active Session"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight" title={userName}>
                {userName}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                  {currentUserRole}
                </span>
                {currentGate && currentUserRole === 'guard' && (
                  <>
                    <span className="text-slate-400 text-[9px]">•</span>
                    <span className="text-[10px] text-slate-400 truncate font-medium">
                      {currentGate.replace('Main Gate ', 'Gate ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Integrated Logout Button */}
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
              setActivePage('login');
            }}
            title="Sign Out / Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-800 hover:border-rose-300 transition-all shrink-0 cursor-pointer shadow-sm group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible on md and larger) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col h-full shrink-0 no-print select-none transition-colors duration-150">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay (Visible on < md when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={onCloseMobile} 
          />
          {/* Slide-out Sidebar */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 select-none transition-colors duration-150">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
