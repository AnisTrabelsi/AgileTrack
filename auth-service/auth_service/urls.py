from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Endpoints JWT : /api/auth/login, /refresh, /verify
    path("api/auth/", include("users.urls")),
]
