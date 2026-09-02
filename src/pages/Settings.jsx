import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Sliders, 
  Camera, 
  Fingerprint, 
  Eye, 
  ShieldCheck, 
  Database, 
  Lock, 
  CheckCircle2, 
  RotateCcw,
  Activity,
  Save,
  Server
} from 'lucide-react';

export default function Settings() {
  const { currentGate, resetToDemoData } = useVms();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    faceThreshold: 85,
    livenessSensitivity: 'High (3D Depth + Silent Blink)',
    cameraResolution: '3840 x 2160 (8 Megapixels)',
    overstayGraceMins: 15,
    autoBlacklistThreshold: 3,
    printerModel: 'Direct Thermal 80mm ESC/POS + PVC Card',
    dbEncryption: 'AES-256 Encrypted Vault',
    storageRetentionDays: 365
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">System Configuration & Biometric Calibration</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure biometric hardware thresholds, anti-spoofing sensitivity, and gate pass policies.
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Engine v2.4 Active
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Biometric Calibration */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Camera className="w-4 h-4 text-sky-400" /> 1. Facial Recognition & Liveness Calibration (ArcFace + SCRFD)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Match Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>ArcFace Cosine Match Threshold:</span>
                <span className="text-sky-400 font-mono font-bold">{settings.faceThreshold}% Match</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={settings.faceThreshold}
                onChange={(e) => setSettings({ ...settings, faceThreshold: Number(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Higher threshold reduces False Acceptance Rate (FAR).</span>
            </div>

            {/* Liveness Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Anti-Spoofing Liveness Mode</label>
              <select
                value={settings.livenessSensitivity}
                onChange={(e) => setSettings({ ...settings, livenessSensitivity: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="High (3D Depth + Silent Blink)">Strict: 3D Depth + Micro-Texture + Silent Blink</option>
                <option value="Medium (Texture Analysis)">Standard: Texture Analysis & Surface Reflection</option>
                <option value="Low (Basic Frame Motion)">Relaxed: Basic Frame Motion</option>
              </select>
            </div>

            {/* Camera Resolution */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">8MP Camera Frame Pipeline</label>
              <select
                value={settings.cameraResolution}
                onChange={(e) => setSettings({ ...settings, cameraResolution: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="3840 x 2160 (8 Megapixels)">4K UHD (3840 x 2160 @ 30 FPS)</option>
                <option value="1920 x 1080 (1080p FHD)">FHD (1920 x 1080 @ 60 FPS)</option>
                <option value="1280 x 720 (720p HD)">HD (1280 x 720 @ 30 FPS)</option>
              </select>
            </div>

            {/* Overstay Grace Period */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Overstay Grace Period (Minutes)</label>
              <input
                type="number"
                value={settings.overstayGraceMins}
                onChange={(e) => setSettings({ ...settings, overstayGraceMins: Number(e.target.value) })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Gate Pass & Security Policy */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Gate Pass & Hardware Integration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Pass Printer Driver Mode</label>
              <select
                value={settings.printerModel}
                onChange={(e) => setSettings({ ...settings, printerModel: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Direct Thermal 80mm ESC/POS + PVC Card">Direct Thermal 80mm ESC/POS & PVC Badges</option>
                <option value="A4 Laser Sheet Printer">Standard A4 Laser Sheet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Biometric Vault Encryption</label>
              <input
                type="text"
                disabled
                value={settings.dbEncryption}
                className="w-full bg-slate-950/60 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-emerald-400 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset system data to initial demonstration state?')) {
                resetToDemoData();
                alert('System restored to default baseline.');
              }
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Baseline Data
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
