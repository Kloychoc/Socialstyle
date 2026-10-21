// Run: npm test
const assert = require("assert");
const A = require("../public/assessments.js");

// ---- strengths ----
const Q = A.STRENGTH_QUESTIONS;
assert.strictEqual(Q.length, 24, "24 pairs");
const seen = Object.fromEntries(A.STRENGTH_KEYS.map(k => [k, { n: 0, opp: new Set(), stmt: new Set() }]));
for (const q of Q) {
  assert.notStrictEqual(q.lk, q.rk, "a pair compares two different strengths");
  seen[q.lk].n++; seen[q.rk].n++;
  seen[q.lk].opp.add(q.rk); seen[q.rk].opp.add(q.lk);
  seen[q.lk].stmt.add(q.l); seen[q.rk].stmt.add(q.r);
}
for (const [k, v] of Object.entries(seen)) {
  assert.strictEqual(v.n, 4, `${k} appears 4 times`);
  assert.strictEqual(v.opp.size, 4, `${k} meets 4 different strengths`);
  assert.strictEqual(v.stmt.size, 4, `${k} uses 4 different statements`);
}
// left/right balance: every strength sits on the left twice and on the right twice
for (const k of A.STRENGTH_KEYS) {
  const left = Q.filter(q => q.lk === k).length;
  assert.strictEqual(left, 2, `${k} sits on the left exactly 2 of 4 times`);
}
// favouring one strength every time puts it first with the max 8 points
for (const k of A.STRENGTH_KEYS) {
  const ans = Q.map(q => (q.lk === k ? 1 : q.rk === k ? 5 : 3));
  const r = A.scoreStrengths(ans);
  assert.strictEqual(r.strengths[0], k, `favouring ${k} ranks it first`);
  assert.strictEqual(r.strengthScores[k], 8);
}
// points are conserved: each answer is worth 2 (มาก), 1 (ค่อนข้าง) or 0 (กลางๆ)
{
  const ans = Q.map((_, i) => (i % 5) + 1);
  const total = Object.values(A.scoreStrengths(ans).strengthScores).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, ans.reduce((s, v) => s + (v === 1 || v === 5 ? 2 : v === 3 ? 0 : 1), 0));
}
// all กลางๆ (e.g. every pair timed out): nothing was picked, so no top strengths
{
  const r = A.scoreStrengths(Q.map(() => 3));
  assert.ok(Object.values(r.strengthScores).every(v => v === 0));
  assert.deepStrictEqual(r.strengths, []);
}
// only strengths that were actually picked can be "top"
{
  const r = A.scoreStrengths(Q.map((q, i) => (i === 0 ? 1 : 3)));
  assert.deepStrictEqual(r.strengths, [Q[0].lk]);
}
// old 4-point answers map onto the 5-point scale with the same meaning
assert.deepStrictEqual(A.upgradeStrengthAnswers([1, 2, 3, 4]), [1, 2, 4, 5]);

// ties never favour a strength: with random answers each strength lands in the top 3 about 25% of the time
{
  // mulberry32: a small PRNG with good spread (a plain LCG gives lopsided answer sheets for some seeds)
  let seed = 9; const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const N = 60000, hits = Object.fromEntries(A.STRENGTH_KEYS.map(k => [k, 0]));
  for (let t = 0; t < N; t++) A.scoreStrengths(Q.map(() => 1 + Math.floor(rnd() * 5))).strengths.forEach(k => hits[k]++);
  for (const [k, n] of Object.entries(hits)) {
    const pct = n / N * 100;
    assert.ok(pct > 23.5 && pct < 26.5, `${k} reaches the top 3 ${pct.toFixed(1)}% of the time (fair is 25%)`);
  }
  const ans = Q.map((_, i) => (i % 5) + 1);
  assert.deepStrictEqual(A.scoreStrengths(ans).strengths, A.scoreStrengths(ans).strengths, "same answers, same result");
}

// ---- 4-letter type ----
assert.strictEqual(A.TYPE_QUESTIONS.length, 20);
for (const ax of Object.keys(A.PAIR_OF)) {
  const items = A.TYPE_QUESTIONS.filter(q => q.ax === ax);
  assert.strictEqual(items.length, 5, `${ax} has 5 items`);
  const [a, b] = A.PAIR_OF[ax];
  assert.ok(items.some(q => q.lp === a) && items.some(q => q.lp === b), `${ax} alternates sides`);
}
// every one of the 16 types is reachable and described
const reached = new Set();
for (let mask = 0; mask < 16; mask++) {
  const want = Object.values(A.PAIR_OF).map(([a, b], i) => (mask >> i) & 1 ? b : a).join("");
  const ans = A.TYPE_QUESTIONS.map(q => (want.includes(q.lp) ? 1 : 4));
  const r = A.scoreType(ans);
  assert.strictEqual(r.type, want, `answers aimed at ${want} give ${want}`);
  assert.ok(A.TYPES[want], `${want} has a description`);
  reached.add(r.type);
}
assert.strictEqual(reached.size, 16);
// no ties: every possible answer on one axis gives a clear letter
{
  let seed = 3; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 5000; t++) {
    const r = A.scoreType(A.TYPE_QUESTIONS.map(() => 1 + Math.floor(rnd() * 4)));
    assert.match(r.type, /^[EI][SN][TF][JP]$/);
    for (const v of Object.values(r.typeScores)) assert.notStrictEqual(v, 50, "no 50/50 axis");
  }
}

console.log("OK  strengths: 24 pairs, each of 12 strengths 4x vs 4 different strengths; ties are fair (each ~25% top-3)");
console.log("    4-letter type: 20 items, all 16 types reachable, no ties possible");
