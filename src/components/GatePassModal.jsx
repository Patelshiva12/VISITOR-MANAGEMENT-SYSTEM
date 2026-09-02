import React, { useState, useRef } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  CreditCard, 
  Receipt, 
  FileText,
  Building2,
  Calendar,
  Clock,
  Car,
  Laptop
} from 'lucide-react';
import { formatDateTime, formatTimeOnly, formatDateOnly } from '../utils/formatters';

export default function GatePassModal({ visit, onClose }) {
  const { zones } = useVms();
  const [passLayout, setPassLayout] = useState('BADGE'); // 'BADGE' | 'THERMAL' | 'A4_SHEET'
  const passRef = useRef(null);

  if (!visit) return null;

  const handlePrint = () => {
    window.print();
  };

  const allowedZoneObjects = (visit.allowedZones || []).map(zId => 
    zones.find(z => z.id === zId) || { name: zId, code: zId }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <span className="font-bold text-sm block">Digital Gate Pass Generator & Printer</span>
              <span className="text-xs text-slate-400 font-mono">Pass #{visit.passNumber}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Pass
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout Switcher Tabs */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-800/60 pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Printer Layout:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'BADGE', label: 'PVC ID Badge', icon: CreditCard },
              { id: 'THERMAL', label: '80mm Thermal', icon: Receipt },
              { id: 'A4_SHEET', label: 'A4 Sheet', icon: FileText }
            ].map(l => {
              const Icon = l.icon;
              const isSelected = passLayout === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setPassLayout(l.id)}
                  className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + 
                    (isSelected ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6">
          <div 
            ref={passRef}
            className="print-area bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-md font-sans overflow-hidden"
          >
            
            {/* FORMAT 1: PVC CLIP-ON BADGE */}
            {passLayout === 'BADGE' && (
              <div className="p-5 space-y-4">
                {/* Lanyard Slot Graphic */}
                <div className="w-16 h-2 rounded-full bg-slate-300 mx-auto -mt-2 mb-2"></div>

                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">ILIZIEN ENTERPRISE VMS</h2>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">Official Visitor Pass � Biometric Verified</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-black rounded">
                    {visit.passNumber}
                  </span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-100 relative shadow-inner">
                      <img 
                        src={visit.visitorPhoto} 
                        alt={visit.visitorName} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
                        <CheckCircle2 className="w-2 h-2" /> BIO-MATCHED
                      </div>
                    </div>
                    <span className="mt-1.5 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {visit.status}
                    </span>
                  </div>

                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Visitor Name</span>
                      <div className="font-extrabold text-sm text-slate-900 leading-tight">{visit.visitorName}</div>
                      <div className="text-slate-600 font-semibold text-[11px]">{visit.visitorCompany}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Host</span>
                        <span className="font-bold text-slate-800">{visit.hostName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Department</span>
                        <span className="font-semibold text-slate-700">{visit.hostDept}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Valid Date</span>
                        <span className="font-medium text-slate-800">{formatDateOnly(visit.scheduledTime)}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Duration</span>
                        <span className="font-medium text-slate-800">{visit.expectedDurationMins} Mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allowed Zones */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px]">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Authorized Security Zones:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {allowedZoneObjects.map((z, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[9px] font-bold rounded">
                        {z.code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Barcode & QR */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 text-[9px]">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-slate-900 p-1 rounded flex items-center justify-center">
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
                      <span className="font-mono font-bold block text-slate-900">TOKEN: {visit.id}</span>
                      <span className="text-slate-500">Scan at Security Gates</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-500 block tracking-widest text-[8px]">||||| | |||| ||||||</span>
                    <span className="font-bold text-red-600 block mt-0.5">NON-TRANSFERABLE</span>
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 2: 80MM THERMAL SLIP */}
            {passLayout === 'THERMAL' && (
              <div className="p-4 font-mono text-xs space-y-2.5 max-w-xs mx-auto">
                <div className="text-center border-b border-dashed border-slate-400 pb-2">
                  <h3 className="font-black text-sm uppercase">ILIZIEN VMS</h3>
                  <p className="text-[10px] text-slate-600">GATE PASS RECEIPT</p>
                  <span className="font-bold text-xs">{visit.passNumber}</span>
                </div>

                <div className="text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>NAME:</span>
                    <span className="font-bold">{visit.visitorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COMPANY:</span>
                    <span>{visit.visitorCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HOST:</span>
                    <span>{visit.hostName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME:</span>
                    <span>{formatTimeOnly(visit.checkInTime || visit.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GATE:</span>
                    <span>{visit.gate || 'Main Gate 01'}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-400 pt-2 text-center">
                  <div className="w-16 h-16 mx-auto bg-black p-1 rounded flex items-center justify-center my-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <rect x="0" y="0" width="30" height="30" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="black" />
                      <rect x="70" y="0" width="30" height="30" fill="white" />
                      <rect x="75" y="5" width="20" height="20" fill="black" />
                      <rect x="0" y="70" width="30" height="30" fill="white" />
                      <rect x="5" y="75" width="20" height="20" fill="black" />
                      <rect x="35" y="35" width="30" height="30" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-slate-500 block">Please surrender pass at exit</span>
                </div>
              </div>
            )}

            {/* FORMAT 3: A4 OFFICIAL PASS SHEET */}
            {passLayout === 'A4_SHEET' && (
              <div className="p-6 space-y-4 text-xs">
                <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-black uppercase text-slate-900">ILIZIEN PRIVATE LIMITED</h2>
                    <p className="text-[10px] text-slate-600">Visitor Entry Authorization & Security Clearance Pass</p>
                    <p className="text-[9px] text-slate-500">UIN: U36999AP2020PTC114536 | A-586, Palam Vihar, Gurgaon</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold rounded">
                      {visit.passNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Date: {formatDateOnly(visit.scheduledTime)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="col-span-1">
                    <img 
                      src={visit.visitorPhoto} 
                      alt={visit.visitorName} 
                      className="w-28 h-28 rounded-xl object-cover border border-slate-400"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div><strong>Visitor:</strong> {visit.visitorName} ({visit.visitorPhone})</div>
                    <div><strong>Organization:</strong> {visit.visitorCompany}</div>
                    <div><strong>Host Official:</strong> {visit.hostName} ({visit.hostDept})</div>
                    <div><strong>Purpose:</strong> {visit.purpose}</div>
                    <div><strong>Permitted Gate:</strong> {visit.gate || 'Main Gate 01'}</div>
                    <div><strong>Authorized Duration:</strong> {visit.expectedDurationMins} Minutes</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 space-y-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <strong className="text-slate-800 block">Security Regulations & NDA Terms:</strong>
                  <p>1. The visitor must wear this pass visibly at all times within the premises.</p>
                  <p>2. Photography, recording, or entry into non-permitted security zones is strictly prohibited.</p>
                  <p>3. This pass must be scanned at the exit turnstile upon completion of visit.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Selected Layout
          </button>
        </div>

      </div>
    </div>
  );
}
