import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { QrCode, X, CheckCircle2, Search, ArrowRight, Shield } from 'lucide-react';

export default function QRScannerModal({ onSelectVisit, onClose }) {
  const { visits } = useVms();
  const [tokenInput, setTokenInput] = useState('');
  const [scanning, setScanning] = useState(true);

  const handleDemoScan = (visit) => {
    onSelectVisit(visit);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const found = visits.find(v => 
      v.id.toLowerCase() === tokenInput.trim().toLowerCase() ||
      v.passNumber.toLowerCase() === tokenInput.trim().toLowerCase() ||
      v.visitorPhone.includes(tokenInput.trim())
    );
    if (found) {
      onSelectVisit(found);
    } else {
      alert('No matching active gate pass found for: ' + tokenInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <QrCode className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-xs sm:text-sm">Gate Pass QR Scanner</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* Animated Scanner Box */}
          <div className="aspect-square max-w-[240px] mx-auto bg-slate-900 bg-slate-950 rounded-2xl border-2 border-dashed border-sky-500/50 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Corner Markers */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-400"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-400"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-400"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-400"></div>
            
            {/* Laser Line */}
            <div className="absolute inset-x-2 h-0.5 bg-sky-400 animate-scan shadow-[0_0_10px_#38bdf8]"></div>
            
            <QrCode className="w-20 h-20 text-slate-300" />
            <span className="text-[11px] text-sky-400 font-semibold mt-2 animate-pulse">Position pass QR in frame</span>
          </div>

          {/* Quick Demo QR Test Selectors */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Demo QR Codes (Simulated Reader):
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {visits.slice(0, 4).map(v => (
                <button
                  key={v.id}
                  onClick={() => handleDemoScan(v)}
                  className="w-full flex items-center justify-between p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-left text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-white block">{v.visitorName}</span>
                    <span className="text-[10px] text-slate-400">{v.passNumber} | {v.visitorCompany}</span>
                  </div>
                  <span className={'text-[10px] px-2 py-0.5 rounded font-bold uppercase ' + 
                    (v.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400')}>
                    {v.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSearch} className="pt-2 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or type Token / Pass # / Phone"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-600 hover:bg-sky-950/600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Scan
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
