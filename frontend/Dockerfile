################ build ################
FROM node:20-alpine AS build
ARG  APP_USER=10001
WORKDIR /app

# Copie ciblée (fichiers lock + package) en lecture seule
COPY --chown=${APP_USER}:${APP_USER} --chmod=0644 package*.json ./
RUN npm ci --ignore-scripts

COPY --chown=${APP_USER}:${APP_USER} --chmod=0644 . .
RUN npm run build

################ runtime ##############
FROM nginx:1.27-alpine
ARG APP_USER=10001

# user non-root
RUN adduser -D -u ${APP_USER} appuser
USER appuser

# Copie la build : fichiers statiques en RO
COPY --from=build \
     --chown=appuser:appuser \
     --chmod=0444 \
     /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1
