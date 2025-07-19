import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";

/**
 * Dashboard principal :
 * - liste de projets (données factices pour l’instant)
 * - liste de tâches CI/CD (données factices)
 */
export default function Dashboard() {
  /* -----------------------------
     Données simulées (mock)
     — à remplacer plus tard par
     des appels API fetch/axios
  ----------------------------- */
  const projects = [
    {
      id: 1,
      name: "API Gateway",
      repo: "github.com/acme/gateway",
      env: "prod",
    },
    {
      id: 2,
      name: "Metrics",
      repo: "github.com/acme/metrics",
      env: "dev",
    },
  ];

  const tasks = [
    { id: "a1b2c3d4", status: "queued" },
    { id: "e5f6g7h8", status: "done" },
  ];

  /* -----------------------------
     Rendu
  ----------------------------- */
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Bloc Projets */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Projets</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* Bloc Tâches CI/CD */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Tâches CI/CD</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tasks.map((t) => (
            <TaskCard key={t.id} {...t} />
          ))}
        </div>
      </section>
    </div>
  );
}
