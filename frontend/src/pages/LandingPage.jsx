import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Shield, 
  ShieldCheck, 
  Camera, 
  Fingerprint, 
  Eye, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Building2, 
  Compass, 
  Search, 
  UserCheck, 
  Lock, 
  ChevronRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatDateOnly, formatTimeOnly } from '../utils/formatters';
import { normalizeVisit } from '../utils/normalizer';

export default function LandingPage({ setActivePage }) {
  const { visits, isAuthenticated, currentUserRole } = useVms();
  const [searchToken, setSearchToken] = useState('');
  const [searchedVisit, setSearchedVisit] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchPass = (e) => {
    e.preventDefault();
    if (!searchToken.trim()) return;
    setHasSearched(true);
    const token = searchToken.trim().toLowerCase();
    const tokenDigits = token.replace(/\D/g, '');

    const found = (visits || []).find(v => {
      const pNo = (v.passNumber || v.pass_number || '').toLowerCase();
      const vId = (v.id || '').toLowerCase();
      const vPhoneDigits = (v.visitorPhone || v.visitor_phone || '').replace(/\D/g, '');

      if (pNo && (pNo === token || pNo.includes(token))) return true;
      if (vId && (vId === token || vId.includes(token))) return true;
      if (tokenDigits.length >= 4 && vPhoneDigits && vPhoneDigits.includes(tokenDigits)) return true;
      return false;
    });

    setSearchedVisit(found ? normalizeVisit(found) : null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Landing Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">ILIZIEN VMS</span>
              <span className="text-[10px] ml-2 font-mono font-semibold px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                Enterprise Biometrics
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-sky-400 transition-colors">Core Features</a>
            <a href="#biometrics" className="hover:text-sky-400 transition-colors">Biometrics</a>
            <a href="#workflow" className="hover:text-sky-400 transition-colors">Workflow</a>
            <a href="#tracker" className="hover:text-sky-400 transition-colors">Pass Tracker</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('pre-register')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              Pre-Register Visit
            </button>
            
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400" />
          <span>Next-Generation Visitor Identity & Access Security</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Multi-Modal Biometric <br />
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Visitor Management System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Digitize and secure the complete visitor lifecycle with high-accuracy <strong>Facial Recognition (SCRFD + ArcFace)</strong>, 
          <strong>Anti-Spoofing Liveness</strong>, <strong>Fingerprint</strong>, <strong>Iris</strong>, and <strong>Digital Gate Passes</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActivePage('pre-register')}
            className="px-6 py-3.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-xl shadow-sky-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-4 h-4" /> Start Visitor Pre-Registration
          </button>
          
          <button
            onClick={() => setActivePage('login')}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security & Staff Login
          </button>

          <a
            href="#tracker"
            className="px-5 py-3.5 text-sky-400 hover:text-sky-300 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Track Existing Pass &rarr;
          </a>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
          {[
            { label: 'Face Recognition Pipeline', value: 'OpenCV + ArcFace', sub: 'Sub-15ms Latency' },
            { label: 'Anti-Spoofing', value: '3D Liveness', sub: 'Photo/Replay Mitigation' },
            { label: 'Gate Pass Engine', value: '100% Digital', sub: 'Dynamic QR + Thermal Print' },
            { label: 'Access Control', value: 'Zone-Based', sub: 'Proposal Section 14' }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">{stat.label}</span>
              <span className="font-extrabold text-white text-base block">{stat.value}</span>
              <span className="text-[10px] text-sky-400 font-mono mt-0.5 block">{stat.sub}</span>
            </div>
          ))}
        </div>

      </section>

      {/* Multi-Modal Biometrics Showcase */}
      <section id="biometrics" className="py-16 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">Biometric Assurance</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Multi-Modal Identity Verification Modes
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Configurable biometric modes ensuring every individual entering the premises is correctly identified and authorized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mode 1: Facial Recognition */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition-all">
              <div className="w-12 h-12 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">8MP Facial Recognition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                OpenCV frame acquisition $ightarrow$ SCRFD face detection $ightarrow$ ArcFace (InsightFace) facial embedding match with sub-second accuracy.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Anti-Spoof:</span>
                  <span className="text-emerald-400 font-bold">Silent Liveness</span>
                </div>
                <div className="flex justify-between">
                  <span>Embeddings:</span>
                  <span className="text-sky-400">512-dim ArcFace</span>
                </div>
              </div>
            </div>

            {/* Mode 2: Fingerprint */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fingerprint Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                500 DPI optical scanner SDK integration. Captures ridge patterns and minutiae points to verify enrolled visitor profiles.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Sensor Type:</span>
                  <span className="text-slate-200">Optical Prism</span>
                </div>
                <div className="flex justify-between">
                  <span>Template:</span>
                  <span className="text-emerald-400">ANSI/INCITS 378</span>
                </div>
              </div>
            </div>

            {/* Mode 3: Iris Scanner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Iris Recognition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Near-infrared illumination and pupil targeting for highest-security areas where zero-touch iris verification is mandated.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Illumination:</span>
                  <span className="text-purple-400">NIR 850nm</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Range:</span>
                  <span className="text-slate-200">35-45 cm Auto</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4-Step Controlled Workflow */}
      <section id="workflow" className="py-16 px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Structured Lifecycle</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            End-to-End Visitor Workflow
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            A 4-step controlled chain separating identity verification from visit authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Pre-Registration', desc: 'Visitor enters identity details, ID document number, and captures selfie.', icon: UserCheck },
            { step: '02', title: 'Host Approval', desc: 'Concerned department host grants security clearance & custom zone rights.', icon: CheckCircle2 },
            { step: '03', title: 'Biometric Verification', desc: 'Gate camera/scanner matches identity & verifies valid visit approval.', icon: Camera },
            { step: '04', title: 'Digital Gate Pass', desc: 'Pass badge with dynamic QR code is issued & entry time is recorded.', icon: QrCode }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-3">
                <span className="text-2xl font-black text-slate-800 absolute right-4 top-4 font-mono">{item.step}</span>
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl w-fit border border-sky-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Pass Status Checker Widget */}
      <section id="tracker" className="py-16 px-6 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">Self-Service Status</span>
            <h2 className="text-2xl font-black text-white">Track Your Gate Pass Status</h2>
            <p className="text-xs text-slate-400">
              Enter your Pass Reference Number (e.g. <code className="text-sky-400">GP-2026-891</code>) or Mobile Number to check real-time approval status.
            </p>
          </div>

          <form onSubmit={handleSearchPass} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. GP-2026-891 or 9876543210"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              className="flex-1 bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all"
            >
              <Search className="w-4 h-4" /> Check Status
            </button>
          </form>

          {/* Search Result */}
          {hasSearched && (
            <div className="text-left animate-in fade-in duration-200">
              {searchedVisit ? (
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={searchedVisit.visitorPhoto} 
                        alt={searchedVisit.visitorName} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white text-sm block">{searchedVisit.visitorName}</span>
                        <span className="text-xs text-slate-400">{searchedVisit.visitorCompany}</span>
                        <span className="text-[10px] text-sky-400 font-mono block mt-0.5">Pass #{searchedVisit.passNumber}</span>
                      </div>
                    </div>
                    <span className={'px-3 py-1 rounded-full text-xs font-bold uppercase ' + 
                      (searchedVisit.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                       searchedVisit.status === 'APPROVED' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                       searchedVisit.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                       'bg-rose-500/20 text-rose-400 border border-rose-500/30')}>
                      {searchedVisit.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Host Authority:</span>
                      <span className="font-semibold text-white">{searchedVisit.hostName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Visit Date:</span>
                      <span className="font-mono text-slate-300">{formatDateOnly(searchedVisit.scheduledTime)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block">Purpose:</span>
                      <span className="text-slate-200">{searchedVisit.purpose}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No active visit record found for "{searchToken}". Please verify the pass number or <button onClick={() => setActivePage('pre-register')} className="text-sky-400 underline font-semibold">Pre-Register Here</button>.
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-6 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-300 text-sm">ILIZIEN PRIVATE LIMITED</span>
              <span className="font-mono text-[10px] text-slate-600">UIN: U36999AP2020PTC114536</span>
            </div>
            <p className="text-[11px] text-slate-500">
              A-586, A Block, Palam Vihar, Gurgaon 122017 | +91 7720039346 | info@ilizien.com
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActivePage('login')} className="hover:text-sky-400 transition-colors">Staff Login</button>
            <span>�</span>
            <button onClick={() => setActivePage('pre-register')} className="hover:text-sky-400 transition-colors">Visitor Pass</button>
            <span>�</span>
            <span className="text-emerald-500 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
