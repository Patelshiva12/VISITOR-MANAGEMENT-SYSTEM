import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY', default='django-insecure-vms-biometric-key-2026-xyz8822')

DEBUG = env('DEBUG', default=True)

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'corsheaders',
    'rest_framework',
    # VMS Application
    'vms_api.apps.VmsApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'vms_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vms_project.wsgi.application'
ASGI_APPLICATION = 'vms_project.asgi.application'

# Database Configuration with PostgreSQL and automatic SQLite fallback
def get_database_config():
    db_engine = env('DB_ENGINE', default='')
    if db_engine == 'sqlite' or env('DB_NAME', default='').endswith('.db'):
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'vms_django.db',
        }
    
    try:
        import psycopg2
        conn = psycopg2.connect(
            dbname=env('DB_NAME', default='vms'),
            user=env('DB_USER', default='postgres'),
            password=env('DB_PASSWORD', default='aryan'),
            host=env('DB_HOST', default='localhost'),
            port=env('DB_PORT', default='5432'),
            connect_timeout=2
        )
        conn.close()
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME', default='vms'),
            'USER': env('DB_USER', default='postgres'),
            'PASSWORD': env('DB_PASSWORD', default='aryan'),
            'HOST': env('DB_HOST', default='localhost'),
            'PORT': env('DB_PORT', default='5432'),
        }
    except Exception:
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'vms_django.db',
        }

DATABASES = {
    'default': get_database_config()
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# CORS Configuration for React SPA (Port 5173 / Localhost)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Disable mandatory trailing slashes to match frontend routes
APPEND_SLASH = False

# Biometric & Security Encryption Keys
DATA_KEY = env('DATA_KEY', default='TRIALS-ADMIN-API')
DATA_IV = env('DATA_IV', default='TRIALS-INITIAL-V')
ENCRYPTION_SECRET_KEY = env('ENCRYPTION_SECRET_KEY', default='V1VWTVRFOVhJRk5WUWsxQlVrbE9SUT09LFRrOUNUMFJaSUZkSlRFd2dTMDVQVnc9PQ==')
BIOMETRIC_VAULT_KEY = env('BIOMETRIC_VAULT_KEY', default='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
ARCFACE_MATCH_THRESHOLD = 0.85
LIVENESS_THRESHOLD = 0.90
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
