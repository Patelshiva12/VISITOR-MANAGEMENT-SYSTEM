import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import { exportToCSV, exportToJSON } from '../utils/exportHelpers';

export default function AuditLogs() {
  const { auditLogs } = useVms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.gate.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Immutable Security Audit Trail & Logs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Defensible digital audit records for all biometric validations, gate entries, approvals, and overrides.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredLogs, 'vms-audit-trail-' + Date.now() + '.csv')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => exportToJSON(filteredLogs, 'vms-audit-trail-' + Date.now() + '.json')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Severity filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'CRITICAL'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' + 
                (selectedSeverity === sev ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200')}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Classification</th>
                <th className="p-4">Description & Audit Payload</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Gate / Point</th>
                <th className="p-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sky-400 block">{log.eventType}</span>
                      <span className="text-[10px] text-slate-400">{log.id}</span>
                    </td>
                    <td className="p-4 font-sans text-slate-200 max-w-md">
                      {log.description}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      {log.performedBy}
                    </td>
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {log.gate}
                    </td>
                    <td className="p-4 text-right">
                      <span className={'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' + 
                        (log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                         log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                         log.severity === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                         'bg-sky-500/20 text-sky-400 border border-sky-500/30')}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
