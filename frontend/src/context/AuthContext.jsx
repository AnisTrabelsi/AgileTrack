// AuthContext.jsx
// --------------------------------------------------------------
// Contexte d’authentification global : fournit le JWT et l’utilisateur
// aux composants React via le Context API.
// --------------------------------------------------------------

import { createContext, useState, useEffect } from "react";

// Création du contexte (exporté pour être consommé via useContext)
export const AuthContext = createContext();

// Provider : englobe <App /> dans main.jsx pour donner
// accès à `token`, `user`, `login`, `logout`.
export function AuthProvider({ children }) {
  // Récupère le token persisté dans localStorage au premier rendu
  const [token, setToken] = useState(() => localStorage.getItem("jwt"));
  // Le profil utilisateur (sera rempli après appel /me)
  const [user, setUser] = useState(null);

  /* -----------------------------------------------------------
     Fonctions de mutateur
  ----------------------------------------------------------- */

  // Stocke le JWT en localStorage et dans le state React
  const login = (jwt) => {
    localStorage.setItem("jwt", jwt);
    setToken(jwt);
  };

  // Supprime le JWT et réinitialise le contexte
  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
  };

  /* -----------------------------------------------------------
     Effet : si `token` change -> charger /me pour récupérer
     les infos utilisateur (non implémenté ici)
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;      // pas connecté
    // TODO : fetch("/api/auth/me") puis setUser(response.data)
  }, [token]);

  /* -----------------------------------------------------------
     Rendu : expose les valeurs via <AuthContext.Provider>
  ----------------------------------------------------------- */
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
