# Techniques — how each part works and how to extend it

Values below are the reference code's (`procgen.js`, `render.js`,
`demo.html`). Change them in the project's looks and recipes, not by
guessing: render, look, adjust.

## 1. Random numbers and noise — always

- `makeRng(seed)`: a fast 32-bit generator; `rng()` in [0, 1),
  `rng.range(a, b)`, `rng.pick(list)`. One generator per scene, consumed in
  a fixed order: adding a call in the middle changes everything after it,
  so append new random draws at the end of a recipe, or give a new feature
  its own `makeRng(seed + k)`.
- `hash2(x, y, s)`: the same integers give the same value in [0, 1), with
  no state. Use it for per-cell or per-texel decisions (which brick is
  darker, where a speck goes).
- `noise(x, y, s, px, py)`: smooth value noise in [0, 1]. With `px`/`py`
  set it repeats every px × py cells: that is what makes a tile seamless.
  The frequency must divide the tile: for a 32-texel tile, `noise(x / 8, y
  / 8, s, 4)` repeats after 32 texels.
- `fbm(...)`: octaves of noise (each twice the frequency, half the
  amplitude); the period doubles with each octave, so tiles stay seamless.
  3–4 octaves for dirt and rock, 2–3 for large blotches.
- Tiling Voronoi (`cells` in `procgen.js`): distance to the nearest and the
  second-nearest jittered site, wrapping at the tile edge. `d2 - d1` small
  means a gap between stones; large means the middle of one. Cobbles: 4×4
  cells per tile; leaf clumps: 8×8.

## 2. Material tiles — when adding or changing a surface

- Each material is a formula per texel of a 32 × 32 tile returning
  `[brightness, height]`. Brightness sits around 1 (0.4–1.25), so one tile
  serves every colour; height is 0–1 and drives the bump in the light.
- Build a formula in four layers: a **pattern** (rows of bricks, planks,
  cells), **variation per piece** (`hash2` of the piece's index: ±15% tone),
  **detail inside** (fine noise ±5–10%), and **edges** (mortar and gaps dark
  and low; a lit top edge +0.06 and a dark bottom edge −0.06 make pieces
  stand out).
- The reference set: `plain`, `plaster`, `dirt`, `grass`, `rock` (noise and
  thin cracks where a second noise crosses 0.5), `brick` (4-texel rows,
  8-texel bricks, rows offset by half), `planks` (8-texel boards, one joint
  each, nails beside it), `cobble` and `leaves` (Voronoi), `shingles` (rows
  whose lower part is raised), `thatch` (strands: noise stretched 4× along
  v), `metal` (brushed, rivets), `sand` (wavy ripples).
- Choose sizes that divide the tile (rows of 4 or 8 in 32), or the seams
  show.
- Texture axes follow the face: u runs along the face horizontally, v runs
  down it (on flat ground u = x, v = z). So bricks stand upright on any wall,
  and roof shingle rows run along the ridge.
- Every shape gets a random whole-texel offset (`uo`, `vo`), so neighbours
  don't repeat the same bricks.
- Cover (snow, moss, sand, ash): a 128-texel tile whose alpha is
  `fbm` thresholded at `1 − amount`, laid in world x, z over faces that face
  up. Its strength fades in with how much the face looks up (none at
  n.y = 0.4, full at 0.85), so slopes get a dusting and flat tops a blanket.

## 3. Views — when choosing or adding a camera

- A view is two rows `a` and `b`: screen x = a · p, screen y = b · p (world
  units, y up), times `art.scale` pixels, plus the origin. The camera looks
  along `d = b × a`; a face is visible when `n · d > 0`, and drawing goes
  far to near by `p · d`.
- `iso: a = (1, 0, −1), b = (0.5, −1.2, 0.5)`: a 1 × 1 tile is a 2:1
  diamond; tops and two sides show. `b.y` sets how tall things look:
  √1.5 ≈ 1.22 makes it an exact orthographic view (dimetric, camera 30°
  above the ground); 1.0–1.2 is common in pixel art.
- `topdown: a = (1, 0, 0), b = (0, −0.6, 0.8)`: a 3/4 view from the south;
  tops and south faces show, east and west faces are edge-on. Lower
  `−0.6` toward 0 for a flatter map view (walls vanish at 0, and so does
  most of the light on them).
- Any affine view works; a side view `a = (1, 0, 0), b = (0, −1, 0.25)`
  was rendered with light and shadows while writing this skill. The light needs no changes: it rebuilds each pixel's world x, z
  from its screen position and stored height through the inverse of
  `[[a.x, a.z], [b.x, b.z]]`.
- `art.fit(points, margin)` sets a whole-number scale and a whole-pixel
  origin so everything fits. Texture density then defaults to
  `round(scale)` texels per world unit: about one texel per pixel.

## 4. Shapes and object recipes — when making objects

- The kit (`Model`): `box`, `prism` (sides, `top` ratio: 1 cylinder, <1
  frustum, 0 cone), `ball` (rings × segments, `sq` squash, `rough` noise,
  `floor` to flatten the part below ground), `roof` (gable, overhang),
  `poly` (flat polygon on the ground), and `face` (any planar polygon; its
  normal is turned away from the centre given).
- Faces are flat-shaded on purpose: the facets are the look. Keep counts
  low: prisms 5–8 sides, balls 3–4 rings × 5–7 segments, rocks 3 × 6 with
  `rough` 0.3–0.4. About 2,000 faces made the demo village, built and
  drawn in 120–190 ms (headless Chromium in a cloud container, measured
  27 Nov 2026 with `bake.mjs`, which prints the time per render).
- A recipe is a function `(art, rng, x, z, ...)` that opens one
  `art.object([x, 0, z])` and stacks shapes. The demo's recipes are short:
  - house: stone footing box, wall box (plaster or brick), door box, two
    glowing window boxes and a light in front, gable roof (shingles or
    thatch), chimney box.
  - tower: 6-sided tapering prism, plank platform, four posts, brazier
    (flared prism), flame (glowing squashed ball), a strong light.
  - tree: trunk prism and three rough leaf balls; pine: trunk and three
    stacked cones.
  - rock: rough squashed ball half in the ground (`floor: 0`).
  - lamp, barrel, crate: two or three shapes each.
- Styles: `art.style(colourName, material, { jitter, ao, emit, cover })`.
  `jitter` 0.07 varies each shape's colour ±7%. `ao: [h, dark]` darkens
  toward the shape's base, from `dark` at the base to 1 at `h` units up (a
  cheap ambient occlusion). Use `null` for the ground. `emit` 0–1 makes a
  face glow in its own colour; the light multiplies it by `grade.emit`.
