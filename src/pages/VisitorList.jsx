import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Fingerprint, 
  Camera, 
  Eye, 
  FileText, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit,
  X,
  Save,
  Laptop,
  MapPin
} from 'lucide-react';
import { formatDateOnly } from '../utils/formatters';

export default function VisitorList({ setActivePage }) {
  const { visitors, visits, toggleBlacklist, updateVisitor } = useVms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const filteredVisitors = visitors.filter(v => 
    v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.company && v.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    v.phone.includes(searchQuery) ||
    v.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (visitor) => {
    setEditingVisitor(visitor);
    setEditFormData({
      fullName: visitor.fullName || '',
      phone: visitor.phone || '',
      email: visitor.email || '',
      company: visitor.company || '',
      address: visitor.address || '',
      idProofType: visitor.idProofType || 'Aadhaar Card',
      idProofNumber: visitor.idProofNumber || '',
      laptopSerial: visitor.laptopSerial || '',
      photoUrl: visitor.photoUrl || '',
      enrolledBiometrics: visitor.enrolledBiometrics || { face: true, fingerprint: false, iris: false }
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingVisitor) return;
    updateVisitor(editingVisitor.id, editFormData);
    setEditingVisitor(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Centralized Visitor Directory & Identity Profiles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage registered personnel, edit profile details, update biometric enrollment, and review history.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, company, phone, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVisitors.map(v => {
          const visitorVisits = visits.filter(visit => visit.visitorId === v.id);
          return (
            <div
              key={v.id}
              className={'bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-4 transition-all relative overflow-hidden ' + 
                (v.isBlacklisted ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-sky-500/40')}
            >
              {v.isBlacklisted && (
                <div className="bg-rose-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-0.5 text-center -mx-5 -mt-5 mb-2">
                  SECURITY WATCH / BLACKLISTED
                </div>
              )}

              <div className="flex items-start gap-3">
                <img
                  src={v.photoUrl}
                  alt={v.fullName}
                  className={'w-14 h-14 rounded-2xl object-cover border-2 shrink-0 ' + 
                    (v.isBlacklisted ? 'border-rose-500' : 'border-slate-700')}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm truncate block">{v.fullName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{v.id}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium block truncate">{v.company || 'Individual Visitor'}</span>
                  <span className="text-[11px] text-sky-400 font-mono block mt-0.5">{v.phone}</span>
                </div>
              </div>

              {/* Identity & Biometric status tags */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Document:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[170px]">{v.idProofType} ({v.idProofNumber || 'N/A'})</span>
                </div>

                {v.address && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{v.address}</span>
                  </div>
                )}

                {v.laptopSerial && v.laptopSerial !== 'NONE' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Laptop Tag:</span>
                    <span className="font-mono text-sky-400">{v.laptopSerial}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Biometric Modes:</span>
                  <div className="flex items-center gap-1.5">
                    <span title="Facial Recognition" className={'p-1 rounded ' + (v.enrolledBiometrics?.face ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-600')}>
                      <Camera className="w-3.5 h-3.5" />
                    </span>
                    <span title="Fingerprint" className={'p-1 rounded ' + (v.enrolledBiometrics?.fingerprint ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600')}>
                      <Fingerprint className="w-3.5 h-3.5" />
                    </span>
                    <span title="Iris Scan" className={'p-1 rounded ' + (v.enrolledBiometrics?.iris ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600')}>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Lifetime Visits:</span>
                  <span className="font-bold text-sky-400">{visitorVisits.length} visits logged</span>
                </div>
              </div>

              {/* Actions: Edit Details, View History, Watchlist */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600 hover:text-white text-sky-400 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-sky-500/30"
                  >
                    <Edit className="w-3 h-3" /> Edit Details
                  </button>
                  <button
                    onClick={() => setSelectedVisitor(v)}
                    className="text-slate-400 hover:text-white font-semibold text-[11px]"
                  >
                    History ({visitorVisits.length})
                  </button>
                </div>

                <button
                  onClick={() => toggleBlacklist(v.id)}
                  className={'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ' + 
                    (v.isBlacklisted 
                      ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30' 
                      : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30')}
                >
                  {v.isBlacklisted ? 'Remove Flag' : 'Flag / Watch'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* EDIT VISITOR DETAILS MODAL */}
      {editingVisitor && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-white">
                <Edit className="w-5 h-5 text-sky-400" />
                <div>
                  <h4 className="font-extrabold text-sm">Edit Visitor Identity Details</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Profile ID: {editingVisitor.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingVisitor(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Company */}
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Organization / Employer</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* ID Type */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Identity Document</label>
                  <select
                    value={editFormData.idProofType}
                    onChange={(e) => setEditFormData({ ...editFormData, idProofType: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID (EPIC)</option>
                    <option value="PAN Card">PAN Card</option>
                  </select>
                </div>

                {/* ID Number */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Document Number</label>
                  <input
                    type="text"
                    value={editFormData.idProofNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, idProofNumber: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Declared Laptop Serial */}
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Declared Equipment / Laptop Serial</label>
                  <input
                    type="text"
                    placeholder="e.g. DELL-LAT-7420-SN9912"
                    value={editFormData.laptopSerial}
                    onChange={(e) => setEditFormData({ ...editFormData, laptopSerial: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Biometrics Enrollment Checklist */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">Enrolled Biometric Modes:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editFormData.enrolledBiometrics?.face}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        enrolledBiometrics: { ...editFormData.enrolledBiometrics, face: e.target.checked }
                      })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Facial (ArcFace)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editFormData.enrolledBiometrics?.fingerprint}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        enrolledBiometrics: { ...editFormData.enrolledBiometrics, fingerprint: e.target.checked }
                      })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Fingerprint (500 DPI)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editFormData.enrolledBiometrics?.iris}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        enrolledBiometrics: { ...editFormData.enrolledBiometrics, iris: e.target.checked }
                      })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Iris Scan (NIR)</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVisitor(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Visitor History Drawer / Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedVisitor.photoUrl} 
                  alt={selectedVisitor.fullName} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedVisitor.fullName}</h4>
                  <span className="text-xs text-slate-400">{selectedVisitor.company}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Gate Pass Records</h5>
              {visits.filter(v => v.visitorId === selectedVisitor.id).map(vt => (
                <div key={vt.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{vt.purpose}</span>
                    <span className="font-mono text-sky-400">{vt.passNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Host: {vt.hostName} ({vt.hostDept})</span>
                    <span>{formatDateOnly(vt.scheduledTime)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Gate: {vt.gate || 'Main Gate 01'}</span>
                    <span className={'px-2 py-0.5 rounded text-[10px] font-bold uppercase ' + 
                      (vt.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300')}>
                      {vt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVisitor(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
