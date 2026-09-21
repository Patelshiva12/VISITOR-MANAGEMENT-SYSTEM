import React, { useState } from 'react';
import { 
  CheckCircle2, 
  UserPlus, 
  CheckSquare, 
  Users, 
  Camera, 
  ShieldCheck, 
  QrCode, 
  LogIn, 
  Clock, 
  LogOut, 
  FileSpreadsheet, 
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export const proposalStages = [
  {
    stage: 1,
    title: 'Visitor Request / Pre-Registration',
    proposalSection: 'Section 3 & 4 (Page 3-4)',
    component: 'PreRegistration.jsx',
    pageRoute: 'pre-register',
    icon: UserPlus,
    description: 'Advance registration with personal info, organization, contact, photograph, ID document details, visit purpose, host, vehicle #, and laptop serial number.',
    keyFeatures: ['Live Selfie Camera Capture', 'Repeat Visitor Phone Auto-Lookup', 'Equipment Asset Tagging']
  },
  {
    stage: 2,
    title: 'Approval by Host / Department',
    proposalSection: 'Section 4.3 (Page 4)',
    component: 'HostApprovals.jsx',
    pageRoute: 'host-approvals',
    icon: CheckSquare,
    description: 'Digital approval chain routed to the designated host authority with customized zone access rights and validity duration.',
    keyFeatures: ['1-Click Fast Approval', 'Custom Zone Permissions Editor', 'Rejection with Mandatory Remarks']
  },
  {
    stage: 3,
    title: 'Visitor Record Creation or Retrieval',
    proposalSection: 'Section 4.4 & 7 (Page 4-5)',
    component: 'VisitorList.jsx',
    pageRoute: 'visitors',
    icon: Users,
    description: 'Centralized database of allowed personnel, biometric references, repeat visitor identity lookup, and security watchlist/blacklist toggle.',
    keyFeatures: ['Master Identity Profiles', 'Edit Profile Modal', 'Lifetime Visit History Tracker']
  },
  {
    stage: 4,
    title: 'Biometric Enrolment / Verification',
    proposalSection: 'Section 5 (Page 4-5)',
    component: 'BiometricScannerModal.jsx',
    pageRoute: 'guard',
    icon: Camera,
    description: 'Multi-modal biometrics: 8MP Facial Recognition (OpenCV + SCRFD + ArcFace), 3D Anti-Spoof Liveness detection, 500 DPI Fingerprint, and NIR Iris scanner.',
    keyFeatures: ['5-Point Face Landmark Mesh', '3D Silent Liveness Anti-Spoof (99.4%)', 'Optical Fingerprint & NIR Iris']
  },
  {
    stage: 5,
    title: 'Authorization Validation',
    proposalSection: 'Section 6 (Page 5)',
    component: 'BiometricScannerModal.jsx',
    pageRoute: 'guard',
    icon: ShieldCheck,
    description: 'Dual Security Controls Matrix: Separates Identity Match ("Who is this person?") from Visit Authorization ("Is this person approved to enter today?").',
    keyFeatures: ['Dual Validation Engine', 'Guard Manual Security Override', 'Declared Laptop Verification']
  },
  {
    stage: 6,
    title: 'Digital Gate Pass Generation',
    proposalSection: 'Section 8 (Page 6)',
    component: 'GatePassModal.jsx',
    pageRoute: 'guard',
    icon: QrCode,
    description: 'Generation of digital & printable gate passes with visitor photo, dynamic vector QR code, validity countdown, and authorized security zones.',
    keyFeatures: ['PVC ID Clip-On Badge', '80mm Thermal Receipt Slip', 'Standard A4 Official Permit Sheet']
  },
  {
    stage: 7,
    title: 'Entry Recording & Check-In',
    proposalSection: 'Section 8 (Page 6)',
    component: 'GuardKiosk.jsx',
    pageRoute: 'guard',
    icon: LogIn,
    description: 'Recording visitor gate entry, gate selection (Gate 1, Gate 2, VIP Lobby), exact entry timestamp, and active pass activation.',
    keyFeatures: ['1-Click Turnstile Check-In', 'Multi-Gate Terminal Routing', 'Equipment Verification Log']
  },
  {
    stage: 8,
    title: 'Visit Monitoring & Host Notification',
    proposalSection: 'Section 9 (Page 6)',
    component: 'Dashboard.jsx',
    pageRoute: 'dashboard',
    icon: Clock,
    description: 'Real-time monitoring of currently inside visitors, host arrival notifications, live elapsed time countdown, and overstay red alert badges.',
    keyFeatures: ['Live Ticking Elapsed Clocks', 'Automatic Overstay Red Flagging', 'AI Telemetry Latency Monitors']
  },
  {
    stage: 9,
    title: 'Exit Verification & Pass Closure',
    proposalSection: 'Section 8 & 9 (Page 6)',
    component: 'GuardKiosk.jsx',
    pageRoute: 'guard',
    icon: LogOut,
    description: 'Gate pass deactivation upon visit completion, actual exit timestamp logging, and optional biometric re-verification.',
    keyFeatures: ['1-Click Fast Check-Out', 'Pass Permanent Deactivation', 'Exit Duration Calculation']
  },
  {
    stage: 10,
    title: 'Audit & Regulatory Reporting',
    proposalSection: 'Section 10 (Page 6)',
    component: 'AuditLogs.jsx',
    pageRoute: 'audit-logs',
    icon: FileSpreadsheet,
    description: 'Immutable, defensible digital audit trail for all registrations, approvals, biometric matches, entries, exits, and 1-click CSV/JSON report exports.',
    keyFeatures: ['Full-Text Audit Search', 'Severity Filtering (Critical/Warning)', '1-Click CSV & JSON Export']
  }
];

export default function ProposalStagesModal({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="font-black text-lg">Ilizien Proposal: Complete 10-Stage Workflow Compliance</h3>
            </div>
            <p className="text-xs text-slate-400">
              Direct 1-to-1 feature mapping for all 10 stages specified on Page 3 (Section 3) of the proposal document.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposalStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.stage}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-sky-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/30">
                        {stage.stage}
                      </span>
                      <h4 className="font-bold text-white text-xs">{stage.title}</h4>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 block">
                    Proposal Reference: <strong className="text-sky-400">{stage.proposalSection}</strong>
                  </span>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stage.keyFeatures.map((feat, fIdx) => (
                      <span key={fIdx} className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[10px] font-semibold rounded-md border border-slate-800">
                        � {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-slate-400">File: {stage.component}</span>
                  <button
                    onClick={() => {
                      onNavigate(stage.pageRoute);
                      onClose();
                    }}
                    className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 text-[11px]"
                  >
                    Open Live Demo <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extension Module Highlight (Section 14) */}
        <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Optional Extension: Zone-Based Access Management (Section 14)</span>
              <span className="text-[11px] text-purple-300">Turnstile door access simulator, multi-zone security matrix, and real-time breach alarm.</span>
            </div>
          </div>
          <button
            onClick={() => {
              onNavigate('zone-access');
              onClose();
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-md transition-colors shrink-0"
          >
            Open Zone Access
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  );
}
