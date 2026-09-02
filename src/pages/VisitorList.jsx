import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Fingerprint, 
  Camera, 
  Eye, 
  FileText, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatDateOnly } from '../utils/formatters';

export default function VisitorList({ setActivePage }) {
  const { visitors, visits, toggleBlacklist } = useVms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filteredVisitors = visitors.filter(v => 
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.company && v.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    v.phone.includes(searchQuery) ||
    v.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Centralized Visitor Directory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Master database of registered personnel, biometric references, and security access profiles.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, company, phone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitors.map(v => {
          const visitorVisits = visits.filter(visit => visit.visitorId === v.id);
          return (
            <div
              key={v.id}
              className={'bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 transition-all relative overflow-hidden ' + 
                (v.isBlacklisted ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-sky-500/40')}
            >
              {v.isBlacklisted && (
                <div className="bg-rose-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-0.5 text-center -mx-5 -mt-5 mb-2">
                  SECURITY WATCH / BLACKLISTED
                </div>
              )}

              <div className="flex items-start gap-3">
                <img
                  src={v.photoUrl}
                  alt={v.fullName}
                  className={'w-14 h-14 rounded-2xl object-cover border-2 shrink-0 ' + 
                    (v.isBlacklisted ? 'border-rose-500' : 'border-slate-700')}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm truncate block">{v.fullName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{v.id}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium block truncate">{v.company || 'Individual Visitor'}</span>
                  <span className="text-[11px] text-sky-400 font-mono block mt-0.5">{v.phone}</span>
                </div>
              </div>

              {/* Identity & Biometric status tags */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Proof:</span>
                  <span className="font-medium text-slate-200">{v.idProofType} ({v.idProofNumber})</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Enrolled Modes:</span>
                  <div className="flex items-center gap-1.5">
                    <span title="Facial Recognition" className={'p-1 rounded ' + (v.enrolledBiometrics?.face ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-600')}>
                      <Camera className="w-3 h-3" />
                    </span>
                    <span title="Fingerprint" className={'p-1 rounded ' + (v.enrolledBiometrics?.fingerprint ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600')}>
                      <Fingerprint className="w-3 h-3" />
                    </span>
                    <span title="Iris Scan" className={'p-1 rounded ' + (v.enrolledBiometrics?.iris ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600')}>
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Lifetime Visits:</span>
                  <span className="font-bold text-sky-400">{visitorVisits.length} visits logged</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedVisitor(v)}
                  className="text-sky-400 hover:underline font-semibold"
                >
                  View History ({visitorVisits.length})
                </button>

                <button
                  onClick={() => toggleBlacklist(v.id)}
                  className={'px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ' + 
                    (v.isBlacklisted 
                      ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30' 
                      : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30')}
                >
                  {v.isBlacklisted ? 'Remove Flag' : 'Flag / Watch'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Visitor History Drawer / Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedVisitor.photoUrl} 
                  alt={selectedVisitor.fullName} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedVisitor.fullName}</h4>
                  <span className="text-xs text-slate-400">{selectedVisitor.company}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Gate Pass Records</h5>
              {visits.filter(v => v.visitorId === selectedVisitor.id).map(vt => (
                <div key={vt.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{vt.purpose}</span>
                    <span className="font-mono text-sky-400">{vt.passNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Host: {vt.hostName} ({vt.hostDept})</span>
                    <span>{formatDateOnly(vt.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Gate: {vt.gate || 'Main Gate 01'}</span>
                    <span className={'px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + 
                      (vt.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300')}>
                      {vt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVisitor(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
