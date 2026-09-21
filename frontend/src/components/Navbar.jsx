import React, { useState, useEffect } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Shield, 
  UserCheck, 
  Users, 
  Building2, 
  Clock, 
  RotateCcw, 
  Radio, 
  Sliders,
  Bell,
  Sparkles,
  Menu
} from 'lucide-react';
import NotificationsDrawer from './NotificationsDrawer';

export default function Navbar({ activePage, setActivePage, onOpenStages, onToggleSidebar }) {
  const { 
    currentUserRole, 
    setCurrentUserRole, 
    currentGate, 
    setCurrentGate, 
    activeAlerts,
    resetToDemoData,
    visits, 
    auditLogs
  } = useVms();

  const [time, setTime] = useState(new Date());
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = visits.filter(v => v.status === 'PENDING').length;
  const criticalAlertsCount = activeAlerts.length + auditLogs.filter(l => l.severity === 'CRITICAL').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-3 sm:px-4 py-2 flex items-center justify-between no-print shrink-0 shadow-sm transition-colors duration-150">
      {/* Left: Hamburger (Mobile) + Brand / System Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={() => setActivePage('landing')}
          title="Go to Landing Page"
          className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Shield className="w-5 h-5 text-white" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">ILIZIEN VMS</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
              Biometric Suite 2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Multi-Modal Identity & Gate Pass System
          </p>
        </div>
      </div>

      {/* Center: Live Station Status & Clock (Uncluttered & Clean) */}
      <div className="hidden md:flex items-center gap-3">
        
        {/* Gate Selector */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-slate-400 font-medium">Station:</span>
          <select 
            value={currentGate}
            onChange={(e) => setCurrentGate(e.target.value)}
            className="bg-transparent font-bold text-sky-400 focus:outline-none cursor-pointer text-xs"
          >
            <option value="Main Gate 01" className="bg-slate-900 text-white">Main Gate 01</option>
            <option value="North Gate 02" className="bg-slate-900 text-white">North Gate 02</option>
            <option value="VIP Lobby" className="bg-slate-900 text-white">VIP Lobby</option>
          </select>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-slate-200 text-xs font-semibold">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Right: Role Switcher, Theme Toggle, 10-Stages Quick Icon, Notifications & System Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-medium text-slate-400 px-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-400" /> Role:
          </span>
          {[
            { id: 'guard', label: 'Guard', icon: Shield },
            { id: 'admin', label: 'Admin', icon: Building2 },
            { id: 'host', label: 'Host', icon: UserCheck, badge: pendingCount },
            { id: 'visitor', label: 'Visitor', icon: Users }
          ].map(r => {
            const Icon = r.icon;
            const isActive = currentUserRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setCurrentUserRole(r.id);
                  if (r.id === 'guard') setActivePage('guard');
                  else if (r.id === 'admin') setActivePage('dashboard');
                  else if (r.id === 'host') setActivePage('host-approvals');
                  else if (r.id === 'visitor') setActivePage('pre-register');
                }}
                className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all relative ' + 
                  (isActive 
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {r.badge > 0 && (
                  <span className="w-3.5 h-3.5 text-[9px] bg-amber-500 text-slate-950 font-black rounded-full flex items-center justify-center">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 10 Stages Quick Icon Button */}
        <button
          onClick={onOpenStages}
          title="10 Stages Proposal Compliance Directory"
          className="p-2 text-sky-400 hover:text-white bg-slate-950 hover:bg-sky-950/60 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer shadow-sm group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Notifications Bell Icon */}
        <button
          onClick={() => setNotifDrawerOpen(true)}
          title="View Security Alerts & Notifications"
          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors relative cursor-pointer shadow-sm"
        >
          <Bell className="w-4 h-4" />
          {criticalAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
              {criticalAlertsCount}
            </span>
          )}
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset system data to initial demonstration state?')) {
              resetToDemoData();
            }
          }}
          title="Reset Demo Data"
          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

      </div>

      {/* Real-Time Security Notifications Drawer */}
      <NotificationsDrawer 
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </header>
  );
}

