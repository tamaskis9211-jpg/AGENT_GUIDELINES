// procgen.js: game art drawn by code, for 2D top-down and isometric views.
// Seeded noise -> small tiling material tiles -> a shape kit that draws six
// lighting buffers with Canvas 2D: albedo, normal, height, bump, emission and
// cast shadow. render.js lights them and gives the finish. No dependencies.
// Reference code for the procedural-2d-art skill: copy it and adapt it.

// ---------- numbers ----------
const TAU = Math.PI * 2;
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const rgbStr = (c) => `rgb(${c.map((v) => clamp01(v) * 255).join(',')})`;
const own = (obj, key) => (Object.hasOwn(obj, key) ? obj[key] : undefined); // names from outside never reach Object.prototype

/** Seeded random numbers in [0, 1): the same seed always gives the same art. */
export function makeRng(seed) {
  let s = seed >>> 0 || 1;
  const f = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (a, b) => a + (b - a) * f();
  f.pick = (list) => list[Math.floor(f() * list.length)];
  return f;
}

/** Hash of an integer grid point to [0, 1). */
export function hash2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

/** Smooth value noise in [0, 1]. px/py > 0 make it repeat every px/py cells (for tiles). */
export function noise(x, y, s = 0, px = 0, py = px) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const wx = (k) => (px ? ((k % px) + px) % px : k), wy = (k) => (py ? ((k % py) + py) % py : k);
  const a = hash2(wx(xi), wy(yi), s), b = hash2(wx(xi + 1), wy(yi), s);
  const c = hash2(wx(xi), wy(yi + 1), s), d = hash2(wx(xi + 1), wy(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal noise: octaves of noise at doubling frequency. Repeats like noise() when px/py are set. */
export function fbm(x, y, s = 0, octaves = 4, px = 0, py = px) {
  let amp = 0.5, f = 1, sum = 0, total = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * f, y * f, s + i * 31, px * f, py * f);
    total += amp; amp *= 0.5; f *= 2;
  }
  return sum / total;
}

export function hexRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

// ---------- material tiles ----------
// Each material is a formula per texel of a TILE x TILE tile that repeats
// seamlessly: [brightness multiplier around 1, height 0..1 for bump]. Colour
// comes from the look, so one tile serves every palette.
export const TILE = 32;

function cells(x, y, n, seed) { // tiling Voronoi: distance to nearest and second site, and the nearest site's id
  const cs = TILE / n, cx = Math.floor(x / cs), cy = Math.floor(y / cs);
  let d1 = 1e9, d2 = 1e9, id = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const gx = cx + i, gy = cy + j, wx = ((gx % n) + n) % n, wy = ((gy % n) + n) % n;
    const sx = (gx + 0.2 + 0.6 * hash2(wx, wy, seed)) * cs, sy = (gy + 0.2 + 0.6 * hash2(wx, wy, seed + 1)) * cs;
    const d = Math.hypot(x + 0.5 - sx, y + 0.5 - sy);
    if (d < d1) { d2 = d1; d1 = d; id = hash2(wx, wy, seed + 2); } else if (d < d2) d2 = d;
  }
  return [d1, d2, id];
}

