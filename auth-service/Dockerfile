# ---------- phase build (installe dépendances) ----------
FROM python:3.11-alpine AS base

# Dépendances système pour psycopg2 + build
RUN apk add --no-cache gcc musl-dev postgresql-dev

# Répertoire de travail
WORKDIR /code

# Copie des dépendances Python
COPY requirements.txt .

# Upgrade pip + install requirements
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# ---------- phase final ----------
FROM python:3.11-alpine

# Copie des packages installés depuis l’image base
COPY --from=base /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=base /usr/local/bin /usr/local/bin

# Copie du code source
WORKDIR /code
COPY . .

# Variables d’environnement runtime
ENV DJANGO_SETTINGS_MODULE=auth_service.settings \
    PYTHONUNBUFFERED=1

# Expose port 8000
EXPOSE 8000

CMD ["gunicorn", "auth_service.wsgi:application", "--bind", "0.0.0.0:8000"]
