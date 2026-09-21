/**
 * ILIZIEN VMS - Centralized Frontend API Service
 * Single unified HTTP Client connecting React UI to Django Backend & Database
 */

import { toastService, notify } from './toastService';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Core unified request function
 * Handles Bearer token, JSON formatting, error catching, and automatic centralized toasts
 */
export async function apiRequest(endpoint, method = 'GET', data = null, optionsOverride = {}) {
  const token = localStorage.getItem('vms_jwt_token') || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const options = {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...optionsOverride
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      const errorMsg = err.detail || response.statusText || 'Request failed';
      
      // Automatic error toast in top-right corner
      toastService.error(errorMsg, `Request Failed (${response.status})`);
      throw new Error(errorMsg);
    }
    const result = await response.json();

    // Automatic notification handling for all API responses (success, biometrics, dual security verdicts, etc.)
    if (method !== 'GET' || endpoint.includes('verify') || endpoint.includes('export')) {
      toastService.handleApiResponse(endpoint, method, result);
    }

    return result;
  } catch (error) {
    console.warn(`[VMS API] ${method} ${endpoint} notice: ${error.message}`);
    throw error;
  }
}


// 1. Authentication & RBAC Service
export const authService = {
  login: (username, password, role = 'guard', gate = 'Main Gate 01') => 
    apiRequest('/auth/login', 'POST', { username, password, role, gate })
};