export const MATERIALS = {
  plain: (x, y) => { const n = noise(x / 4, y / 4, 1, 8) - 0.5; return [1 + n * 0.08, 0.5 + n * 0.1]; },
  plaster: (x, y) => { const n = fbm(x / 8, y / 8, 2, 3, 4); return [0.9 + 0.2 * n + (hash2(x, y, 3) - 0.5) * 0.05, 0.45 + 0.2 * n]; },
  dirt: (x, y) => {
    const n = fbm(x / 8, y / 8, 4, 4, 4), s = hash2(x, y, 5);
    let m = 0.78 + 0.42 * n, h = 0.3 + 0.4 * n;
    if (s > 0.97) { m += 0.16; h += 0.3; } else if (s < 0.04) { m -= 0.14; h -= 0.15; }
    return [m, h];
  },
  grass: (x, y) => {
    const n = fbm(x / 4, y / 4, 6, 3, 8), s = hash2(x, y, 7);
    let m = 0.78 + 0.36 * n, h = 0.35 + 0.4 * n;
    if (s > 0.86 && n > 0.45) { m += 0.16; h += 0.25; } else if (s < 0.08) { m -= 0.14; h -= 0.2; }
    return [m, h];
  },
  rock: (x, y) => {
    const n = fbm(x / 8, y / 8, 8, 4, 4), c = fbm(x / 16, y / 16, 9, 3, 2), crack = Math.abs(c - 0.5) < 0.025 ? 1 : 0;
    return [0.74 + 0.46 * n - crack * 0.32, 0.3 + 0.6 * n - crack * 0.4];
  },
  brick: (x, y) => { // rows 4 texels high, bricks 8 wide, every other row shifted half a brick
    const row = Math.floor(y / 4), off = (row & 1) * 4, lx = (x + off) % 8, ly = y % 4;
    if (lx === 0 || ly === 0) return [0.55 + (hash2(x, y, 10) - 0.5) * 0.08, 0.1];
    const id = hash2(Math.floor((x + off) / 8) % 4, row, 11), n = noise(x / 2, y / 2, 12, 16) - 0.5;
    return [0.8 + 0.3 * id + n * 0.12 + (ly === 1 ? 0.06 : 0) - (ly === 3 ? 0.06 : 0), 0.7 + 0.15 * id];
  },
  planks: (x, y) => { // planks 8 texels wide along v, one joint each, nails by the joint
    const p = Math.floor(x / 8), lx = x % 8, id = hash2(p, 0, 13), joint = Math.floor(id * TILE);
    if (lx === 0 || y === joint) return [0.5, 0.1];
    if ((lx === 2 || lx === 5) && (y === (joint + 2) % TILE || y === (joint + TILE - 2) % TILE)) return [0.45, 0.9];
    const g = noise(x, y / 4, 14, TILE, TILE / 4) - 0.5;
    return [0.82 + 0.25 * id + g * 0.3 + (lx === 1 ? 0.05 : 0) - (lx === 7 ? 0.07 : 0), 0.55 + g * 0.3];
  },
  cobble: (x, y) => {
    const [d1, d2, id] = cells(x, y, 4, 15), e = d2 - d1;
    if (e < 1.1) return [0.42, 0.05];
    const dome = smooth(1.1, 4, e);
    return [0.7 + 0.35 * id + dome * 0.12 + (hash2(x, y, 16) - 0.5) * 0.08, 0.25 + 0.7 * dome];
  },
  leaves: (x, y) => {
    const [d1, d2, id] = cells(x, y, 8, 17), dome = smooth(0, (TILE / 8) * 0.6, d2 - d1);
    return [0.62 + 0.4 * dome + 0.15 * id + (hash2(x, y, 18) > 0.9 ? 0.12 : 0), 0.2 + 0.8 * dome];
  },
  shingles: (x, y) => { // the lower part of each row is raised: it overlaps the row below
    const row = Math.floor(y / 4), off = (row & 1) * 4, lx = (x + off) % 8, ly = y % 4;
    let m = 0.78 + 0.3 * hash2(Math.floor((x + off) / 8) % 4, row, 19);
    if (lx === 0) m -= 0.25;
    if (ly === 3) m += 0.1; else if (ly === 0) m -= 0.3;
    return [m, 0.2 + 0.2 * ly];
  },
  thatch: (x, y) => { const s = noise(x, y / 4, 20, TILE, TILE / 4), band = y % 8; return [0.7 + 0.45 * s - (band === 0 ? 0.25 : 0), 0.3 + 0.4 * s + band * 0.04]; },
  metal: (x, y) => {
    const b = noise(x / 8, y, 21, 4, TILE) - 0.5, rivet = (x % 16 === 3 || x % 16 === 12) && (y % 16 === 3 || y % 16 === 12);
    return rivet ? [1.25, 1] : [0.92 + b * 0.18, 0.5 + b * 0.1];
  },
  sand: (x, y) => {
    const w = Math.sin(((y + noise(x / 8, y / 8, 22, 4) * 6) * Math.PI) / 4) * 0.5 + 0.5;
    return [0.9 + 0.08 * w + (hash2(x, y, 23) - 0.5) * 0.1, 0.3 + 0.4 * w];
  },
};

