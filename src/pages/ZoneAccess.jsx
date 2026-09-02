import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Compass, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Lock, 
  Unlock, 
  Scan, 
  AlertTriangle, 
  CheckCircle2, 
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { formatTimeOnly } from '../utils/formatters';

export default function ZoneAccess() {
  const { zones, visits, simulateZoneScan, activeAlerts } = useVms();
  const [selectedVisitId, setSelectedVisitId] = useState(visits[0]?.id || '');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || '');
  const [scanResult, setScanResult] = useState(null);

  const activeInsideVisits = visits.filter(v => v.status === 'CHECKED_IN');

  const handleTestDoorScan = () => {
    if (!selectedVisitId || !selectedZoneId) return;
    const res = simulateZoneScan(selectedVisitId, selectedZoneId);
    setScanResult(res);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Zone-Based Access Management (Extension Module)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time movement tracking, zone security clearance validation, and automatic breach detection.
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          Proposal Section 14 Active
        </span>
      </div>

      {/* Security Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map(z => {
          const zoneVisits = visits.filter(v => v.status === 'CHECKED_IN' && v.allowedZones && v.allowedZones.includes(z.id));
          return (
            <div 
              key={z.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{z.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                  {z.securityLevel}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{z.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{z.description}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-400">Authorized Now:</span>
                <span className="font-bold text-emerald-400 font-mono">{zoneVisits.length} visitors</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Zone Scanner Simulator & Door Entry Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Simulator Controller */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Scan className="w-4 h-4 text-sky-400" />
              Zone Turnstile / Door Scanner Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Test how the system verifies visitor permissions when scanning at internal zone access doors.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Pick Visitor */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Select Active Visitor / Pass:</label>
              <select
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                {visits.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.visitorName} ({v.passNumber}) � {v.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Pick Target Zone Door */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Select Access Door / Security Zone:</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.code}: {z.name} ({z.securityLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={handleTestDoorScan}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Scan className="w-4 h-4" /> Simulate Turnstile / Door Scan
            </button>
          </div>

          {/* Test Scan Result Feedback */}
          {scanResult && (
            <div className={'p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ' + 
              (scanResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300')}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {scanResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                <span>{scanResult.message}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {scanResult.success 
                  ? 'Turnstile unlocked. Access event recorded in immutable audit logs.' 
                  : 'Alarm triggered! Guard dispatched and security alert generated in real-time.'}
              </p>
            </div>
          )}

        </div>

        {/* Right: Security Breach Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Zone Security Exceptions & Breaches
            </h3>
            <span className="text-xs text-slate-400 font-mono">{activeAlerts.length} active</span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto" />
              <span>No unauthorized zone breaches detected. All visitors in assigned zones.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {alert.visitorName}
                    </span>
                    <span className="font-mono text-[10px] text-rose-400">{formatTimeOnly(alert.timestamp)}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Attempted entry into: <strong className="text-rose-300">{alert.zoneName} ({alert.zoneCode})</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">Security Gate: {alert.gate}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
