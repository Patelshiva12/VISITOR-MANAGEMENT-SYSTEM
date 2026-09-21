from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_status_view(request):
    return JsonResponse({
        "status": "ONLINE",
        "framework": "Django 5.2 (Django REST Framework)",
        "system": "ILIZIEN VMS Biometric Suite 2.0 Backend",
        "hardware": "SecuGen Hamster Pro 20 (HU20-AP) 100% Offline Active",
        "api_v1_url": "/api/v1/"
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('vms_api.urls')),
    path('api/', include('vms_api.urls')),
]
