import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="btn" onClick={logout}>Déconnexion</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">📦 Projets : 0</div>
        <div className="card">⚙️ Tâches en file : 0</div>
      </div>
    </div>
  );
}
