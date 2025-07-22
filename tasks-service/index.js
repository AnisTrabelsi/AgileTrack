// tasks-service/index.js
import express from "express";
import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

/* ------------------------------------------------------------------ */
/*  Configuration via variables d’environnement                        */
/* ------------------------------------------------------------------ */
const {
  PORT = 8002,
  REDIS_URL = "redis://tasks-redis:6379",
  JWT_SECRET = "dev-secret",
} = process.env;

const redis = new Redis(REDIS_URL);
const app = express();
app.use(express.json());

/* ------------------------------------------------------------------ */
/*  Middleware JWT (Authorization: Bearer <token>)                     */
/* ------------------------------------------------------------------ */
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token manquant" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET); // { id, email, … }
    return next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

/* ------------------------------------------------------------------ */
/*  Routes API                                                         */
/* ------------------------------------------------------------------ */

// POST /api/tasks  → crée une tâche pour l’utilisateur connecté
app.post("/api/tasks", authenticate, async (req, res) => {
  const { title = "build" } = req.body;

  const task = {
    id: uuid(),
    user: req.user.id,
    title,
    status: "queued",
    ts: Date.now(),
  };

  await redis.lpush(`tasks:${req.user.id}`, JSON.stringify(task));
  res.status(201).json(task);

  // Simule la fin du job après 10 s
  setTimeout(async () => {
    task.status = "done";
    await redis.lset(`tasks:${req.user.id}`, 0, JSON.stringify(task));
  }, 10_000);
});

// GET /api/tasks  → liste des tâches de l’utilisateur connecté
app.get("/api/tasks", authenticate, async (req, res) => {
  const raw = await redis.lrange(`tasks:${req.user.id}`, 0, -1);
  res.json(raw.map(JSON.parse));
});

// Healthcheck (pour le depends_on)
app.get("/health", (_, res) => res.send("OK"));

/* ------------------------------------------------------------------ */
/*  Lancement serveur                                                  */
/* ------------------------------------------------------------------ */
app.listen(PORT, () =>
  console.log(`Tasks‑service prêt sur http://0.0.0.0:${PORT}`)
);
