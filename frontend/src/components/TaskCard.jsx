/**
 * Carte affichant une tâche CI/CD.
 * @param {string} id     - Identifiant unique de la tâche.
 * @param {string} status - État courant : "queued" | "running" | "done" | "failed".
 */
export default function TaskCard({ id, status }) {
  // Couleur du badge selon le statut
  const badge =
    status === "done"
      ? "bg-green-100 text-green-700"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"; // queued ou running

  return (
    <div className="card flex justify-between items-center">
      <span className="font-mono text-sm">#{id.slice(0, 8)}</span>
      <span className={`text-xs px-2 py-1 rounded ${badge}`}>{status}</span>
    </div>
  );
}
