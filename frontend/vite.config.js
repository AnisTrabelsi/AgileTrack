import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  /* -----------------------------------------------------------
     Développement :
     - host:true → écoute sur toutes les interfaces (utile en conteneur)
     - HMR : auto
     - Proxy : toutes les routes /api/** vers Django (8000)
  ----------------------------------------------------------- */
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        // Pas de rewrite ; on laisse /api/... tel quel
        // Si tu déplaces l'API sur /, active au besoin :
        // rewrite: path => path.replace(/^\/api/, "")
      },
    },
  },
});
