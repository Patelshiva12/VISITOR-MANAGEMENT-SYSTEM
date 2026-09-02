import React, { useState, useEffect, useRef } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Camera, 
  Fingerprint, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Scan, 
  X,
  Activity,
  Layers,
  Laptop,
  CheckSquare,
  Sparkles
} from 'lucide-react';

export default function BiometricScannerModal({ visit, onComplete, onClose }) {
  const { currentGate, checkInVisitor, manualOverrideCheckIn } = useVms();
  const [selectedMode, setSelectedMode] = useState('FACE'); // 'FACE' | 'FINGERPRINT' | 'IRIS'
  const [scanningState, setScanningState] = useState('idle'); // 'idle' | 'scanning' | 'matched' | 'failed'
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [useCameraStream, setUseCameraStream] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [laptopVerified, setLaptopVerified] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (selectedMode === 'FACE' && useCameraStream) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selectedMode, useCameraStream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.warn('Webcam unavailable, falling back to 8MP high-def simulated frame:', err);
      setCameraError('Webcam unavailable. Using 8MP high-def camera buffer.');
      setUseCameraStream(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const triggerBiometricScan = () => {
    setScanningState('scanning');
    setLivenessPassed(false);
    setConfidenceScore(0);

    setTimeout(() => {
      setLivenessPassed(true);
    }, 1100);

    setTimeout(() => {
      if (visit?.visitorCompany?.includes('Apex') || visit?.status === 'REJECTED') {
        setScanningState('failed');
        setConfidenceScore(38.2);
      } else {
        const score = Number((97.2 + Math.random() * 2.4).toFixed(1));
        setConfidenceScore(score);
        setScanningState('matched');
      }
    }, 2100);
  };

  const isVisitApproved = visit?.status === 'APPROVED' || visit?.status === 'CHECKED_IN';
  const isBiometricMatched = scanningState === 'matched';
  const canGrantAccess = isBiometricMatched && isVisitApproved;

  const handleGrantAccess = () => {
    checkInVisitor(visit.id, [selectedMode]);
    onComplete();
  };

  const handleManualOverride = () => {
    if (!overrideReason.trim()) {
      alert('Please enter a mandatory security reason for manual override.');
      return;
    }
    manualOverrideCheckIn(visit.id, overrideReason);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">Multi-Modal Biometric Verification Terminal</span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentGate} � SCRFD-ArcFace Engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Biometric Mode Selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'FACE', label: 'Facial Recognition', icon: Camera, desc: 'OpenCV + SCRFD + ArcFace' },
              { id: 'FINGERPRINT', label: 'Fingerprint Scan', icon: Fingerprint, desc: '500 DPI Optical Sensor' },
              { id: 'IRIS', label: 'Iris Verification', icon: Eye, desc: 'Dual 850nm NIR Scan' }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMode(m.id);
                    setScanningState('idle');
                  }}
                  className={'p-2.5 rounded-xl text-left transition-all ' + 
                    (isSelected 
                      ? 'bg-sky-600/20 border border-sky-500/40 text-sky-300 shadow-sm' 
                      : 'hover:bg-slate-900 text-slate-400')}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={'w-4 h-4 ' + (isSelected ? 'text-sky-400' : 'text-slate-400')} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Biometric Capture Viewport */}
          <div className="relative aspect-video max-h-72 w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            
            {/* FACE MODE */}
            {selectedMode === 'FACE' && (
              <div className="w-full h-full relative flex items-center justify-center">
                {useCameraStream && !cameraError ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src={visit?.visitorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'} 
                      alt="Visitor Camera Simulator" 
                      className="w-full h-full object-cover filter brightness-90"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-mono">
                      Simulated 8MP High-Definition Video Frame
                    </div>
                  </div>
                )}

                {/* Face Alignment HUD Graphic with Landmark points */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className={'w-44 h-56 rounded-[45%] border-2 border-dashed transition-all duration-300 relative ' + 
                    (scanningState === 'matched' 
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.35)]' 
                      : scanningState === 'failed' 
                      ? 'border-rose-500 bg-rose-500/10' 
                      : scanningState === 'scanning'
                      ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]' 
                      : 'border-slate-500/60')}>
                    
                    {/* Simulated 5 Face Landmark Points */}
                    {scanningState === 'scanning' && (
                      <>
                        <span className="absolute top-16 left-12 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span className="absolute top-16 right-12 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span className="absolute top-28 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span className="absolute bottom-14 left-14 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span className="absolute bottom-14 right-14 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      </>
                    )}
                  </div>

                  {/* Laser Scan line when active */}
                  {scanningState === 'scanning' && (
                    <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan shadow-[0_0_12px_#38bdf8]"></div>
                  )}
                </div>

                {/* Real-time Telemetry Overlay */}
                <div className="absolute bottom-2 inset-x-2 flex justify-between items-center text-[10px] bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 font-mono text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Liveness: {livenessPassed ? <span className="text-emerald-400 font-bold">3D LIVE (99.4%)</span> : <span className="text-slate-400">Detecting...</span>}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>SCRFD: <span className="text-sky-400 font-bold">12ms</span></span>
                  </div>
                  <div>
                    ArcFace Embedding: {confidenceScore > 0 ? <span className="text-emerald-400 font-bold">{confidenceScore}% MATCH</span> : '--'}
                  </div>
                </div>
              </div>
            )}

            {/* FINGERPRINT MODE */}
            {selectedMode === 'FINGERPRINT' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className={'w-28 h-28 rounded-2xl flex items-center justify-center border-2 transition-all ' + 
                  (scanningState === 'matched' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : scanningState === 'scanning' 
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400 animate-pulse' 
                    : 'border-slate-700 bg-slate-900 text-slate-400')}>
                  <Fingerprint className="w-16 h-16" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">500 DPI Optical Sensor Ready</span>
                  <span className="text-slate-400 text-[11px]">Place registered index finger on glass prism</span>
                </div>
              </div>
            )}

            {/* IRIS MODE */}
            {selectedMode === 'IRIS' && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className={'w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all ' + 
                  (scanningState === 'matched' 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : scanningState === 'scanning' 
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400 animate-spin' 
                    : 'border-slate-700 bg-slate-900 text-slate-400')}>
                  <Eye className="w-16 h-16" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Dual 850nm Near-IR Iris Scanner</span>
                  <span className="text-slate-400 text-[11px]">Align eye with optical circular reticle (35-45cm)</span>
                </div>
              </div>
            )}

          </div>

          {/* Trigger Scan Button */}
          <div className="flex justify-center">
            <button
              onClick={triggerBiometricScan}
              disabled={scanningState === 'scanning'}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={'w-4 h-4 ' + (scanningState === 'scanning' ? 'animate-spin' : '')} />
              {scanningState === 'scanning' ? 'Matching Biometrics & Anti-Spoofing...' : 'Capture & Verify Biometrics'}
            </button>
          </div>

          {/* Equipment / Laptop Tagging Check */}
          {visit?.laptopSerial && visit.laptopSerial !== 'NONE' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-slate-300 font-semibold block">Declared Equipment: {visit.laptopSerial}</span>
                  <span className="text-[10px] text-slate-500">Verify physical asset tag before turnstile gate open</span>
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={laptopVerified}
                  onChange={(e) => setLaptopVerified(e.target.checked)}
                  className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span>Tag Verified</span>
              </label>
            </div>
          )}

          {/* Dual Security Verification Result Matrix (Proposal Page 5, Section 6) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> Dual Security Controls Matrix
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Proposal Page 5</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Check 1: Identity Match */}
              <div className={'p-3 rounded-xl border flex items-start gap-2.5 ' + 
                (scanningState === 'matched' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : scanningState === 'failed' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400')}>
                {scanningState === 'matched' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : scanningState === 'failed' ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Activity className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-white block">1. Identity Verification</span>
                  <span className="text-[11px]">
                    {scanningState === 'matched' 
                      ? 'Confirmed: ' + (visit?.visitorName || 'Visitor') + ' (' + confidenceScore + '%)'
                      : scanningState === 'failed' 
                      ? 'Biometric Mismatch / Spoof Detected' 
                      : 'Pending biometric scan'}
                  </span>
                </div>
              </div>

              {/* Check 2: Visit Authorization */}
              <div className={'p-3 rounded-xl border flex items-start gap-2.5 ' + 
                (isVisitApproved 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300')}>
                {isVisitApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-white block">2. Visit Authorization</span>
                  <span className="text-[11px]">
                    {isVisitApproved ? 'Approved by ' + (visit?.hostName || 'Host') : 'Pending host approval (Status: ' + (visit?.status || 'N/A') + ')'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Security Override Option */}
          {overrideMode ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
              <span className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Security Guard Manual Override Mode
              </span>
              <input 
                type="text" 
                placeholder="Enter mandatory reason (e.g. VIP escort, hardware glitch, verbal clearance by CSO)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full bg-slate-900 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setOverrideMode(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualOverride}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                >
                  Confirm Manual Check-In
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => setOverrideMode(true)}
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Need guard manual security override?
              </button>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleGrantAccess}
            disabled={!canGrantAccess}
            className={'px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ' + 
              (canGrantAccess
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed')}
          >
            <ShieldCheck className="w-4 h-4" /> Grant Gate Entry & Issue Pass
          </button>
        </div>

      </div>
    </div>
  );
}
