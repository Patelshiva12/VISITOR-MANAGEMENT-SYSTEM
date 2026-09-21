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
  const { zones, departments } = useVms();
  const [passLayout, setPassLayout] = useState('BADGE'); // 'BADGE' | 'THERMAL' | 'A4_SHEET'
  const passRef = useRef(null);

  if (!visit) return null;

  const handlePrint = () => {
    window.print();
  };

  const allowedZoneObjects = (visit.allowedZones || []).map(zId => 
    zones.find(z => z.id === zId) || { name: zId, code: zId }
  );

  const allowedDeptList = visit.allowedDepartments || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 text-white min-w-0">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm block truncate">Digital Gate Pass Generator</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">Pass #{visit.passNumber}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-950/600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print Pass</span><span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout Switcher Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 pb-2 flex flex-wrap items-center justify-between border-b border-slate-800/60 gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Layout:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'BADGE', label: 'PVC Badge', icon: CreditCard },
              { id: 'THERMAL', label: 'Thermal', icon: Receipt },
              { id: 'A4_SHEET', label: 'A4 Sheet', icon: FileText }
            ].map(l => {
              const Icon = l.icon;
              const isSelected = passLayout === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setPassLayout(l.id)}
                  className={'flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ' + 
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
        <div className="p-3 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div 
            ref={passRef}
            className="print-area bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-md font-sans overflow-hidden"
          >
            
            {/* FORMAT 1: PVC CLIP-ON BADGE */}
            {passLayout === 'BADGE' && (
              <div className="p-5 space-y-3.5">
                {/* Lanyard Slot Graphic */}
                <div className="w-16 h-2 rounded-full bg-slate-300 mx-auto -mt-2 mb-2"></div>

                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">ILIZIEN ENTERPRISE VMS</h2>
                    <p className="text-[9px] text-slate-600 font-bold uppercase">Official Visitor Pass • Biometric Verified</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-black rounded">
                    {visit.passNumber}
                  </span>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-100 relative shadow-inner flex items-center justify-center">
                      {visit.visitorPhoto ? (
                        <img 
                          src={visit.visitorPhoto} 
                          alt={visit.visitorName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white text-2xl font-black">
                          {(visit.visitorName || 'V').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 mt-1">
                      ✓ PASS ACTIVE
                    </span>
                  </div>

                  <div className="col-span-2 space-y-1 text-xs">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Visitor Name</span>
                      <div className="font-extrabold text-sm text-slate-900 leading-tight">{visit.visitorName}</div>
                      <div className="text-slate-600 font-semibold text-[11px]">{visit.visitorCompany}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Host</span>
                        <span className="font-bold text-slate-800">{visit.hostName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Department</span>
                        <span className="font-semibold text-slate-700">{visit.hostDept}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-200">
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

                {/* Authorized Departments & Security Zones */}
                <div className="grid grid-cols-1 gap-2">
                  {/* Authorized Departments Badge Display (Temporarily Commented Out)
                  <div className="bg-sky-50 p-2 rounded-xl border border-sky-200 text-[10px]">
                    <span className="text-[8px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
                      Authorized Departments:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {allowedDeptList.length > 0 ? (
                        allowedDeptList.map((d, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 bg-sky-200 text-sky-950 text-[8px] font-mono font-bold rounded">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-500 italic">General Reception Only</span>
                      )}
                    </div>
                  </div>
                  */}

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px]">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Permitted Zones:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {allowedZoneObjects.map((z, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-slate-200 text-slate-800 text-[8px] font-bold rounded">
                          {z.code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Barcode & QR */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 text-[9px]">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-900 p-1 rounded flex items-center justify-center">
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
                  {/* Department Display (Temporarily Commented Out)
                  <div className="flex justify-between">
                    <span>DEPTS:</span>
                    <span className="font-bold">{allowedDeptList.join(', ') || 'COMMON'}</span>
                  </div>
                  */}
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
                  <div className="col-span-1 flex items-center justify-center">
                    {visit.visitorPhoto ? (
                      <img 
                        src={visit.visitorPhoto} 
                        alt={visit.visitorName} 
                        className="w-28 h-28 rounded-xl object-cover border border-slate-400"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-xl bg-slate-800 text-white flex items-center justify-center text-3xl font-black border border-slate-400">
                        {(visit.visitorName || 'V').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div><strong>Visitor:</strong> {visit.visitorName} ({visit.visitorPhone})</div>
                    <div><strong>Organization:</strong> {visit.visitorCompany}</div>
                    <div><strong>Host Official:</strong> {visit.hostName} ({visit.hostDept})</div>
                    {/* Authorized Departments Display (Temporarily Commented Out)
                    <div><strong>Authorized Departments:</strong> <span className="font-mono font-bold text-sky-700">{allowedDeptList.join(', ') || 'Reception & Lounge'}</span></div>
                    */}
                    <div><strong>Purpose:</strong> {visit.purpose}</div>
                    <div><strong>Permitted Gate:</strong> {visit.gate || 'Main Gate 01'}</div>
                    <div><strong>Authorized Duration:</strong> {visit.expectedDurationMins} Minutes</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 space-y-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <strong className="text-slate-800 block">Security Regulations & NDA Terms:</strong>
                  <p>1. The visitor must wear this pass visibly at all times within the premises.</p>
                  <p>2. Photography, recording, or entry into non-permitted departments is strictly prohibited.</p>
                  <p>3. This pass must be scanned at the exit turnstile upon completion of visit.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 sm:px-5 py-2 bg-sky-600 hover:bg-sky-950/600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Pass
          </button>
        </div>

      </div>
    </div>
  );
}
