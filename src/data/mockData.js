export const initialHosts = [
  { id: 'HST-101', name: 'Dr. Arvind Menon', department: 'R&D & Engineering', email: 'arvind.m@ilizien.com', cabin: 'Tech Block 3, 4th Floor' },
  { id: 'HST-102', name: 'Neha Kapoor', department: 'IT Infrastructure & Cloud', email: 'neha.k@ilizien.com', cabin: 'Data Center, Ground Floor' },
  { id: 'HST-103', name: 'Rajeshwar Rao', department: 'Security & Operations', email: 'rajeshwar.r@ilizien.com', cabin: 'Gate House Control' },
  { id: 'HST-104', name: 'Pooja Sharma', department: 'Human Resources', email: 'pooja.s@ilizien.com', cabin: 'Admin Block, 2nd Floor' },
  { id: 'HST-105', name: 'Vikramjit Singh', department: 'Procurement & Finance', email: 'vikram.s@ilizien.com', cabin: 'Corporate Suite 5B' }
];

export const initialZones = [
  { id: 'ZONE-01', name: 'Reception & Visitor Lounge', code: 'Z-REC', securityLevel: 'Level 1 (Public)', color: 'emerald', description: 'Main building entrance, security checkpoint and visitor holding lounge.' },
  { id: 'ZONE-02', name: 'General Office & Meeting Rooms', code: 'Z-OFF', securityLevel: 'Level 2 (Standard)', color: 'sky', description: 'Administrative wing, meeting suites, open workstations, and cafeteria.' },
  { id: 'ZONE-03', name: 'R&D Embedded Systems Lab', code: 'Z-LAB', securityLevel: 'Level 3 (Restricted)', color: 'amber', description: 'Hardware development, testing benches, prototype assembly line.' },
  { id: 'ZONE-04', name: 'Data Center & Main Server Vault', code: 'Z-DC', securityLevel: 'Level 4 (Critical)', color: 'rose', description: 'Core server racks, fiber terminations, biometric multi-factor entry portal.' }
];

const now = new Date();
const getPastDate = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString();
const getFutureDate = (minsAhead) => new Date(now.getTime() + minsAhead * 60000).toISOString();

export const initialVisitors = [
  {
    id: 'VIS-901',
    fullName: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@tcs.com',
    company: 'Tata Consultancy Services',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    idProofType: 'Aadhaar Card',
    idProofNumber: 'XXXX-XXXX-4819',
    isBlacklisted: false,
    enrolledBiometrics: { face: true, fingerprint: true, iris: false }
  },
  {
    id: 'VIS-902',
    fullName: 'Priya Patel',
    phone: '+91 98111 22334',
    email: 'priya.p@infosys.com',
    company: 'Infosys Cyber Defense',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    idProofType: 'Passport',
    idProofNumber: 'Z8924102',
    isBlacklisted: false,
    enrolledBiometrics: { face: true, fingerprint: true, iris: true }
  },
  {
    id: 'VIS-903',
    fullName: 'Amitabh Verma',
    phone: '+91 99887 76655',
    email: 'a.verma@siemens.de',
    company: 'Siemens Industrial Automation',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    idProofType: 'Driving License',
    idProofNumber: 'DL-0420190038',
    isBlacklisted: false,
    enrolledBiometrics: { face: true, fingerprint: false, iris: false }
  },
  {
    id: 'VIS-904',
    fullName: 'Sunita Rao',
    phone: '+91 94567 81234',
    email: 'sunita.rao@lnt.com',
    company: 'Larsen & Toubro Ltd',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    idProofType: 'Aadhaar Card',
    idProofNumber: 'XXXX-XXXX-9102',
    isBlacklisted: false,
    enrolledBiometrics: { face: true, fingerprint: true, iris: false }
  },
  {
    id: 'VIS-905',
    fullName: 'Devendra Mehta',
    phone: '+91 91234 56780',
    email: 'd.mehta@roguecorp.in',
    company: 'Apex Logistics',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    idProofType: 'Voter ID',
    idProofNumber: 'EPIC-882910',
    isBlacklisted: true,
    enrolledBiometrics: { face: true, fingerprint: true, iris: false }
  }
];

