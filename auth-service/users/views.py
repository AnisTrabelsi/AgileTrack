from django.http import JsonResponse, HttpResponse


def health(request):
    """
    Endpoint de liveness/readiness pour Kubernetes.
    Retourne simplement 200 OK avec un JSON court.
    """
    data = {"status": "ok"}
    return JsonResponse(data, status=200)


# Exemple d’autre vue (si besoin)
def index(request):
    return HttpResponse("Hello DevOpsTrack !")
