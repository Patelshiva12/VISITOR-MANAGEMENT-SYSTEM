# ILIZIEN VMS — Django Backend (Django 5.2 + Django REST Framework + OpenCV, SCRFD & ArcFace)

Complete high-security Multi-Modal Biometric Visitor Management Backend.

## 🚀 Key Features

* **Zero `dlib` Dependency:** Powered strictly by OpenCV + SCRFD (Face Detection) + ArcFace (InsightFace 512-dim Embedding).
* **AES-256-GCM Biometric Vault:** Cancelable salting and military-grade encryption for all stored templates.
* **Database Models:** Matches `person`, `biometric_template`, `visit`, `audit_log`, and `zone` exact specifications.
* **Dual Security Controls:** Validates Biometric Identity Match independently from Date/Time/Host Visit Authorization.
* **Interactive DRF Browsable API & Admin Panel:** Available at `http://localhost:8080/admin/` and `http://localhost:8080/api/v1/`.

## 💻 How to Run Locally

```powershell
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Start the Django Server (Default Port: 8080)
python run.py

# Or start on any custom port:
python run.py 8005
```

* **API Base URL:** `http://localhost:8080/api/v1/`
* **Admin Console:** `http://localhost:8080/admin/`

