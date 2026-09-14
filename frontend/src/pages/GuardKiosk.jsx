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
  UserCheck,
  Tag,
  Camera,
  UserPlus,
  Plus
} from 'lucide-react';
import { formatTimeOnly, formatDateOnly, formatDuration, getElapsedMinutes } from '../utils/formatters';
import BiometricScannerModal from '../components/BiometricScannerModal';
import QRScannerModal from '../components/QRScannerModal';
import GatePassModal from '../components/GatePassModal';
import WalkInRegistrationModal from '../components/WalkInRegistrationModal';

export default function GuardKiosk() {
  const { 
    visits, 
    visitors, 
    currentGate, 
    checkOutVisitor,
    checkInVisitor,
    logAudit
  } = useVms();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INSIDE' | 'APPROVED' | 'PENDING'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Modals
  const [verifyingVisit, setVerifyingVisit] = useState(null);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activePassVisit, setActivePassVisit] = useState(null);
  const [exitVerifyVisit, setExitVerifyVisit] = useState(null);

  // Filter visits
  const filteredVisits = visits.filter(v => {
    const matchesSearch = 
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (selectedCategory !== 'ALL' && v.visitorCategory !== selectedCategory) return false;

    if (activeTab === 'INSIDE') return v.status === 'CHECKED_IN';
    if (activeTab === 'APPROVED') return v.status === 'APPROVED';
    if (activeTab === 'PENDING') return v.status === 'PENDING';
    return true;
  });

  const insideCount = visits.filter(v => v.status === 'CHECKED_IN').length;
  const approvedCount = visits.filter(v => v.status === 'APPROVED').length;
  const pendingCount = visits.filter(v => v.status === 'PENDING').length;

  const handlePrintPass = (visit) => {
    logAudit('PASS_REPRINTED', 'Gate pass reprint initiated for ' + visit.visitorName + ' (' + visit.passNumber + ')', 'INFO', currentGate);
    setActivePassVisit(visit);
  };

  const handleConfirmExit = (visit) => {
    checkOutVisitor(visit.id);
    setExitVerifyVisit(null);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-lg font-black text-white tracking-tight">
              Security Gate Terminal � {currentGate}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rapid Biometric Verification, Identity Matching, and Gate Pass Issuance (Proposal Section 8)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* FLOW 2: Spot Walk-In Visitor Registration */}
          <button
            onClick={() => setWalkInModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Plus className="w-4 h-4 text-white" /> Register Walk-In Visitor
          </button>

          <button
            onClick={() => setQrModalOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" /> Scan Visitor QR
          </button>

          <button
            onClick={() => {
              const firstApproved = visits.find(v => v.status === 'APPROVED');
              setVerifyingVisit(firstApproved || { 
                visitorName: 'Live Biometric Scanner',
                passNumber: 'Auto-Detect',
                isLiveScanner: true
              });
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Scan className="w-4 h-4" /> Next Biometric Check-In
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records', count: visits.length },
            { id: 'APPROVED', label: 'Ready for Check-In', count: approvedCount, badgeColor: 'bg-sky-500 text-white' },
            { id: 'INSIDE', label: 'Currently Inside', count: insideCount, badgeColor: 'bg-emerald-500 text-slate-950 font-bold' },
            { id: 'PENDING', label: 'Pending Approval', count: pendingCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ' + 
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

        {/* Category & Search */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Visitor Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-800 text-sky-400 font-bold focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="VIP Dignitary / Guest">VIP Guests</option>
            <option value="Business Client / Partner">Business Clients</option>
            <option value="Vendor / Service Contractor">Vendors</option>
            <option value="Audit & Regulatory Inspector">Auditors</option>
            <option value="Interview Candidate">Candidates</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
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

      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Visitor Profile & Category</th>
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
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm block">{visit.visitorName}</span>
                              {visit.visitorCategory && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-semibold">
                                  {visit.visitorCategory.split(' ')[0]}
                                </span>
                              )}
                            </div>
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
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                            >
                              <Scan className="w-3.5 h-3.5" /> Biometric Check-In
                            </button>
                          )}

                          {/* 2. If CHECKED_IN => Check-Out (with Exit Biometric option) */}
                          {visit.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => setExitVerifyVisit(visit)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Check-Out
                            </button>
                          )}

                          {/* 3. If PENDING => Review note */}
                          {visit.status === 'PENDING' && (
                            <button
                              onClick={() => setVerifyingVisit(visit)}
                              className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl text-xs font-bold border border-amber-500/40 transition-all"
                            >
                              Check Status
                            </button>
                          )}

                          {/* View & Print Gate Pass (Logs pass reprint event) */}
                          <button
                            onClick={() => handlePrintPass(visit)}
                            title="Print / View Gate Pass"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
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

      {/* Flow 2: Spot Walk-In Registration Modal */}
      {walkInModalOpen && (
        <WalkInRegistrationModal
          isOpen={walkInModalOpen}
          onClose={() => setWalkInModalOpen(false)}
          onComplete={() => setWalkInModalOpen(false)}
        />
      )}

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

      {/* Exit Biometric Re-Verification Modal (Proposal Section 8) */}
      {exitVerifyVisit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-white">
              <LogOut className="w-5 h-5 text-rose-400" />
              <h4 className="font-extrabold text-sm">Confirm Exit & Pass Closure</h4>
            </div>
            
            <p className="text-xs text-slate-300">
              Confirm gate exit for <strong className="text-white">{exitVerifyVisit.visitorName}</strong>. This will deactivate Gate Pass <strong className="text-sky-400">{exitVerifyVisit.passNumber}</strong>.
            </p>

            {exitVerifyVisit.laptopSerial && exitVerifyVisit.laptopSerial !== 'NONE' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span>Declared Asset Verification:</span>
                <span className="font-mono font-bold text-sky-400 block mt-0.5">{exitVerifyVisit.laptopSerial} (Check physical laptop)</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setExitVerifyVisit(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmExit(exitVerifyVisit)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                Confirm Exit & Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
