import express from "express";
import Redis   from "ioredis";
import { v4 as uuid } from "uuid";
import jwt     from "jsonwebtoken";

const {
  PORT       = 8002,
  REDIS_URL  = "redis://tasks-redis:6379",
  JWT_SECRET = "super-secret-dev-key", // même clé que Django
} = process.env;

/* ---------- Redis ---------- */
const redis = new Redis(REDIS_URL);
redis.on("error", (err) => console.error("Redis :", err.message));

/* ---------- Express -------- */
const app = express();
app.use(express.json());

/* ---------- JWT middleware ---------- */
function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);           // HS256
    req.user      = decoded;                                 // token complet
    req.userId    = decoded.user_id ?? decoded.id ?? decoded.sub;
    if (!req.userId) return res.sendStatus(401);
    next();
  } catch {
    return res.sendStatus(401);
  }
}

/* ---------- API ---------- */

/* ➊ POST /api/tasks – crée une tâche */
app.post("/api/tasks", auth, async (req, res) => {
  const task = {
    id:   uuid(),
    user: req.userId,
    title: (req.body?.title || "build").trim(),
    status: "queued",
    createdAt: Date.now(),
  };

  await redis
    .multi()
    .set(`task:${task.id}`, JSON.stringify(task))
    .rpush("tasks:queue", task.id)
    .rpush(`tasks:user:${req.userId}`, task.id)
    .exec();

  res.status(201).json(task);
});

/* ➋ GET /api/tasks – liste les tâches de l’utilisateur */
app.get("/api/tasks", auth, async (req, res) => {
  const ids  = await redis.lrange(`tasks:user:${req.userId}`, 0, -1);
  const raws = ids.length ? await redis.mget(ids.map((id) => `task:${id}`)) : [];
  res.json(raws.filter(Boolean).map(JSON.parse));
});

/* ➌ /health – readiness probe */
app.get("/health", (_req, res) => res.send("OK"));

app.listen(PORT, () => console.log(`tasks‑service API on :${PORT}`));
