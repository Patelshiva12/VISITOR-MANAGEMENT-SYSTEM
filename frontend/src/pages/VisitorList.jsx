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
  MapPin,
  Plus
} from 'lucide-react';
import { formatDateOnly } from '../utils/formatters';
import Pagination from '../components/Pagination';

export default function VisitorList({ setActivePage }) {
  const { visitors, visits, departments, toggleBlacklist, updateVisitor, mapUserDepartments } = useVms();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // 10 Items Per Page Pagination State
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredVisitors = visitors.filter(v => {
    if (!v) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const fName = (v.fullName || v.name || '').toLowerCase();
    const comp = (v.company || v.organization || '').toLowerCase();
    const phone = String(v.phone || '');
    const id = String(v.id || v.person_id || '').toLowerCase();

    return fName.includes(q) || comp.includes(q) || phone.includes(q) || id.includes(q);
  });

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
      allowedDepartments: visitor.allowedDepartments || [],
      enrolledBiometrics: visitor.enrolledBiometrics || { face: true, fingerprint: false, iris: false }
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingVisitor) return;
    updateVisitor(editingVisitor.id, editFormData);
    if (editFormData.allowedDepartments) {
      await mapUserDepartments(editingVisitor.id, editFormData.allowedDepartments);
    }
    setEditingVisitor(null);
  };

  const handleToggleEditDept = (deptCode) => {
    const current = editFormData.allowedDepartments || [];
    if (current.includes(deptCode)) {
      setEditFormData({ ...editFormData, allowedDepartments: current.filter(c => c !== deptCode) });
    } else {
      setEditFormData({ ...editFormData, allowedDepartments: [...current, deptCode] });
    }
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
            Manage registered personnel, edit profile details, update biometric enrollment, and review department access clearance.
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
        {filteredVisitors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(v => {
          const visitorVisits = visits.filter(visit => visit.visitorId === v.id);
          const deptList = v.allowedDepartments || [];

          return (
            <div
              key={v.id}
              className={'bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-4 transition-all relative overflow-hidden flex flex-col justify-between ' + 
                (v.isBlacklisted ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-sky-500/40')}
            >
              {v.isBlacklisted && (
                <div className="bg-rose-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-0.5 text-center -mx-5 -mt-5 mb-2">
                  SECURITY WATCH / BLACKLISTED
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {v.photoUrl ? (
                    <img
                      src={v.photoUrl}
                      alt={v.fullName}
                      className={'w-14 h-14 rounded-2xl object-cover border-2 shrink-0 ' + 
                        (v.isBlacklisted ? 'border-rose-500' : 'border-slate-700')}
                    />
                  ) : (
                    <div className={'w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-700 to-indigo-600 flex items-center justify-center text-white text-base font-black border-2 shrink-0 ' + 
                      (v.isBlacklisted ? 'border-rose-500' : 'border-slate-700')}>
                      {(v.fullName || 'V').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm truncate block">{v.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{v.id}</span>
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
                      <span title="Facial Recognition" className={'p-1 rounded ' + (v.enrolledBiometrics?.face ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400')}>
                        <Camera className="w-3.5 h-3.5" />
                      </span>
                      <span title="Fingerprint" className={'p-1 rounded ' + (v.enrolledBiometrics?.fingerprint ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400')}>
                        <Fingerprint className="w-3.5 h-3.5" />
                      </span>
                      <span title="Iris Scan" className={'p-1 rounded ' + (v.enrolledBiometrics?.iris ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400')}>
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Lifetime Visits:</span>
                    <span className="font-bold text-sky-400">{visitorVisits.length} visits logged</span>
                  </div>
                </div>
              </div>

              {/* Actions: Edit Details, View History, Watchlist */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600 hover:text-white text-sky-400 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-sky-500/30 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setSelectedVisitor(v)}
                    className="text-slate-400 hover:text-white font-semibold text-[11px] cursor-pointer"
                  >
                    History ({visitorVisits.length})
                  </button>
                </div>

                <button
                  onClick={() => toggleBlacklist(v.id)}
                  className={'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ' + 
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

      {/* 10-Item Responsive Pagination Footer */}
      <div className="rounded-2xl overflow-hidden border border-slate-800">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredVisitors.length}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="visitors"
        />
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
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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

              {/* Department Access Checkboxes */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">Authorized Department Clearance:</span>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map(d => {
                    const isChecked = (editFormData.allowedDepartments || []).includes(d.code);
                    return (
                      <label key={d.code} className="flex items-center gap-2 cursor-pointer text-slate-300 p-1.5 rounded-lg hover:bg-slate-900 border border-slate-800">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEditDept(d.code)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-[11px] font-bold truncate">{d.code} - {d.name}</span>
                      </label>
                    );
                  })}
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-950/600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-600/30 cursor-pointer"
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
                {selectedVisitor.photoUrl ? (
                  <img 
                    src={selectedVisitor.photoUrl} 
                    alt={selectedVisitor.fullName} 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center text-xs font-black border border-slate-700">
                    {(selectedVisitor.fullName || 'V').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedVisitor.fullName}</h4>
                  <span className="text-xs text-slate-400">{selectedVisitor.company}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
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
                    <span className="text-[10px] text-slate-400 font-mono">Gate: {vt.gate || 'Main Gate 01'}</span>
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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
