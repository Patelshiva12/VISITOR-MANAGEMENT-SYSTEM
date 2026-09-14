import React, { useState } from 'react';
import { useVms } from '../context/VmsContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  Lock, 
  Unlock,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toastService } from '../services/api';

const CLEARANCE_LEVELS = [
  { id: 'STANDARD', label: 'Level 1: Standard Access (Public/Lounge)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'RESTRICTED', label: 'Level 2: Restricted Department (Escort/Badge)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'HIGH_SECURITY', label: 'Level 3: High Security (Biometric Mantrap)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'TOP_SECRET', label: 'Level 4: Critical Vault (Executive Clearance)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
];

export default function DepartmentMaster({ setActivePage }) {
  const { 
    departments, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment, 
    mapUserDepartments, 
    visitors, 
    visits 
  } = useVms();

  const [activeTab, setActiveTab] = useState('MAPPING'); // 'MAPPING' | 'DIRECTORY' | 'ROSTER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClearance, setSelectedClearance] = useState('ALL');

  // Modal State for Adding/Editing Department
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    floor: 'Floor 1',
    head_of_dept: '',
    head_email: '',
    head_phone: '',
    security_clearance_required: 'STANDARD',
    description: '',
    color: 'sky'
  });

  // User-to-Department Mapping Matrix State
  const [selectedVisitorId, setSelectedVisitorId] = useState(visitors[0]?.id || '');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [isVisitorDropdownOpen, setIsVisitorDropdownOpen] = useState(false);
  const visitorDropdownRef = React.useRef(null);

  // Close visitor dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (visitorDropdownRef.current && !visitorDropdownRef.current.contains(event.target)) {
        setIsVisitorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtered visitors for the mapping tab selector
  const filteredMappingVisitors = visitors.filter(v => {
    if (!visitorSearchTerm.trim()) return true;
    const q = visitorSearchTerm.toLowerCase().trim();
    return (
      (v.fullName && v.fullName.toLowerCase().includes(q)) ||
      (v.company && v.company.toLowerCase().includes(q)) ||
      (v.phone && v.phone.toLowerCase().includes(q)) ||
      (v.id && v.id.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q)) ||
      (v.govtId && v.govtId.toLowerCase().includes(q))
    );
  });

  // When selected visitor changes, load their allowed departments
  React.useEffect(() => {
    if (selectedVisitorId) {
      const visitor = visitors.find(v => v.id === selectedVisitorId);
      if (visitor) {
        setSelectedDepts(visitor.allowedDepartments || []);
      }
    } else if (visitors.length > 0) {
      setSelectedVisitorId(visitors[0].id);
      setSelectedDepts(visitors[0].allowedDepartments || []);
    }
  }, [selectedVisitorId, visitors]);

  // Selected Department for Roster View
  const [selectedRosterDeptCode, setSelectedRosterDeptCode] = useState(departments[0]?.code || 'RND');

  // Filtered Departments
  const filteredDepartments = departments.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (d.head_of_dept && d.head_of_dept.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (d.floor && d.floor.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchSearch) return false;
    if (selectedClearance !== 'ALL' && d.security_clearance_required !== selectedClearance) return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      code: '',
      name: '',
      floor: 'Floor 1',
      head_of_dept: '',
      head_email: '',
      head_phone: '',
      security_clearance_required: 'STANDARD',
      description: '',
      color: 'sky'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      floor: dept.floor,
      head_of_dept: dept.head_of_dept || '',
      head_email: dept.head_email || '',
      head_phone: dept.head_phone || '',
      security_clearance_required: dept.security_clearance_required || 'STANDARD',
      description: dept.description || '',
      color: dept.color || 'sky'
    });
    setModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Department Code and Name are mandatory.');
      return;
    }

    if (editingDept) {
      await updateDepartment(editingDept.id || editingDept.code, formData);
    } else {
      await addDepartment(formData);
    }
    setModalOpen(false);
  };

  const handleDeleteDepartment = (dept) => {
    if (window.confirm(`Are you sure you want to delete department "${dept.name}" (${dept.code})?`)) {
      deleteDepartment(dept.id || dept.code);
    }
  };

  // Toggle department checkbox for selected visitor
  const handleToggleDept = (deptCode) => {
    if (selectedDepts.includes(deptCode)) {
      setSelectedDepts(prev => prev.filter(c => c !== deptCode));
    } else {
      setSelectedDepts(prev => [...prev, deptCode]);
    }
  };

  const handleSelectAllCommon = () => {
    const commonCodes = departments
      .filter(d => d.security_clearance_required === 'STANDARD' || d.security_clearance_required === 'RESTRICTED')
      .map(d => d.code);
    setSelectedDepts(commonCodes);
  };

  const handleSelectAll = () => {
    setSelectedDepts(departments.map(d => d.code));
  };

  const handleClearAll = () => {
    setSelectedDepts([]);
  };

  const handleSaveMapping = async () => {
    if (!selectedVisitorId) {
      alert('Please select a visitor to map departments.');
      return;
    }
    await mapUserDepartments(selectedVisitorId, selectedDepts);
  };

  const activeVisitor = visitors.find(v => v.id === selectedVisitorId);
  const activeVisitorVisits = visits.filter(v => v.visitorId === selectedVisitorId || v.visitorName === activeVisitor?.fullName);

  // Roster View: visitors who have access to selectedRosterDeptCode
  const rosterVisitors = visitors.filter(v => 
    v.allowedDepartments && v.allowedDepartments.includes(selectedRosterDeptCode)
  );
  const activeRosterDept = departments.find(d => d.code === selectedRosterDeptCode) || departments[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-cyan-500 text-white rounded-2xl shadow-lg shadow-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Department Master & Access Matrix
                <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full font-bold">
                  {departments.length} Master Departments Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Define organizational departments and map multi-department access permissions for registered visitors.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Master Department
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('MAPPING')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'MAPPING'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. User Multi-Department Mapping Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'DIRECTORY'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Department Master Directory ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ROSTER'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Department-Wise Visitor Access Roster</span>
        </button>
      </div>

      {/* TAB 1: USER MULTI-DEPARTMENT MAPPING MATRIX */}
      {activeTab === 'MAPPING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visitor Selection & Compliance Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Visitor Selector */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  Select Registered Visitor
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {visitors.length} Registered
                </span>
              </div>

              {visitors.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-3">
                  <Users className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">No registered visitors found in database.</p>
                  <button
                    onClick={() => setActivePage('guard')}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
                  >
                    Go to Guard Terminal to Register
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-semibold block">
                      Choose Registered Identity Profile:
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {visitors.length} Registered
                    </span>
                  </div>

                  {/* Compact Searchable Dropdown Combobox */}
                  <div className="relative" ref={visitorDropdownRef}>
                    {/* Dropdown Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsVisitorDropdownOpen(prev => !prev)}
                      className={`w-full bg-slate-950 text-left px-3.5 py-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm ${
                        isVisitorDropdownOpen 
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-slate-950' 
                          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-900/60'
                      }`}
                    >
                      {activeVisitor ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={activeVisitor.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={activeVisitor.fullName}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs truncate">
                                {activeVisitor.fullName}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-sky-400 font-bold rounded shrink-0">
                                {activeVisitor.id}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {activeVisitor.company || 'Visitor'} • {activeVisitor.phone}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Select a visitor profile...</span>
                      )}

                      <div className="flex items-center gap-2 shrink-0 text-slate-400">
                        {isVisitorDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-sky-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Floating Searchable Popover Menu */}
                    {isVisitorDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2.5 space-y-2">
                        {/* Live Search Input inside Dropdown */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            placeholder={`Search among ${visitors.length} visitors...`}
                            value={visitorSearchTerm}
                            onChange={(e) => setVisitorSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                          />
                          {visitorSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setVisitorSearchTerm('')}
                              className="absolute right-2 top-2 text-slate-400 hover:text-white p-0.5 rounded-md cursor-pointer"
                              title="Clear search"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Scrollable Matching List */}
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {filteredMappingVisitors.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs space-y-1">
                              <p>No matching visitors found for "{visitorSearchTerm}"</p>
                              <button
                                type="button"
                                onClick={() => setVisitorSearchTerm('')}
                                className="text-[10px] text-sky-400 hover:underline font-bold cursor-pointer"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            filteredMappingVisitors.map(v => {
                              const isSelected = v.id === selectedVisitorId;
                              const deptCount = v.allowedDepartments?.length || 0;
                              return (
                                <button
                                  type="button"
                                  key={v.id}
                                  onClick={() => {
                                    setSelectedVisitorId(v.id);
                                    setIsVisitorDropdownOpen(false);
                                    setVisitorSearchTerm('');
                                  }}
                                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-600/20 border border-sky-500/50 text-white'
                                      : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={v.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                      alt={v.fullName}
                                      className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                                    />
                                    <div className="truncate">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-xs truncate text-white block">
                                          {v.fullName}
                                        </span>
                                        <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-800 text-slate-400 rounded shrink-0">
                                          {v.id}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 block truncate">
                                        {v.company || 'Visitor'} • <span className="font-mono text-slate-400">{v.phone}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                      deptCount > 0 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-slate-800 text-slate-500'
                                    }`}>
                                      {deptCount} Depts
                                    </span>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-sky-400 stroke-[3]" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Visitor Profile Summary Card */}
                  {activeVisitor && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 mt-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={activeVisitor.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={activeVisitor.fullName} 
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-extrabold text-white text-sm truncate">{activeVisitor.fullName}</h4>
                          <span className="text-xs text-sky-400 font-semibold block truncate">{activeVisitor.company}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{activeVisitor.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Person ID:</span>
                          <span className="font-mono font-bold text-slate-200">{activeVisitor.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Compliance:</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {activeVisitor.complianceStatus || 'COMPLIANT'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block mb-1">Current Authorized Departments:</span>
                        <div className="flex flex-wrap gap-1">
                          {(activeVisitor.allowedDepartments && activeVisitor.allowedDepartments.length > 0) ? (
                            activeVisitor.allowedDepartments.map(code => (
                              <span key={code} className="text-[9px] font-mono px-2 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-md font-bold">
                                {code}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-amber-400 italic">No departments mapped yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Bulk Actions */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Selection Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllCommon}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl border border-slate-700 transition-all text-center"
                >
                  Common Areas
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl border border-slate-700 transition-all text-center"
                >
                  All Depts ({departments.length})
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-[10px] font-bold rounded-xl border border-slate-700 transition-all text-center"
                >
                  Clear All
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Department Checklist & Grant Access (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Department Access Clearance Checklist
                    <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                      {selectedDepts.length} of {departments.length} Selected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Check the departments where <strong className="text-white">{activeVisitor?.fullName || 'Visitor'}</strong> is authorized to enter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveMapping}
                  disabled={!activeVisitor}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Save Department Access
                </button>
              </div>

              {/* Department Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {departments.map(dept => {
                  const isChecked = selectedDepts.includes(dept.code);
                  const clearanceInfo = CLEARANCE_LEVELS.find(c => c.id === dept.security_clearance_required) || CLEARANCE_LEVELS[0];

                  return (
                    <div
                      key={dept.code}
                      onClick={() => handleToggleDept(dept.code)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                        isChecked
                          ? 'bg-sky-950/40 border-sky-400/70 shadow-md ring-1 ring-sky-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              isChecked ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white block">
                                  {dept.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-800 text-sky-400 rounded">
                                  {dept.code}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                📍 {dept.floor}
                              </span>
                            </div>
                          </div>
                        </div>

                        {dept.description && (
                          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {dept.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold border ${clearanceInfo.color}`}>
                          {dept.security_clearance_required}
                        </span>
                        {dept.head_of_dept && (
                          <span className="text-slate-400 truncate max-w-[140px]">
                            HOD: {dept.head_of_dept}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Confirmation Bar */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>
                    Access changes will immediately reflect on the visitor's printed <strong>Gate Pass</strong> and Turnstile verification.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveMapping}
                  disabled={!activeVisitor}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Confirm & Update Access
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DEPARTMENT MASTER DIRECTORY (CRUD) */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedClearance}
                onChange={(e) => setSelectedClearance(e.target.value)}
                className="bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-sky-400 font-bold focus:outline-none"
              >
                <option value="ALL">All Security Clearances</option>
                <option value="STANDARD">Standard (Level 1)</option>
                <option value="RESTRICTED">Restricted (Level 2)</option>
                <option value="HIGH_SECURITY">High Security (Level 3)</option>
                <option value="TOP_SECRET">Top Secret (Level 4)</option>
              </select>

              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search department, HOD, floor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredDepartments.length}</strong> of {departments.length} departments
            </span>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map(dept => {
              const mappedCount = visitors.filter(v => v.allowedDepartments && v.allowedDepartments.includes(dept.code)).length;
              const clearanceInfo = CLEARANCE_LEVELS.find(c => c.id === dept.security_clearance_required) || CLEARANCE_LEVELS[0];

              return (
                <div 
                  key={dept.id || dept.code}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm leading-tight">
                            {dept.name}
                          </h4>
                          <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.2 rounded mt-0.5 inline-block">
                            Code: {dept.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(dept)}
                          title="Edit Department"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          title="Delete Department"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{dept.floor}</span>
                      </div>
                      {dept.head_of_dept && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>HOD: <strong className="text-slate-300">{dept.head_of_dept}</strong></span>
                        </div>
                      )}
                      {dept.head_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono text-[11px]">{dept.head_phone}</span>
                        </div>
                      )}
                    </div>

                    {dept.description && (
                      <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {dept.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${clearanceInfo.color}`}>
                      {dept.security_clearance_required}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedRosterDeptCode(dept.code);
                        setActiveTab('ROSTER');
                      }}
                      className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" /> {mappedCount} Authorized
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: DEPARTMENT-WISE VISITOR ACCESS ROSTER */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Select Department Roster:</span>
              <select
                value={selectedRosterDeptCode}
                onChange={(e) => setSelectedRosterDeptCode(e.target.value)}
                className="bg-slate-950 text-xs px-3.5 py-2 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none"
              >
                {departments.map(d => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code}) - {d.floor}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                Total <strong>{rosterVisitors.length}</strong> visitor(s) currently authorized to enter <strong>{activeRosterDept?.name}</strong>
              </span>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Visitor Identity</th>
                  <th className="p-4">Organization & Contact</th>
                  <th className="p-4">All Mapped Departments</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rosterVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No visitors currently authorized for {activeRosterDept?.name} ({selectedRosterDeptCode}). Use the Mapping Matrix tab to grant access.
                    </td>
                  </tr>
                ) : (
                  rosterVisitors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={v.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={v.fullName} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{v.fullName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{v.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-200 block">{v.company}</span>
                        <span className="font-mono text-[11px] text-slate-400 block">{v.phone}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {v.allowedDepartments?.map(code => (
                            <span 
                              key={code} 
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                code === selectedRosterDeptCode 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> {v.complianceStatus || 'COMPLIANT'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedVisitorId(v.id);
                            setActiveTab('MAPPING');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-sky-400 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                        >
                          Modify Access
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MASTER DEPARTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">
                  {editingDept ? 'Edit Master Department' : 'Create Master Department'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RND, IT_INFRA, HR"
                    value={formData.code}
                    disabled={!!editingDept}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Floor / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Floor 3 (Room 301)"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Full Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R&D Embedded Systems & Hardware Lab"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Head of Department (HOD)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Arvind Menon"
                    value={formData.head_of_dept}
                    onChange={(e) => setFormData({ ...formData, head_of_dept: e.target.value })}
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Security Clearance Level</label>
                  <select
                    value={formData.security_clearance_required}
                    onChange={(e) => setFormData({ ...formData, security_clearance_required: e.target.value })}
                    className="w-full bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none"
                  >
                    <option value="STANDARD">Level 1: Standard Access</option>
                    <option value="RESTRICTED">Level 2: Restricted</option>
                    <option value="HIGH_SECURITY">Level 3: High Security</option>
                    <option value="TOP_SECRET">Level 4: Top Secret</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">HOD Contact Email</label>
                  <input
                    type="email"
                    placeholder="hod.dept@ilizien.com"
                    value={formData.head_email}
                    onChange={(e) => setFormData({ ...formData, head_email: e.target.value })}
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">HOD Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={formData.head_phone}
                    onChange={(e) => setFormData({ ...formData, head_phone: e.target.value })}
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Department Scope / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe activities conducted in this department..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
