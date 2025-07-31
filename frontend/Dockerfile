############################################
# ----------- Build   stage  --------------
############################################
FROM node:20-alpine AS build

# UID non-root (ex. 10001)
ARG  APP_USER=10001
WORKDIR /app

# Crée l’utilisateur dans l’étape build pour éviter l’exécution en root
RUN adduser -D -u ${APP_USER} appuser
USER appuser

# ➜ Copie ciblée : uniquement les fichiers de dépendances
COPY --chown=${APP_USER}:${APP_USER} --chmod=0644 package.json .
COPY --chown=${APP_USER}:${APP_USER} --chmod=0644 package-lock.json .

# Installation sans scripts post-install  (+ cache npm si besoin)
RUN npm ci --ignore-scripts

# ➜ Copie du code source (fichiers listés dans .dockerignore exclus)
COPY --chown=${APP_USER}:${APP_USER} --chmod=0644 . .

# Build React / Vite → dist/
RUN npm run build



############################################
# ----------- Runtime stage ---------------
############################################
FROM nginx:1.27-alpine

# Même UID non-root que dans la phase build
ARG APP_USER=10001

# Ajoute l’utilisateur d’exécution
RUN adduser -D -u ${APP_USER} appuser
USER appuser

# Copie la build  (fichiers statiques) en lecture-seule
COPY --from=build \
     --chown=appuser:appuser \
     --chmod=0444 \
     /app/dist/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1
