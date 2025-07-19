/**
 * Page Login
 * ----------
 * Formulaire d’authentification basique.
 * • récupère e‑mail et mot de passe
 * • appelle la fonction `login()` du contexte
 * • redirige vers la racine “/” après succès
 *
 * ⚠️  Pour l’instant, l’appel API est fictif ; on injecte un JWT bidon.
 *     Quand l’Auth‑Service Django sera opérationnel,
 *     il suffira de remplacer le bloc `fakeJwt` par un fetch POST /api/auth/login.
 */

import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  /* -------------------------------------------------------------
     1. Hooks & contexte
  --------------------------------------------------------------*/
  const { login } = useContext(AuthContext); // méthode pour stocker le JWT
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();            // pour rediriger après login

  /* -------------------------------------------------------------
     2. Soumission du formulaire
        – bloque le reload
        – injecte un JWT factice
        – redirige vers "/"
  --------------------------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO : remplacer par fetch('/api/auth/login', { email, password })
    const fakeJwt = "dummy-token";
    login(fakeJwt);
    navigate("/");
  };

  /* -------------------------------------------------------------
     3. Rendu JSX – formulaire centré
  --------------------------------------------------------------*/
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-80"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">Connexion</h1>

        {/* Champ e-mail */}
        <input
          type="email"
          placeholder="E‑mail"
          className="input w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Champ mot de passe */}
        <input
          type="password"
          placeholder="Mot de passe"
          className="input w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Bouton soumettre */}
        <button className="btn w-full" type="submit">
          Se connecter
        </button>
      </form>
    </div>
  );
}