function newCanvas(w, h) {
  if (typeof document !== 'undefined') return Object.assign(document.createElement('canvas'), { width: w, height: h });
  return new OffscreenCanvas(w, h);
}
function imageTile(size, fill) { // fill(x, y) -> [r, g, b, a] in 0..1
  const c = newCanvas(size, size), ctx = c.getContext('2d'), img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = fill(x, y), i = (y * size + x) * 4;
    for (let k = 0; k < 4; k++) img.data[i + k] = clamp01(v[k]) * 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
const tiles = new Map();
function cached(key, make) { let t = tiles.get(key); if (!t) tiles.set(key, (t = make())); return t; }
function materialData(mat) {
  return cached('data:' + mat, () => {
    const f = own(MATERIALS, mat);
    if (!f) throw new Error(`unknown material "${mat}"; known: ${Object.keys(MATERIALS).join(', ')}`);
    const m = new Float32Array(TILE * TILE), h = new Float32Array(TILE * TILE);
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) [m[y * TILE + x], h[y * TILE + x]] = f(x, y);
    return { m, h };
  });
}
function albedoTile(mat, rgb) {
  const q = rgb.map((v) => Math.round(clamp01(v) * 255));
  return cached(`albedo:${mat}:${q}`, () => {
    const { m } = materialData(mat);
    return imageTile(TILE, (x, y) => { const k = m[y * TILE + x]; return [q[0] / 255 * k, q[1] / 255 * k, q[2] / 255 * k, 1]; });
  });
}
function bumpTile(mat) {
  return cached('bump:' + mat, () => { const { h } = materialData(mat); return imageTile(TILE, (x, y) => { const v = h[y * TILE + x]; return [v, v, v, 1]; }); });
}
function coverTile(cover) { // snow, moss, sand: a large tile whose alpha says where the cover lies
  return cached(`cover:${cover.color}:${cover.amount}`, () => {
    const c = hexRgb(cover.color), t = 1 - cover.amount;
    return imageTile(128, (x, y) => {
      const n = fbm(x / 16, y / 16, 40, 4, 8), k = 0.92 + 0.12 * noise(x / 2, y / 2, 41, 64);
      return [c[0] * k, c[1] * k, c[2] * k, smooth(t - 0.06, t + 0.06, n)];
    });
  });
}

// ---------- views ----------
// A view is an affine projection: screen x = a . p, screen y = b . p (world
// units, y up), then scaled. Any a and b work; the camera looks along b x a.
export const VIEWS = {
  iso: { a: [1, 0, -1], b: [0.5, -1.2, 0.5] }, // 2:1 diamond tiles; tops and two sides show
  topdown: { a: [1, 0, 0], b: [0, -0.6, 0.8] }, // 3/4 view from the south; tops and south faces show
};
export const HMAX = 8; // world heights 0..HMAX are stored in the 8-bit height buffer
const BUFFERS = ['albedo', 'normal', 'height', 'bump', 'emit', 'shadow'];

