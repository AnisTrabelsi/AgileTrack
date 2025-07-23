// src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext }   from "../context/AuthContext";
import { useTasks, createTask }   from "../hooks/useTasks";
import { useProjects, createProject } from "../hooks/useProjects";

import NavBar       from "../components/NavBar";
import ProjectCard  from "../components/ProjectCard";
import TaskCard     from "../components/TaskCard";
import NewProjectForm from "../components/NewProjectForm";

/* ------------------------------------------------------------------ */
/*  Tableau de bord (pages protégée)                                   */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  /* ---------- Auth ---------- */
  const { token, logout } = useContext(AuthContext);

  /* ---------- Projets ---------- */
  // hook réutilisable avec rafraîchissement manuel (pas de polling ici)
  const { projects, loading, setProjects } = useProjects(token);
  const [showForm, setShowForm] = useState(false);

  // Création de projet
  const handleCreateProject = async (payload) => {
    try {
      const proj = await createProject(token, payload);
      // mise à jour optimiste
      setProjects((prev) => [...prev, proj]);
      setShowForm(false);
    } catch {
      alert("Erreur lors de la création du projet");
    }
  };

  /* ---------- Tâches ---------- */
  const { tasks, loading: loadingTasks } = useTasks(token);

  const handleNewTask = async () => {
    try {
      await createTask(token);
    } catch {
      alert("Erreur lors de la création de tâche");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-8">
      {/* barre du haut */}
      <NavBar />

      {/* --- Projets --- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projets</h2>
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            + Nouveau projet
          </button>
        </div>

        {showForm && (
          <NewProjectForm
            onCreate={handleCreateProject}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-500">
                Aucun projet pour l’instant.
              </p>
            )}
          </div>
        )}
      </section>

      {/* --- Tâches --- */}
      <section className="mt-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tâches CI/CD</h2>
          <button className="btn" onClick={handleNewTask}>
            + Nouvelle tâche
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
