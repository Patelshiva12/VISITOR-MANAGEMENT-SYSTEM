/**
 * Normalizer to ensure complete compatibility between FastAPI Backend (snake_case)
 * and React UI Components (camelCase)
 */
export function normalizeVisit(v) {
  if (!v) return null;
  const visitorName = v.visitor_name || v.visitorName || 'Visitor';
  const passNumber = v.pass_number || v.passNumber || 'GP-2026-000';
  const visitorPhone = v.visitor_phone || v.visitorPhone || '';
  const visitorCompany = v.visitor_company || v.visitorCompany || 'Individual Visitor';
  const hostName = v.host_name || v.hostName || 'Dr. Arvind Menon';
  const hostDept = v.host_department || v.hostDept || v.host_dept || 'R&D & Engineering';
  const scheduledTime = v.scheduled_time || v.scheduledTime || new Date().toISOString();
  const allowedZones = v.allowed_zones || v.allowedZones || ['ZONE-01', 'ZONE-02'];
  const verifiedBiometrics = v.verified_biometrics || v.verifiedBiometrics || [];
  const visitorPhoto = v.visitor_photo || v.visitorPhoto || v.photo || (v.person && v.person.photo) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  return {
    ...v,
    id: v.id || 'VST-2026-000',
    passNumber,
    pass_number: passNumber,
    visitorId: v.person_id || v.visitorId || 'VIS-000',
    person_id: v.person_id || v.visitorId || 'VIS-000',
    visitorName,
    visitor_name: visitorName,
    visitorCompany,
    visitor_company: visitorCompany,
    visitorPhone,
    visitor_phone: visitorPhone,
    visitorPhoto,
    visitor_photo: visitorPhoto,
    visitorEmail: v.visitor_email || v.visitorEmail || '',
    visitor_email: v.visitor_email || v.visitorEmail || '',
    visitorCategory: v.visitor_category || v.visitorCategory || 'Business Client',
    visitor_category: v.visitor_category || v.visitorCategory || 'Business Client',
    hostId: v.host_id || v.hostId || 'HST-101',
    host_id: v.host_id || v.hostId || 'HST-101',
    hostName,
    host_name: hostName,
    hostDept,
    host_department: hostDept,
    purpose: v.purpose || 'Official Visit',
    scheduledTime,
    scheduled_time: scheduledTime,
    expectedDurationMins: Number(v.expected_duration_mins || v.expectedDurationMins || 60),
    expected_duration_mins: Number(v.expected_duration_mins || v.expectedDurationMins || 60),
    checkInTime: v.check_in_time || v.checkInTime || null,
    check_in_time: v.check_in_time || v.checkInTime || null,
    checkOutTime: v.check_out_time || v.checkOutTime || null,
    check_out_time: v.check_out_time || v.checkOutTime || null,
    status: (v.status || 'PENDING').toUpperCase(),
    allowedZones: Array.isArray(allowedZones) ? allowedZones : ['ZONE-01', 'ZONE-02'],
    allowed_zones: Array.isArray(allowedZones) ? allowedZones : ['ZONE-01', 'ZONE-02'],
    verifiedBiometrics: Array.isArray(verifiedBiometrics) ? verifiedBiometrics : [],
    verified_biometrics: Array.isArray(verifiedBiometrics) ? verifiedBiometrics : [],
    gate: v.gate || 'Main Gate 01',
    vehicleNumber: v.vehicle_number || v.vehicleNumber || 'N/A',
    vehicle_number: v.vehicle_number || v.vehicleNumber || 'N/A',
    laptopSerial: v.laptop_serial || v.laptopSerial || 'NONE',
    laptop_serial: v.laptop_serial || v.laptopSerial || 'NONE',
    notes: v.notes || ''
  };
}

export function normalizeVisits(visitsList) {
  if (!Array.isArray(visitsList)) return [];
  return visitsList.map(normalizeVisit).filter(Boolean);
}
