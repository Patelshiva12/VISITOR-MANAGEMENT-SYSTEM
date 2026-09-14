import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialVisitors, initialVisits, initialHosts, initialZones, initialDepartments, initialAuditLogs } from '../data/mockData';
import { VmsBackendApi, toastService } from '../services/api';
import { normalizeVisit, normalizeVisits } from '../utils/normalizer';

const VmsContext = createContext();

export function VmsProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('vms_auth');
    return saved !== null ? JSON.parse(saved) : false; // Default FALSE (requires login to enter staff portal)
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vms_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUserRole, setCurrentUserRole] = useState(() => localStorage.getItem('vms_role') || 'guard');
  const [currentGate, setCurrentGate] = useState(() => localStorage.getItem('vms_gate') || 'Main Gate 01');
  const [currentHostId, setCurrentHostId] = useState('HST-101');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [visitors, setVisitors] = useState(() => {
    const saved = localStorage.getItem('vms_visitors');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : initialVisitors;
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('vms_visits');
    return (saved && JSON.parse(saved).length > 0) ? normalizeVisits(JSON.parse(saved)) : normalizeVisits(initialVisits);
  });

  const [hosts] = useState(initialHosts);
  const [zones] = useState(initialZones);

  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('vms_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('vms_audit_logs');
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : initialAuditLogs;
  });

  const [activeAlerts, setActiveAlerts] = useState([]);

  // Auto-sync with Django Backend on startup
  useEffect(() => {
    async function syncBackend() {
      try {
        const backendVisits = await VmsBackendApi.getVisits();
        if (backendVisits && Array.isArray(backendVisits)) {
          setVisits(normalizeVisits(backendVisits));
          setIsBackendConnected(true);
        }
      } catch (e) {
        setIsBackendConnected(false);
      }

      try {
        const backendDepts = await VmsBackendApi.getDepartments();
        if (backendDepts && Array.isArray(backendDepts) && backendDepts.length > 0) {
          setDepartments(backendDepts);
        }
      } catch (e) {}

      try {
        const backendPersons = await VmsBackendApi.getPersons();
        if (backendPersons && Array.isArray(backendPersons) && backendPersons.length > 0) {
          setVisitors(backendPersons.map(p => ({
            id: p.person_id,
            fullName: p.name,
            phone: p.phone,
            email: p.email,
            company: p.organization,
            photoUrl: p.photo,
            idProofType: p.id_proof_type,
            idProofNumber: p.id_proof_number,
            address: p.address,
            isBlacklisted: p.status === 'BLACKLISTED',
            complianceStatus: p.compliance_status || 'COMPLIANT',
            allowedDepartments: p.allowed_departments || [],
            enrolledBiometrics: { face: true, fingerprint: false, iris: false },
            laptopSerial: p.declared_laptop_serial || 'NONE'
          })));
        }
      } catch (e) {}
    }
    syncBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('vms_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vms_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vms_role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem('vms_gate', currentGate);
  }, [currentGate]);

  useEffect(() => {
    localStorage.setItem('vms_visitors', JSON.stringify(visitors));
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('vms_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('vms_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('vms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const login = async (role, userDetails = {}, gate = 'Main Gate 01') => {
    try {
      const authRes = await VmsBackendApi.login(
        userDetails.email || `${role}.user`,
        'security@2026',
        role,
        gate
      );
      if (authRes?.access_token) {
        localStorage.setItem('vms_jwt_token', authRes.access_token);
      }
    } catch (err) {
      console.info('Backend auth fallback: running local session');
    }

    const user = {
      name: userDetails.name || (role === 'admin' ? 'System Administrator' : role === 'guard' ? 'Security Officer' : role === 'host' ? 'Host Manager' : 'Visitor'),
      email: userDetails.email || (role + '@ilizien.com'),
      role,
      gate: role === 'guard' ? gate : undefined,
      avatar: userDetails.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setCurrentUser(user);
    setCurrentUserRole(role);
    if (role === 'guard') setCurrentGate(gate);
    setIsAuthenticated(true);
    logAudit('USER_LOGIN', 'User ' + user.name + ' logged in as ' + role.toUpperCase() + (role === 'guard' ? ' (' + gate + ')' : ''), 'INFO', gate, user.name);
  };

  const logout = () => {
    const prevUser = currentUser?.name || 'Staff User';
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('vms_auth');
    localStorage.removeItem('vms_current_user');
    localStorage.removeItem('vms_jwt_token');
    localStorage.setItem('vms_active_page', 'login');
    logAudit('USER_LOGOUT', 'User ' + prevUser + ' signed out of the system', 'INFO');
  };

  const logAudit = (eventType, description, severity = 'INFO', gate = currentGate, performedBy = null) => {
    const actor = performedBy || (currentUser?.name || 'System Operator');
    const newLog = {
      id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      eventType,
      performedBy: actor,
      gate,
      description,
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const registerVisitor = async (visitorData, visitData) => {
    let visitorId = visitorData.id || ('VIS-' + Math.floor(100 + Math.random() * 900));
    const visitId = 'VST-2026-' + Math.floor(100 + Math.random() * 900);
    const passNumber = 'GP-2026-' + Math.floor(100 + Math.random() * 900);

    const allowedDepts = visitorData.allowedDepartments || ['RND', 'IT_INFRA'];

    try {
      const backendPerson = await VmsBackendApi.registerPerson({
        person_id: visitorId,
        name: visitorData.fullName,
        organization: visitorData.company,
        phone: visitorData.phone,
        email: visitorData.email,
        category: visitorData.category || 'Business Client / Partner',
        declared_laptop_serial: visitorData.laptopSerial || 'NONE',
        allowed_departments: allowedDepts
      });
      if (backendPerson && backendPerson.person_id) {
        visitorId = backendPerson.person_id;
      }
    } catch (e) {}

    const newVisitor = {
      id: visitorId,
      fullName: visitorData.fullName,
      phone: visitorData.phone,
      email: visitorData.email,
      company: visitorData.company,
      photoUrl: visitorData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      idProofType: visitorData.idProofType,
      idProofNumber: visitorData.idProofNumber,
      address: visitorData.address,
      isBlacklisted: false,
      complianceStatus: 'COMPLIANT',
      allowedDepartments: allowedDepts,
      enrolledBiometrics: { face: true, fingerprint: false, iris: false },
      laptopSerial: visitorData.laptopSerial || 'NONE'
    };

    const targetHost = hosts.find(h => h.id === (visitData?.hostId || 'HST-101')) || hosts[0];
    const newVisit = {
      id: visitId,
      passNumber,
      visitorId,
      visitorName: visitorData.fullName,
      visitorCompany: visitorData.company,
      visitorPhone: visitorData.phone,
      visitorPhoto: newVisitor.photoUrl,
      hostId: targetHost.id,
      hostName: targetHost.name,
      hostDept: targetHost.department,
      purpose: visitData?.purpose || 'Business Discussion',
      scheduledTime: visitData?.scheduledTime || new Date().toISOString(),
      expectedDurationMins: visitData?.expectedDurationMins || 60,
      checkInTime: null,
      checkOutTime: null,
      status: 'APPROVED',
      allowedZones: ['ZONE-01', 'ZONE-02'],
      allowedDepartments: allowedDepts,
      gate: currentGate,
      vehicleNumber: visitData?.vehicleNumber || 'N/A',
      laptopSerial: visitorData.laptopSerial || 'NONE',
      verifiedBiometrics: [],
      notes: visitData?.notes || 'Standard Visitor Access'
    };

    setVisitors(prev => [newVisitor, ...prev.filter(v => v.id !== visitorId)]);
    setVisits(prev => [newVisit, ...prev]);

    logAudit('VISITOR_REGISTERED', 'Registered visitor ' + newVisitor.fullName + ' with access to ' + allowedDepts.join(', '), 'SUCCESS');
    return { visitor: newVisitor, visit: newVisit };
  };

  const registerWalkInVisitor = async (walkInData) => {
    return registerVisitor({
      id: walkInData.personId || ('VIS-' + Math.floor(100 + Math.random() * 900)),
      fullName: walkInData.name,
      company: walkInData.company,
      phone: walkInData.phone,
      email: walkInData.email || '',
      idProofType: walkInData.idProofType,
      idProofNumber: walkInData.idProofNumber,
      address: walkInData.address || '',
      photoUrl: walkInData.photo || '',
      category: walkInData.category || 'Walk-In Guest',
      allowedDepartments: walkInData.allowedDepartments || ['RND', 'IT_INFRA']
    }, {
      hostId: walkInData.hostId || 'HST-101',
      purpose: walkInData.purpose || 'Spot Walk-In Check-In',
      vehicleNumber: walkInData.vehicleNumber || 'N/A',
      laptopSerial: walkInData.laptopSerial || 'NONE',
      expectedDurationMins: walkInData.duration || 60
    });
  };

  const updateVisitor = (visitorId, updatedData) => {
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, ...updatedData } : v));
    try {
      VmsBackendApi.updatePerson(visitorId, updatedData);
    } catch (e) {}
  };

  const updateVisit = (visitId, updatedData) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, ...updatedData } : v));
  };

  const approveVisit = async (visitId, allowedZones = ['ZONE-01', 'ZONE-02'], allowedDepartments = []) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    try {
      await VmsBackendApi.approveVisit(visitId, allowedZones, allowedDepartments);
    } catch (e) {}

    setVisits(prev => prev.map(v => 
      v.id === visitId ? { 
        ...v, 
        status: 'APPROVED', 
        allowedZones: allowedZones.length > 0 ? allowedZones : v.allowedZones,
        allowedDepartments: allowedDepartments.length > 0 ? allowedDepartments : v.allowedDepartments
      } : v
    ));

    logAudit('VISIT_APPROVED', 'Visit ' + visit.passNumber + ' approved for ' + visit.visitorName, 'SUCCESS');
    toastService.success('Visit ' + visit.passNumber + ' approved successfully.', 'Visit Approved');
  };

  const rejectVisit = async (visitId, reason = 'Host unavailable') => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    try {
      await VmsBackendApi.rejectVisit(visitId, reason);
    } catch (e) {}

    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'REJECTED', notes: reason } : v));
    logAudit('VISIT_REJECTED', 'Visit ' + visit.passNumber + ' rejected: ' + reason, 'WARNING');
    toastService.warn('Visit rejected: ' + reason, 'Visit Rejected');
  };

  const checkInVisitor = async (visitId, verifiedModes = ['FACE']) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    const checkInTime = new Date().toISOString();
    try {
      await VmsBackendApi.checkInVisit(visitId, currentGate, verifiedModes);
    } catch (e) {}

    setVisits(prev => prev.map(v => 
      v.id === visitId ? { 
        ...v, 
        status: 'CHECKED_IN', 
        checkInTime, 
        verifiedBiometrics: verifiedModes,
        gate: currentGate
      } : v
    ));

    logAudit('VISITOR_CHECK_IN', 'Visitor ' + visit.visitorName + ' (' + visit.passNumber + ') checked in at ' + currentGate + ' via ' + verifiedModes.join('+'), 'SUCCESS');
    toastService.success('Gate Pass activated for ' + visit.visitorName, 'Check-In Complete');
  };

  const checkOutVisitor = async (visitId) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    const checkOutTime = new Date().toISOString();
    try {
      await VmsBackendApi.checkOutVisit(visitId);
    } catch (e) {}

    setVisits(prev => prev.map(v => 
      v.id === visitId ? { ...v, status: 'COMPLETED', checkOutTime } : v
    ));

    logAudit('VISITOR_CHECK_OUT', 'Visitor ' + visit.visitorName + ' (' + visit.passNumber + ') checked out at ' + currentGate, 'INFO');
    toastService.info('Pass closed for ' + visit.visitorName, 'Check-Out Complete');
  };

  const manualOverrideCheckIn = (visitId, reason) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    const checkInTime = new Date().toISOString();
    setVisits(prev => prev.map(v => 
      v.id === visitId ? { 
        ...v, 
        status: 'CHECKED_IN', 
        checkInTime, 
        verifiedBiometrics: ['GUARD_OVERRIDE'],
        notes: 'GUARD MANUAL OVERRIDE: ' + reason,
        gate: currentGate
      } : v
    ));

    logAudit('SECURITY_OVERRIDE_CHECKIN', 'Guard override check-in for ' + visit.visitorName + '. Reason: ' + reason, 'WARNING', currentGate);
    toastService.warn('Manual override logged in security audit.', 'Override Authorized');
  };

  const toggleBlacklist = (visitorId) => {
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) return;

    const newStatus = !visitor.isBlacklisted;
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, isBlacklisted: newStatus } : v));
    logAudit(newStatus ? 'VISITOR_BLACKLISTED' : 'VISITOR_UNBLACKLISTED', (newStatus ? 'BLACKLISTED: ' : 'Restored: ') + visitor.fullName, newStatus ? 'CRITICAL' : 'INFO');
  };

  // Department Master Functions
  const addDepartment = async (deptData) => {
    const newDept = {
      id: deptData.id || `DEP-${Math.floor(100 + Math.random() * 900)}`,
      code: deptData.code.trim().toUpperCase(),
      name: deptData.name.trim(),
      floor: deptData.floor || 'Floor 1',
      head_of_dept: deptData.head_of_dept || '',
      head_email: deptData.head_email || '',
      head_phone: deptData.head_phone || '',
      security_clearance_required: deptData.security_clearance_required || 'STANDARD',
      allowed_zones: deptData.allowed_zones || ['ZONE-01', 'ZONE-02'],
      description: deptData.description || '',
      color: deptData.color || 'sky',
      is_active: true
    };

    setDepartments(prev => [...prev.filter(d => d.code !== newDept.code), newDept]);

    try {
      await VmsBackendApi.createDepartment(newDept);
    } catch (e) {}

    logAudit('DEPARTMENT_CREATED', `Master department added: ${newDept.name} (${newDept.code})`, 'SUCCESS');
    toastService.success(`Department ${newDept.name} created.`, 'Department Created');
    return newDept;
  };

  const updateDepartment = async (deptId, updatedData) => {
    setDepartments(prev => prev.map(d => (d.id === deptId || d.code === deptId) ? { ...d, ...updatedData } : d));
    try {
      await VmsBackendApi.updateDepartment(deptId, updatedData);
    } catch (e) {}
    toastService.success('Department details updated.', 'Updated');
  };

  const deleteDepartment = async (deptId) => {
    const targetDept = departments.find(d => d.id === deptId || d.code === deptId);
    setDepartments(prev => prev.filter(d => d.id !== deptId && d.code !== deptId));
    try {
      await VmsBackendApi.deleteDepartment(deptId);
    } catch (e) {}
    logAudit('DEPARTMENT_DELETED', `Department deleted: ${targetDept?.name || deptId}`, 'WARNING');
    toastService.info('Department removed from master.', 'Deleted');
  };

  const mapUserDepartments = async (personId, departmentCodes) => {
    const targetVisitor = visitors.find(v => v.id === personId);
    const visitorName = targetVisitor?.fullName || 'Visitor';

    const cleanCodes = departmentCodes.map(c => c.trim().toUpperCase());

    // Update in frontend state
    setVisitors(prev => prev.map(v => 
      v.id === personId ? { ...v, allowedDepartments: cleanCodes, complianceStatus: 'COMPLIANT' } : v
    ));

    setVisits(prev => prev.map(v => 
      (v.visitorId === personId || v.visitorName === visitorName) ? { ...v, allowedDepartments: cleanCodes } : v
    ));

    // Call Backend API
    try {
      await VmsBackendApi.mapUserDepartments(personId, cleanCodes);
    } catch (e) {
      console.warn('Backend map sync error:', e);
    }

    logAudit('DEPARTMENT_ACCESS_MAPPED', `Mapped ${cleanCodes.length} department(s) [${cleanCodes.join(', ')}] to ${visitorName} (${personId})`, 'SUCCESS');
    toastService.success(`Assigned ${cleanCodes.length} department(s) access to ${visitorName}.`, 'Compliance Access Mapped');
  };

  const simulateZoneScan = async (visitId, zoneId) => {
    const visit = visits.find(v => v.id === visitId);
    const zone = zones.find(z => z.id === zoneId);
    if (!visit || !zone) return;

    const isAllowed = visit.allowedZones && visit.allowedZones.includes(zoneId);
    const timestamp = new Date().toISOString();

    try {
      await VmsBackendApi.scanZoneDoor(visitId, zoneId, 'TURNSTILE-01');
    } catch (e) {}

    if (isAllowed) {
      logAudit('ZONE_ACCESS_GRANTED', 'Visitor ' + visit.visitorName + ' granted access to ' + zone.name + ' (' + zone.code + ')', 'SUCCESS');
      return { success: true, message: 'Access Granted to ' + zone.name };
    } else {
      const alertItem = {
        id: 'ALT-' + Date.now(),
        timestamp,
        visitorName: visit.visitorName,
        visitorPhoto: visit.visitorPhoto,
        zoneName: zone.name,
        zoneCode: zone.code,
        securityLevel: zone.securityLevel,
        gate: currentGate
      };
      setActiveAlerts(prev => [alertItem, ...prev]);
      logAudit(
        'SECURITY_BREACH_UNAUTHORIZED_ZONE',
        'UNAUTHORIZED ENTRY ATTEMPT: ' + visit.visitorName + ' attempted to access ' + zone.name + ' without permission!',
        'CRITICAL'
      );
      return { success: false, message: 'Access Denied! Unauthorized for ' + zone.name, alert: alertItem };
    }
  };

  const dismissAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearAllVisitorData = async () => {
    localStorage.removeItem('vms_visitors');
    localStorage.removeItem('vms_visits');
    localStorage.removeItem('vms_audit_logs');
    setVisitors([]);
    setVisits([]);
    setAuditLogs([]);
    setActiveAlerts([]);
    try {
      await VmsBackendApi.clearAllData();
    } catch (e) {
      console.warn('Backend reset sync:', e);
    }
  };

  const resetToDemoData = () => {
    localStorage.removeItem('vms_visitors');
    localStorage.removeItem('vms_visits');
    localStorage.removeItem('vms_audit_logs');
    setVisitors(initialVisitors);
    setVisits(normalizeVisits(initialVisits));
    setAuditLogs(initialAuditLogs);
    setActiveAlerts([]);
    logAudit('SYSTEM_RESET', 'Demonstration baseline data restored to default baseline', 'SUCCESS');
  };

  return (
    <VmsContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      logout,
      currentUserRole,
      setCurrentUserRole,
      currentGate,
      setCurrentGate,
      currentHostId,
      setCurrentHostId,
      visitors,
      visits,
      hosts,
      zones,
      departments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      mapUserDepartments,
      auditLogs,
      activeAlerts,
      registerVisitor,
      registerWalkInVisitor,
      updateVisitor,
      updateVisit,
      approveVisit,
      rejectVisit,
      checkInVisitor,
      checkOutVisitor,
      manualOverrideCheckIn,
      toggleBlacklist,
      simulateZoneScan,
      dismissAlert,
      resetToDemoData,
      clearAllVisitorData,
      logAudit
    }}>
      {children}
    </VmsContext.Provider>
  );
}

export function useVms() {
  const context = useContext(VmsContext);
  if (!context) {
    throw new Error('useVms must be used within a VmsProvider');
  }
  return context;
}
