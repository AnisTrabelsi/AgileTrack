/* src/main.jsx
   ──────────────────────────────────────────────────────────────────────────
   Point d’entrée React :
   • Monte l’application dans la <div id="root"> du index.html
   • Fournit le contexte d’authentification à tout l’arbre
   • Configure le routing côté client avec react‑router‑dom
   ────────────────────────────────────────────────────────────────────────── */

import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ---------- Contexte Auth (token, user, login, logout) ------------------ */
import { AuthProvider, AuthContext } from "./context/AuthContext";

/* ---------- Pages ------------------------------------------------------- */
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";

/* ---------- Styles globaux --------------------------------------------- */
import "./index.css";          // Tailwind + éventuels overrides


/* =========================================================================
   <Private> – Garde de route
   • Si le token est présent ⇒ rend les enfants (page protégée)
   • Sinon                      ⇒ redirige vers /login
   ====================================================================== */
function Private({ children }) {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate replace to="/login" />;
}


/* =========================================================================
   Hydratation :
   <AuthProvider>  – Expose le contexte Auth à toute l’app
   <BrowserRouter> – Historique HTML5 (routing « single‑page »)
   <Routes>        – Déclare les routes :
       • /login  → <Login>
       • /       → <Dashboard>                 (protégé)
       • *       → redirige vers /             (catch‑all 404)
   ====================================================================== */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- Page de connexion (publique) ---------- */}
          <Route path="/login" element={<Login />} />

          {/* ---------- Tableau de bord (privé) --------------- */}
          <Route
            path="/"
            element={
              <Private>
                <Dashboard />
              </Private>
            }
          />

          {/* ---------- Catch‑all : toute autre URL = / ------- */}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
