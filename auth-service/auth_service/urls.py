from django.contrib import admin
from django.urls import path, include
from users.views import health
urlpatterns = [
    path("admin/", admin.site.urls),
    # Endpoints JWT : /api/auth/login, /refresh, /verify
    path("api/auth/", include("users.urls")),
        path("health/", health),   # avec slash
    path("health", health),    # sans slash (au cas où)
]
