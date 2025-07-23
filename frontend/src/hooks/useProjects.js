// src/hooks/useProjects.js
import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   Hook useProjects : charge la liste des projets
   ------------------------------------------------------------------ */
export function useProjects(token, pollEveryMs = 0) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const timerRef = useRef(null);

  const fetchProjects = async (signal) => {
    if (!token) return;
    try {
      const res = await fetch("/api/projects", {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProjects(await res.json());
    } catch (err) {
      if (err.name !== "AbortError")
        console.error("fetch /api/projects :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset si déconnexion
    if (!token) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const ctl = new AbortController();
    fetchProjects(ctl.signal);                 // premier chargement

    // polling optionnel
    if (pollEveryMs > 0) {
      timerRef.current = setInterval(
        () => fetchProjects(ctl.signal),
        pollEveryMs
      );
    }
    return () => {
      ctl.abort();
      clearInterval(timerRef.current);
    };
  }, [token, pollEveryMs]);

  // expose setProjects pour mise à jour optimiste
  return { projects, loading, setProjects };
}

/* ------------------------------------------------------------------
   createProject : POST /api/projects
   ------------------------------------------------------------------ */
export async function createProject(
  token,
  { name, repo = null, env = "dev" }
) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, repo, env }),
  });

  if (!res.ok) {
    const msg = res.status === 401 ? "JWT expiré" : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();           // retourne le projet créé
}
