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
  LogOut,
  Home,
  User,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { 
    currentUserRole, 
    setCurrentUserRole, 
    currentGate, 
    setCurrentGate, 
    activeAlerts,
    resetToDemoData,
    visits,
    currentUser,
    logout,
    isAuthenticated
  } = useVms();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = visits.filter(v => v.status === 'PENDING').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between no-print">
      {/* Left: Brand / System Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActivePage('landing')}
          title="Go to Landing Page"
          className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30 hover:opacity-90 transition-opacity"
        >
          <Shield className="w-5 h-5 text-white" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">ILIZIEN VMS</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
              Biometric Suite 2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Multi-Modal Identity & Gate Pass System
          </p>
        </div>
      </div>

      {/* Center: Live Station Status & Clock */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-medium">Gate Terminal:</span>
          <select 
            value={currentGate}
            onChange={(e) => setCurrentGate(e.target.value)}
            className="bg-transparent font-semibold text-sky-400 focus:outline-none cursor-pointer"
          >
            <option value="Main Gate 01" className="bg-slate-900 text-white">Main Gate 01 (Front)</option>
            <option value="North Gate 02" className="bg-slate-900 text-white">North Gate 02 (R&D)</option>
            <option value="VIP Lobby" className="bg-slate-900 text-white">VIP Lobby</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-slate-200">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        </div>
      </div>

      {/* Right: User Profile, Role Switcher & System Actions */}
      <div className="flex items-center gap-2.5">
        
        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-medium text-slate-400 px-1.5 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-400" /> Switch:
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
                className={'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all relative ' + 
                  (isActive 
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {r.badge > 0 && (
                  <span className="w-3.5 h-3.5 text-[9px] bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center">
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Home / Landing button */}
        <button
          onClick={() => setActivePage('landing')}
          title="Visit Public Landing Page"
          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors flex items-center gap-1 text-xs"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (confirm('Reset system data to initial demonstration state?')) {
              resetToDemoData();
            }
          }}
          title="Reset Demo Data"
          className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Current User Chip & Logout */}
        <div className="flex items-center gap-2 bg-slate-950 pl-2 pr-1 py-1 rounded-xl border border-slate-800">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block leading-tight">{currentUser?.name || 'Authorized Staff'}</span>
            <span className="text-[10px] text-sky-400 font-mono uppercase">{currentUserRole}</span>
          </div>

          <button
            onClick={() => {
              logout();
              setActivePage('login');
            }}
            title="Sign Out"
            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