- Placement: keep a list of taken circles and search outward from a wanted
  spot (`place` in `demo.html`). Place in order of importance: roads and
  plazas, buildings, light sources, props, trees, rocks.
- Give a project's recipes their numbers as options with defaults, so the
  game's content files can vary them (house width, roof kind, tree height).
  The demo's recipes draw these at random inside, to stay short.

## 5. The six buffers — when debugging or extending the light

| Buffer | Holds | Encoding |
|---|---|---|
| `albedo` | surface colour after material, AO and cover | sRGB; alpha = coverage |
| `normal` | world normal of the face | (n + 1) / 2 in RGB |
| `height` | world height of each pixel | 0–`HMAX` (8 units) → 0–255, an exact linear gradient per face |
| `bump` | the material's height | grey, same texture mapping as the albedo |
| `emit` | glow colour × `emit` | sRGB; mipmapped for the glow |
| `shadow` | where the sun's cast shadow falls on the ground | white = shadowed; objects drawn over it clear it |

- Each face is filled once per buffer, plus a 1-pixel stroke in the same
  fill that closes the hairline seams anti-aliasing leaves between faces.
- Look at any buffer with `demo.html?...&buffer=normal` (or albedo, height,
  bump, emit, shadow) before changing the light: most lighting bugs are
  buffer bugs.

## 6. Light — when tuning or extending it

- Per pixel: `colour = albedo × (ambient + sun + Σ point lights) + emit ×
  grade.emit`, in linear light (sRGB values raised to 2.2, gamma 2.2 back
  at the end).
- **Ambient:** blend of `groundLight` (facing down) and `sky` (facing up)
  by the normal's y. This sets the darkest the scene gets.
