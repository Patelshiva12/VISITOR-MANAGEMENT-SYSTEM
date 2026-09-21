import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Layers
} from 'lucide-react';
import { formatDateTime, formatDateOnly } from '../utils/formatters';

export default function HostApprovals({ setActivePage }) {
  const { visits, hosts, zones, approveVisit, rejectVisit } = useVms();
  const [selectedHostFilter, setSelectedHostFilter] = useState('ALL');
  const [rejectingVisitId, setRejectingVisitId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [customizingVisit, setCustomizingVisit] = useState(null);
  const [customZones, setCustomZones] = useState(['ZONE-01', 'ZONE-02']);

  const pendingVisits = visits.filter(v => {
    const isPending = v.status === 'PENDING';
    if (selectedHostFilter === 'ALL') return isPending;
    return isPending && v.hostId === selectedHostFilter;
  });

  const historyVisits = visits.filter(v => v.status !== 'PENDING');

  const handleApprove = (visit) => {
    approveVisit(visit.id, ['ZONE-01', 'ZONE-02']);
  };

  const handleConfirmCustomApprove = () => {
    if (!customizingVisit) return;
    approveVisit(customizingVisit.id, customZones);
    setCustomizingVisit(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingVisitId) return;
    rejectVisit(rejectingVisitId, rejectReason || 'Host schedule unavailable');
    setRejectingVisitId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-black text-white">Host & Department Approval Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Review incoming visitor requests, approve security clearance, and grant zone access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Department Host:</span>
          <select
            value={selectedHostFilter}
            onChange={(e) => setSelectedHostFilter(e.target.value)}
            className="bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none"
          >
            <option value="ALL">All Department Requests</option>
            {hosts.map(h => (
              <option key={h.id} value={h.id}>{h.name} ({h.department})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Approval Queue ({pendingVisits.length})
          </h2>
          <span className="text-xs text-slate-400">Immediate action required before visitor gate check-in</span>
        </div>

        {pendingVisits.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
            <span className="font-semibold block text-slate-400">All caught up!</span>
            <span>No pending visitor requests awaiting approval.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVisits.map(visit => (
              <div 
                key={visit.id} 
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm transition-colors duration-150 shadow-sm space-y-4 hover:border-sky-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={visit.visitorPhoto} 
                      alt={visit.visitorName} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white text-sm block">{visit.visitorName}</span>
                      <span className="text-xs text-slate-400 font-medium">{visit.visitorCompany}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{visit.visitorPhone}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase">
                    Pending
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Host:</span>
                    <span className="font-bold text-white">{visit.hostName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-300">{visit.hostDept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Visit Purpose:</span>
                    <span className="font-semibold text-sky-400 truncate max-w-xs">{visit.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Arrival:</span>
                    <span className="font-mono text-slate-300">{formatDateTime(visit.scheduledTime)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setCustomizingVisit(visit);
                      setCustomZones(visit.allowedZones || ['ZONE-01', 'ZONE-02']);
                    }}
                    className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 font-semibold"
                  >
                    <Layers className="w-3.5 h-3.5" /> Zone Settings
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRejectingVisitId(visit.id);
                        setRejectReason('');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 text-xs font-bold rounded-xl transition-all border border-slate-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(visit)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Recent Approval History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Visitor</th>
                <th className="p-3">Host Authority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Pass Reference</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historyVisits.slice(0, 6).map(v => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block">{v.visitorName}</span>
                    <span className="text-[10px] text-slate-400">{v.visitorCompany}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-200">{v.hostName}</span>
                  </td>
                  <td className="p-3">
                    <span className={'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' + 
                      (v.status === 'CHECKED_IN' || v.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{v.passNumber}</td>
                  <td className="p-3 text-slate-400">{formatDateOnly(v.scheduledTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingVisitId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">Reject Visitor Request</h4>
            <p className="text-xs text-slate-400">Please provide a reason for rejecting this visit request:</p>
            <input
              type="text"
              placeholder="e.g. Schedule conflict, wrong department, cancelled"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingVisitId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {customizingVisit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">Configure Security Zones for {customizingVisit.visitorName}</h4>
            <p className="text-xs text-slate-400">Select permitted zones for this specific visit pass:</p>
            
            <div className="space-y-2">
              {zones.map(z => {
                const isChecked = customZones.includes(z.id);
                return (
                  <label 
                    key={z.id} 
                    className={'flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ' + 
                      (isChecked ? 'bg-sky-600/10 border-sky-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-400')}
                  >
                    <div>
                      <span className="font-bold block">{z.name} ({z.code})</span>
                      <span className="text-[10px] text-slate-400">{z.securityLevel}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomZones([...customZones, z.id]);
                        } else {
                          setCustomZones(customZones.filter(id => id !== z.id));
                        }
                      }}
                      className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomizingVisit(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustomApprove}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Approve with Selected Zones
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
