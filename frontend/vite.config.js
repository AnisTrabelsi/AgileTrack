import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  /* -----------------------------------------------------------
     Configuration du serveur de développement
     - Port 5173 (par défaut)
     - Proxy : /api -> Django (port 8000)
  ----------------------------------------------------------- */
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        // réécrit /api/auth/... -> /api/auth/... (pas de suppression du préfixe)
        // si ton gateway utilise un autre chemin, adapte `rewrite`.
      },
    },
  },
});
