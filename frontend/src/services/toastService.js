/**
 * ILIZIEN VMS - Centralized Global Toast & Notification Service
 * Manages real-time alert notifications at the top-right corner for all API responses
 */

class ToastService {
  constructor() {
    this.toasts = [];
    this.listeners = new Set();
    this.counter = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  /**
   * Core show toast method
   */
  show({ type = 'info', title, message, details = null, duration = 5000 }) {
    const id = ++this.counter;
    const newToast = {
      id,
      type,
      title: title || this.getDefaultTitle(type),
      message: message || '',
      details,
      timestamp: new Date(),
      duration
    };

    // Keep maximum 5 active toasts on screen
    this.toasts = [newToast, ...this.toasts.slice(0, 4)];
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  clearAll() {
    this.toasts = [];
    this.notifyListeners();
  }

  getDefaultTitle(type) {
    switch (type) {
      case 'success': return 'Action Successful';
      case 'error': return 'Request Failed';
      case 'warning': return 'Security Notice';
      case 'biometric': return 'Biometric Verification';
      default: return 'Notification';
    }
  }

  // Convenience Methods
  success(message, title = 'Success', details = null, duration = 4500) {
    return this.show({ type: 'success', title, message, details, duration });
  }

  error(message, title = 'Error', details = null, duration = 6000) {
    return this.show({ type: 'error', title, message, details, duration });
  }

  warning(message, title = 'Warning', details = null, duration = 6000) {
    return this.show({ type: 'warning', title, message, details, duration });
  }

  info(message, title = 'Info', details = null, duration = 4000) {
    return this.show({ type: 'info', title, message, details, duration });
  }

  /**
   * Handles Biometric / Dual Security API Responses
   */
  handleBiometricResponse(data) {
    if (!data) return;

    const matched = data.matched;
    const canGrant = data.dual_security_status ? data.dual_security_status.can_grant_entry : matched;
    const confidence = data.confidence_score !== undefined ? (data.confidence_score > 1 ? data.confidence_score : data.confidence_score * 100).toFixed(1) : null;
    const liveness = data.liveness_score !== undefined ? Number(data.liveness_score).toFixed(1) : null;
    const personName = data.person_name || 'Visitor';
    const message = data.message || (matched ? ('Biometric verification passed for ' + personName) : ('Biometric mismatch or low confidence for ' + personName));

    const details = {
      person: personName,
      confidence: confidence ? (confidence + '%') : null,
      liveness: liveness ? (liveness + '%') : null,
      identityMatch: data.dual_security_status?.biometric_identity_match || (matched ? 'PASSED' : 'FAILED'),
      visitAuth: data.dual_security_status?.visit_authorization || 'UNKNOWN',
      entryDecision: canGrant ? 'GRANTED' : 'DENIED'
    };

    if (matched && canGrant) {
      this.show({
        type: 'success',
        title: 'Biometric Verified (Entry Approved)',
        message,
        details,
        duration: 5500
      });
    } else if (data.is_live === false) {
      this.show({
        type: 'error',
        title: 'Spoof Detected (Liveness Failed)',
        message: '3D Anti-spoofing alert: Non-live face presentation detected.',
        details,
        duration: 7000
      });
    } else {
      this.show({
        type: 'warning',
        title: 'Biometric Mismatch (Verification Alert)',
        message,
        details,
        duration: 7000
      });
    }
  }

  /**
   * Automatic Centralized Handler for all API responses
   */
  handleApiResponse(endpoint, method, data) {
    if (!data) return;

    // 1. Biometric verification response
    if (data.matched !== undefined || data.dual_security_status !== undefined) {
      this.handleBiometricResponse(data);
      return;
    }

    // 2. Zone door scan response
    if (data.access_granted !== undefined) {
      if (data.access_granted) {
        this.success(
          data.message || ('Access granted for ' + (data.zone_name || data.zone_id || 'Zone')),
          'Turnstile Access Granted',
          { zone: data.zone_name, door: data.door_id, visit: data.visit_id }
        );
      } else {
        this.error(
          data.message || ('Access denied for ' + (data.zone_name || data.zone_id || 'Zone') + '. Reason: ' + (data.denial_reason || 'Unauthorized zone')),
          'Turnstile Access Denied',
          { zone: data.zone_name, door: data.door_id, visit: data.visit_id }
        );
      }
      return;
    }

    // 3. General responses with custom message or status
    if (data.message && typeof data.message === 'string') {
      const title = this.inferTitleFromEndpoint(endpoint, method);
      this.success(data.message, title);
      return;
    }

    // 4. Visit creation response
    if (endpoint.includes('/visits/create') && data.pass_number) {
      this.success(
        'Pre-registration completed. Gate Pass: ' + data.pass_number + ' for ' + (data.visitor_name || 'Visitor'),
        'Pre-Registration Success',
        { pass: data.pass_number, host: data.host_name }
      );
      return;
    }

    // 5. Visit Approval / Rejection / Check-in
    if (endpoint.includes('/approve') && data.status === 'APPROVED') {
      this.success(
        'Visit ' + (data.id || data.pass_number) + ' approved. Allowed Zones: ' + ((data.allowed_zones || []).join(', ') || 'All'),
        'Visit Approved',
        { status: data.status, host: data.host_name }
      );
      return;
    }

    if (endpoint.includes('/reject') && data.status === 'REJECTED') {
      this.warning(
        'Visit ' + (data.id || data.pass_number) + ' rejected. Reason: ' + (data.notes || 'Host unavailable'),
        'Visit Rejected'
      );
      return;
    }

    if (endpoint.includes('/check-in') && data.status === 'CHECKED_IN') {
      this.success(
        'Visitor ' + (data.visitor_name || '') + ' checked in at ' + (data.gate || 'Gate') + '. Badge: ' + (data.badge_number || 'Issued') + '.',
        'Check-In Complete',
        { badge: data.badge_number, gate: data.gate }
      );
      return;
    }

    if (endpoint.includes('/check-out') && data.status === 'CHECKED_OUT') {
      this.info(
        'Visitor ' + (data.visitor_name || '') + ' checked out. Badge revoked.',
        'Check-Out Complete'
      );
      return;
    }

    // 6. Biometric enrollment response
    if (endpoint.includes('/biometrics/enroll') && data.status === 'ENROLLED') {
      this.success(
        (data.modality || 'Biometric') + ' template salted & encrypted with AES-256-GCM in vault.',
        'Biometric Enrolled Successfully',
        { modality: data.modality, version: data.template_version }
      );
      return;
    }

    // 7. Auth Login
    if (endpoint.includes('/auth/login') && data.access_token) {
      this.success(
        'Authenticated as ' + (data.user?.username || 'User') + ' (' + ((data.user?.role || 'Staff').toUpperCase()) + ')',
        'Login Successful'
      );
      return;
    }
  }

  inferTitleFromEndpoint(endpoint, method) {
    if (endpoint.includes('/auth/login')) return 'Authentication';
    if (endpoint.includes('/visits/')) return 'Visit Management';
    if (endpoint.includes('/persons/')) return 'Visitor Registry';
    if (endpoint.includes('/biometrics/')) return 'Biometrics Engine';
    if (endpoint.includes('/zones/')) return 'Zone Access Control';
    if (endpoint.includes('/audit/')) return 'Audit System';
    return method === 'POST' ? 'Action Completed' : 'System Update';
  }
}

export const toastService = new ToastService();
export const notify = toastService;
export default toastService;
