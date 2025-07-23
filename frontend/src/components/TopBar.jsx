import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function TopBar() {
  const { logout } = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between px-6 py-4 mb-6 bg-gray-800 rounded-2xl shadow">
      <h1 className="text-2xl font-bold text-white">DevOpsTrack</h1>

      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
      >
        Déconnexion
      </button>
    </header>
  );
}
