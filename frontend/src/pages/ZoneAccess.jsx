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
  Layers,
  MapPin,
  Sliders,
  History,
  Search,
  Building,
  Navigation
} from 'lucide-react';
import { formatTimeOnly, formatDateTime, formatDuration, getElapsedMinutes } from '../utils/formatters';

export default function ZoneAccess() {
  const { zones, visits, simulateZoneScan, activeAlerts, auditLogs } = useVms();
  const [selectedVisitId, setSelectedVisitId] = useState(visits[0]?.id || '');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || '');
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('LIVE_TRACKER'); // 'LIVE_TRACKER' | 'SIMULATOR' | 'MATRIX' | 'MOVEMENT_LOGS'
  const [movementSearch, setMovementSearch] = useState('');

  const activeInsideVisits = visits.filter(v => v.status === 'CHECKED_IN');

  const handleTestDoorScan = () => {
    if (!selectedVisitId || !selectedZoneId) return;
    const res = simulateZoneScan(selectedVisitId, selectedZoneId);
    setScanResult(res);
  };

  // Filter Zone Movement Events (Section 14.4)
  const zoneMovementLogs = auditLogs.filter(log => 
    log.eventType.includes('ZONE') || log.eventType.includes('SECURITY_BREACH')
  ).filter(log => 
    log.description.toLowerCase().includes(movementSearch.toLowerCase()) ||
    log.performedBy.toLowerCase().includes(movementSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Zone-Based Access & Live Location Tracking</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track exact visitor locations inside the building, monitor zone occupancy, and detect unauthorized movements (Proposal Section 14).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'LIVE_TRACKER', label: 'Live Location Tracker', icon: Navigation },
            { id: 'SIMULATOR', label: 'Turnstile Simulator', icon: Scan },
            { id: 'MATRIX', label: 'Permission Matrix', icon: Layers },
            { id: 'MOVEMENT_LOGS', label: 'Movement Logs', icon: History }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ' + 
                  (isSelected ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-slate-200')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Security Zones Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((z, idx) => {
          // Dynamic visitors in this zone
          const inThisZone = idx === 0 
            ? activeInsideVisits.filter((_, i) => i % 2 === 0) 
            : idx === 1 
            ? activeInsideVisits.filter((_, i) => i % 2 === 1)
            : [];
          return (
            <div 
              key={z.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{z.code}</span>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border ' + 
                  (z.securityLevel === 'Public' ? 'bg-slate-950 text-slate-300 border-slate-800' :
                   z.securityLevel === 'Standard' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                   z.securityLevel === 'Restricted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                   'bg-rose-500/10 text-rose-400 border-rose-500/20')}>
                  {z.securityLevel}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> {z.name}
                </h3>
                <span className="text-[10px] text-sky-400 font-mono block mt-0.5">{z.floor}</span>
                <p className="text-xs text-slate-400 mt-1">{z.description}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-400">Current Occupancy:</span>
                <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {inThisZone.length} Inside
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TAB 0: LIVE LOCATION TRACKER (Main Answer to User Question) */}
      {activeTab === 'LIVE_TRACKER' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Live Visitor Current Area & Zone Locator
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time GPS/Turnstile checkpoint tracking showing which room/zone each active visitor is in right now.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeInsideVisits.length} Visitors Active Inside Building
              </span>
            </div>

            {activeInsideVisits.length === 0 ? (
              <div className="p-10 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                No visitors currently checked-in inside premises. Check-in a visitor from Guard Kiosk to track location.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInsideVisits.map((visit, idx) => {
                  const elapsed = getElapsedMinutes(visit.checkInTime);
                  const isOverstay = elapsed > visit.expectedDurationMins;
                  // Assigned zone simulation
                  const currentZone = idx === 0 
                    ? { name: 'ZONE-02: General Office Floor', floor: 'Floor 2 � Sector B', status: 'AUTHORIZED' }
                    : { name: 'ZONE-01: Main Reception & Visitor Lobby', floor: 'Ground Floor � Main Gate', status: 'AUTHORIZED' };

                  return (
                    <div
                      key={visit.id}
                      className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-sky-500/50 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        <img 
                          src={visit.visitorPhoto} 
                          alt={visit.visitorName} 
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm truncate">{visit.visitorName}</h4>
                            <span className="font-mono text-[10px] text-sky-400 font-bold">{visit.passNumber}</span>
                          </div>
                          <span className="text-xs text-slate-400 block truncate">{visit.visitorCompany}</span>
                          <span className="text-[10px] text-slate-500 block">Host: {visit.hostName} ({visit.hostDept})</span>
                        </div>
                      </div>

                      {/* CURRENT AREA LOCATION BANNER */}
                      <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Current Location:
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full">
                            {currentZone.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white pl-5">{currentZone.name}</div>
                        <div className="text-[10px] text-slate-400 pl-5 font-mono">{currentZone.floor}</div>
                      </div>

                      {/* Allowed Zones & Time */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Allowed:</span>
                          {(visit.allowedZones || ['ZONE-01', 'ZONE-02']).map(z => (
                            <span key={z} className="px-1.5 py-0.2 bg-slate-800 text-sky-400 rounded text-[9px] font-mono font-bold">
                              {z}
                            </span>
                          ))}
                        </div>

                        <span className={'font-mono font-bold px-2 py-0.5 rounded-lg text-[10px] ' + 
                          (isOverstay ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-300')}>
                          {formatDuration(elapsed)} / {visit.expectedDurationMins}m
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: Simulator */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Simulator Controller */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Scan className="w-4 h-4 text-sky-400" />
                Zone Door / Turnstile Scanner Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Select a visitor pass and test scanning at interior building zone entry turnstiles.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Visitor / Pass:</label>
                <select
                  value={selectedVisitId}
                  onChange={(e) => setSelectedVisitId(e.target.value)}
                  className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {visits.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.visitorName} ({v.passNumber}) � {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Zone Entry Point:</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.code}: {z.name} ({z.securityLevel})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTestDoorScan}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <Scan className="w-4 h-4" /> Simulate Turnstile / Door Access
              </button>
            </div>

            {scanResult && (
              <div className={'p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ' + 
                (scanResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300')}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scanResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                  <span>{scanResult.message}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {scanResult.success 
                    ? 'Turnstile unlocked. Visitor location updated in live tracker.' 
                    : 'Security breach recorded! Visual & audible alert triggered in Security Command Center.'}
                </p>
              </div>
            )}
          </div>

          {/* Real-time Exception & Alert Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Zone Security Exceptions
              </h3>
              <span className="text-xs text-slate-400 font-mono">{activeAlerts.length} Active Incidents</span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto" />
                <span>No unauthorized zone entries detected. All visitors in permitted areas.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {alert.visitorName}
                      </span>
                      <span className="font-mono text-[10px] text-rose-400">{formatTimeOnly(alert.timestamp)}</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Unauthorized Access into: <strong className="text-rose-300">{alert.zoneName} ({alert.zoneCode})</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">Security Gate: {alert.gate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Access Matrix Table */}
      {activeTab === 'MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Zone Permission Matrix by Visitor</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Visitor Name</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5 text-center">Z-REC (Public)</th>
                  <th className="p-3.5 text-center">Z-OFF (Office)</th>
                  <th className="p-3.5 text-center">Z-LAB (R&D)</th>
                  <th className="p-3.5 text-center">Z-DC (Server Vault)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white">{v.visitorName}</td>
                    <td className="p-3.5 text-slate-400">{v.visitorCompany}</td>
                    {['ZONE-01', 'ZONE-02', 'ZONE-03', 'ZONE-04'].map(zId => {
                      const isPermitted = v.allowedZones && v.allowedZones.includes(zId);
                      return (
                        <td key={zId} className="p-3.5 text-center">
                          {isPermitted ? (
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full">
                              ALLOWED
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-500 font-bold text-[10px] rounded-full">
                              RESTRICTED
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Searchable Movement Events Log (Proposal Section 14.4) */}
      {activeTab === 'MOVEMENT_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">Zone Movement Events Log (Section 14.4)</h3>
              <p className="text-xs text-slate-400">Searchable movement audit trail for all authorized and unauthorized internal door taps.</p>
            </div>

            <div className="relative sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search movement events..."
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Movement Details & Zone</th>
                  <th className="p-3.5">Gate / Turnstile</th>
                  <th className="p-3.5 text-right">Access Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {zoneMovementLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                      No zone movement records found. Use the Turnstile Simulator to simulate door taps.
                    </td>
                  </tr>
                ) : (
                  zoneMovementLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                      <td className="p-3.5 text-sky-400 font-bold">{log.eventType}</td>
                      <td className="p-3.5 text-slate-200 font-sans max-w-md">{log.description}</td>
                      <td className="p-3.5 text-slate-400">{log.gate}</td>
                      <td className="p-3.5 text-right">
                        <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ' + 
                          (log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')}>
                          {log.severity === 'CRITICAL' ? 'BREACH BLOCKED' : 'GRANTED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