// three well-spread points of a screen polygon, for the affine fits
function spread3(P) {
  let i1 = 1, i2 = 2, best = -1;
  for (let i = 1; i < P.length; i++) { const d = (P[i][0] - P[0][0]) ** 2 + (P[i][1] - P[0][1]) ** 2; if (d > best) { best = d; i1 = i; } }
  best = -1;
  for (let i = 1; i < P.length; i++) {
    const a = Math.abs((P[i1][0] - P[0][0]) * (P[i][1] - P[0][1]) - (P[i][0] - P[0][0]) * (P[i1][1] - P[0][1]));
    if (a > best) { best = a; i2 = i; }
  }
  return [0, i1, i2];
}
// the matrix mapping texture (u, v) onto screen, from three matching points
function affine(uv, xy) {
  const [u0, v0] = uv[0], du1 = uv[1][0] - u0, dv1 = uv[1][1] - v0, du2 = uv[2][0] - u0, dv2 = uv[2][1] - v0;
  const [x0, y0] = xy[0], dx1 = xy[1][0] - x0, dy1 = xy[1][1] - y0, dx2 = xy[2][0] - x0, dy2 = xy[2][1] - y0;
  const det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 1e-9) return null;
  const a = (dx1 * dv2 - dx2 * dv1) / det, c = (dx2 * du1 - dx1 * du2) / det;
  const b = (dy1 * dv2 - dy2 * dv1) / det, d = (dy2 * du1 - dy1 * du2) / det;
  return new DOMMatrix([a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0]);
}
// world height as a plane over screen x, y: h = ax * x + ay * y + c
function heightPlane(P, H) {
  const [x0, y0] = P[0], x1 = P[1][0] - x0, y1 = P[1][1] - y0, x2 = P[2][0] - x0, y2 = P[2][1] - y0;
  const det = x1 * y2 - x2 * y1, h1 = H[1] - H[0], h2 = H[2] - H[0];
  if (Math.abs(det) < 1e-9) return [0, 0, H[0]];
  const ax = (h1 * y2 - h2 * y1) / det, ay = (x1 * h2 - x2 * h1) / det;
  return [ax, ay, H[0] - ax * x0 - ay * y0];
}
// a fill that is colour c0 where the height is h0 and c1 where it is h1
function heightFill(ctx, [ax, ay, c], h0, h1, c0, c1) {
  const g2 = ax * ax + ay * ay;
  if (g2 < 1e-12) { const t = clamp01((c - h0) / (h1 - h0)); return rgbStr(c0.map((v, i) => v + (c1[i] - v) * t)); }
  const k0 = (h0 - c) / g2, k1 = (h1 - c) / g2;
  const g = ctx.createLinearGradient(ax * k0, ay * k0, ax * k1, ay * k1);
  g.addColorStop(0, rgbStr(c0)); g.addColorStop(1, rgbStr(c1));
  return g;
}

// ---------- shapes ----------
/** A list of flat-shaded faces. Shapes push faces; Art draws them. */
export class Model {
  constructor(art, anchor, castShadow) { this.art = art; this.anchor = anchor; this.castShadow = castShadow; this.faces = []; }

