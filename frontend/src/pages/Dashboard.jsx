import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  // 🔐 Stocker le token JWT (peut aussi venir d'un contexte global)
  const [token, setToken] = useState("");

  // 📦 Liste des projets à afficher (sera remplie avec un appel API)
  const [projects, setProjects] = useState([]);

  // 🛠️ Données factices pour les tâches CI/CD
  const tasks = [
    { id: "a1b2c3d4", status: "queued" },
    { id: "e5f6g7h8", status: "done" },
  ];

  // 📡 Appel API au chargement du composant pour récupérer les projets
  useEffect(() => {
    const jwt = localStorage.getItem("token"); // récupération du token JWT depuis le localStorage
    setToken(jwt); // mise à jour du state local

    if (!jwt) return; // si pas de token, ne rien faire

    // Appel à l'API protégée
    fetch("/api/projects", {
      headers: {
        Authorization: `Bearer ${jwt}`, // envoi du token dans le header
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des projets");
        return res.json(); // conversion en JSON
      })
      .then((data) => setProjects(data)) // mise à jour de la liste des projets
      .catch((err) => console.error(err)); // gestion des erreurs
  }, []);

  // 🧱 Rendu principal du tableau de bord
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Bloc Projets */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Projets</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Affichage dynamique des projets avec ProjectCard */}
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* Bloc Tâches CI/CD */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Tâches CI/CD</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Affichage statique des tâches */}
          {tasks.map((t) => (
            <TaskCard key={t.id} {...t} />
          ))}
        </div>
      </section>
    </div>
  );
}
