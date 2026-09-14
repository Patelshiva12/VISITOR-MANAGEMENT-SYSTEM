# ILIZIEN VMS - Multi-Modal Biometric Visitor Management System (2.0)

Enterprise Multi-Modal Biometric Identity & Digital Gate Pass System powered by **Django 5.2 + Django REST Framework (DRF)**.

---

## 📂 Project Architecture

`
D:\vms-biometric-system\
├── frontend/                     # React 18 SPA (Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/           # Biometric Modal, QR Scanner, Gate Pass, Navbar, Sidebar
│   │   ├── context/              # VmsContext (RBAC, active state, live backend sync)
│   │   ├── pages/                # LandingPage, PreRegistration, GuardKiosk, HostApprovals, Dashboard
│   │   └── services/api.js       # Centralized REST API client (Fetch + JWT Auth)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # Django 5.2 + Django REST Framework (DRF)
│   ├── manage.py
│   ├── run.py                    # 1-Click Server Runner (Auto-migrate + Auto-seed + Runserver)
│   ├── requirements.txt
│   ├── vms_project/              # Django Project Root (settings, urls, wsgi, asgi)
│   │   ├── settings.py           # DB config, CORS, DRF, JWT, Biometric keys
│   │   └── urls.py               # Root URL router (/api/v1/ and /admin/)
│   └── vms_api/                  # Core Django VMS App
│       ├── models.py             # Person, BiometricTemplate, Visit, AuditLog, Zone
│       ├── serializers.py        # DRF Model & Response Serializers
│       ├── urls.py               # /api/v1/ endpoints
│       ├── views/                # auth_views, visit_views, person_views, biometric_views, zone_views, audit_views
│       ├── services/             # OpenCV, SCRFD, ArcFace (Zero dlib), AES-256 template protection
│       └── management/commands/  # seed_db command
│
└── README.md
`

---

## 🚀 How to Run the System

### 1. Start Django Backend (Port 8080 / Custom Port)
Open a terminal in `D:\vms-biometric-system\backend`:
```powershell
cd D:\vms-biometric-system\backend
pip install -r requirements.txt

# Run on default Port 8080:
python run.py

# Or run on any custom port (e.g. 8005):
python run.py 8005
```
*(Or manually: `python manage.py migrate` -> `python manage.py seed_db` -> `python manage.py runserver 127.0.0.1:8080`)*

* **API Base URL:** `http://localhost:8080/api/v1/`
* **Django Admin Panel:** `http://localhost:8080/admin/`



---

### 2. Start React Frontend (Port 5173)
Open another terminal in D:\vms-biometric-system\frontend:
`powershell
cd D:\vms-biometric-system\frontend
npm install
npm run dev
`
* **Web UI:** http://localhost:5173

---

## 👥 Role-Based Portals

| Role | Landing Route | Access Scope |
| :--- | :--- | :--- |
| 🌐 **Public Visitor** | / (Landing) & /pre-register | Self-Service Pre-registration & Pass Tracking (Zero staff access) |
| 🛡️ **Security Guard** | /guard (Guard Kiosk) | Live Face AI Verification, Gate Check-In/Out, Thermal Pass Print |
| 👤 **Host (Employee)**| /host-approvals | Review Visitor Requests, Approve/Reject, Assign Zone Clearance |
| 👑 **Admin (CSO)**     | /dashboard (Command Center) | Master Analytics, Turnstiles, Biometric Calibration, Audit CSV |

---

## 🔒 Biometric Security Standards
* **Face AI Engine:** OpenCV + SCRFD (5-Point Landmarks) + ArcFace InsightFace R100 (512-dim embedding) - **Strictly Zero dlib**.
* **Template Protection:** AES-256-GCM encrypted feature vectors (Raw images deleted immediately after vector extraction).
* **Anti-Spoofing:** 3D Liveness Detection (Photo / Screen / Replay attack mitigation).
