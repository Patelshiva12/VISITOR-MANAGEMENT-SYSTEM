# Multi-Modal Biometric Visitor Management System (VMS)

An enterprise-grade React web application for the **Visitor Management System with Multi-Modal Biometrics (Face, Fingerprint, Iris, Anti-Spoofing Liveness Detection) & Digital Gate Pass Management**, designed strictly in accordance with the Ilizien Private Limited proposal specification.

---

## ?? Key Features

1. **Role-Based Workflows & Portals:**
   - **Security Guard Kiosk:** Fast check-in/check-out, live camera biometric station, QR code scanner, thermal gate pass printing, manual security override.
   - **Host & Department Portal:** Expected visitor calendar, pending request queue, 1-click approvals with custom zone permissions, rejection with remarks.
   - **Visitor Pre-Registration:** Self-service multi-step onboarding wizard with webcam selfie capture and repeat-visitor phone lookup.
   - **Admin Command Center:** Live real-time active visitor tracking with elapsed time counters, overstay alerts, biometric hardware telemetry, and visitor trends.

2. **Multi-Modal Biometric Verification Suite:**
   - **Facial Recognition Station:** Live WebRTC camera capture, SCRFD alignment overlay, ArcFace embedding comparison, and silent 3D liveness anti-spoofing detection.
   - **Fingerprint Verification:** Simulated 500 DPI optical sensor with minutiae extraction and template matching.
   - **Iris Recognition:** Dual Near-IR retinal HUD with pupil targeting.

3. **Dual Security Policy Enforcement (Proposal Page 5):**
   - Combines **Identity Match** ("This is the enrolled person") with **Visit Authorization** ("This person has a valid approval for this date, time, and host").

4. **Digital Gate Pass Management & Printing:**
   - Printable pass with dynamic vector QR code, verified biometric seal, barcode, allowed zones, and custom printable styles for thermal and standard badge printers.

5. **Zone-Based Access Control Matrix (Proposal Section 14):**
   - Multi-zone turnstile scanner simulation (Reception, Office Wing, R&D Lab, Server Vault) with instant real-time security breach alarm feeds.

6. **Defensible Audit Trail:**
   - Immutable log of all events with full-text search, severity filtering, and 1-click **CSV & JSON data export**.

---

## ?? How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open your browser at `http://localhost:5173` (or port indicated in terminal).

### Building for Production
```bash
npm run build
npm run preview
```

---

## ??? Tech Stack
- **Frontend:** React 18, Vite 6
- **Styling:** Tailwind CSS, Lucide React Icons
- **State & Data:** React Context API + LocalStorage persistence + Seed baseline reset
