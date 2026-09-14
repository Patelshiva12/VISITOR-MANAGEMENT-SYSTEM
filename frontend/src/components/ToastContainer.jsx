import React, { useState, useEffect } from 'react';
import { toastService } from '../services/toastService';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ShieldAlert, 
  X
} from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    return unsubscribe;
  }, []);

  if (!toasts || toasts.length === 0) return null;

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/40',
          bg: 'bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-slate-900/95',
          glow: 'shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          barBg: 'bg-emerald-400',
          titleColor: 'text-emerald-300'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          border: 'border-rose-500/50',
          bg: 'bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-slate-900/95',
          glow: 'shadow-rose-500/20',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          barBg: 'bg-rose-400',
          titleColor: 'text-rose-300'
        };
      case 'warning':
      case 'biometric':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />,
          border: 'border-amber-500/50',
          bg: 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-900/95',
          glow: 'shadow-amber-500/20',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          barBg: 'bg-amber-400',
          titleColor: 'text-amber-300'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          border: 'border-sky-500/40',
          bg: 'bg-gradient-to-r from-sky-950/90 via-slate-900/95 to-slate-900/95',
          glow: 'shadow-sky-500/10',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          barBg: 'bg-sky-400',
          titleColor: 'text-sky-300'
        };
    }
  };

  return (
    <aside 
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden backdrop-blur-xl border ${config.border} ${config.bg} shadow-2xl ${config.glow} rounded-2xl p-4 transition-all duration-300 transform translate-y-0 opacity-100 ring-1 ring-white/10`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs font-black tracking-wide uppercase ${config.titleColor}`}>
                      {toast.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 ml-auto">
                      {toast.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Message body */}
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                    {toast.message}
                  </p>

                  {/* Structured Details Badge / Dual Security Chips */}
                  {toast.details && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-[11px]">
                      {toast.details.identityMatch && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Identity:</span>
                          <span className={`px-1.5 py-0.2 font-mono font-bold rounded text-[10px] border ${
                            toast.details.identityMatch === 'PASSED' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {toast.details.identityMatch}
                          </span>
                        </div>
                      )}

                      {toast.details.visitAuth && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Visit Auth:</span>
                          <span className={`px-1.5 py-0.2 font-mono font-bold rounded text-[10px] border ${
                            toast.details.visitAuth === 'APPROVED' 
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {toast.details.visitAuth}
                          </span>
                        </div>
                      )}

                      {toast.details.confidence && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">Match Score:</span>
                          <span className="font-mono font-semibold text-slate-200 text-[10px]">
                            {toast.details.confidence}
                          </span>
                        </div>
                      )}

                      {toast.details.liveness && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">3D Liveness:</span>
                          <span className="font-mono font-semibold text-emerald-400 text-[10px]">
                            {toast.details.liveness}
                          </span>
                        </div>
                      )}

                      {toast.details.entryDecision && (
                        <div className="flex items-center gap-1.5 col-span-2 mt-0.5">
                          <span className="text-slate-400 text-[10px]">Entry Clearance:</span>
                          <span className={`px-2 py-0.5 font-mono font-black rounded-full text-[10px] border tracking-wider ${
                            toast.details.entryDecision === 'GRANTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {toast.details.entryDecision}
                          </span>
                        </div>
                      )}

                      {toast.details.pass && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span className="text-slate-400 text-[10px]">Pass No:</span>
                          <span className="font-mono font-bold text-sky-400 text-[10px]">
                            {toast.details.pass}
                          </span>
                        </div>
                      )}

                      {toast.details.badge && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span className="text-slate-400 text-[10px]">RFID Badge:</span>
                          <span className="font-mono font-bold text-emerald-400 text-[10px]">
                            {toast.details.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Close dismiss button */}
              <button
                onClick={() => toastService.dismiss(toast.id)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom progress bar indicating timeout */}
            {toast.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/50">
                <div 
                  className={`h-full ${config.barBg} opacity-70`}
                  style={{
                    animation: `shrinkWidth ${toast.duration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
}
