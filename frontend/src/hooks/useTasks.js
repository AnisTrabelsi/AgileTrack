import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const POLL_EVERY_MS = 3_000;

/**
 * Récupère et rafraîchit la liste des tâches CI/CD.
 * Retourne { tasks, loading }.
 */
export function useTasks(token) {
  const { logout } = useContext(AuthContext);   // pour déconnexion auto
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  /* GET /api/tasks -------------------------------------------------- */
  const fetchTasks = async (signal) => {
    if (!token) return;

    try {
      const res = await fetch("/api/tasks", {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {        // JWT expiré ou invalide
        logout();                      // vide le contexte + localStorage
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setTasks(await res.json());
    } catch (err) {
      if (err.name !== "AbortError")
        console.error("fetch /api/tasks :", err);
    } finally {
      setLoading(false);
    }
  };

  /* Effet : première charge + polling ------------------------------ */
  useEffect(() => {
    if (!token) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ctl = new AbortController();
    fetchTasks(ctl.signal);                              // appel initial

    pollRef.current = setInterval(
      () => fetchTasks(ctl.signal),
      POLL_EVERY_MS,
    );

    return () => {
      ctl.abort();
      clearInterval(pollRef.current);
    };
  }, [token]);

  return { tasks, loading };
}

/* POST /api/tasks --------------------------------------------------- */
export async function createTask(token, title = "build") {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (res.status === 401) throw new Error("JWT expiré");
  if (!res.ok)          throw new Error(`HTTP ${res.status}`);

  return res.json();
}
