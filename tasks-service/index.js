const express = require("express");
const Redis = require("ioredis");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");

const redis = new Redis({
  host: "tasks-redis",
  port: 6379,
});

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "dev-secret";

// Middleware pour authentifier via JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Endpoint pour ajouter une tâche
app.post("/tasks", authenticate, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });

  const task = {
    id: uuid(),
    user: req.user.id,
    title,
    done: false,
  };

  await redis.lpush(`tasks:${req.user.id}`, JSON.stringify(task));
  res.status(201).json(task);
});

// Endpoint pour lister les tâches
app.get("/tasks", authenticate, async (req, res) => {
  const tasks = await redis.lrange(`tasks:${req.user.id}`, 0, -1);
  res.json(tasks.map(JSON.parse));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tasks service running on port ${PORT}`);
});
