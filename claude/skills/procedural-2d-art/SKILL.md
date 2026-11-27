---
name: procedural-2d-art
description: Make game art entirely in code for 2D isometric and top-down games — seeded noise, small tiling material textures, low-poly shapes drawn as flat polygons that carry normals and heights, a sun or moon plus point lights, one palette per land, age or season, and a finishing pass (glow, grade, vignette, grain, ordered dither) at a low resolution scaled up with crisp pixels. Includes tested reference code (Canvas 2D + one WebGL2 pass) and a bake script. Use when the user wants procedural or code-generated art, art with no image files, a lit "miniature / diorama" pixel look, many palette variants of the same objects, or sprites and backgrounds baked from code. Not for painted, hand-drawn or photo-real art, expressive characters, faces or UI icons.
---

# Procedural 2D and isometric game art

Everything is drawn by code from a seed: no image files. Objects are built
from a few low-poly shapes (boxes, prisms, cones, balls, roofs) described in
world units, projected by a 2D view (isometric or 3/4 top-down) into flat
polygons, and drawn with Canvas 2D into six buffers: colour, surface
direction (normal), height, material bump, emission and cast shadow. One
WebGL2 pass lights the buffers with a sky, a sun or moon and point lights
(fires, lamps, windows), then gives the whole frame one finish. Because the
art knows each pixel's direction and height, the light behaves as in 3D
while everything stays 2D.

The reference code in this folder works and was checked by rendering
(`TECHNIQUES.md` explains every part):

| File | What |
|---|---|
| `procgen.js` | Seeded random numbers and noise, 13 material tiles, the views, the shape kit and the six buffers (`Art`, `Model`) |
| `render.js` | The WebGL2 lighting and finishing pass (`createRenderer`) |
| `demo.html` | Three looks (dusk, winter, day), object recipes (house, tower, trees, rock, lamp, barrel, crate), a village scene, single sprites and a raw-buffer view |
| `bake.mjs` | Renders demo pages to PNG with headless Chromium (Playwright); the pattern for a project's own bake script |

## When it fits — tell the user before building

- **Fits:** buildings, terrain, paths, props, trees, rocks, fire and light,
  map tiles, backgrounds, many variants of one set (lands, ages, seasons,
  times of day), tiny downloads, art that must match exactly every time.
- **Doesn't fit:** a painted or hand-drawn look, faces and expressive
  characters, detailed creatures, UI icons and text. Say so and offer a
  mix: code-drawn world plus art from elsewhere for those parts.
- The look is the project's own. When the user points at another game as
  reference, take the technique, never its palette, signature shapes or
  composition (`LEGAL.md` §3).

## Ask before building (one round, each with a recommendation)

1. **View:** isometric 2:1 (recommended for building and strategy games),
   3/4 top-down, or straight top-down (flat; little light on walls).
2. **Delivery:** bake at build time to PNG (recommended for phones: fast
   start, every sprite reviewable), generate at load time (tiny download,
   endless variation), or both (static world baked, lights live).
3. **Resolution and pixel size:** the internal size the art is drawn at and
   the whole-number scale-up, e.g. 640×360 ×3 for 1080p landscape, 360×640
   ×3 or 270×480 ×4 for a portrait phone.
4. **Light:** full (WebGL2, moving firelight), baked into the images (no
   WebGL needed at runtime), or unlit (flat colours, cheapest).
5. **Looks:** how many palettes and their moods (night, day, snow, desert,
   one per age…), with the user's colours or references if they have them.
6. **Finish:** the dithered pixel finish (levels 24–32, grain, vignette) or
   a cleaner one (levels 64+, no grain).
7. **Subjects:** the list of objects and tiles needed, their sizes in
   tiles, and which must animate.

Small details (texture density, light counts, noise seeds) are agent
defaults: list them under "Decided by the agent".

## Workflow, each step with its check

1. **Copy the reference files** into the project (e.g. `src/art/`). Keep
   looks and object recipes in the project's content or config files, not
   in engine code. Check: the demo renders unchanged from the new place
   (`node bake.mjs out "view=iso&look=dusk&seed=3"`) and you looked at it.
2. **Set the view and resolution.** Check: one render at the real size,
   scaled up by the real factor.
3. **Write the looks** (`TECHNIQUES.md` §7). Check: the same scene in every
   look side by side, at real size.
4. **Write each object recipe** as a function of (art, rng, position,
   options) using the shape kit. Check: each one alone as a sprite at its
   in-game size, then in the busiest scene (overlaps, sorting, light).
5. **Lay out scenes from game data** (positions, which objects, which look).
6. **Bake or wire up** (`TECHNIQUES.md` §10–11). Check: bake twice and
   compare file hashes (must match); change the seed and the art changes;
   the run time is written in the bake script's header.
7. **Failure paths.** Check: no WebGL2 gives the fallback or a clear message
   (launch Chromium with `--disable-webgl --disable-webgl2
   --disable-3d-apis`); an unknown look, material or object name gives an
   error that names the known ones.
8. **Performance** on the weakest target: `window.artStats.ms` for drawing,
   frame time for the lit pass at the internal resolution. Check: measured
   numbers written down, not guessed.
9. **Show the user** every look × view at real size, the worst case first
   (the busiest scene on the smallest screen), before it goes into the game.

## Rules

- All randomness comes from `makeRng(seed)` or the hash and noise
  functions; never `Math.random()` in art code. Same seed and code, same
  pixels.
- Colours come from the look by name, with a small jitter. Materials are
  brightness and height only. A new land, age or season is a new look, not
  new shapes.
- Draw at the low internal resolution and scale up by a whole number with
  `image-rendering: pixelated` (or nearest-neighbour when baking). A
  fractional scale makes pixels uneven.
- Keep texture density near one texel per pixel (the default). Denser
  shimmers; sparser looks blocky.
- Every standing thing is its own `art.object(anchor)` so it sorts by depth.
  Split long things (walls, fences, bridges) into pieces of about one tile.
- Paths, patches and other ground decals go into `art.ground()`, in the order
  they stack. The ground is never depth-sorted.
- At most 32 point lights (`MAX_LIGHTS`); merge close ones. Give every
  glowing part (`emit`) a light if it should light its surroundings.
- Judge every change from a render, not from the code. While this skill was
  being written, a sort bug drew the grass over the road. The code ran
  cleanly; only the picture showed it.
- Read `TECHNIQUES.md` §13 (known limits) before promising shadows on
  objects, terrain with heights, or more than 32 lights.
