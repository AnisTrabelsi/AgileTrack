import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    /* appel fictif pour l'instant */
    const fakeJwt = "dummy-token";
    login(fakeJwt);
    navigate("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-80">
        <h1 className="text-2xl font-semibold mb-4 text-center">Connexion</h1>
        <input
          type="email" placeholder="E‑mail"
          className="input w-full mb-3"
          value={email} onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password" placeholder="Mot de passe"
          className="input w-full mb-4"
          value={password} onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="btn w-full" type="submit">Se connecter</button>
      </form>
    </div>
  );
}
