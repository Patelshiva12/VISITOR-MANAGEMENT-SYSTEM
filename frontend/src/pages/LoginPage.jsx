import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  UserCheck, 
  Building2, 
  Radio, 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login, hosts } = useVms();
  const [selectedRole, setSelectedRole] = useState('guard'); // 'guard' | 'host' | 'admin' | 'visitor'
  const [gate, setGate] = useState('Main Gate 01');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedHostId, setSelectedHostId] = useState('HST-101');
  const [rememberMe, setRememberMe] = useState(true);
  const [isFaceScanning, setIsFaceScanning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    processLogin(selectedRole);
  };

  const processLogin = (role) => {
    if (role === 'guard') {
      login('guard', {
        name: 'Officer Sandeep Sharma',
        email: 'guard.desk01@ilizien.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }, gate);
      setActivePage('guard');
    } else if (role === 'host') {
      const selectedHost = hosts.find(h => h.id === selectedHostId) || hosts[0];
      login('host', {
        name: selectedHost.name,
        email: selectedHost.email,
        department: selectedHost.department,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });
      setActivePage('host-approvals');
    } else if (role === 'admin') {
      login('admin', {
        name: 'Chief Security Officer (Admin)',
        email: 'admin.security@ilizien.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      });
      setActivePage('dashboard');
    } else if (role === 'visitor') {
      login('visitor', {
        name: 'Visitor Portal User',
        email: 'visitor.guest@guest.com'
      });
      setActivePage('pre-register');
    }
  };

  // Simulated Biometric Face Login
  const handleBiometricLogin = () => {
    setIsFaceScanning(true);
    setTimeout(() => {
      setIsFaceScanning(false);
      processLogin(selectedRole);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back to landing button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Security Portal Authentication</h2>
          <p className="text-xs text-slate-400">
            Select your assigned role to access the Visitor Management System.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'guard', label: 'Guard', icon: Shield },
            { id: 'host', label: 'Host', icon: UserCheck },
            { id: 'admin', label: 'Admin', icon: Building2 },
            { id: 'visitor', label: 'Visitor', icon: Eye }
          ].map(r => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={'flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ' + 
                  (isSelected 
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900')}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role 1: Security Guard specific field (Gate selection) */}
          {selectedRole === 'guard' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" /> Assigned Gate Terminal
              </label>
              <select
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="Main Gate 01">Main Gate 01 (Front Entrance)</option>
                <option value="North Gate 02">North Gate 02 (Service & R&D)</option>
                <option value="VIP Lobby">VIP Lobby & Executive Portal</option>
              </select>
            </div>
          )}

          {/* Role 2: Host specific field (Host Picker for demo) */}
          {selectedRole === 'host' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Host Profile</label>
              <select
                value={selectedHostId}
                onChange={(e) => setSelectedHostId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none focus:border-sky-500"
              >
                {hosts.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} � {h.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Username / Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {selectedRole === 'guard' ? 'Guard Badge / Officer ID' : selectedRole === 'visitor' ? 'Mobile / Reference ID' : 'Work Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={selectedRole === 'guard' ? 'G-8801' : selectedRole === 'visitor' ? '+91 98765 43210' : 'employee@ilizien.com'}
                defaultValue={selectedRole === 'admin' ? 'admin@ilizien.com' : selectedRole === 'guard' ? 'guard.desk01' : ''}
                className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Password (if not visitor) */}
          {selectedRole !== 'visitor' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Security PIN / Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo mode: Use 1-click login below without password.'); }} className="text-[11px] text-sky-400 hover:underline">
                  Forgot PIN?
                </a>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="��������"
                  defaultValue="security@2026"
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-3.5 w-3.5"
              />
              <span>Remember this workstation</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-400">256-Bit SSL</span>
          </div>

          {/* Primary Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Sign In to {selectedRole.toUpperCase()} Portal
          </button>

          {/* Quick 1-Click Demo Login Pill */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => processLogin(selectedRole)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              1-Click Demo Login as {selectedRole.toUpperCase()}
            </button>
          </div>

          {/* Biometric Quick Face Login Simulation */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isFaceScanning}
              onClick={handleBiometricLogin}
              className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className={'w-3.5 h-3.5 text-sky-400 ' + (isFaceScanning ? 'animate-spin' : '')} />
              {isFaceScanning ? 'Matching Face Biometrics...' : 'Fast Biometric Face Login'}
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
          Ilizien Private Limited � Multi-Modal Identity Suite
        </div>

      </div>

    </div>
  );
}
