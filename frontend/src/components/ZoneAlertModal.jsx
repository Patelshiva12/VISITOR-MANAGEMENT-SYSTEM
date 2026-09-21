import React from 'react';
import { useVms } from '../context/VmsContext';
import { AlertTriangle, ShieldAlert, X, Radio, BellRing } from 'lucide-react';
import { formatTimeOnly } from '../utils/formatters';

export default function ZoneAlertModal() {
  const { activeAlerts, dismissAlert } = useVms();

  if (!activeAlerts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full space-y-2 no-print">
      {activeAlerts.map(alert => (
        <div 
          key={alert.id}
          className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-rose-400">
              <div className="p-1.5 bg-rose-500/20 rounded-lg animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white uppercase tracking-wide">
                  CRITICAL ZONE SECURITY ALERT
                </h4>
                <span className="text-[10px] text-rose-300">{formatTimeOnly(alert.timestamp)} | {alert.gate}</span>
              </div>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="p-1 text-rose-400 hover:text-white hover:bg-rose-900 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 bg-slate-950/70 p-3 rounded-xl border border-rose-900/60 text-xs space-y-1.5">
            <div className="flex items-center gap-3">
              {alert.visitorPhoto ? (
                <img 
                  src={alert.visitorPhoto} 
                  alt="Breach Person" 
                  className="w-10 h-10 rounded-lg object-cover border border-rose-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-500/60 flex items-center justify-center text-rose-300">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-bold text-white block">{alert.visitorName}</span>
                <span className="text-[11px] text-rose-300 font-semibold">
                  Unauthorized Access into: <span className="text-white underline">{alert.zoneName} ({alert.zoneCode})</span>
                </span>
              </div>
            </div>
            <div className="text-[10px] text-rose-400 font-mono pt-1">
              Restricted Security Level: {alert.securityLevel}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => dismissAlert(alert.id)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Acknowledge & Dispatch Security Team
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