- **Sun or moon:** `sun.color × max(n · sun.dir, 0)`, reduced by 85% in
  cast shadow. `sun.dir` points toward the light. Lighting the left
  isometric faces and darkening the right ones reads best (dir
  ≈ (−0.35, 0.8, 0.5)). Shadows are the objects' faces pushed along the
  sun onto y = 0 and softened by a 3 × 3 blur. `dir.y` below 0.2 (once
  normalised) throws an error: a lower sun casts shadows off the map.
- **Point lights:** `intensity × flicker / (1 + d²)`, faded to 0 between
  0.6 and 1.0 of `radius`, times `max(n · L, 0)`. The 1 + d² keeps a light
  from blowing out what is next to it. Flicker is two sines of time per
  light (±10% and ±6%). Typical values: lamp 4 / 6 units, window 1.8 / 3.5,
  big fire 9 / 10. `look.lightScale` scales them all (0.1 by day).
- **Bump:** the normal tilts against the bump buffer's slope across the
  screen (`grade.bump` 1.2–1.6). Slopes are clamped so the edge between two
  faces doesn't read as a cliff.
- **Glow:** the emit buffer sampled at mip levels 1.5 and 3 (blurred for
  free), plus a soft halo round each light's screen position.
- Day and night need different settings, not just colours: by day the sun
  is strong (≈ 1.2–1.4), the sky ambient high (≈ 0.3–0.5), the lights low.
  At night the moon is weak and blue (≈ 0.3–0.4) and the lights do the work.

## 7. Looks — when adding a land, age, season or time of day

A look is plain data:

```js
{
  colors: { grass: '#4c5a38', dirt: '#5e4b39', stone: '#7d808a', roof: '#71402f', flame: '#ffb24a', /* every name the recipes use */ },
  clear: '#0a0c14',                    // background
  sky: [0.05, 0.065, 0.13],            // ambient from above (linear multipliers)
  groundLight: [0.025, 0.02, 0.025],   // ambient from below
  sun: { dir: [-0.35, 0.8, 0.5], color: [0.3, 0.38, 0.68] },
  lightScale: 1,                       // scales every point light
  cover: null,                         // or { color: '#dfe7f2', amount: 0.72 }
  trees: ['broad', 'pine'],            // content choices can live here too
  grade: { exposure: 1.5, saturation: 0.92, vignette: 0.55, lift: [0.008, 0.012, 0.03], levels: 28, grain: 0.03, glow: 0.7, bump: 1.6, emit: 2.5 },
}
```

- Pick colours by value first: ground mid-dark, walls lighter than roofs,
  foliage darker than grass, so shapes read without light. Keep each look
  to a few hue families; let the light add the warm/cool contrast (warm
  fire, cool ambient).
- Every look defines every colour name the recipes use; a missing name
  throws an error naming it.
- Variants of a creature or object per land: give it its own colour names
  and set them in each look, instead of drawing a new one.
- A time-of-day cycle: interpolate two looks' light and grade numbers
  (not the colours) over time.

## 8. The finish — when tuning the overall feel

In order, at the internal resolution, all in `render.js`:

1. glow added (`grade.glow` 0.3 day – 0.7 night);
2. tone curve `1 − e^(−x × exposure)` (`exposure` 1.1–1.5): soft
   highlights, no clipping;
3. saturation toward grey (`saturation` 0.85–1.0);
4. vignette (`vignette` 0.3–0.55: how dark the corners get);
5. lift: a colour added to the darkest tones (a little blue reads as
   night air);
6. gamma 2.2;
7. grain, ± `grain` / 2 per pixel, fixed per pixel so baking stays
   identical (0.02–0.04);
8. ordered dither to `levels` steps per channel (8 × 8 pattern; 24–32 gives
   the pixel-art banding, 64+ looks clean).

Scale the result up by a whole number with nearest-neighbour. Optional, not
in the reference: a tilt-shift blur (blur the top and bottom bands of the
screen) makes the scene read as a miniature.

## 9. Animation — when things must move

- Light flicker is free: pass time to `render(art, t)`; the buffers stay
  the same.
- Moving units and swaying trees: keep the static scene's buffers and draw
  only the moving things each frame into a copy of them. Then upload and
  light again. Canvas 2D handles a few hundred faces per frame at
  640 × 360; measure on the target phone.
- A sway without redrawing: offset the crown's faces by
  `sin(time + x) × 0.05` units before drawing. Do it only in the dynamic
  layer.
