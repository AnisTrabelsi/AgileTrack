/**
 * Composant ProjectCard
 * ---------------------
 * Affiche :
 *   • le nom du projet
 *   • l’URL du dépôt (ou toute métadonnée texte)
 *   • l’environnement cible (prod / dev / staging…)
 *
 * Props
 * -----
 * @param {string} name  Nom lisible du projet
 * @param {string} repo  URL ou chemin du dépôt Git
 * @param {string} env   Environnement (« prod », « dev », etc.)
 */
export default function ProjectCard({ name, repo, env }) {
  return (
    /* Conteneur avec la classe utilitaire .card (définie dans index.css) */
    <div className="card">
      {/* Titre du projet */}
      <h3 className="font-semibold mb-1">{name}</h3>

      {/* URL du dépôt – nuance de gris pour le visuel */}
      <p className="text-sm text-gray-500">{repo}</p>

      {/* Badge d’environnement en bas : couleur indigo clair */}
      <span className="mt-2 inline-block bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
        {env}
      </span>
    </div>
  );
}
