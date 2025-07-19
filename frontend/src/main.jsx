// main.jsx ----------------------------------------------------------
// Point d’entrée React : monte l’application dans la div #root
// et configure le routing + le contexte d’authentification.
// ------------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Contexte d’authentification (token, login, logout…)
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Styles globaux (Tailwind + overrides perso)
import "./index.css";

/* ------------------------------------------------------------------
   Composant <Private>
   - Si le token existe ➜ affiche les enfants
   - Sinon ➜ redirige vers /login
-------------------------------------------------------------------*/
const Private = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

/* ------------------------------------------------------------------
   Hydratation de l’app React
   <AuthProvider>  – expose le contexte auth à tout l’arbre
   <BrowserRouter> – gère l’historique HTML5
   <Routes>/<Route>– définit les chemins :
     • /login  ➜  <Login>
     • /       ➜  <Dashboard> protégé par <Private>
-------------------------------------------------------------------*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Private>
              <Dashboard />
            </Private>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
