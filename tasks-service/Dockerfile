# Utilise une image légère de Node.js
FROM node:22-alpine

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installe uniquement les dépendances de production
RUN npm ci --omit=dev

# Copie le reste des fichiers du projet
COPY . .

# Expose le port sur lequel le service écoute
EXPOSE 8002

# Commande de démarrage du service
CMD ["node", "index.js"]
