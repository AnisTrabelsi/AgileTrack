# Utilise une image légère Python
FROM python:3.11-alpine

# Définir le répertoire de travail
WORKDIR /code

# Copier le fichier des dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier le reste du code
COPY . .

# Exposer le port de l'API
EXPOSE 8001

# Commande pour lancer l'application FastAPI avec Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
