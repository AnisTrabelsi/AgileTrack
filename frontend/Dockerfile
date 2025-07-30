###############  build stage ###############
FROM node:20-alpine AS build
WORKDIR /app

# dépendances
COPY package*.json ./
RUN npm ci

# sources
COPY . .
RUN npm run build               # génère dist/

###############  runtime stage #############
FROM nginx:1.27-alpine
# copie la build React / Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost:80/ || exit 1