export const initialVisits = [
  {
    id: 'VST-2026-001',
    visitorId: 'VIS-901',
    visitorName: 'Rajesh Sharma',
    visitorCompany: 'Tata Consultancy Services',
    visitorPhone: '+91 98765 43210',
    visitorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    hostId: 'HST-101',
    hostName: 'Dr. Arvind Menon',
    hostDept: 'R&D & Engineering',
    purpose: 'Quarterly AI Chip Integration Review',
    scheduledTime: getPastDate(90),
    expectedDurationMins: 120,
    checkInTime: getPastDate(75),
    checkOutTime: null,
    status: 'CHECKED_IN',
    allowedZones: ['ZONE-01', 'ZONE-02', 'ZONE-03'],
    gate: 'Main Gate 01',
    passNumber: 'GP-2026-891',
    vehicleNumber: 'HR-26-DQ-1092',
    verifiedBiometrics: ['FACE', 'FINGERPRINT'],
    notes: 'Escort required for Zone 3'
  },
  {
    id: 'VST-2026-002',
    visitorId: 'VIS-902',
    visitorName: 'Priya Patel',
    visitorCompany: 'Infosys Cyber Defense',
    visitorPhone: '+91 98111 22334',
    visitorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    hostId: 'HST-102',
    hostName: 'Neha Kapoor',
    hostDept: 'IT Infrastructure & Cloud',
    purpose: 'ISO 27001 Physical Security Audit',
    scheduledTime: getPastDate(200),
    expectedDurationMins: 90,
    checkInTime: getPastDate(180),
    checkOutTime: null,
    status: 'CHECKED_IN',
    allowedZones: ['ZONE-01', 'ZONE-02', 'ZONE-04'],
    gate: 'North Gate 02',
    passNumber: 'GP-2026-892',
    vehicleNumber: 'DL-3C-AZ-4411',
    verifiedBiometrics: ['FACE', 'IRIS'],
    notes: 'Audit badge issued'
  },
  {
    id: 'VST-2026-003',
    visitorId: 'VIS-903',
    visitorName: 'Amitabh Verma',
    visitorCompany: 'Siemens Industrial Automation',
    visitorPhone: '+91 99887 76655',
    visitorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    hostId: 'HST-103',
    hostName: 'Rajeshwar Rao',
    hostDept: 'Security & Operations',
    purpose: 'Biometric Access Sensor Calibration',
    scheduledTime: getFutureDate(30),
    expectedDurationMins: 180,
    checkInTime: null,
    checkOutTime: null,
    status: 'APPROVED',
    allowedZones: ['ZONE-01', 'ZONE-02'],
    gate: 'Main Gate 01',
    passNumber: 'GP-2026-893',
    vehicleNumber: 'HR-51-BK-8800',
    verifiedBiometrics: [],
    notes: 'VIP fast-track pre-approved'
  },
  {
    id: 'VST-2026-004',
    visitorId: 'VIS-904',
    visitorName: 'Sunita Rao',
    visitorCompany: 'Larsen & Toubro Ltd',
    visitorPhone: '+91 94567 81234',
    visitorPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    hostId: 'HST-104',
    hostName: 'Pooja Sharma',
    hostDept: 'Human Resources',
    purpose: 'Campus Recruitment Vendor Alignment',
    scheduledTime: getFutureDate(60),
    expectedDurationMins: 60,
    checkInTime: null,
    checkOutTime: null,
    status: 'PENDING',
    allowedZones: ['ZONE-01', 'ZONE-02'],
    gate: 'Main Gate 01',
    passNumber: 'GP-2026-894',
    vehicleNumber: 'UP-16-CK-2911',
    verifiedBiometrics: [],
    notes: 'Awaiting host acceptance'
  },
  {
    id: 'VST-2026-005',
    visitorId: 'VIS-905',
    visitorName: 'Devendra Mehta',
    visitorCompany: 'Apex Logistics',
    visitorPhone: '+91 91234 56780',
    visitorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    hostId: 'HST-105',
    hostName: 'Vikramjit Singh',
    hostDept: 'Procurement & Finance',
    purpose: 'Material Inward Delivery',
    scheduledTime: getPastDate(300),
    expectedDurationMins: 45,
    checkInTime: null,
    checkOutTime: null,
    status: 'REJECTED',
    allowedZones: [],
    gate: 'Main Gate 01',
    passNumber: 'GP-2026-895',
    vehicleNumber: 'HR-26-EE-9011',
    verifiedBiometrics: [],
    notes: 'Rejected by security: Blacklisted identity'
  }
];

export const initialAuditLogs = [
  {
    id: 'LOG-8801',
    timestamp: getPastDate(180),
    eventType: 'BIOMETRIC_VERIFY_SUCCESS',
    performedBy: 'Security Guard (Desk 01)',
    gate: 'North Gate 02',
    description: 'Facial recognition match 98.8% & Liveness confirmed for Priya Patel',
    severity: 'SUCCESS'
  },
  {
    id: 'LOG-8802',
    timestamp: getPastDate(180),
    eventType: 'CHECK_IN',
    performedBy: 'Security Guard (Desk 01)',
    gate: 'North Gate 02',
    description: 'Visitor Priya Patel checked in for Host Neha Kapoor. Gate pass GP-2026-892 generated.',
    severity: 'INFO'
  },
  {
    id: 'LOG-8803',
    timestamp: getPastDate(75),
    eventType: 'BIOMETRIC_VERIFY_SUCCESS',
    performedBy: 'Security Guard (Desk 02)',
    gate: 'Main Gate 01',
    description: 'Multi-modal Face + Fingerprint verified for Rajesh Sharma (SCRFD Latency 12ms)',
    severity: 'SUCCESS'
  },
  {
    id: 'LOG-8804',
    timestamp: getPastDate(75),
    eventType: 'CHECK_IN',
    performedBy: 'Security Guard (Desk 02)',
    gate: 'Main Gate 01',
    description: 'Visitor Rajesh Sharma entered Main Gate. Assigned Zones: Z-REC, Z-OFF, Z-LAB',
    severity: 'INFO'
  },
  {
    id: 'LOG-8805',
    timestamp: getPastDate(30),
    eventType: 'HOST_APPROVAL',
    performedBy: 'Rajeshwar Rao (HST-103)',
    gate: 'System Portal',
    description: 'Approved visit VST-2026-003 for Amitabh Verma with VIP fast-track status',
    severity: 'SUCCESS'
  }
];
