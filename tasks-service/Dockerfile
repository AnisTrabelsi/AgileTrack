# tasks-service/Dockerfile
FROM node:22-alpine

WORKDIR /code

# 1. Dépendances
COPY package*.json ./
RUN npm ci --production

# 2. Source
COPY src ./src

EXPOSE 8002
CMD ["node", "src/server.js"]   # <‑‑ chemin mis à jour
