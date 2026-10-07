// Places people on the Social Style map.
// Rules (checked by test/map-layout.test.js):
//  1. A dot always stays inside the quadrant its scores belong to, even near the midline.
//  2. A dot stays as close as possible to its true score position.
//  3. Dots never overlap while their quadrant has room (about 18 people per quadrant).
(function (root) {
  const SS = typeof module !== "undefined" && module.exports ? require("./questions.js") : root.SocialStyle;

  // SVG geometry shared by the page and the tests
  const GEOM = { W: 480, H: 480, padX: 56, padY: 56, inner: 368, r: 16 };
  const HALF = GEOM.inner / 2;
  const GAP = 3;                 // space between a dot and the quadrant edge
  const MIN_D = GEOM.r * 2 + 3;  // minimum centre-to-centre distance between dots

  // score (LO..HI) -> px offset inside the grid (0..inner)
  const scale = v => (v - SS.LO) / (SS.HI - SS.LO) * GEOM.inner;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // x: assertiveness (Ask left -> Tell right); y: responsiveness (Control top -> Emote bottom)
  function quadrantOf(a, r) { return { right: a > SS.MID, bottom: r > SS.MID }; }

  function bounds(a, r) {
    const q = quadrantOf(a, r), m = GEOM.r + GAP;
    const x0 = GEOM.padX + (q.right ? HALF : 0), y0 = GEOM.padY + (q.bottom ? HALF : 0);
    return { minX: x0 + m, maxX: x0 + HALF - m, minY: y0 + m, maxY: y0 + HALF - m };
  }

  // Candidate spots inside a quadrant, on a fine 6px lattice (cached per quadrant).
  const STEP = 6, cache = {};
  function spots(b) {
    const key = `${b.minX},${b.minY}`;
    if (cache[key]) return cache[key];
    const xs = [], ys = [];
    for (let x = b.minX; x < b.maxX; x += STEP) xs.push(x); xs.push(b.maxX);
    for (let y = b.minY; y < b.maxY; y += STEP) ys.push(y); ys.push(b.maxY);
    return (cache[key] = xs.flatMap(x => ys.map(y => [x, y])));
  }

  // points: [{id, a, r, ...}] -> same objects plus {x, y, tx, ty}
  // Each dot takes the free spot nearest its true score position, and only spots inside its
  // own quadrant are offered. "Free" means at least MIN_D from every dot already placed.
  function layout(points) {
    const P = [...points]
      .sort((p, q) => String(p.id).localeCompare(String(q.id)))  // same data -> same picture
      .map(p => ({ ...p, b: bounds(p.a, p.r), tx: GEOM.padX + scale(p.a), ty: GEOM.padY + scale(p.r) }));
    const placed = [];
    for (const p of P) {
      const exact = [clamp(p.tx, p.b.minX, p.b.maxX), clamp(p.ty, p.b.minY, p.b.maxY)];
      const cands = [exact, ...spots(p.b)]
        .map(c => ({ c, dist: Math.hypot(c[0] - p.tx, c[1] - p.ty) }))
        .sort((u, v) => u.dist - v.dist);
      let pick = null, fallback = null, fallbackGap = -1;
      for (const { c } of cands) {
        let gap = Infinity;
        for (const q of placed) gap = Math.min(gap, Math.hypot(c[0] - q.x, c[1] - q.y));
        if (gap >= MIN_D) { pick = c; break; }
        if (gap > fallbackGap) { fallbackGap = gap; fallback = c; } // quadrant full: least crowded spot
      }
      [p.x, p.y] = pick || fallback;
      placed.push(p);
    }
    return P.map(({ b, ...p }) => p);
  }

  const api = { GEOM, HALF, layout, bounds, quadrantOf, scale };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MapLayout = api;
})(this);
