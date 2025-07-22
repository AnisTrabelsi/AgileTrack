import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";

export default function Dashboard() {
  /* -----------------------------------------------------------
     Contexte JWT
  ----------------------------------------------------------- */
  const { token, logout } = useContext(AuthContext);

  /* -----------------------------------------------------------
     États locaux
  ----------------------------------------------------------- */
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingProj, setLoadingProj] = useState(true);

  /* -----------------------------------------------------------
     Helper générique d'appel API
  ----------------------------------------------------------- */
  const apiFetch = (url, signal) =>
    fetch(url, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      if (r.status === 401) logout();     // token expiré
      if (!r.ok) return Promise.reject();
      return r.json();
    });

  /* -----------------------------------------------------------
     Charger les projets au montage
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;
    const ctl = new AbortController();

    apiFetch("/api/projects", ctl.signal)
      .then(setProjects)
      .catch(() => console.error("Impossible de charger les projets"))
      .finally(() => setLoadingProj(false));

    return () => ctl.abort();
  }, [token]);

  /* -----------------------------------------------------------
     Charger les tâches et poller toutes les 3 s
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const ctl = new AbortController();
    const load = () =>
      apiFetch("/api/tasks", ctl.signal)
        .then(setTasks)
        .catch(() => console.error("Impossible de charger les tâches"));

    load();                                // appel initial
    const id = setInterval(load, 3000);    // polling 3 s
    return () => {
      ctl.abort();
      clearInterval(id);
    };
  }, [token]);

  /* -----------------------------------------------------------
     Rendu
  ----------------------------------------------------------- */
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
              <p className="text-sm text-gray-500">
                Aucun projet pour l’instant.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ----------- Tâches CI/CD ----------- */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Tâches CI/CD</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tasks.map((t) => (
            <TaskCard key={t.id} {...t} />
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-gray-500">
              Aucune tâche en cours. Lance un build pour commencer !
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