// 2. Visits & Gate Passes Service
export const visitsService = {
  getAll: (status = null, hostId = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (hostId && hostId !== 'ALL') params.append('host_id', hostId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/visits/${query}`, 'GET');
  },
  getById: (visitId) => 
    apiRequest(`/visits/${visitId}`, 'GET'),
  create: (visitPayload) => 
    apiRequest('/visits/create', 'POST', visitPayload),
  approve: (visitId, allowedZones = ['ZONE-01', 'ZONE-02'], allowedDepartments = []) => 
    apiRequest(`/visits/${visitId}/approve`, 'POST', { allowed_zones: allowedZones, allowed_departments: allowedDepartments }),
  reject: (visitId, reason = 'Host unavailable') => 
    apiRequest(`/visits/${visitId}/reject`, 'POST', { reason }),
  checkIn: (visitId, gate = 'Main Gate 01', verifiedModes = ['FACE']) => 
    apiRequest(`/visits/${visitId}/check-in`, 'POST', { gate, verified_modes: verifiedModes, laptop_verified: true }),
  checkOut: (visitId) => 
    apiRequest(`/visits/${visitId}/check-out`, 'POST')
};

// 3. Persons / Master Visitors Service
export const personsService = {
  getAll: () => 
    apiRequest('/persons/', 'GET'),
  getById: (personId) => 
    apiRequest(`/persons/${personId}`, 'GET'),
  register: (personPayload) => 
    apiRequest('/persons/register', 'POST', personPayload),
  update: (personId, updatePayload) => 
    apiRequest(`/persons/${personId}`, 'PUT', updatePayload)
};

// 4. Department Master & User Mapping Service
export const departmentsService = {
  getAll: () =>
    apiRequest('/departments/', 'GET'),
  getById: (deptId) =>
    apiRequest(`/departments/${deptId}/`, 'GET'),
  create: (deptPayload) =>
    apiRequest('/departments/create', 'POST', deptPayload),
  update: (deptId, updatePayload) =>
    apiRequest(`/departments/${deptId}/`, 'PUT', updatePayload),
  delete: (deptId) =>
    apiRequest(`/departments/${deptId}/`, 'DELETE'),
  mapUserDepartments: (personId, departments) =>
    apiRequest('/departments/map-user', 'POST', {
      person_id: personId,
      departments: departments
    }),
  getDepartmentUsers: (deptCode) =>
    apiRequest(`/departments/users/${deptCode}/`, 'GET')
};

// 5. Multi-Modal Biometrics Service (OpenCV + SCRFD + ArcFace)
export const biometricsService = {
  enroll: (personId, modality, rawPayloadBase64, deviceId = 'TERMINAL-01', fingerCode = '') => 
    apiRequest('/biometrics/enroll', 'POST', {
      person_id: personId,
      modality: modality.toUpperCase(),
      raw_payload_base64: rawPayloadBase64,
      device_id: deviceId,
      finger_code: fingerCode
    }),
  enrollBiometric: (personId, modality, rawPayloadBase64, deviceId = 'TERMINAL-01', fingerCode = '') => 
    apiRequest('/biometrics/enroll', 'POST', {
      person_id: personId,
      modality: modality.toUpperCase(),
      raw_payload_base64: rawPayloadBase64,
      device_id: deviceId,
      finger_code: fingerCode
    }),
  detectFace: (frameBase64) =>
    apiRequest('/biometrics/detect-face', 'POST', {
      frame_base64: frameBase64
    }),
  verifyFace: (liveFrameBase64, visitId = null, personId = null) => 
    apiRequest('/biometrics/verify-face', 'POST', { 
      live_frame_base64: liveFrameBase64,
      visit_id: visitId,
      person_id: personId
    }),
  verifyFingerprint: (rawPayloadBase64, visitId = null, personId = null) =>
    apiRequest('/biometrics/verify-fingerprint', 'POST', {
      raw_payload_base64: rawPayloadBase64,
      visit_id: visitId,
      person_id: personId
    }),
  recognizeStreamFaces: (liveFrameBase64) =>
    apiRequest('/biometrics/recognize-stream-faces', 'POST', {
      live_frame_base64: liveFrameBase64
    }),
  getSecuGenStatus: () =>
    apiRequest('/biometrics/secugen-status', 'GET'),
  captureSecuGenFingerprint: (fingerCode = 'RI', quality = 50, timeout = 5000, personId = null) =>
    apiRequest('/biometrics/secugen-capture', 'POST', {
      finger_code: fingerCode,
      quality: quality,
      timeout: timeout,
      person_id: personId
    }),
  getMfs110Status: () =>
    apiRequest('/biometrics/mfs110-status', 'GET'),
  customCaptureFingerprint: (fingerCode = 'RI', quality = 50, timeout = 5000, personId = null) =>
    apiRequest('/biometrics/custom-capture', 'POST', {
      finger_code: fingerCode,
      quality: quality,
      timeout: timeout,
      person_id: personId
    }),
  toggleScannerLed: (state = true) =>
    apiRequest('/biometrics/toggle-led', 'POST', { state })
};

// 6. Zone Access & Turnstiles Service
export const zonesService = {
  scanDoor: (visitId, zoneId, doorId = 'TURNSTILE-01') =>
    apiRequest('/zones/scan-door', 'POST', { 
      visit_id: visitId, 
      zone_id: zoneId, 
      door_id: doorId 
    })
};

// 7. Audit Trail & Compliance Service
export const auditService = {
  getAll: () => 
    apiRequest('/audit/', 'GET'),
  exportCsvUrl: `${API_BASE_URL}/audit/export-csv`
};

// 8. System Management Service
export const systemService = {
  clearAllData: () => 
    apiRequest('/system/clear-all-data', 'POST')
};

// Unified Export Object
export const api = {
  auth: authService,
  visits: visitsService,
  persons: personsService,
  departments: departmentsService,
  biometrics: biometricsService,
  zones: zonesService,
  audit: auditService,
  system: systemService,
  toast: toastService,
  notify: notify
};

// Backward-compatible alias for existing components
export const VmsBackendApi = {
  login: authService.login,
  getPersons: personsService.getAll,
  registerPerson: personsService.register,
  updatePerson: personsService.update,
  getDepartments: departmentsService.getAll,
  getDepartmentById: departmentsService.getById,
  createDepartment: departmentsService.create,
  updateDepartment: departmentsService.update,
  deleteDepartment: departmentsService.delete,
  mapUserDepartments: departmentsService.mapUserDepartments,
  getDepartmentUsers: departmentsService.getDepartmentUsers,
  enrollBiometric: biometricsService.enrollBiometric,
  enroll: biometricsService.enrollBiometric,
  detectFace: biometricsService.detectFace,
  verifyFace: biometricsService.verifyFace,
  verifyFingerprint: biometricsService.verifyFingerprint,
  recognizeStreamFaces: biometricsService.recognizeStreamFaces,
  getSecuGenStatus: biometricsService.getSecuGenStatus,
  captureSecuGenFingerprint: biometricsService.captureSecuGenFingerprint,
  getMfs110Status: biometricsService.getMfs110Status,
  customCaptureFingerprint: biometricsService.customCaptureFingerprint,
  toggleScannerLed: biometricsService.toggleScannerLed,
  getVisits: visitsService.getAll,
  getVisitById: visitsService.getById,
  createVisit: visitsService.create,
  approveVisit: visitsService.approve,
  rejectVisit: visitsService.reject,
  checkInVisit: visitsService.checkIn,
  checkOutVisit: visitsService.checkOut,
  scanZoneDoor: zonesService.scanDoor,
  getAuditLogs: auditService.getAll,
  exportCsvUrl: auditService.exportCsvUrl,
  clearAllData: systemService.clearAllData,
  toast: toastService,
  notify: notify
};

export { toastService, notify };
export default api;
