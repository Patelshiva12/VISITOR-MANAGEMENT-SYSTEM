import React, { useState, useMemo } from 'react';
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
  Navigation,
  UserCheck,
  UserX,
  Zap,
  Key,
  Shield,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { formatTimeOnly, formatDateTime, formatDuration, getElapsedMinutes } from '../utils/formatters';
import ZoneBiometricTerminalModal from '../components/ZoneBiometricTerminalModal';
import Pagination from '../components/Pagination';

export default function ZoneAccess() {
  const { zones, visits, updateVisit, updateVisitor, simulateZoneScan, activeAlerts, auditLogs, logAudit, currentGate } = useVms();
  
  // Active Main Tab
  const [activeTab, setActiveTab] = useState('ZONE_USERS'); // 'ZONE_USERS' | 'LIVE_TRACKER' | 'SIMULATOR' | 'MATRIX' | 'MOVEMENT_LOGS'
  
  // Selected Zone for Zone-wise view and terminal
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || 'ZONE-01');
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);

  // Filter & Search states for Zone-wise list
  const [visitorFilter, setVisitorFilter] = useState('ALL'); // 'ALL' | 'AUTHORIZED' | 'RESTRICTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simulator tab state
  const [simVisitId, setSimVisitId] = useState(visits[0]?.id || '');
  const [simZoneId, setSimZoneId] = useState(zones[0]?.id || 'ZONE-01');
  const [scanResult, setScanResult] = useState(null);

  // Movement logs search
  const [movementSearch, setMovementSearch] = useState('');

  // Find active selected zone object
  const activeZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'ZONE-01',
    code: 'ZONE-01',
    name: 'Main Reception & Visitor Lobby',
    floor: 'Ground Floor • Main Gate',
    securityLevel: 'Public',
    description: 'Open reception area for visitor check-in and basic clearance.'
  };

  const activeInsideVisits = visits.filter(v => v.status === 'CHECKED_IN');

  // Compute authorized and restricted lists for selected zone
  const allZoneUsers = useMemo(() => {
    return visits.map(v => {
      const allowed = v.allowedZones || ['ZONE-01', 'ZONE-02'];
      const isAuthorized = allowed.includes(selectedZoneId);
      return {
        ...v,
        isAuthorizedForSelectedZone: isAuthorized
      };
    });
  }, [visits, selectedZoneId]);

  const filteredZoneUsers = useMemo(() => {
    return allZoneUsers.filter(user => {
      // Status Filter
      if (visitorFilter === 'AUTHORIZED' && !user.isAuthorizedForSelectedZone) return false;
      if (visitorFilter === 'RESTRICTED' && user.isAuthorizedForSelectedZone) return false;

      // Text search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = (user.visitorName || '').toLowerCase().includes(q);
        const passMatch = (user.passNumber || '').toLowerCase().includes(q);
        const compMatch = (user.visitorCompany || '').toLowerCase().includes(q);
        const phoneMatch = (user.visitorPhone || '').toLowerCase().includes(q);
        if (!nameMatch && !passMatch && !compMatch && !phoneMatch) return false;
      }

      return true;
    });
  }, [allZoneUsers, visitorFilter, searchTerm]);

  // Pagination slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredZoneUsers.slice(start, start + itemsPerPage);
  }, [filteredZoneUsers, currentPage]);

  const totalPages = Math.ceil(filteredZoneUsers.length / itemsPerPage) || 1;

  // Toggle Access (Grant / Revoke) for single visitor in currently selected zone
  const handleToggleZoneAccess = (userVisit) => {
    const currentZones = userVisit.allowedZones || ['ZONE-01', 'ZONE-02'];
    const hasAccess = currentZones.includes(selectedZoneId);
    const newZones = hasAccess 
      ? currentZones.filter(z => z !== selectedZoneId)
      : [...currentZones, selectedZoneId];

    updateVisit(userVisit.id, { allowedZones: newZones });
    if (userVisit.visitorId) {
      updateVisitor(userVisit.visitorId, { allowed_zones: newZones });
    }

    logAudit(
      hasAccess ? 'ZONE_ACCESS_REVOKED' : 'ZONE_ACCESS_GRANTED',
      `${hasAccess ? 'Revoked' : 'Granted'} access for ${userVisit.visitorName} to ${activeZone.name} (${activeZone.code})`,
      hasAccess ? 'WARNING' : 'SUCCESS',
      currentGate
    );
  };

  // Test Door Scan Handler (Simulator tab)
  const handleTestDoorScan = () => {
    if (!simVisitId || !simZoneId) return;
    const res = simulateZoneScan(simVisitId, simZoneId);
    setScanResult(res);
  };

  // Movement logs filter
  const zoneMovementLogs = auditLogs.filter(log => 
    log.eventType.includes('ZONE') || log.eventType.includes('SECURITY_BREACH')
  ).filter(log => 
    log.description.toLowerCase().includes(movementSearch.toLowerCase()) ||
    log.performedBy.toLowerCase().includes(movementSearch.toLowerCase())
  );

  const authCount = allZoneUsers.filter(u => u.isAuthorizedForSelectedZone).length;
  const restrCount = allZoneUsers.filter(u => !u.isAuthorizedForSelectedZone).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">
                Zone Access Control & Live Biometric Checkpoint
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Select security zones, manage visitor permissions, and verify interior door access via Live Face AI & Fingerprints.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto shrink-0">
          {[
            { id: 'ZONE_USERS', label: 'Zone Permission List', icon: Users },
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
                onClick={() => {
                  setActiveTab(t.id);
                  setCurrentPage(1);
                }}
                className={'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + 
                  (isSelected ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900')}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Security Zones Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((z) => {
          const isSelected = z.id === selectedZoneId;
          const allowedInZone = visits.filter(v => v.allowedZones && v.allowedZones.includes(z.id)).length;
          
          return (
            <div 
              key={z.id}
              onClick={() => {
                setSelectedZoneId(z.id);
                setCurrentPage(1);
              }}
              className={'rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all cursor-pointer border ' + 
                (isSelected 
                  ? 'bg-slate-900/90 border-sky-500 ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/10' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80')}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-sky-400">{z.code}</span>
                <span className={'text-[10px] font-bold px-2.5 py-0.5 rounded-full border ' + 
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
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{z.description}</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Authorized Visitors:</span>
                <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {allowedInZone} Permitted
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ZONE-WISE USER LIST & BIOMETRIC VERIFICATION (MAIN REQUESTED VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'ZONE_USERS' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Active Zone Control & Biometric Terminal Launcher Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Dropdown Selector */}
              <div className="space-y-1.5 max-w-md w-full">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Building className="w-4 h-4 text-sky-400" />
                  Select Target Security Zone:
                </label>
                <div className="relative">
                  <select
                    value={selectedZoneId}
                    onChange={(e) => {
                      setSelectedZoneId(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 appearance-none focus:outline-none focus:border-sky-500 cursor-pointer pr-10"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.code}: {z.name} — ({z.securityLevel} • {z.floor})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons: Open Live Biometric Terminal */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTerminalModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Launch Live Door Biometric Scanner</span>
                </button>
              </div>

            </div>

            {/* Active Zone Details Strip */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Zone Code</span>
                <span className="font-extrabold text-sky-400 font-mono text-sm">{activeZone.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Classification</span>
                <span className="font-bold text-white">{activeZone.securityLevel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Floor & Wing</span>
                <span className="font-bold text-slate-200">{activeZone.floor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Access Ratio</span>
                <span className="font-bold text-emerald-400 font-mono">{authCount} Authorized / {restrCount} Restricted</span>
              </div>
            </div>
          </div>

          {/* Zone-Wise Visitor List Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            
            {/* Table Filters & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => { setVisitorFilter('ALL'); setCurrentPage(1); }}
                  className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + 
                    (visitorFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200')}
                >
                  All Visitors ({allZoneUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setVisitorFilter('AUTHORIZED'); setCurrentPage(1); }}
                  className={'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ' + 
                    (visitorFilter === 'AUTHORIZED' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:bg-slate-900')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized ({authCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setVisitorFilter('RESTRICTED'); setCurrentPage(1); }}
                  className={'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ' + 
                    (visitorFilter === 'RESTRICTED' ? 'bg-rose-600 text-white shadow-md' : 'text-rose-400 hover:bg-slate-900')}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted ({restrCount})</span>
                </button>
              </div>

              <div className="relative sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search visitor, pass, company..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Visitor / Pass</th>
                    <th className="p-3.5">Company & Host</th>
                    <th className="p-3.5 text-center">Status for {activeZone.code}</th>
                    <th className="p-3.5">All Permitted Zones</th>
                    <th className="p-3.5 text-right">Zone Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        No visitors match the current filter for {activeZone.name}.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map(user => {
                      const isAuth = user.isAuthorizedForSelectedZone;
                      const allowedList = user.allowedZones || ['ZONE-01', 'ZONE-02'];

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Visitor Info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {user.visitorPhoto ? (
                                <img 
                                  src={user.visitorPhoto} 
                                  alt={user.visitorName} 
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0" 
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-xs shrink-0">
                                  {user.visitorName?.charAt(0) || 'V'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">{user.visitorName}</span>
                                <span className="font-mono text-[10px] text-sky-400 font-semibold">{user.passNumber}</span>
                              </div>
                            </div>
                          </td>

                          {/* Company & Host */}
                          <td className="p-3.5">
                            <span className="text-slate-300 block truncate">{user.visitorCompany || 'Direct Guest'}</span>
                            <span className="text-[10px] text-slate-400 block truncate">Host: {user.hostName}</span>
                          </td>

                          {/* Access Badge for Selected Zone */}
                          <td className="p-3.5 text-center">
                            {isAuth ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] rounded-full shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>AUTHORIZED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] rounded-full shadow-sm">
                                <Lock className="w-3.5 h-3.5 text-rose-400" />
                                <span>RESTRICTED</span>
                              </span>
                            )}
                          </td>

                          {/* All Permitted Zones */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {allowedList.map(zId => {
                                const isCurrent = zId === selectedZoneId;
                                return (
                                  <span 
                                    key={zId} 
                                    className={'px-2 py-0.5 rounded text-[9px] font-mono font-bold ' + 
                                      (isCurrent 
                                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' 
                                        : 'bg-slate-800 text-slate-400')}
                                  >
                                    {zId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Action Button: Grant / Revoke */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleZoneAccess(user)}
                                className={'px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow ' + 
                                  (isAuth 
                                    ? 'bg-slate-800 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-emerald-600/30')}
                              >
                                {isAuth ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Revoke Access</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                                    <span>Grant Access</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredZoneUsers.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredZoneUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE LOCATION TRACKER                                             */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE_TRACKER' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Live Visitor Current Area & Zone Locator
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time checkpoint tracking showing which room/zone each active visitor is in right now.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeInsideVisits.length} Visitors Active Inside Building
              </span>
            </div>

            {activeInsideVisits.length === 0 ? (
              <div className="p-10 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No visitors currently checked-in inside premises. Check-in a visitor from Guard Kiosk to track location.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInsideVisits.map((visit, idx) => {
                  const elapsed = getElapsedMinutes(visit.checkInTime);
                  const isOverstay = elapsed > visit.expectedDurationMins;
                  const currentZone = idx === 0 
                    ? { name: 'ZONE-02: General Office Floor', floor: 'Floor 2 • Sector B', status: 'AUTHORIZED' }
                    : { name: 'ZONE-01: Main Reception & Visitor Lobby', floor: 'Ground Floor • Main Gate', status: 'AUTHORIZED' };

                  return (
                    <div
                      key={visit.id}
                      className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-sky-500/50 transition-all shadow-md"
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
                          <span className="text-[10px] text-slate-400 block">Host: {visit.hostName} ({visit.hostDept})</span>
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
                          <span className="text-slate-400">Allowed:</span>
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

      {/* ========================================================================= */}
      {/* TAB 3: TURNSTILE SIMULATOR                                               */}
      {/* ========================================================================= */}
      {activeTab === 'SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Simulator Controller */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
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
                  value={simVisitId}
                  onChange={(e) => setSimVisitId(e.target.value)}
                  className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {visits.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.visitorName} ({v.passNumber}) — {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Zone Entry Point:</label>
                <select
                  value={simZoneId}
                  onChange={(e) => setSimZoneId(e.target.value)}
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
                type="button"
                onClick={handleTestDoorScan}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Zone Security Exceptions
              </h3>
              <span className="text-xs text-slate-400 font-mono">{activeAlerts.length} Active Incidents</span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
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
                    <div className="text-[10px] text-slate-400">Security Gate: {alert.gate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCESS MATRIX TABLE                                               */}
      {/* ========================================================================= */}
      {activeTab === 'MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 space-y-4 shadow-xl animate-in fade-in">
          <h3 className="font-bold text-white text-sm">Zone Permission Matrix by Visitor</h3>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Visitor Name</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5 text-center">ZONE-01 (Reception)</th>
                  <th className="p-3.5 text-center">ZONE-02 (Offices)</th>
                  <th className="p-3.5 text-center">ZONE-03 (R&D Labs)</th>
                  <th className="p-3.5 text-center">ZONE-04 (Data Vault)</th>
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
                            <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-400 font-bold text-[10px] rounded-full">
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

      {/* ========================================================================= */}
      {/* TAB 5: MOVEMENT LOGS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'MOVEMENT_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">Zone Movement Events Log</h3>
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

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
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
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                      No zone movement records found. Use the Turnstile Simulator or Live Biometric Terminal to test door access.
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

      {/* Live Zone Door Biometric Terminal Modal */}
      {isTerminalModalOpen && (
        <ZoneBiometricTerminalModal
          zone={activeZone}
          isOpen={isTerminalModalOpen}
          onClose={() => setIsTerminalModalOpen(false)}
        />
      )}

    </div>
  );
}
