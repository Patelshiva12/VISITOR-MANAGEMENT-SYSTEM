import React, { useState, useEffect, useRef } from 'react';
import { useVms } from '../context/VmsContext';
import { VmsBackendApi, toastService } from '../services/api';
import { 
  Camera, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Scan, 
  Lock, 
  Unlock, 
  Users, 
  RotateCcw,
  Building,
  Volume2,
  VolumeX,
  Radio,
  Check,
  Power
} from 'lucide-react';
import { 
  discoverMantraService, 
  captureMantraFingerprint 
} from '../services/mantraBiometricService';

// Audio feedback synthesizer using Web Audio API
const playTone = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15); // E3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Ignore audio error
  }
};

export default function ZoneBiometricTerminalModal({ zone, isOpen, onClose }) {
  const { visits, simulateZoneScan, logAudit, currentGate } = useVms();
  
  const [activeTab, setActiveTab] = useState('FACE'); // 'FACE' | 'FINGERPRINT' | 'MANUAL'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tab 1: Face State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [lastFaceVerdict, setLastFaceVerdict] = useState(null); // { name, photo, status: 'GRANTED'|'DENIED', reason, timestamp }
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessingFrameRef = useRef(false);

  // Tab 2: Fingerprint State
  const [fingerScanStatus, setFingerScanStatus] = useState('IDLE'); // 'IDLE' | 'SCANNING' | 'GRANTED' | 'DENIED'
  const [fingerVerdict, setFingerVerdict] = useState(null);
  const [isAutoSenseActive, setIsAutoSenseActive] = useState(true);
  const isProcessingFingerRef = useRef(false);

  // Tab 3: Manual Simulator State
  const [selectedSimVisitId, setSelectedSimVisitId] = useState(visits[0]?.id || '');
  const [simVerdict, setSimVerdict] = useState(null);

  // Setup / Teardown Camera for Face Tab
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (activeTab === 'FACE') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
      setIsLiveCameraActive(true);
      setDetectedFaces([]);
      isProcessingFrameRef.current = false;
    } catch (err) {
      console.warn('Webcam stream not accessible, using fallback simulation.');
      setIsLiveCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  };

  // Continuous Live Stream Face AI Recognition Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'FACE' || !isLiveCameraActive) {
      return;
    }

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || isProcessingFrameRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 480, 360);

      const frameBase64 = canvas.toDataURL('image/jpeg', 0.72).split(',')[1];
      isProcessingFrameRef.current = true;

      try {
        const streamRes = await VmsBackendApi.recognizeStreamFaces(frameBase64);
        if (streamRes && streamRes.faces && streamRes.faces.length > 0) {
          setDetectedFaces(streamRes.faces);

          // Find first matched visitor in stream
          const matchedFace = streamRes.faces.find(f => f.matched);
          if (matchedFace) {
            // Check Zone Access for this visitor
            const targetVisit = visits.find(v => 
              v.id === matchedFace.visit_id || 
              v.visitorId === matchedFace.person_id || 
              v.visitorName.toLowerCase() === matchedFace.name.toLowerCase()
            );

            const allowedZones = targetVisit?.allowedZones || ['ZONE-01', 'ZONE-02'];
            const isZoneAllowed = allowedZones.includes(zone.id);

            if (isZoneAllowed) {
              setLastFaceVerdict({
                name: matchedFace.name,
                company: matchedFace.company,
                photo: matchedFace.photo,
                status: 'GRANTED',
                score: matchedFace.confidence_score,
                message: `Zone Access Authorized ✓ Door Unlocked for ${zone.name}`,
                timestamp: new Date().toLocaleTimeString()
              });
              if (soundEnabled) playTone('success');
              logAudit('ZONE_ACCESS_GRANTED', `Facial AI Verified: ${matchedFace.name} entered ${zone.name} (${zone.code})`, 'SUCCESS', zone.name);
            } else {
              setLastFaceVerdict({
                name: matchedFace.name,
                company: matchedFace.company,
                photo: matchedFace.photo,
                status: 'DENIED',
                score: matchedFace.confidence_score,
                message: `SECURITY RESTRICTION: ${matchedFace.name} is RESTRICTED from ${zone.name}! Door Locked.`,
                timestamp: new Date().toLocaleTimeString()
              });
              if (soundEnabled) playTone('alert');
              // Trigger simulateZoneScan to log breach & dispatch alert
              if (targetVisit) {
                simulateZoneScan(targetVisit.id, zone.id);
              }
            }
          }
        } else {
          setDetectedFaces([]);
        }
      } catch (e) {
        // silent catch
      } finally {
        isProcessingFrameRef.current = false;
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, isLiveCameraActive, zone, visits, soundEnabled]);

  // Tab 2: Auto-Sense Fingerprint Loop for Zone Door
  useEffect(() => {
    if (!isOpen || activeTab !== 'FINGERPRINT' || !isAutoSenseActive) {
      return;
    }

    let isMounted = true;
    let timerId = null;

    const runZoneFingerLoop = async () => {
      if (!isMounted || activeTab !== 'FINGERPRINT' || isProcessingFingerRef.current) {
        return;
      }

      isProcessingFingerRef.current = true;

      try {
        const hwCapture = await captureMantraFingerprint({
          fingerName: 'Zone Door Optical Finger',
          fingerCode: 'LIVE_SCAN',
          timeout: 2000,
          quality: 20
        });

        if (!isMounted) return;

        if (!hwCapture || !hwCapture.success || (!hwCapture.rawPayload && !hwCapture.templateBase64)) {
          isProcessingFingerRef.current = false;
          if (isMounted && activeTab === 'FINGERPRINT' && isAutoSenseActive) {
            timerId = setTimeout(runZoneFingerLoop, 350);
          }
          return;
        }

        setFingerScanStatus('SCANNING');

        const verifyRes = await VmsBackendApi.verifyFingerprint(
          hwCapture.templateBase64 || hwCapture.rawPayload,
          null,
          null
        );

        if (!isMounted) return;

        if (verifyRes && verifyRes.matched) {
          const matchedName = verifyRes.name || 'Visitor';
          const matchedId = verifyRes.person_id || 'VIS-ID';
          
          const targetVisit = visits.find(v => 
            v.id === verifyRes.visit_id || 
            v.visitorId === verifyRes.person_id || 
            (v.person_id && v.person_id === verifyRes.person_id) ||
            v.visitorName?.toLowerCase() === matchedName.toLowerCase()
          );

          const allowedZones = targetVisit?.allowedZones || ['ZONE-01', 'ZONE-02'];
          const isZoneAllowed = allowedZones.includes(zone.id);

          if (isZoneAllowed) {
            setFingerScanStatus('GRANTED');
            setFingerVerdict({
              name: matchedName,
              personId: matchedId,
              company: verifyRes.company || 'Authorized Guest',
              photo: verifyRes.photo,
              status: 'GRANTED',
              score: verifyRes.confidence_score || 95.8,
              message: `Fingerprint Authorized ✓ Door Unlocked for ${zone.name}`,
              timestamp: new Date().toLocaleTimeString()
            });
            if (soundEnabled) playTone('success');
            toastService.success(`Door Unlocked: Welcome ${matchedName}!`, 'Zone Access Authorized');
            logAudit('ZONE_ACCESS_GRANTED', `Fingerprint Verified: ${matchedName} unlocked ${zone.name} (${zone.code})`, 'SUCCESS', zone.name);
          } else {
            setFingerScanStatus('DENIED');
            setFingerVerdict({
              name: matchedName,
              personId: matchedId,
              company: verifyRes.company || 'Authorized Guest',
              photo: verifyRes.photo,
              status: 'DENIED',
              score: verifyRes.confidence_score || 95.8,
              message: `SECURITY BREACH: ${matchedName} is RESTRICTED from ${zone.name}!`,
              timestamp: new Date().toLocaleTimeString()
            });
            if (soundEnabled) playTone('alert');
            toastService.error(`Restricted: ${matchedName} not authorized for ${zone.name}`, 'Access Denied');
            if (targetVisit) {
              simulateZoneScan(targetVisit.id, zone.id);
            }
          }

          await new Promise(r => setTimeout(r, 3000));
          if (isMounted) {
            setFingerScanStatus('IDLE');
          }
        } else {
          setFingerScanStatus('DENIED');
          setFingerVerdict({
            name: 'Unregistered Fingerprint',
            status: 'DENIED',
            score: 15.0,
            message: 'Fingerprint Not Found in Vault. Access Denied.',
            timestamp: new Date().toLocaleTimeString()
          });
          if (soundEnabled) playTone('alert');
          await new Promise(r => setTimeout(r, 2500));
          if (isMounted) {
            setFingerScanStatus('IDLE');
          }
        }
      } catch (e) {
        console.warn('Zone Fingerprint cycle note:', e);
      } finally {
        isProcessingFingerRef.current = false;
      }

      if (isMounted && activeTab === 'FINGERPRINT' && isAutoSenseActive) {
        timerId = setTimeout(runZoneFingerLoop, 400);
      }
    };

    runZoneFingerLoop();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isOpen, activeTab, isAutoSenseActive, zone, visits, soundEnabled]);

  // Tab 3: Manual Simulator Test Action
  const handleRunManualSim = () => {
    if (!selectedSimVisitId) return;
    const targetVisit = visits.find(v => v.id === selectedSimVisitId);
    if (!targetVisit) return;

    const allowedZones = targetVisit.allowedZones || ['ZONE-01', 'ZONE-02'];
    const isZoneAllowed = allowedZones.includes(zone.id);

    if (isZoneAllowed) {
      setSimVerdict({
        visit: targetVisit,
        status: 'GRANTED',
        message: `ACCESS GRANTED ✓ Turnstile / Door Unlocked for ${zone.name}`,
        timestamp: new Date().toLocaleTimeString()
      });
      if (soundEnabled) playTone('success');
      toastService.success(`Access Granted: ${targetVisit.visitorName} entered ${zone.name}`, 'Door Unlocked');
      logAudit('ZONE_ACCESS_GRANTED', `Simulated Door Scan: ${targetVisit.visitorName} accessed ${zone.name} (${zone.code})`, 'SUCCESS', zone.name);
    } else {
      setSimVerdict({
        visit: targetVisit,
        status: 'DENIED',
        message: `ACCESS DENIED ❌ Security Restriction Breach for ${zone.name}!`,
        timestamp: new Date().toLocaleTimeString()
      });
      if (soundEnabled) playTone('alert');
      simulateZoneScan(targetVisit.id, zone.id);
      toastService.error(`Access Denied: ${targetVisit.visitorName} is not permitted in ${zone.name}`, 'Security Breach');
    }
  };

  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto no-print animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                  Live Zone Door Biometric Terminal
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full font-bold">
                  {zone.code}
                </span>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border ' + 
                  (zone.securityLevel === 'Public' ? 'bg-slate-950 text-slate-300 border-slate-800' :
                   zone.securityLevel === 'Standard' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                   zone.securityLevel === 'Restricted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                   'bg-rose-500/10 text-rose-400 border-rose-500/20')}>
                  {zone.securityLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Target Zone: <strong className="text-white">{zone.name}</strong> • Location: <span className="text-sky-400">{zone.floor}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={'p-2 rounded-xl border transition-colors cursor-pointer ' + 
                (soundEnabled ? 'bg-slate-800 text-sky-400 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800')}
              title={soundEnabled ? 'Audio Feedback Enabled' : 'Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close terminal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          
          {/* Modality Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('FACE')}
              className={'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + 
                (activeTab === 'FACE' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900')}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">1. Face AI Stream</span>
              <span className="sm:hidden">Face AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('FINGERPRINT')}
              className={'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + 
                (activeTab === 'FINGERPRINT' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900')}
            >
              <Fingerprint className="w-4 h-4" />
              <span className="hidden sm:inline">2. Optical Fingerprint</span>
              <span className="sm:hidden">Fingerprint</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ' + 
                (activeTab === 'MANUAL' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900')}
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">3. Turnstile Simulator</span>
              <span className="sm:hidden">Simulator</span>
            </button>
          </div>

          {/* TAB 1: FACIAL RECOGNITION CAMERA STREAM */}
          {activeTab === 'FACE' && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video max-h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transform -scale-x-100 ${!isLiveCameraActive ? 'hidden' : 'block'}`} 
                />

                {!isLiveCameraActive && (
                  <div className="text-center text-slate-400 space-y-2">
                    <Camera className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="text-xs">Camera stream initializing...</p>
                  </div>
                )}

                {/* Bounding Boxes for Faces */}
                {detectedFaces.map((face, idx) => {
                  const leftPercent = (1.0 - face.bbox_norm[0] - face.bbox_norm[2]) * 100;
                  const topPercent = face.bbox_norm[1] * 100;
                  const widthPercent = face.bbox_norm[2] * 100;
                  const heightPercent = face.bbox_norm[3] * 100;
                  
                  const targetVisit = visits.find(v => 
                    v.id === face.visit_id || 
                    v.visitorId === face.person_id || 
                    v.visitorName.toLowerCase() === face.name.toLowerCase()
                  );
                  const isAuthorized = targetVisit?.allowedZones?.includes(zone.id);

                  return (
                    <div
                      key={face.face_id ?? idx}
                      style={{
                        left: `${Math.max(0, Math.min(95, leftPercent))}%`,
                        top: `${Math.max(0, Math.min(95, topPercent))}%`,
                        width: `${Math.max(8, Math.min(95, widthPercent))}%`,
                        height: `${Math.max(8, Math.min(95, heightPercent))}%`
                      }}
                      className={`absolute pointer-events-none rounded-2xl border-2 transition-all duration-150 ${
                        isAuthorized
                          ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.85)] ring-2 ring-emerald-400/40 bg-emerald-500/10'
                          : 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.85)] ring-2 ring-rose-500/40 bg-rose-500/10'
                      }`}
                    >
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-lg ${
                        isAuthorized ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {isAuthorized ? `✓ ${zone.code} AUTHORIZED` : `⛔ ${zone.code} RESTRICTED`}
                      </div>

                      <div className="absolute top-[100%] mt-2 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-2xl flex flex-col items-center min-w-max pointer-events-auto">
                        <span className="font-bold text-xs text-white">{face.name}</span>
                        <span className={`text-[10px] font-bold ${isAuthorized ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isAuthorized ? 'Door Unlocked' : 'Security Breach Recorded'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Top Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 px-3 py-1 rounded-xl text-[10px] font-mono text-sky-400 font-bold flex items-center gap-2 z-10 shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Zone Door Camera • {zone.code} Protection Active</span>
                </div>
              </div>

              {/* Last Verification Verdict Card */}
              {lastFaceVerdict && (
                <div className={'p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ' + 
                  (lastFaceVerdict.status === 'GRANTED'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]')}
                >
                  <div className="flex items-center gap-3">
                    {lastFaceVerdict.status === 'GRANTED' ? (
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Unlock className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="font-extrabold text-sm text-white block">{lastFaceVerdict.name}</span>
                      <p className="text-[11px] font-medium">{lastFaceVerdict.message}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={'px-2.5 py-1 rounded-full text-[10px] font-black uppercase ' + 
                      (lastFaceVerdict.status === 'GRANTED' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white')}>
                      {lastFaceVerdict.status === 'GRANTED' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">{lastFaceVerdict.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OPTICAL FINGERPRINT SCANNER */}
          {activeTab === 'FINGERPRINT' && (
            <div className="space-y-4">
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className={'w-24 h-24 mx-auto rounded-3xl border-2 flex items-center justify-center transition-all duration-300 ' + 
                  (fingerScanStatus === 'GRANTED' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.3)]' :
                   fingerScanStatus === 'DENIED' ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.3)] animate-pulse' :
                   fingerScanStatus === 'SCANNING' ? 'border-purple-400 bg-purple-500/10 text-purple-400 animate-spin' :
                   'border-slate-700 bg-slate-900 text-slate-400')}>
                  {fingerScanStatus === 'GRANTED' ? (
                    <Unlock className="w-12 h-12" />
                  ) : fingerScanStatus === 'DENIED' ? (
                    <ShieldAlert className="w-12 h-12" />
                  ) : (
                    <Fingerprint className="w-12 h-12" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">
                    {fingerScanStatus === 'GRANTED' ? 'Door Unlocked — Access Permitted ✓' :
                     fingerScanStatus === 'DENIED' ? 'Access Denied — Restricted Zone ❌' :
                     fingerScanStatus === 'SCANNING' ? 'Scanning Fingerprint Vault...' :
                     'Touch Optical Scanner at Door Terminal'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Auto-Sense is active. Place registered finger on SecuGen sensor to verify permissions for {zone.name} ({zone.code}).
                  </p>
                </div>
              </div>

              {fingerVerdict && (
                <div className={'p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ' + 
                  (fingerVerdict.status === 'GRANTED'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]')}
                >
                  <div className="flex items-center gap-3">
                    {fingerVerdict.status === 'GRANTED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-extrabold text-sm text-white block">{fingerVerdict.name}</span>
                      <p className="text-[11px]">{fingerVerdict.message}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={'px-2.5 py-1 rounded-full text-[10px] font-black uppercase ' + 
                      (fingerVerdict.status === 'GRANTED' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white')}>
                      {fingerVerdict.status === 'GRANTED' ? 'PERMITTED' : 'BLOCKED'}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">{fingerVerdict.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TURNSTILE SIMULATOR */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-2">
                <label className="text-slate-300 font-bold text-xs block">
                  Select Registered Visitor to Scan at {zone.code} Door:
                </label>
                <select
                  value={selectedSimVisitId}
                  onChange={(e) => setSelectedSimVisitId(e.target.value)}
                  className="w-full bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {visits.map(v => {
                    const hasAccess = v.allowedZones && v.allowedZones.includes(zone.id);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.visitorName} ({v.passNumber}) — {hasAccess ? '🟢 Permitted' : '🔒 Restricted'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunManualSim}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Scan className="w-4 h-4" /> Simulate Turnstile / Door Access
              </button>

              {simVerdict && (
                <div className={'p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ' + 
                  (simVerdict.status === 'GRANTED' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/80 text-rose-200')}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {simVerdict.status === 'GRANTED' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-rose-400" />}
                    <span>{simVerdict.message}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Visitor: <strong className="text-white">{simVerdict.visit.visitorName}</strong> • Pass: <span className="font-mono text-sky-400">{simVerdict.visit.passNumber}</span>
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Internal Station: <strong className="text-emerald-400">{zone.name}</strong> ({zone.code})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
}
