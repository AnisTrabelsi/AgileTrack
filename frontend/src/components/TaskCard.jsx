/**
 * Composant TaskCard
 * -------------------
 * Affiche une tâche CI/CD avec :
 *  - son identifiant tronqué (8 premiers caractères)
 *  - un badge de couleur indiquant le statut
 *
 * Props
 * -----
 * @param {string} id     Identifiant unique de la tâche
 * @param {string} status État actuel : "queued" | "running" | "done" | "failed"
 */
export default function TaskCard({ id, status }) {
  /* -------------------------------------------------------------
     1. Déterminer la couleur du badge en fonction du statut
        - done    → vert
        - failed  → rouge
        - running / queued → jaune
  --------------------------------------------------------------*/
  const badge =
    status === "done"
      ? "bg-green-100 text-green-700"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"; // running ou queued

  /* -------------------------------------------------------------
     2. Rendu
        - conteneur card (classe utilitaire Tailwind)
        - identifiant monospace
        - badge coloré
  --------------------------------------------------------------*/
  return (
    <div className="card flex justify-between items-center">
      {/* Identifiant : on affiche seulement les 8 premiers caractères */}
      <span className="font-mono text-sm">#{id.slice(0, 8)}</span>

      {/* Badge de statut */}
      <span className={`text-xs px-2 py-1 rounded ${badge}`}>{status}</span>
    </div>
  );
}