- Fire: an emissive ball whose squash and colour change per frame, plus a
  light whose intensity follows it.
- Weather (snow, ash, rain, fireflies): particles drawn after the finish as
  1–2-pixel squares, or into `emit` for glowing ones, in the low
  resolution so they match the pixel grid.

## 10. Baking — when the game ships images

- Two kinds: **lit images** (scenes, or single sprites with
  `alphaOut`; the light is baked in), or **buffer sprites** (save albedo,
  normal, height, bump and emit per sprite and light them at runtime).
  Lit images are simplest. Buffer sprites keep moving firelight but need
  the runtime pass.
- `bake.mjs` serves the folder on 127.0.0.1 (modules don't load from
  `file://`), opens each query, waits for `window.artDone` or
  `window.artError`, and saves the canvas at 1× and 3×. A project's bake
  script keeps that contract and adds a manifest: file, size, anchor
  (the pixel where the object's base centre lands, for placing it), look,
  seed.
- Bake one sprite per object × look, trimmed to its bounding box. Put
  sprites that are used together in one sheet.
- Check determinism every time: bake twice and compare hashes.
- Baked files are generated assets: if the project keeps a placeholder or
  asset register, list them there with the seed and the script that made
  them.

## 11. Running in a game — when generating at runtime

- Build and draw the static world once (load time: the demo's ~2,000 faces
  take 120–190 ms in headless Chromium in a cloud container; measure on
  the target phone), then only `render()` per frame.
- Keep the internal resolution low (≤ 640 × 360 or 360 × 640): the light
  pass runs once per pixel with up to 32 lights.
- WebGL2 is missing on some old devices and in some test browsers:
  `createRenderer` throws a clear message. Catch it and show baked lit
  images instead.
- Redraw only when something changes: a new building means redrawing the
  static buffers (or just that object's area), not every frame.

## 12. More effects — when the game needs them

- **Water:** a flat face in a dark colour with `cover: false`. For
  reflection, add a term in the light pass where a water mask is set (e.g.
  a spare emit colour or a 7th buffer): sky colour × fresnel
  (`pow(1 − n.y, 2)`) plus ripples from scrolling noise on the normal.
- **Lava, magic, crystals:** `emit` faces and a light; animate the emit
  colour.
- **Smoke:** soft dark balls drawn after the finish with low alpha, rising
  and fading.
- **Outlines** (if the look wants them): after the light, darken pixels
  whose height or normal differs strongly from a neighbour's.

## 13. Known limits — before promising a feature

- **Sorting:** objects sort by their anchor (painter's algorithm). Long or
  overlapping footprints can sort wrong. Split them into one-tile pieces;
  give a tall thin thing its anchor at its base centre.
- **Shadows** fall only on the flat ground (y = 0), only from the sun or
  moon. Objects don't shadow each other, and point lights cast none. For
  terrain with levels, project shadows per level, or skip cast shadows and
  rely on AO.
- **Ground height:** the reference ground is flat. Raised tiles work as
  boxes in `art.ground()`, drawn back to front by you. Shadows won't land
  on their tops.
- **Cover seams:** snow drawn face by face can leave a faint line between
  two ground polygons (visible on the winter demo's road). If it shows,
  give those polygons `cover: false` and a snowy colour of their own in
  that look.
- **8-bit height:** steps of 8/255 ≈ 0.03 units; enough for light, not for
  exact depth tests.
- **Lights:** 32 per pass. Merge distant small lights or drop the weakest.
- **Point lights ignore walls:** a fire lights through a wall's far side
  only if that side faces it. There is no occlusion.

## 14. Debugging — when a render looks wrong

- Look at the raw buffers (`&buffer=…`) to find which stage is wrong.
- Wrong face visible or missing: check the normal points outward (pass the
  shape's centre to `face`) and that `n · d > 0` for faces that should
  show.
- Texture smeared or stretched: the three points chosen for the texture
  mapping were nearly in a line. Use a face with a better-spread first
  vertex, or split the face.
- Everything too dark or too bright: check `sky`, `groundLight` and
  `sun.color` before `exposure`; the tone curve hides a lot.
- Light appears in the wrong place: the height buffer or the view inverse
  is wrong. Draw a light's screen position (`art.project(pos)`) as a dot
  and compare.