  /** One planar polygon. The normal is computed and turned to face away from `centre`. */
  face(pts, st, centre) {
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (centre) { const m = pts.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((v) => v / pts.length); if (dot(n, sub(m, centre)) < 0) n = n.map((v) => -v); }
    this.faces.push({ pts, n, st });
    return this;
  }
  /** A flat polygon at height y, given as [x, z] points (paths, plazas, patches). */
  poly(xz, y, st) { this.faces.push({ pts: xz.map(([x, z]) => [x, y, z]), n: [0, 1, 0], st: { ...st, base: y } }); return this; }
  /** A box standing on y, centred on x, z; rot turns it about the vertical axis. */
  box(x, y, z, w, h, d, st, { rot = 0, top = st } = {}) {
    const c = Math.cos(rot), s = Math.sin(rot), hw = w / 2, hd = d / 2, ctr = [x, y + h / 2, z];
    const at = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
    const lo = [at(-hw, 0, -hd), at(hw, 0, -hd), at(hw, 0, hd), at(-hw, 0, hd)], hi = lo.map((p) => [p[0], p[1] + h, p[2]]);
    const side = { ...st, base: y }, cap = { ...top, base: y };
    this.face(hi, cap, ctr);
    for (let i = 0; i < 4; i++) this.face([lo[i], lo[(i + 1) % 4], hi[(i + 1) % 4], hi[i]], side, ctr);
    return this;
  }
  /** A prism with `sides` sides: a cylinder, a frustum (top < 1) or a cone (top = 0). */
  prism(x, y, z, r, h, st, { sides = 8, top = 1, rot = 0, cap = st } = {}) {
    const ring = (rr, yy) => Array.from({ length: sides }, (_, i) => { const a = rot + (i / sides) * TAU; return [x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr]; });
    const lo = ring(r, y), hi = ring(r * top, y + h), ctr = [x, y + h * 0.4, z], side = { ...st, base: y };
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      this.face(top > 0.001 ? [lo[i], lo[j], hi[j], hi[i]] : [lo[i], lo[j], [x, y + h, z]], side, ctr);
    }
    if (top > 0.001) this.face(hi, { ...cap, base: y }, ctr);
    return this;
  }
  /** A low-poly ball: crowns, bushes, flames; with rough > 0 and floor set, a rock. */
  ball(x, y, z, r, st, { rings = 4, seg = 7, sq = 1, rough = 0, floor = -Infinity } = {}) {
    const sd = this.art.rng() * 100, base = { ...st, base: Math.max(y - r * sq, floor) }, ctr = [x, y, z];
    const pt = (i, k) => {
      const th = (i / rings) * Math.PI, ph = (k / seg) * TAU + ((i & 1) * Math.PI) / seg;
      const d = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
      const kr = 1 + rough * (noise(d[0] * 1.8 + sd, d[2] * 1.8 + d[1] * 1.3, 31) - 0.5) * 2;
      return [x + d[0] * r * kr, Math.max(y + d[1] * r * sq * kr, floor), z + d[2] * r * kr];
    };
    for (let i = 0; i < rings; i++) for (let k = 0; k < seg; k++) {
      const a = pt(i, k), b = pt(i, k + 1), c = pt(i + 1, k), d = pt(i + 1, k + 1);
      if (i > 0) this.face([a, c, b], base, ctr);
      if (i < rings - 1) this.face([b, c, d], base, ctr);
    }
    return this;
  }
  /** A gable roof whose ridge runs along the box's width; walls fill the gable ends. */
  roof(x, y, z, w, d, h, st, { rot = 0, over = 0.15, gable = st } = {}) {
    const c = Math.cos(rot), s = Math.sin(rot), hw = w / 2, hd = d / 2, ctr = [x, y + h / 3, z];
    const at = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
    const drop = (over * h) / hd, ew = hw + over, sl = { ...st, base: y }, gb = { ...gable, base: y };
    this.face([at(-ew, -drop, hd + over), at(ew, -drop, hd + over), at(ew, h, 0), at(-ew, h, 0)], sl, ctr);
    this.face([at(-ew, -drop, -hd - over), at(-ew, h, 0), at(ew, h, 0), at(ew, -drop, -hd - over)], sl, ctr);
    this.face([at(-hw, 0, -hd), at(-hw, 0, hd), at(-hw, h, 0)], gb, ctr);
    this.face([at(hw, 0, -hd), at(hw, h, 0), at(hw, 0, hd)], gb, ctr);
    return this;
  }
}

