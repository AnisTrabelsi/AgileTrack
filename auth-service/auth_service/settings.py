"""
Paramètres Django pour le service d'authentification DevOpsTrack.
"""

from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------
# Helpers ENV
# ------------------------------------------------------------------
def _env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}

def _env_list(name: str, default: str = "") -> list[str]:
    return [x.strip() for x in os.getenv(name, default).split(",") if x.strip()]

# ------------------------------------------------------------------
# Sécurité
# ------------------------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-for-local-only")
DEBUG = _env_bool("DJANGO_DEBUG", True)

# ⚠️ IMPORTANT : on lit d'abord l'ENV, sinon on retombe sur des valeurs dev.
# ALLOWED_HOSTS n'accepte pas les schémas; CSRF_TRUSTED_ORIGINS DOIT inclure http/https.
ALLOWED_HOSTS = _env_list(
    "DJANGO_ALLOWED_HOSTS",
    ".127.0.0.1.nip.io,localhost,127.0.0.1",
)

CSRF_TRUSTED_ORIGINS = _env_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://devopstrack.127.0.0.1.nip.io,http://*.127.0.0.1.nip.io,https://*.127.0.0.1.nip.io",
)

# Si l'app est derrière un proxy/ingress (Traefik, NGINX, etc.)
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ------------------------------------------------------------------
# Applications
# ------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Tiers
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",               # CORS

    # Local
    "users",
]

# ------------------------------------------------------------------
# Middleware
# ------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",     # doit venir avant CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "auth_service.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "auth_service.wsgi.application"

# ------------------------------------------------------------------
# Base de données (PostgreSQL)
# ------------------------------------------------------------------
# Par défaut, on vise le service Bitnami : auth-db-postgresql
POSTGRES_DB = os.getenv("POSTGRES_DB", "auth")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "auth-db-postgresql")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": POSTGRES_DB,
        "USER": POSTGRES_USER,
        "PASSWORD": POSTGRES_PASSWORD,
        "HOST": POSTGRES_HOST,
        "PORT": POSTGRES_PORT,
    }
}

# ------------------------------------------------------------------
# REST Framework + JWT
# ------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ------------------------------------------------------------------
# CORS (front Vite, etc.)
# ------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = _env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://devopstrack.127.0.0.1.nip.io",
)

# Pour autoriser dynamiquement toutes les sous-domaines nip.io en dev :
CORS_ALLOWED_ORIGIN_REGEXES = _env_list(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    r"^https?://.*\.127\.0\.0\.1\.nip\.io$",
)

# Si besoin de cookies cross-site (auth session), décommente:
# CORS_ALLOW_CREDENTIALS = True

# ------------------------------------------------------------------
# Internationalisation / statiques
# ------------------------------------------------------------------
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
