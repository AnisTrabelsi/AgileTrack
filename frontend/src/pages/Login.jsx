import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);

  // username plutôt que email, Django n'exige pas d'@
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* -----------------------------------------------------------
     Soumission du formulaire
  ----------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // distinguer réseau (fetch) de 400/401 côté API
        const msg =
          res.status === 400 || res.status === 401
            ? "Nom d’utilisateur ou mot de passe incorrect"
            : `Erreur serveur (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json(); // { access, refresh }
      login(data.access);            // stocke le JWT
      navigate("/");                 // redirige vers le dashboard
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "API injoignable" : err.message);
    }
  };

  /* -----------------------------------------------------------
     Interface
  ----------------------------------------------------------- */
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-80"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">Connexion</h1>

        {error && (
          <p className="mb-3 text-sm text-red-600 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Nom d’utilisateur"
          className="input mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn w-full" type="submit">
          Se connecter
        </button>
      </form>
    </div>
  );
}
