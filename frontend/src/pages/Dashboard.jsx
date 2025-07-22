import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import { useTasks, createTask } from "../hooks/useTasks"; // ← le fichier doit être dans  src/hooks/useTasks.js

/**
 * Tableau de bord : projets + tâches CI/CD en temps réel.
 */
export default function Dashboard() {
  /* ---------------------- Auth ---------------------- */
  const { token, logout } = useContext(AuthContext);

  /* -------------------- Projets --------------------- */
  const [projects, setProjects] = useState([]);
  const [loadingProj, setLoadingProj] = useState(true);

  /** Appel générique protégé */
  const apiFetch = (url, signal) =>
    fetch(url, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      if (r.status === 401) logout();          // JWT expiré
      if (!r.ok) throw new Error();            // autre erreur
      return r.json();
    });

  /* Charge les projets une fois connecté */
  useEffect(() => {
    if (!token) return;
    const ctl = new AbortController();

    apiFetch("/api/projects", ctl.signal)
      .then(setProjects)
      .catch(() => console.error("Impossible de charger les projets"))
      .finally(() => setLoadingProj(false));

    return () => ctl.abort();
  }, [token]);

  /* --------------------- Tâches --------------------- */
  // Hook personnalisé : polling 3 s
  const { tasks, loading: loadingTasks } = useTasks(token);

  /* Crée une tâche manuellement (bouton +) */
  const handleNewTask = async () => {
    try {
      await createTask(token); // le polling détecte la nouvelle tâche
    } catch (err) {
      alert("Erreur lors de la création de tâche");
    }
  };

  /* ---------------------- UI ------------------------ */
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* ----------- Projets ----------- */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Projets</h2>
        {loadingProj ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id ?? p.id} {...p} />
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-500">Aucun projet pour l’instant.</p>
            )}
          </div>
        )}
      </section>

      {/* ----------- Tâches CI/CD ----------- */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Tâches CI/CD</h2>
          <button className="btn" onClick={handleNewTask}>
            + Nouvelle tâche
          </button>
        </div>

        {loadingTasks ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t.id} {...t} />
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-gray-500">
                Aucune tâche en cours. Clique sur « Nouvelle tâche ».
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
