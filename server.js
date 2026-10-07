// Payso Social Style — small Express server for Railway.
// Storage: Postgres when DATABASE_URL is set (Railway), otherwise a local JSON file.
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { QUESTIONS, score } = require("./public/questions.js");

const PORT = process.env.PORT || 3000;
const ACCESS_CODE = (process.env.ACCESS_CODE || "").trim(); // optional shared passcode for the team
const TEAMS = ["sales", "marketing"];
const ID_RE = /^[0-9a-f-]{36}$/i;

// ---------- storage ----------
function fileStore() {
  const file = process.env.DATA_FILE || path.join(__dirname, "data", "results.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const load = () => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return {}; } };
  return {
    async init() {},
    async list() { return Object.values(load()); },
    async upsert(row) {
      const all = load(); all[row.id] = row;
      fs.writeFileSync(file + ".tmp", JSON.stringify(all, null, 2));
      fs.renameSync(file + ".tmp", file);
    },
  };
}

function pgStore() {
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  return {
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, team TEXT NOT NULL,
        a INT NOT NULL, r INT NOT NULL, style TEXT NOT NULL,
        answers JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    },
    async list() {
      const { rows } = await pool.query(
        "SELECT id, name, team, a, r, style, answers, updated_at AS \"updatedAt\" FROM results ORDER BY updated_at");
      return rows;
    },
    async upsert(x) {
      await pool.query(
        `INSERT INTO results (id, name, team, a, r, style, answers, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,now())
         ON CONFLICT (id) DO UPDATE SET name=$2, team=$3, a=$4, r=$5, style=$6, answers=$7, updated_at=now()`,
        [x.id, x.name, x.team, x.a, x.r, x.style, JSON.stringify(x.answers)]);
    },
  };
}

const store = process.env.DATABASE_URL ? pgStore() : fileStore();

// ---------- app ----------
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// passcode check for every other /api route
app.use("/api", (req, res, next) => {
  if (!ACCESS_CODE) return next();
  const given = String(req.get("x-access-code") || "");
  const ok = given.length === ACCESS_CODE.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(ACCESS_CODE));
  return ok ? next() : res.status(401).json({ error: "access_code" });
});

app.get("/api/config", (_req, res) => res.json({ ok: true }));

// Everyone sees name, team and position. Individual answers stay on the server.
app.get("/api/results", async (_req, res, next) => {
  try {
    const rows = await store.list();
    res.json(rows.map(({ id, name, team, a, r, style, updatedAt }) => ({ id, name, team, a, r, style, updatedAt })));
  } catch (e) { next(e); }
});

// The browser's own row, including answers, so a retake can start pre-filled.
app.get("/api/results/:id", async (req, res, next) => {
  try {
    if (!ID_RE.test(req.params.id)) return res.status(400).json({ error: "bad_id" });
    const row = (await store.list()).find(x => x.id === req.params.id);
    return row ? res.json(row) : res.status(404).json({ error: "not_found" });
  } catch (e) { next(e); }
});

app.put("/api/results/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const name = String((req.body || {}).name || "").trim().slice(0, 40);
    const team = (req.body || {}).team;
    const answers = (req.body || {}).answers;
    if (!ID_RE.test(id)) return res.status(400).json({ error: "bad_id" });
    if (!name) return res.status(400).json({ error: "name_required" });
    if (!TEAMS.includes(team)) return res.status(400).json({ error: "bad_team" });
    if (!Array.isArray(answers) || answers.length !== QUESTIONS.length ||
        !answers.every(v => Number.isInteger(v) && v >= 1 && v <= 4)) {
      return res.status(400).json({ error: "bad_answers" });
    }
    const s = score(answers); // scored on the server, never trusted from the client
    const row = { id, name, team, answers, ...s, updatedAt: new Date().toISOString() };
    await store.upsert(row);
    res.json(row);
  } catch (e) { next(e); }
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

store.init()
  .then(() => app.listen(PORT, () =>
    console.log(`Social Style running on :${PORT} (${process.env.DATABASE_URL ? "postgres" : "json file"}${ACCESS_CODE ? ", passcode on" : ""})`)))
  .catch(e => { console.error("Storage init failed:", e); process.exit(1); });
