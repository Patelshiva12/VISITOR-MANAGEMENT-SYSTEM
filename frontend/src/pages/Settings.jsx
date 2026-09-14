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
  Server,
  Archive,
  FileCheck
} from 'lucide-react';

export default function Settings() {
  const { currentGate, resetToDemoData, logAudit } = useVms();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    faceThreshold: 85,
    livenessSensitivity: 'High (3D Depth + Silent Blink)',
    cameraResolution: '3840 x 2160 (8 Megapixels)',
    overstayGraceMins: 15,
    autoBlacklistThreshold: 3,
    printerModel: 'Direct Thermal 80mm ESC/POS + PVC Card',
    dbEncryption: 'AES-256 Encrypted Vault (Section 13.3)',
    storageRetentionDays: '365 Days (1 Year ISO Compliance)',
    biometricArchivalPolicy: 'Auto-Purge Expired Face Embeddings after 90 Days',
    auditLogImmutable: 'Enabled (Write-Once-Read-Many)'
  });

  const handleSave = (e) => {
    e.preventDefault();
    logAudit('SETTINGS_UPDATED', 'System security policies & biometric calibration updated by Administrator', 'SUCCESS');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">System Configuration & Biometric Calibration</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure biometric hardware thresholds, anti-spoofing sensitivity, and data retention policies (Section 13).
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Engine v2.4 Active
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Biometric Calibration (Section 5) */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5">
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
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
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
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
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
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security & Data Protection Policy (Section 13) */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Archive className="w-4 h-4 text-purple-400" /> 2. Data Protection, Retention & Archival Policy (Section 13.5)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Visitor Records Retention Period</label>
              <select
                value={settings.storageRetentionDays}
                onChange={(e) => setSettings({ ...settings, storageRetentionDays: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="90 Days (Quarterly Purge)">90 Days (Quarterly Purge)</option>
                <option value="180 Days (Half-Yearly)">180 Days (Half-Yearly)</option>
                <option value="365 Days (1 Year ISO Compliance)">365 Days (1 Year ISO Compliance)</option>
                <option value="3 Years (Extended Legal Hold)">3 Years (Extended Legal Hold)</option>
                <option value="7 Years (Statutory Audit Archive)">7 Years (Statutory Audit Archive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Biometric Vault Privacy Policy</label>
              <select
                value={settings.biometricArchivalPolicy}
                onChange={(e) => setSettings({ ...settings, biometricArchivalPolicy: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Auto-Purge Expired Face Embeddings after 90 Days">Auto-Purge Expired Face Embeddings after 90 Days</option>
                <option value="Retain Permanent Enrolled Templates">Retain Permanent Enrolled Templates</option>
                <option value="Anonymize Facial Hashes on Visit Closure">Anonymize Facial Hashes on Visit Closure</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Pass Printer Mode</label>
              <select
                value={settings.printerModel}
                onChange={(e) => setSettings({ ...settings, printerModel: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Direct Thermal 80mm ESC/POS + PVC Card">Direct Thermal 80mm ESC/POS & PVC Badges</option>
                <option value="A4 Laser Sheet Printer">Standard A4 Laser Sheet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Biometric Encryption Standard (Section 13.3)</label>
              <input
                type="text"
                disabled
                value={settings.dbEncryption}
                className="w-full bg-slate-950/60 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-emerald-400 font-mono font-bold cursor-not-allowed"
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
