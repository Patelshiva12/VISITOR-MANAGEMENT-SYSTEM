import React from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  UserCheck, 
  Camera,
  Trash2
} from 'lucide-react';
import { formatTimeOnly } from '../utils/formatters';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const { auditLogs } = useVms();

  if (!isOpen) return null;

  // Filter latest real-time security events
  const notifications = auditLogs.slice(0, 15);

  const getEventIcon = (eventType, severity) => {
    if (severity === 'CRITICAL') return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    if (severity === 'WARNING') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (eventType.includes('CHECK_IN')) return <LogIn className="w-4 h-4 text-emerald-400" />;
    if (eventType.includes('CHECK_OUT')) return <LogOut className="w-4 h-4 text-sky-400" />;
    if (eventType.includes('HOST')) return <UserCheck className="w-4 h-4 text-indigo-400" />;
    if (eventType.includes('BIOMETRIC')) return <Camera className="w-4 h-4 text-cyan-400" />;
    return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end no-print animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 transition-colors duration-150 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-white">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Security Alerts & Notification Feed</h3>
                <span className="text-[10px] text-slate-400 font-mono">Proposal Section 9.5 Active Feed</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="mt-4 space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={'p-3.5 rounded-2xl border text-xs space-y-1 transition-all ' + 
                  (item.severity === 'CRITICAL' ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' :
                   item.severity === 'WARNING' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
                   'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(item.eventType, item.severity)}
                    <span className="font-bold text-white text-xs">{item.eventType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{formatTimeOnly(item.timestamp)}</span>
                </div>

                <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pl-6 pt-1">
                  <span>Actor: {item.performedBy}</span>
                  <span className="font-mono">Gate: {item.gate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close Feed
          </button>
        </div>

      </div>
    </div>
  );
}
