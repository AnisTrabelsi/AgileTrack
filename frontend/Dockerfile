##################### build stage #####################
FROM node:20-alpine AS build

# UID non-root (e.g. 10001)
ARG APP_USER=10001
WORKDIR /app

# ➜ ne copie que ce qui est nécessaire grâce au .dockerignore
COPY --chown=${APP_USER}:${APP_USER} package*.json ./
RUN npm ci --ignore-scripts        # pas d’exec de scripts post-install

# Copie du code source (voir .dockerignore)
COPY --chown=${APP_USER}:${APP_USER} . .

RUN npm run build                  # génère dist/

##################### runtime stage ####################
FROM nginx:1.27-alpine

# Ajoute l’utilisateur non-root
ARG APP_USER=10001
RUN adduser -D -u ${APP_USER} appuser

# Copie la build React / Vite dans Nginx
COPY --from=build /app/dist /usr/share/nginx/html

USER appuser              # ⇒ plus root
EXPOSE 80

HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1
