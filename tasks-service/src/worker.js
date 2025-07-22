// tasks-service/src/worker.js
import Redis from "ioredis";

const {
  REDIS_URL = "redis://tasks-redis:6379",
  SLEEP_MS  = 4000,                      // durée simulée d’un build
} = process.env;

/* ----------------------- Redis ------------------------ */
const redis = new Redis(REDIS_URL);
redis.on("error", (err) => console.error("Redis :", err.message));

/* ------------------ Helpers --------------------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------ Boucle principale ----------------- */
async function main() {
  console.log("🔧 worker démarré – en attente de tâches…");

  while (true) {
    try {
      /* 1️⃣ Attend la prochaine tâche dans la file */
      const [, taskId] = await redis.blpop("tasks:queue", 0); // 0 = blocage infini
      console.log(`➡️  Tâche récupérée : ${taskId}`);

      const key = `task:${taskId}`;
      const raw = await redis.get(key);
      if (!raw) continue;                                  // tâche introuvable

      const task = JSON.parse(raw);

      /* 2️⃣ Status → running */
      task.status    = "running";
      task.startedAt = Date.now();
      await redis.set(key, JSON.stringify(task));

      /* 3️⃣ Simulation du job */
      await sleep(Number(SLEEP_MS));

      /* 4️⃣ Status final (90 % success) */
      const success  = Math.random() < 0.9;
      task.status    = success ? "done" : "failed";
      task.finishedAt = Date.now();
      await redis.set(key, JSON.stringify(task));

      console.log(`✅  Tâche ${taskId} ${task.status}`);
    } catch (err) {
      console.error("Worker :", err);
      await sleep(1000); // petit back‑off avant de réessayer
    }
  }
}

main();
