import React, { useRef } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  Building2, 
  User, 
  Car, 
  CheckCircle2, 
  AlertCircle,
  Download
} from 'lucide-react';
import { formatDateTime, formatTimeOnly, formatDateOnly } from '../utils/formatters';

export default function GatePassModal({ visit, onClose }) {
  const { zones } = useVms();
  const passRef = useRef(null);

  if (!visit) return null;

  const handlePrint = () => {
    window.print();
  };

  const allowedZoneObjects = (visit.allowedZones || []).map(zId => 
    zones.find(z => z.id === zId) || { name: zId, code: zId }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-sm">Official Digital Gate Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print Badge
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pass Container */}
        <div className="p-6">
          <div 
            ref={passRef}
            className="print-area bg-white text-slate-900 p-5 rounded-xl border-2 border-slate-300 shadow-md font-sans space-y-4"
          >
            {/* Pass Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">ILIZIEN ENTERPRISE VMS</h2>
                <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">Multi-Modal Biometric Secured Visitor Pass</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-bold rounded">
                  {visit.passNumber || 'GP-2026-891'}
                </span>
                <p className="text-[9px] text-slate-500 mt-0.5">GATE: {visit.gate || 'Main Gate 01'}</p>
              </div>
            </div>

            {/* Main Badge Layout */}
            <div className="grid grid-cols-3 gap-4">
              {/* Photo & Status */}
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-slate-800 bg-slate-100 shadow-inner relative">
                  <img 
                    src={visit.visitorPhoto} 
                    alt={visit.visitorName} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className={'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' + 
                    (visit.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800')}>
                    {visit.status}
                  </span>
                </div>
              </div>

              {/* Visitor & Host Info */}
              <div className="col-span-2 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visitor Name</span>
                  <div className="font-extrabold text-sm text-slate-900">{visit.visitorName}</div>
                  <div className="text-slate-600 font-medium text-[11px]">{visit.visitorCompany}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Host Authority</span>
                    <span className="font-bold text-slate-800">{visit.hostName}</span>
                    <span className="text-slate-500 text-[10px] block">{visit.hostDept}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Purpose</span>
                    <span className="font-semibold text-slate-800 truncate block">{visit.purpose}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Valid Date</span>
                    <span className="font-medium text-slate-800">{formatDateOnly(visit.scheduledTime)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Duration</span>
                    <span className="font-medium text-slate-800">{visit.expectedDurationMins} Minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allowed Zones */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Authorized Security Zones
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allowedZoneObjects.map((z, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded border border-slate-300">
                    {z.code}: {z.name}
                  </span>
                ))}
              </div>
            </div>

            {/* QR Code & Barcode Verification Footer */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 text-[10px]">
              <div className="flex items-center gap-3">
                {/* SVG Visual QR Code */}
                <div className="w-14 h-14 bg-slate-900 p-1 rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                    <rect x="0" y="0" width="30" height="30" fill="white" />
                    <rect x="5" y="5" width="20" height="20" fill="black" />
                    <rect x="10" y="10" width="10" height="10" fill="white" />

                    <rect x="70" y="0" width="30" height="30" fill="white" />
                    <rect x="75" y="5" width="20" height="20" fill="black" />
                    <rect x="80" y="10" width="10" height="10" fill="white" />

                    <rect x="0" y="70" width="30" height="30" fill="white" />
                    <rect x="5" y="75" width="20" height="20" fill="black" />
                    <rect x="10" y="80" width="10" height="10" fill="white" />

                    <rect x="35" y="10" width="10" height="10" fill="white" />
                    <rect x="50" y="20" width="15" height="10" fill="white" />
                    <rect x="35" y="40" width="30" height="15" fill="white" />
                    <rect x="40" y="65" width="20" height="10" fill="white" />
                    <rect x="75" y="45" width="15" height="15" fill="white" />
                    <rect x="70" y="75" width="25" height="20" fill="white" />
                  </svg>
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-800 block">TOKEN: {visit.id}</span>
                  <span className="text-[9px] text-slate-500">Scan at Security Turnstiles & Zone Doors</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] text-slate-400 block tracking-widest">||||| | |||| |||||| || |</span>
                <span className="text-[9px] font-bold text-red-600 block mt-1">NON-TRANSFERABLE</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Gate Pass (Thermal / Standard)
          </button>
        </div>

      </div>
    </div>
  );
}
