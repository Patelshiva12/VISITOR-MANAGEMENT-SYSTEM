import React, { useState, useRef } from 'react';
import { useVms } from '../context/VmsContext';
import { VmsBackendApi } from '../services/api';
import { 
  UserPlus, 
  Camera, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Car, 
  ShieldCheck,
  Laptop,
  ArrowRight,
  Sparkles,
  MapPin,
  Home,
  Check
} from 'lucide-react';

export default function PreRegistration({ setActivePage, isPublicView = false }) {
  const { hosts, visitors, registerVisitor } = useVms();
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdVisit, setCreatedVisit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    visitorCategory: 'Business Client / Partner',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    hostId: hosts[0]?.id || 'HST-101',
    purpose: '',
    expectedDurationMins: '60',
    vehicleNumber: '',
    laptopSerial: '',
    notes: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  });

  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handlePhoneBlur = () => {
    if (!formData.phone) return;
    const existing = visitors.find(v => v.phone.replace(/\s+/g, '').includes(formData.phone.replace(/\s+/g, '')));
    if (existing) {
      setFormData(prev => ({
        ...prev,
        fullName: existing.fullName,
        email: existing.email || prev.email,
        company: existing.company || prev.company,
        address: existing.address || prev.address,
        visitorCategory: existing.visitorCategory || prev.visitorCategory,
        idProofType: existing.idProofType || prev.idProofType,
        idProofNumber: existing.idProofNumber || prev.idProofNumber,
        laptopSerial: existing.laptopSerial || prev.laptopSerial,
        photoUrl: existing.photoUrl || prev.photoUrl
      }));
    }
  };

  const startCamera = async () => {
    try {
      setIsTakingPhoto(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.warn('Camera unavailable, keeping sample photo');
      setIsTakingPhoto(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL('image/jpeg');
      setFormData(prev => ({ ...prev, photoUrl: photo }));
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsTakingPhoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.purpose) {
      alert('Please fill in all required fields (Name, Phone, Purpose).');
      return;
    }

    setIsSubmitting(true);

    // 1. Local context state registration
    const { visitId, passNumber } = registerVisitor(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        address: formData.address,
        visitorCategory: formData.visitorCategory,
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber,
        laptopSerial: formData.laptopSerial,
        photoUrl: formData.photoUrl
      },
      {
        hostId: formData.hostId,
        purpose: formData.purpose,
        visitorCategory: formData.visitorCategory,
        expectedDurationMins: formData.expectedDurationMins,
        vehicleNumber: formData.vehicleNumber,
        laptopSerial: formData.laptopSerial,
        notes: formData.notes
      }
    );

    // 2. Call FastAPI Python Backend (if online)
    try {
      await VmsBackendApi.createVisit({
        visitor_name: formData.fullName,
        visitor_phone: formData.phone,
        visitor_company: formData.company,
        visitor_category: formData.visitorCategory,
        host_id: formData.hostId,
        purpose: formData.purpose,
        expected_duration_mins: Number(formData.expectedDurationMins) || 60,
        vehicle_number: formData.vehicleNumber,
        laptop_serial: formData.laptopSerial,
        notes: formData.notes,
        face_image_base64: formData.photoUrl
      });
      console.log('[Backend API] Pre-registration saved in PostgreSQL successfully.');
    } catch (err) {
      console.log('[Backend API] Running in local offline mode.');
    }

    const generated = {
      id: visitId,
      passNumber,
      visitorName: formData.fullName,
      visitorCompany: formData.company,
      visitorPhone: formData.phone,
      visitorCategory: formData.visitorCategory,
      visitorPhoto: formData.photoUrl,
      hostName: hosts.find(h => h.id === formData.hostId)?.name || 'Host Authority',
      hostDept: hosts.find(h => h.id === formData.hostId)?.department || 'Administration',
      purpose: formData.purpose,
      scheduledTime: new Date().toISOString(),
      expectedDurationMins: formData.expectedDurationMins,
      status: 'PENDING',
      allowedZones: ['ZONE-01', 'ZONE-02'],
      gate: 'Main Gate 01'
    };

    setCreatedVisit(generated);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  if (isSuccess && createdVisit) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-5">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Pre-Registration Submitted Successfully!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your visit request has been logged and forwarded to <strong className="text-sky-400">{createdVisit.hostName}</strong> ({createdVisit.hostDept}) for approval.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Pass Reference No:</span>
              <span className="font-mono font-bold text-sky-400 text-sm">{createdVisit.passNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Visitor Name:</span>
              <span className="font-bold text-white">{createdVisit.visitorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Visitor Category:</span>
              <span className="font-semibold text-slate-300">{createdVisit.visitorCategory}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Host Department:</span>
              <span className="text-slate-300">{createdVisit.hostDept}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 font-bold rounded-full text-[10px] uppercase border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Awaiting Host Approval
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Show your Pass Reference number or registered phone at the security gate upon arrival for rapid biometric check-in.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                setCreatedVisit(null);
                setFormData({
                  fullName: '',
                  phone: '',
                  email: '',
                  company: '',
                  address: '',
                  visitorCategory: 'Business Client / Partner',
                  idProofType: 'Aadhaar Card',
                  idProofNumber: '',
                  hostId: hosts[0]?.id || 'HST-101',
                  purpose: '',
                  expectedDurationMins: '60',
                  vehicleNumber: '',
                  laptopSerial: '',
                  notes: '',
                  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                });
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Register Another Visitor
            </button>
            <button
              onClick={() => setActivePage('landing')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5" /> Back to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-black text-white">Visitor Pre-Registration Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fill details in advance for rapid biometric gate pass clearance upon arrival.
          </p>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full font-mono">
          Self-Service Kiosk
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Step 1: Personal & Category Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-sky-400" /> 1. Visitor Identity & Category
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mobile Number * (Auto-Lookup)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onBlur={handlePhoneBlur}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Type registered phone to auto-fill repeat visitor profile</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Visitor Category *</label>
              <select
                value={formData.visitorCategory}
                onChange={(e) => setFormData({ ...formData, visitorCategory: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-sky-400 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="VIP Dignitary / Guest">VIP Dignitary / Guest</option>
                <option value="Business Client / Partner">Business Client / Partner</option>
                <option value="Vendor / Service Contractor">Vendor / Service Contractor</option>
                <option value="Audit & Regulatory Inspector">Audit & Regulatory Inspector</option>
                <option value="Interview Candidate">Interview Candidate</option>
                <option value="Equipment Delivery / Logistics">Equipment Delivery / Logistics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="ramesh@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Organization</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Siemens / TCS / Individual"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Permanent Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Sector 25, Gurgaon, Haryana"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Identity Document Type</label>
              <select
                value={formData.idProofType}
                onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID (EPIC)</option>
                <option value="Government ID">Government Official ID</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Reference Number</label>
              <input
                type="text"
                placeholder="e.g. XXXX-XXXX-4819"
                value={formData.idProofNumber}
                onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Facial Biometric Capture */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Camera className="w-4 h-4 text-sky-400" /> 2. Facial Biometric Reference Image
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shrink-0 relative">
              <img 
                src={formData.photoUrl} 
                alt="Visitor Reference" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-white block">Capture Live Camera Photo</span>
              <p className="text-[11px] text-slate-400">
                A high-resolution facial capture used for ArcFace embedding generation and gate pass printing.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {!isTakingPhoto ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" /> Open Webcam
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Snap Photo
                  </button>
                )}
              </div>
            </div>

            {isTakingPhoto && (
              <div className="w-32 h-24 rounded-xl overflow-hidden border border-sky-500 bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Visit Logistics & Equipment */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-sky-400" /> 3. Visit Logistics & Equipment Declaration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Host Authority *</label>
              <select
                required
                value={formData.hostId}
                onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                {hosts.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} � {h.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Visit Duration</label>
              <select
                value={formData.expectedDurationMins}
                onChange={(e) => setFormData({ ...formData, expectedDurationMins: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="30">30 Minutes (Quick meeting)</option>
                <option value="60">1 Hour (Standard)</option>
                <option value="120">2 Hours (Review meeting)</option>
                <option value="240">Half Day (4 Hours)</option>
                <option value="480">Full Day (8 Hours)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Purpose of Visit *</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Audit / AI Chip Integration / Server Maintenance"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Registration # (Optional)</label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. DL-01-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Declared Laptop Serial / Asset Tag</label>
              <div className="relative">
                <Laptop className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. DELL-LAT-7420-SN9912"
                  value={formData.laptopSerial}
                  onChange={(e) => setFormData({ ...formData, laptopSerial: e.target.value })}
                  className="w-full bg-slate-950 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Special Instructions / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Carrying toolkit, requires projector conference room"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActivePage('landing')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> 
            {isSubmitting ? 'Submitting to Backend...' : 'Submit Pre-Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
