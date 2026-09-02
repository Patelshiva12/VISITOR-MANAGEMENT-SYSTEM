import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Shield, 
  Search, 
  QrCode, 
  Scan, 
  LogOut, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { formatTimeOnly, formatDateOnly, formatDuration, getElapsedMinutes } from '../utils/formatters';
import BiometricScannerModal from '../components/BiometricScannerModal';
import QRScannerModal from '../components/QRScannerModal';
import GatePassModal from '../components/GatePassModal';

export default function GuardKiosk() {
  const { 
    visits, 
    visitors, 
    currentGate, 
    checkOutVisitor,
    checkInVisitor
  } = useVms();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INSIDE' | 'APPROVED' | 'PENDING'
  
  // Modals
  const [verifyingVisit, setVerifyingVisit] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activePassVisit, setActivePassVisit] = useState(null);

  // Filter visits
  const filteredVisits = visits.filter(v => {
    const matchesSearch = 
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === 'INSIDE') return v.status === 'CHECKED_IN';
    if (activeTab === 'APPROVED') return v.status === 'APPROVED';
    if (activeTab === 'PENDING') return v.status === 'PENDING';
    return true;
  });

  const insideCount = visits.filter(v => v.status === 'CHECKED_IN').length;
  const approvedCount = visits.filter(v => v.status === 'APPROVED').length;
  const pendingCount = visits.filter(v => v.status === 'PENDING').length;

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-lg font-black text-white tracking-tight">
              Security Gate Terminal � {currentGate}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid Biometric Verification, Identity Matching, and Gate Pass Issuance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrModalOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" /> Scan Visitor QR
          </button>

          <button
            onClick={() => {
              const firstApproved = visits.find(v => v.status === 'APPROVED');
              if (firstApproved) {
                setVerifyingVisit(firstApproved);
              } else {
                alert('No pending approved visitors at the gate.');
              }
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
          >
            <Scan className="w-4 h-4" /> Next Biometric Check-In
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Records', count: visits.length },
            { id: 'APPROVED', label: 'Ready for Check-In', count: approvedCount, badgeColor: 'bg-sky-500 text-white' },
            { id: 'INSIDE', label: 'Currently Inside', count: insideCount, badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
            { id: 'PENDING', label: 'Pending Approval', count: pendingCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ' + 
                (activeTab === tab.id 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200')}
            >
              <span>{tab.label}</span>
              <span className={'text-[10px] px-1.5 py-0.2 rounded-full ' + (tab.badgeColor || 'bg-slate-800 text-slate-300')}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search visitor, phone, pass #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Visitor Profile</th>
                <th className="p-4">Pass & Gate</th>
                <th className="p-4">Host & Purpose</th>
                <th className="p-4">Status & Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No visitor records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredVisits.map(visit => {
                  const elapsed = getElapsedMinutes(visit.checkInTime);
                  const isOverstay = visit.status === 'CHECKED_IN' && elapsed > visit.expectedDurationMins;

                  return (
                    <tr key={visit.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Visitor Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={visit.visitorPhoto} 
                            alt={visit.visitorName} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white text-sm block">{visit.visitorName}</span>
                            <span className="text-[11px] text-slate-400 block">{visit.visitorCompany}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{visit.visitorPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pass Details */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-200 block text-xs">{visit.passNumber}</span>
                        <span className="text-[11px] text-sky-400 block">{visit.gate || currentGate}</span>
                        {visit.vehicleNumber && visit.vehicleNumber !== 'N/A' && (
                          <span className="text-[10px] text-slate-400 font-mono block">Veh: {visit.vehicleNumber}</span>
                        )}
                      </td>

                      {/* Host & Purpose */}
                      <td className="p-4">
                        <span className="font-bold text-slate-200 block">{visit.hostName}</span>
                        <span className="text-[10px] text-slate-400 block">{visit.hostDept}</span>
                        <span className="text-[11px] text-slate-300 block truncate max-w-xs mt-0.5">"{visit.purpose}"</span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' + 
                            (visit.status === 'CHECKED_IN' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : visit.status === 'APPROVED' 
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                              : visit.status === 'PENDING' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {visit.status}
                          </span>

                          {visit.status === 'CHECKED_IN' && (
                            <div className="text-[10px] font-mono text-slate-400 block">
                              In: {formatTimeOnly(visit.checkInTime)} ({formatDuration(elapsed)})
                              {isOverstay && (
                                <span className="text-rose-400 font-bold ml-1 block">?? OVERSTAY</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* 1. If APPROVED => Verify & Check-In */}
                          {visit.status === 'APPROVED' && (
                            <button
                              onClick={() => setVerifyingVisit(visit)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Scan className="w-3.5 h-3.5" /> Biometric Check-In
                            </button>
                          )}

                          {/* 2. If CHECKED_IN => Check-Out */}
                          {visit.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => {
                                if (confirm('Check-out visitor ' + visit.visitorName + '?')) {
                                  checkOutVisitor(visit.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Check-Out
                            </button>
                          )}

                          {/* 3. If PENDING => Review note */}
                          {visit.status === 'PENDING' && (
                            <button
                              onClick={() => setVerifyingVisit(visit)}
                              className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-xs font-bold border border-amber-500/40 transition-all"
                            >
                              Check Status
                            </button>
                          )}

                          {/* View Gate Pass */}
                          <button
                            onClick={() => setActivePassVisit(visit)}
                            title="View / Print Pass"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
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
      </div>

      {/* Biometric Verification Modal */}
      {verifyingVisit && (
        <BiometricScannerModal
          visit={verifyingVisit}
          onComplete={() => {
            setVerifyingVisit(null);
          }}
          onClose={() => setVerifyingVisit(null)}
        />
      )}

      {/* QR Scanner Modal */}
      {qrModalOpen && (
        <QRScannerModal
          onSelectVisit={(visit) => {
            setQrModalOpen(false);
            setVerifyingVisit(visit);
          }}
          onClose={() => setQrModalOpen(false)}
        />
      )}

      {/* Gate Pass Print Modal */}
      {activePassVisit && (
        <GatePassModal
          visit={activePassVisit}
          onClose={() => setActivePassVisit(null)}
        />
      )}

    </div>
  );
}
