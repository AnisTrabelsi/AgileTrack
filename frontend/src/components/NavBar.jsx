// src/components/NavBar.jsx
//--------------------------------------------------------------
// Barre d’en‑tête toujours affichée dans la partie protégée
// • Affiche le nom (si dispo) ou « Connecté »
// • Bouton “Déconnexion” qui vide le contexte et redirige vers /login
//--------------------------------------------------------------

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // vide le token + profil
    navigate("/login");  // retour écran de connexion
  };

  return (
    <header className="mb-6 flex items-center justify-between border-b pb-3">
      {/* Profil */}
      <span className="font-medium">
        {user?.username ?? "Connecté"}
      </span>

      {/* Bouton déconnexion */}
      <button
        type="button"
        onClick={handleLogout}
        className="btn"              /* classe utilitaire déjà utilisée */
      >
        Déconnexion
      </button>
    </header>
  );
}
