import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialVisitors, initialVisits, initialHosts, initialZones, initialAuditLogs } from '../data/mockData';

const VmsContext = createContext();

export function VmsProvider({ children }) {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('vms_auth');
    return saved !== null ? JSON.parse(saved) : true; // Default true so user can explore directly or switch
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vms_current_user');
    return saved ? JSON.parse(saved) : {
      name: 'Security Officer Sandeep',
      email: 'sandeep.guard@ilizien.com',
      role: 'guard',
      gate: 'Main Gate 01',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
  });

  // Role & Gate state
  const [currentUserRole, setCurrentUserRole] = useState(() => localStorage.getItem('vms_role') || 'guard');
  const [currentGate, setCurrentGate] = useState(() => localStorage.getItem('vms_gate') || 'Main Gate 01');
  const [currentHostId, setCurrentHostId] = useState('HST-101');

  // Core entities
  const [visitors, setVisitors] = useState(() => {
    const saved = localStorage.getItem('vms_visitors');
    return saved ? JSON.parse(saved) : initialVisitors;
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('vms_visits');
    return saved ? JSON.parse(saved) : initialVisits;
  });

  const [hosts] = useState(initialHosts);
  const [zones] = useState(initialZones);

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('vms_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [activeAlerts, setActiveAlerts] = useState([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vms_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('vms_current_user', JSON.stringify(currentUser));
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
    localStorage.setItem('vms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Auth Functions
  const login = (role, userDetails = {}, gate = 'Main Gate 01') => {
    const user = {
      name: userDetails.name || (role === 'admin' ? 'System Administrator' : role === 'guard' ? 'Security Guard' : role === 'host' ? 'Host Manager' : 'Visitor User'),
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
    const prevUser = currentUser?.name || 'User';
    setIsAuthenticated(false);
    logAudit('USER_LOGOUT', 'User ' + prevUser + ' signed out of the system', 'INFO');
  };

  // Helper to add audit log
  const logAudit = (eventType, description, severity = 'INFO', gate = currentGate, performedBy = null) => {
    const actor = performedBy || (currentUser?.name || (currentUserRole === 'guard' ? 'Security Guard (' + currentGate + ')' : currentUserRole === 'admin' ? 'System Administrator' : currentUserRole === 'host' ? 'Host Employee' : 'Visitor Self-Service'));
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

  // 1. Register Visitor & Create Visit
  const registerVisitor = (visitorData, visitData) => {
    let visitorId = visitorData.id;
    let existingVisitor = visitors.find(v => v.phone === visitorData.phone || (v.idProofNumber && v.idProofNumber === visitorData.idProofNumber));

    if (existingVisitor) {
      visitorId = existingVisitor.id;
      setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, ...visitorData } : v));
    } else {
      visitorId = 'VIS-' + Math.floor(100 + Math.random() * 900);
      const newVisitor = {
        id: visitorId,
        ...visitorData,
        isBlacklisted: false,
        enrolledBiometrics: visitorData.enrolledBiometrics || { face: true, fingerprint: false, iris: false }
      };
      setVisitors(prev => [newVisitor, ...prev]);
    }

    const visitId = 'VST-2026-' + Math.floor(100 + Math.random() * 900);
    const passNumber = 'GP-2026-' + Math.floor(100 + Math.random() * 900);
    const host = hosts.find(h => h.id === visitData.hostId) || { name: 'Host Desk', department: 'General' };

    const newVisit = {
      id: visitId,
      visitorId,
      visitorName: visitorData.fullName,
      visitorCompany: visitorData.company || 'Individual Visitor',
      visitorPhone: visitorData.phone,
      visitorPhoto: visitorData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      hostId: visitData.hostId,
      hostName: host.name,
      hostDept: host.department,
      purpose: visitData.purpose,
      scheduledTime: visitData.scheduledTime || new Date().toISOString(),
      expectedDurationMins: Number(visitData.expectedDurationMins) || 60,
      checkInTime: null,
      checkOutTime: null,
      status: 'PENDING',
      allowedZones: ['ZONE-01', 'ZONE-02'],
      gate: currentGate,
      passNumber,
      vehicleNumber: visitData.vehicleNumber || 'N/A',
      verifiedBiometrics: [],
      notes: visitData.notes || 'Pre-registered online'
    };

    setVisits(prev => [newVisit, ...prev]);
    logAudit('VISITOR_REGISTER', 'Pre-registration submitted for ' + visitorData.fullName + ' (Host: ' + host.name + ')', 'INFO');
    return { visitorId, visitId, passNumber };
  };

  // 2. Approve Visit (Host action)
  const approveVisit = (visitId, allowedZones = null) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'APPROVED',
          allowedZones: allowedZones || v.allowedZones || ['ZONE-01', 'ZONE-02']
        };
      }
      return v;
    }));
    const target = visits.find(v => v.id === visitId);
    logAudit('HOST_APPROVAL', 'Visit ' + visitId + ' approved for ' + (target ? target.visitorName : 'Visitor'), 'SUCCESS');
  };

  // 3. Reject Visit (Host action)
  const rejectVisit = (visitId, reason = 'Host unavailable') => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'REJECTED',
          notes: 'Rejected: ' + reason
        };
      }
      return v;
    }));
    const target = visits.find(v => v.id === visitId);
    logAudit('HOST_REJECTION', 'Visit ' + visitId + ' rejected for ' + (target ? target.visitorName : 'Visitor') + ' (Reason: ' + reason + ')', 'WARNING');
  };

  // 4. Check In Visitor (Guard action with Biometric verification)
  const checkInVisitor = (visitId, biometricModes = ['FACE']) => {
    const nowIso = new Date().toISOString();
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'CHECKED_IN',
          checkInTime: nowIso,
          gate: currentGate,
          verifiedBiometrics: biometricModes
        };
      }
      return v;
    }));
    const target = visits.find(v => v.id === visitId);
    logAudit('CHECK_IN', 'Visitor ' + (target ? target.visitorName : 'Visitor') + ' checked in via ' + biometricModes.join(' + ') + ' at ' + currentGate, 'SUCCESS');
  };

  // 5. Check Out Visitor
  const checkOutVisitor = (visitId) => {
    const nowIso = new Date().toISOString();
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'COMPLETED',
          checkOutTime: nowIso
        };
      }
      return v;
    }));
    const target = visits.find(v => v.id === visitId);
    logAudit('CHECK_OUT', 'Visitor ' + (target ? target.visitorName : 'Visitor') + ' completed visit and checked out at ' + currentGate, 'INFO');
  };

  // 6. Manual Security Override
  const manualOverrideCheckIn = (visitId, reason) => {
    const nowIso = new Date().toISOString();
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'CHECKED_IN',
          checkInTime: nowIso,
          gate: currentGate,
          notes: 'Manual Security Override: ' + reason,
          verifiedBiometrics: ['MANUAL_OVERRIDE']
        };
      }
      return v;
    }));
    const target = visits.find(v => v.id === visitId);
    logAudit('MANUAL_OVERRIDE', 'Security Override applied for ' + (target ? target.visitorName : 'Visitor') + ' | Reason: ' + reason, 'WARNING');
  };

  // 7. Toggle Blacklist
  const toggleBlacklist = (visitorId) => {
    let visitorName = '';
    let newStatus = false;
    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId) {
        visitorName = v.fullName;
        newStatus = !v.isBlacklisted;
        return { ...v, isBlacklisted: newStatus };
      }
      return v;
    }));
    logAudit(
      newStatus ? 'VISITOR_BLACKLISTED' : 'VISITOR_WHITELISTED',
      'Visitor ' + visitorName + (newStatus ? ' added to SECURITY WATCH / BLACKLIST' : ' removed from Blacklist'),
      newStatus ? 'CRITICAL' : 'INFO'
    );
  };

  // 8. Simulate Zone Scanning & Breach Detection
  const simulateZoneScan = (visitId, zoneId) => {
    const visit = visits.find(v => v.id === visitId);
    const zone = zones.find(z => z.id === zoneId);
    if (!visit || !zone) return;

    const isAllowed = visit.allowedZones && visit.allowedZones.includes(zoneId);
    const timestamp = new Date().toISOString();

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

  // Reset to initial demo seed
  const resetToDemoData = () => {
    localStorage.removeItem('vms_visitors');
    localStorage.removeItem('vms_visits');
    localStorage.removeItem('vms_audit_logs');
    setVisitors(initialVisitors);
    setVisits(initialVisits);
    setAuditLogs(initialAuditLogs);
    setActiveAlerts([]);
    logAudit('SYSTEM_RESET', 'System data restored to default demonstration baseline', 'INFO');
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
      auditLogs,
      activeAlerts,
      registerVisitor,
      approveVisit,
      rejectVisit,
      checkInVisitor,
      checkOutVisitor,
      manualOverrideCheckIn,
      toggleBlacklist,
      simulateZoneScan,
      dismissAlert,
      resetToDemoData,
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
