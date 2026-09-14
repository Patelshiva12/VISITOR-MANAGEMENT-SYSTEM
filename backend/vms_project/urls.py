from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_status_view(request):
    return JsonResponse({
        "status": "ONLINE",
        "framework": "Django 5.2 (Django REST Framework)",
        "system": "ILIZIEN VMS Biometric Suite 2.0 Backend",
        "models": {
            "face_detection": "SCRFD (5-Point Landmarks)",
            "face_recognition": "ArcFace InsightFace R100 (512-dim Embedding)",
            "liveness": "3D Silent Anti-Spoofing (Active)",
            "database": "Django ORM with AES-256-GCM Biometric Vault"
        },
        "api_v1_url": "/api/v1/"
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('vms_api.urls')),
]
