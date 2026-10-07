// Run: npm test
// Checks that every dot lands in the quadrant its scores belong to.
const assert = require("assert");
const { LO, HI, MID, styleOf, score, QUESTIONS } = require("../public/questions.js");
const { GEOM, HALF, layout } = require("../public/map-layout.js");

const cx = GEOM.padX + HALF, cy = GEOM.padY + HALF;
const quadOfPos = p => styleOf(p.x > cx ? HI : LO, p.y > cy ? HI : LO);

// 1) the scale's ends and middle sit where the grid says they do
{
  const [lo] = layout([{ id: "lo", a: LO, r: LO }]);
  const [hi] = layout([{ id: "hi", a: HI, r: HI }]);
  assert.ok(lo.tx === GEOM.padX && lo.ty === GEOM.padY, "LO maps to the grid's top-left corner");
  assert.ok(hi.tx === GEOM.padX + GEOM.inner && hi.ty === GEOM.padY + GEOM.inner, "HI maps to the bottom-right corner");
  assert.ok(Math.abs(GEOM.padX + (MID - LO) / (HI - LO) * GEOM.inner - cx) < 1e-9, "MID maps to the centre line");
}

// 2) all four corners of the map land in the right quadrant
for (const [a, r, want] of [[LO, LO, "analytical"], [HI, LO, "driver"], [LO, HI, "amiable"], [HI, HI, "expressive"]]) {
  const [p] = layout([{ id: want, a, r }]);
  assert.strictEqual(quadOfPos(p), want, `corner ${want}`);
}

// 3) randomised teams: some spread out, some crowded right next to the midline, with duplicates
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const nearLine = () => (rnd() < 0.5 ? 37 : 38);
const anyScore = () => LO + Math.floor(rnd() * (HI - LO + 1));
let checked = 0, worstShift = 0;

for (let t = 0; t < 2000; t++) {
  const n = 1 + Math.floor(rnd() * 50);
  const crowded = rnd() < 0.3;
  const pts = Array.from({ length: n }, (_, i) => {
    let a, r;
    if (crowded) { a = 36 + Math.floor(rnd() * 4); r = 37 + Math.floor(rnd() * 4); }
    else { const m = rnd(); a = m < 0.4 ? nearLine() : anyScore(); r = m > 0.6 ? nearLine() : anyScore(); }
    return { id: `p${t}-${i}`, a, r, style: styleOf(a, r) };
  });
  const placed = layout(pts);
  assert.strictEqual(placed.length, n);
  const perQuad = {};
  for (const p of placed) {
    assert.strictEqual(quadOfPos(p), p.style, `dot ${p.id} (a=${p.a}, r=${p.r}) drawn in the wrong quadrant`);
    assert.ok(p.x - GEOM.r >= GEOM.padX && p.x + GEOM.r <= GEOM.padX + GEOM.inner, "dot inside grid (x)");
    assert.ok(p.y - GEOM.r >= GEOM.padY && p.y + GEOM.r <= GEOM.padY + GEOM.inner, "dot inside grid (y)");
    assert.ok(Math.abs(p.x - cx) >= GEOM.r && Math.abs(p.y - cy) >= GEOM.r, "dot clear of the midline");
    perQuad[p.style] = (perQuad[p.style] || 0) + 1;
    checked++;
  }
  // no two dots overlap while their quadrant holds 20 people or fewer
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    const A = placed[i], B = placed[j];
    if (A.style !== B.style || perQuad[A.style] > 20) continue;
    assert.ok(Math.hypot(A.x - B.x, A.y - B.y) >= GEOM.r * 2, `dots ${A.id} and ${B.id} overlap`);
  }
  if (n === 1) worstShift = Math.max(worstShift, Math.hypot(placed[0].x - placed[0].tx, placed[0].y - placed[0].ty));
}

// 4) server scoring and map agree: a real answer sheet lands in its scored quadrant
{
  const answers = QUESTIONS.map((_, i) => (i % 4) + 1);
  const s = score(answers);
  const [p] = layout([{ id: "me", ...s }]);
  assert.strictEqual(quadOfPos(p), s.style);
}

console.log(`OK  ${checked} dots in 2000 random teams, all in the correct quadrant`);
console.log(`    lone dot moved at most ${worstShift.toFixed(1)}px from its true spot (only when hugging the midline or the outer edge)`);
console.log("    no overlapping dots while a quadrant holds 20 people or fewer");
