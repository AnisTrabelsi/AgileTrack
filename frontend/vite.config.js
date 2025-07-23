// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Configuration Vite (développement uniquement)
 * - HMR activé
 * - host:true → accessible en réseau local ou via conteneurs Docker
 * - proxy : redirige les appels API vers leurs microservices respectifs
 */
export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,

    proxy: {
      // Auth Service (Django)
      "/api/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },

      // Projects Service (FastAPI)
      "^/api/projects(/|$)": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },

      // Tasks Service (Node.js)
      "/api/tasks": {
        target: "http://localhost:8002",
        changeOrigin: true,
      },
    },
  },
});
