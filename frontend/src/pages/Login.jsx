import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({
          username: email, // Django s’attend à « username »
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Identifiants invalides");
      }

      const data = await res.json();       // { access, refresh }
      login(data.access);                  // stocke le JWT dans le contexte
      navigate("/");                       // redirige vers le dashboard
    } catch (err) {
      setError(err.message);
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
          type="email"
          placeholder="E‑mail"
          className="input mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
