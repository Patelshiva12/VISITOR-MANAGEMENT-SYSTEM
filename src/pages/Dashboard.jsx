import React, { useState, useEffect } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Compass, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  Eye,
  Camera,
  Fingerprint,
  TrendingUp,
  BarChart3,
  Server
} from 'lucide-react';
import { formatTimeOnly, formatDuration, getElapsedMinutes } from '../utils/formatters';
import GatePassModal from '../components/GatePassModal';

export default function Dashboard({ setActivePage }) {
  const { visits, visitors, auditLogs, currentGate } = useVms();
  const [selectedPassVisit, setSelectedPassVisit] = useState(null);
  const [, setTicker] = useState(0);

  // Real-time ticking for live elapsed timers
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const insideVisits = visits.filter(v => v.status === 'CHECKED_IN');
  const pendingVisits = visits.filter(v => v.status === 'PENDING');
  const approvedVisits = visits.filter(v => v.status === 'APPROVED');
  const rejectedVisits = visits.filter(v => v.status === 'REJECTED');
  
  // Overstay calculations
  const overstayVisits = insideVisits.filter(v => {
    const elapsed = getElapsedMinutes(v.checkInTime);
    return elapsed > (v.expectedDurationMins || 60);
  });

  const blacklistedCount = visitors.filter(v => v.isBlacklisted).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Security Command Center & Real-Time Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring active premises traffic, multi-modal biometric validations, and gate authorizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('guard')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all"
          >
            Launch Guard Kiosk <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Currently Inside */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inside Premises</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{insideVisits.length}</span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Active
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all security checkpoints</div>
        </div>

        {/* Card 2: Expected / Approved */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready at Gate</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{approvedVisits.length}</span>
            <span className="text-[11px] text-sky-400 font-semibold">Pre-Approved</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for biometric check-in</div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Host</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingVisits.length}</span>
            <span className="text-[11px] text-amber-400 font-semibold">Awaiting Approval</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires host clearance</div>
        </div>

        {/* Card 4: Overstay Alerts */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overstay Alert</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">{overstayVisits.length}</span>
            <span className="text-[11px] text-rose-400 font-bold animate-pulse">Exceeded Time</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Action required by security</div>
        </div>

        {/* Card 5: Security Watch / Flagged */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Watch</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{blacklistedCount}</span>
            <span className="text-[11px] text-purple-400 font-semibold">Flagged Profiles</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Automatic gate block</div>
        </div>

      </div>

      {/* Hourly Flow Chart & Overstay Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Currently Inside Monitor */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Live Visitors Inside Premises ({insideVisits.length})
              </h3>
              <p className="text-xs text-slate-400">Tracking entry time, allowed duration, and active overstay countdowns.</p>
            </div>
            <button
              onClick={() => setActivePage('guard')}
              className="text-xs text-sky-400 hover:underline font-semibold"
            >
              Open Guard Kiosk &rarr;
            </button>
          </div>

          {insideVisits.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No visitors currently inside premises.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Visitor Profile</th>
                    <th className="pb-3">Host & Department</th>
                    <th className="pb-3">Entry Time</th>
                    <th className="pb-3">Elapsed / Allowed</th>
                    <th className="pb-3 text-right">Pass Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {insideVisits.map(visit => {
                    const elapsed = getElapsedMinutes(visit.checkInTime);
                    const isOverstay = elapsed > visit.expectedDurationMins;
                    return (
                      <tr key={visit.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={visit.visitorPhoto} 
                              alt={visit.visitorName} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-white block">{visit.visitorName}</span>
                              <span className="text-[10px] text-slate-400">{visit.visitorCompany}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-slate-200 block">{visit.hostName}</span>
                          <span className="text-[10px] text-slate-400">{visit.hostDept}</span>
                        </td>
                        <td className="py-3 font-mono text-slate-300">
                          {formatTimeOnly(visit.checkInTime)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={'font-mono font-bold px-2 py-0.5 rounded-lg ' + 
                              (isOverstay ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-300')}>
                              {formatDuration(elapsed)} / {visit.expectedDurationMins}m
                            </span>
                            {isOverstay && (
                              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> OVERSTAY
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedPassVisit(visit)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 rounded-xl text-[11px] font-bold transition-all border border-slate-700"
                          >
                            View Badge
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Biometric Pipeline Telemetry Widget */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Biometric Engine Telemetry
            </h3>
            <p className="text-xs text-slate-400">Multi-modal recognition & anti-spoofing engine status.</p>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* Facial Recognition Node */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-sky-400" /> Facial Pipeline
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                  ONLINE (12ms)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Detection Model:</span>
                  <span className="text-slate-200 font-mono">SCRFD-10G (5-Point)</span>
                </div>
                <div className="flex justify-between">
                  <span>Recognition Model:</span>
                  <span className="text-slate-200 font-mono">ArcFace InsightFace R100</span>
                </div>
                <div className="flex justify-between">
                  <span>Liveness Anti-Spoof:</span>
                  <span className="text-emerald-400 font-mono font-semibold">Active (Silent Blink + 3D)</span>
                </div>
              </div>
            </div>

            {/* Fingerprint Node */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-sky-400" /> Fingerprint Scanner
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                  READY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Sensor Type:</span>
                  <span className="text-slate-200 font-mono">500 DPI Optical Prism</span>
                </div>
                <div className="flex justify-between">
                  <span>Template Standard:</span>
                  <span className="text-slate-200 font-mono">ANSI/INCITS 378</span>
                </div>
              </div>
            </div>

            {/* Iris Node */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-400" /> Iris Recognition
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                  STANDBY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Illumination:</span>
                  <span className="text-slate-200 font-mono">Near-Infrared (NIR 850nm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Capture Range:</span>
                  <span className="text-slate-200 font-mono">35 - 45 cm Auto-Focus</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Gate Pass Modal Preview */}
      {selectedPassVisit && (
        <GatePassModal
          visit={selectedPassVisit}
          onClose={() => setSelectedPassVisit(null)}
        />
      )}

    </div>
  );
}