// ---------- the art: buffers, scene, drawing ----------
export class Art {
  /**
   * @param {object} o
   * @param {number} o.width  buffer width in pixels (the low internal resolution)
   * @param {number} o.height buffer height in pixels
   * @param {string|{a:number[],b:number[]}} o.view 'iso', 'topdown' or a custom projection
   * @param {object} o.look   palette, light and grade (see LOOKS in demo.html)
   * @param {number} [o.seed] seed for colour variation, texture offsets and rock shapes
   * @param {number} [o.texelsPerUnit] texture density; default: one texel per pixel at the fitted scale
   */
  constructor({ width, height, view = 'iso', look, seed = 1, texelsPerUnit }) {
    const v = typeof view === 'string' ? own(VIEWS, view) : view;
    if (!v) throw new Error(`unknown view "${view}"; known: ${Object.keys(VIEWS).join(', ')}`);
    if (Math.abs(v.a[0] * v.b[2] - v.a[2] * v.b[0]) < 1e-6) throw new Error('the view must show x and z apart: a.x * b.z - a.z * b.x is 0');
    this.a = v.a; this.b = v.b; this.d = norm(cross(v.b, v.a)); // d points toward the camera
    this.w = width; this.h = height; this.look = look; this.tpu = texelsPerUnit;
    this.rng = makeRng(seed); this.scale = 16; this.ox = width / 2; this.oy = height / 2;
    this.groundModels = []; this.objects = []; this.lights = []; this.version = 0;
    this.buf = {};
    for (const k of BUFFERS) { const ctx = newCanvas(width, height).getContext('2d'); ctx.imageSmoothingEnabled = false; this.buf[k] = ctx; }
    this.pats = new Map();
  }
  project(p) { return [this.ox + this.scale * dot(this.a, p), this.oy + this.scale * dot(this.b, p)]; }
  /** Scale and centre the view so that all `pts` (world points) fit, margin in pixels. */
  fit(pts, margin = 8) {
    const s = pts.map((p) => [dot(this.a, p), dot(this.b, p)]);
    const xs = s.map((q) => q[0]), ys = s.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    this.scale = Math.floor(Math.min((this.w - 2 * margin) / (x1 - x0), (this.h - 2 * margin) / (y1 - y0)));
    this.ox = Math.round((this.w - this.scale * (x0 + x1)) / 2); this.oy = Math.round((this.h - this.scale * (y0 + y1)) / 2);
  }
  /** A style: a look colour (varied by +-jitter), a material, and options. */
  style(colour, mat = 'plain', { jitter = 0.07, ao = [1, 0.6], emit = 0, cover = true } = {}) {
    const hex = own(this.look.colors, colour);
    if (!hex) throw new Error(`the look has no colour "${colour}"`);
    const k = 1 + (this.rng() * 2 - 1) * jitter;
    return { color: hexRgb(hex).map((v) => v * k), mat, ao, emit, cover, uo: Math.floor(this.rng() * TILE), vo: Math.floor(this.rng() * TILE) };
  }
  /** Ground layer: drawn first, in the order added, never sorted, casts no shadow. */
  ground() { const m = new Model(this, null, false); this.groundModels.push(m); return m; }
  /** An object standing at `anchor` [x, y, z]: sorted back to front by its anchor. */
  object(anchor, { castShadow = true } = {}) { const m = new Model(this, anchor, castShadow); this.objects.push(m); return m; }
  /** A point light: world position, colour (hex), intensity, radius in world units. */
  light(pos, colour, intensity = 4, radius = 8) { this.lights.push({ pos, rgb: hexRgb(colour), intensity, radius }); }

