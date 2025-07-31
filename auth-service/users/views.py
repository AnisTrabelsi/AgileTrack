from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_safe

# ---------------------------------------------------------------------------
# Liveness / readiness ­– accepte uniquement les méthodes *SAFE* (GET/HEAD)
# ---------------------------------------------------------------------------
@require_safe
def health(request):
    """
    Endpoint de liveness/readiness pour Kubernetes.
    Retourne simplement 200 OK avec un JSON court.
    """
    return JsonResponse({"status": "ok"}, status=200)


# ---------------------------------------------------------------------------
# Exemple de vue « root » (facultatif) – safe methods uniquement
# ---------------------------------------------------------------------------
@require_safe
def index(request):
    return HttpResponse("Hello DevOpsTrack !")
