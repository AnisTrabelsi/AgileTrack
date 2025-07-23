// src/context/AuthContext.jsx
// ───────────────────────────────────────────────────────────────
// Contexte d’authentification global : met à disposition
//   • token   – JWT Bearer
//   • user    – profil (facultatif)
//   • login   – stocke le token
//   • logout  – efface tout
// ───────────────────────────────────────────────────────────────

import { createContext, useState, useEffect } from "react";

/* -----------------------------------------------------------
   Création du contexte
----------------------------------------------------------- */
export const AuthContext = createContext(null);

/* -----------------------------------------------------------
   Provider : englobe toute l’app (main.jsx)
----------------------------------------------------------- */
export function AuthProvider({ children }) {
  /* ---------- États ---------- */
  // 1) JWT persistant
  const [token, setToken] = useState(() => localStorage.getItem("jwt"));
  // 2) Profil utilisateur (optionnel)
  const [user , setUser ] = useState(null);

  /* ---------- Actions ---------- */
  /** Connexion : enregistre le JWT et le met en mémoire. */
  const login = (jwt) => {
    localStorage.setItem("jwt", jwt);
    setToken(jwt);
  };

  /** Déconnexion : vide le stockage + réinitialise le contexte. */
  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
  };

  /* ---------- Effet : charge /me quand le token change ---------- */
  useEffect(() => {
    if (!token) return;                        // pas connecté -> rien à faire

    const controller = new AbortController();

    fetch("/api/auth/me", {
      signal : controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        // Token expiré → on force le logout
        if (res.status === 401) return logout();
        // Route non encore implémentée → on ignore (pas de console.error)
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((profil) => {
        if (profil) setUser(profil);
      })
      .catch((err) => {
        // On ignore les cancellations ; on log les vraies erreurs
        if (err.name !== "AbortError") {
          console.error("Erreur /api/auth/me :", err);
        }
      });

    return () => controller.abort();           // nettoyage si unmount
  }, [token]);

  /* ---------- Exposition du contexte ---------- */
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