  draw() {
    const tpu = this.tpu ?? Math.max(1, Math.round(this.scale));
    for (const ctx of Object.values(this.buf)) ctx.clearRect(0, 0, this.w, this.h);
    for (const m of this.groundModels) this.#model(m, tpu);
    // cast shadows: every face of every object, pushed along the sun onto the ground (y = 0)
    const L = norm(this.look.sun.dir), ly = L[1], sh = this.buf.shadow;
    if (ly < 0.2) throw new Error('look.sun.dir must point upward (y >= 0.2 once normalised): a lower sun casts shadows off the map');
    sh.fillStyle = sh.strokeStyle = '#fff';
    for (const m of this.objects) if (m.castShadow) for (const f of m.faces) {
      if (f.pts.every((p) => p[1] <= 1e-3)) continue;
      this.#path(sh, f.pts.map((p) => this.project([p[0] - (L[0] * p[1]) / ly, 0, p[2] - (L[2] * p[1]) / ly])), true);
    }
    const depth = (m) => dot(m.anchor, this.d);
    for (const m of [...this.objects].sort((p, q) => depth(p) - depth(q))) this.#model(m, tpu);
    this.version++;
  }
  #model(m, tpu) { // objects: far faces first; ground: in the order added (paths lie on the grass)
    const facing = m.faces.filter((f) => dot(f.n, this.d) > 1e-4);
    const depth = (f) => f.pts.reduce((s, p) => s + dot(p, this.d), 0) / f.pts.length;
    if (m.anchor) facing.sort((p, q) => depth(p) - depth(q));
    facing.forEach((f) => this.#face(f, tpu));
  }
  #path(ctx, P, fillAndStroke) {
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
    ctx.closePath();
    if (fillAndStroke) { ctx.fill(); ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke(); } // the stroke closes seams between faces
  }
  #fill(ctx, P, style, seams = true) {
    ctx.fillStyle = ctx.strokeStyle = style;
    if (seams) this.#path(ctx, P, true); else { this.#path(ctx, P, false); ctx.fill(); }
  }
  #pattern(ctx, tile, matrix) {
    let per = this.pats.get(ctx); if (!per) this.pats.set(ctx, (per = new Map()));
    let p = per.get(tile); if (!p) per.set(tile, (p = ctx.createPattern(tile, 'repeat')));
    p.setTransform(matrix);
    return p;
  }
  #face({ pts, n, st }, tpu) {
    const P = pts.map((p) => this.project(p)), ix = spread3(P), B = this.buf;
    // texture axes in the face's plane: u along it, v down it (or along z on flat faces)
    const flat = Math.abs(n[1]) > 0.98, eu = flat ? [1, 0, 0] : norm(cross([0, 1, 0], n)), ev = flat ? [0, 0, 1] : cross(eu, n);
    const uv = pts.map((p) => [Math.round(dot(p, eu) * tpu) + st.uo, Math.round(dot(p, ev) * tpu) + st.vo]);
    const M = affine(ix.map((i) => uv[i]), ix.map((i) => P[i]));
    if (!M) return; // edge-on
    const plane = heightPlane(ix.map((i) => P[i]), ix.map((i) => pts[i][1]));
    this.#fill(B.albedo, P, this.#pattern(B.albedo, albedoTile(st.mat, st.color), M));
    if (st.ao) { // darker toward the shape's base: cheap ambient occlusion
      B.albedo.globalCompositeOperation = 'multiply';
      this.#fill(B.albedo, P, heightFill(B.albedo, plane, st.base, st.base + st.ao[0], [st.ao[1], st.ao[1], st.ao[1]], [1, 1, 1]), false);
      B.albedo.globalCompositeOperation = 'source-over';
    }
    const cover = this.look.cover;
    if (cover && st.cover && n[1] > 0.4) { // snow, moss or sand: full on flat tops, thinning on slopes
      const cm = affine(ix.map((i) => [pts[i][0] * tpu, pts[i][2] * tpu]), ix.map((i) => P[i]));
      B.albedo.globalAlpha = smooth(0.4, 0.85, n[1]);
      if (cm) this.#fill(B.albedo, P, this.#pattern(B.albedo, coverTile(cover), cm));
      B.albedo.globalAlpha = 1;
    }
    this.#fill(B.normal, P, rgbStr(n.map((v) => v * 0.5 + 0.5)));
    this.#fill(B.height, P, heightFill(B.height, plane, 0, HMAX, [0, 0, 0], [1, 1, 1]));
    this.#fill(B.bump, P, this.#pattern(B.bump, bumpTile(st.mat), M));
    this.#fill(B.emit, P, st.emit ? rgbStr(st.color.map((v) => v * st.emit)) : '#000');
    this.#fill(B.shadow, P, '#000'); // an object in front hides the shadow on the ground behind it
  }
}
