// Payso Social Style — Express app.
// Railway / local: `npm start` runs it as a normal server that also serves public/.
// (It also exports the app, so it can run on Vercel unchanged.)
// Storage: Postgres when DATABASE_URL is set (Railway Postgres), otherwise a local JSON file.
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { QUESTIONS, score } = require("./public/questions.js");

const ACCESS_CODE = (process.env.ACCESS_CODE || "").trim(); // optional shared passcode for the team
const TEAMS = ["sales", "marketing"];
const ID_RE = /^[0-9a-f-]{36}$/i;

// ---------- storage ----------
function fileStore() {
  const file = process.env.DATA_FILE || path.join(__dirname, "data", "results.json");
  const load = () => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return {}; } };
  return {
    async init() { fs.mkdirSync(path.dirname(file), { recursive: true }); },
    async list() { return Object.values(load()); },
    async get(id) { return load()[id] || null; },
    async upsert(row) {
      const all = load(); all[row.id] = row;
      fs.writeFileSync(file + ".tmp", JSON.stringify(all, null, 2));
      fs.renameSync(file + ".tmp", file);
    },
  };
}

function pgStore(url) {
  const { Pool } = require("pg");
  // No SSL for local or Railway's private network (*.railway.internal); SSL for public/hosted URLs.
  // Override with PGSSL=true / PGSSL=false.
  let host = ""; try { host = new URL(url).hostname; } catch {}
  const privateNet = /^(localhost|127\.0\.0\.1)$/.test(host) || host.endsWith(".railway.internal");
  const useSsl = process.env.PGSSL ? process.env.PGSSL === "true" : !privateNet;
  const pool = new Pool({ connectionString: url, max: 5, ssl: useSsl ? { rejectUnauthorized: false } : false });
  const cols = 'id, name, team, a, r, style, answers, updated_at AS "updatedAt"';
  return {
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, team TEXT NOT NULL,
        a INT NOT NULL, r INT NOT NULL, style TEXT NOT NULL,
        answers JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    },
    async list() { return (await pool.query(`SELECT ${cols} FROM results ORDER BY updated_at`)).rows; },
    async get(id) { return (await pool.query(`SELECT ${cols} FROM results WHERE id = $1`, [id])).rows[0] || null; },
    async upsert(x) {
      await pool.query(
        `INSERT INTO results (id, name, team, a, r, style, answers, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,now())
         ON CONFLICT (id) DO UPDATE SET name=$2, team=$3, a=$4, r=$5, style=$6, answers=$7, updated_at=now()`,
        [x.id, x.name, x.team, x.a, x.r, x.style, JSON.stringify(x.answers)]);
    },
  };
}

// Accept DATABASE_URL / POSTGRES_URL, or the same names with a prefix added when the
// database was connected in Vercel (e.g. STORAGE_DATABASE_URL). Pooled URLs win over unpooled.
const DB_ENV =
  Object.keys(process.env)
    .filter(k => /(^|_)(DATABASE_URL|POSTGRES_URL)$/.test(k) && process.env[k])
    .sort((a, b) => (a === "DATABASE_URL" ? -1 : b === "DATABASE_URL" ? 1 : a.length - b.length))[0] || null;
const DB_URL = DB_ENV ? process.env[DB_ENV] : "";
// On Vercel the disk is read-only, so a database is required there.
const store = DB_URL ? pgStore(DB_URL) : (process.env.VERCEL ? null : fileStore());
let ready = null; // init once per instance, on the first request
const ensureReady = () => (ready ||= store.init().catch(e => { ready = null; throw e; }));

// ---------- app ----------
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

// Health check: says which storage is in use and which variable it came from (never the value).
app.get("/api/health", async (_req, res) => {
  const out = { ok: true, storage: DB_URL ? "postgres" : store ? "file" : "none", dbVariable: DB_ENV };
  if (store) {
    try { await ensureReady(); out.database = "connected"; }
    catch (e) { out.ok = false; out.database = "error: " + (e.code || e.message || "unknown"); }
  }
  res.status(out.ok ? 200 : 500).json(out);
});

// passcode check for every other /api route
app.use("/api", (req, res, next) => {
  if (!ACCESS_CODE) return next();
  const given = String(req.get("x-access-code") || "");
  const ok = given.length === ACCESS_CODE.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(ACCESS_CODE));
  return ok ? next() : res.status(401).json({ error: "access_code" });
});

app.get("/api/config", (_req, res) => res.json({ ok: true }));

// storage must be ready for the routes below
app.use("/api", async (_req, res, next) => {
  if (!store) return res.status(503).json({ error: "db_not_configured" });
  try { await ensureReady(); next(); } catch (e) { next(e); }
});

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
    const row = await store.get(req.params.id);
    return row ? res.json(row) : res.status(404).json({ error: "not_found" });
  } catch (e) { next(e); }
});

app.put("/api/results/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const name = String(body.name || "").trim().slice(0, 40);
    if (!ID_RE.test(id)) return res.status(400).json({ error: "bad_id" });
    if (!name) return res.status(400).json({ error: "name_required" });
    if (!TEAMS.includes(body.team)) return res.status(400).json({ error: "bad_team" });
    const answers = body.answers;
    if (!Array.isArray(answers) || answers.length !== QUESTIONS.length ||
        !answers.every(v => Number.isInteger(v) && v >= 1 && v <= 4)) {
      return res.status(400).json({ error: "bad_answers" });
    }
    const row = { id, name, team: body.team, answers, ...score(answers), updatedAt: new Date().toISOString() };
    await store.upsert(row); // scored on the server, never trusted from the client
    res.json(row);
  } catch (e) { next(e); }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

// Serves the page and its scripts (on Vercel the CDN does this instead).
app.use(express.static(path.join(__dirname, "public")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Social Style on :${PORT} (${DB_URL ? "postgres" : "json file"}${ACCESS_CODE ? ", passcode on" : ""})`));
}
