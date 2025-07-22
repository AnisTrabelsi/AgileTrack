// src/hooks/useTasks.js
import { useEffect, useState, useRef } from "react";

/**
 * Hook personnalisé : récupère la liste des tâches CI/CD
 * et la rafraîchit toutes les 3 secondes.
 *
 * @param {string} token  – JWT Bearer (peut venir du AuthContext)
 * @returns {{ tasks: Array, loading: boolean }}
 */
export function useTasks(token) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  /** Appel API ---------------------------------------------------- */
  const fetchTasks = async (signal) => {
    if (!token) return; // pas d’utilisateur → pas d’appel

    try {
      const r = await fetch("/api/tasks", {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setTasks(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Erreur fetch /api/tasks:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /** Effet: charge puis poll toutes les 3 s ----------------------- */
  useEffect(() => {
    // Annule la requête si le composant se démonte avant la réponse
    const controller = new AbortController();
    fetchTasks(controller.signal);

    // Polling
    timerRef.current = setInterval(() => fetchTasks(controller.signal), 3000);

    // Nettoyage
    return () => {
      controller.abort();
      clearInterval(timerRef.current);
    };
  }, [token]); // redémarre le polling si le token change

  return { tasks, loading };
}
