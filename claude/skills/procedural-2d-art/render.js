// render.js: lights the six buffers procgen.js draws and gives them the
// finish (glow, tone curve, saturation, vignette, shadow tint, grain and an
// ordered dither), in one WebGL2 pass at the buffers' own low resolution.
// Show the canvas scaled up by a whole number with CSS
// `image-rendering: pixelated`, so every pixel stays a crisp square.
import { HMAX, hexRgb } from './procgen.js';

export const MAX_LIGHTS = 32;
const KEYS = ['albedo', 'normal', 'height', 'bump', 'emit', 'shadow'];

const VS = `#version 300 es
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D tAlbedo, tNormal, tHeight, tBump, tEmit, tShadow;
uniform vec2 uSize;        // buffer size in pixels
uniform vec3 uOrigin;      // screen x, y of the world origin, and pixels per world unit
uniform vec3 uA, uB;       // the view: screen x = A . p, screen y = B . p
uniform mat2 uInvXZ;       // screen (minus the height part) back to world x, z
uniform vec3 uSky, uGround, uSunDir, uSunCol, uClear;
uniform vec4 uLP[${MAX_LIGHTS}], uLC[${MAX_LIGHTS}]; // light position + radius, linear colour + intensity
uniform int uNL;
uniform float uTime, uBump, uEmit, uGlow, uGrain, uAlphaOut;
uniform vec4 uGrade;       // exposure, saturation, vignette, dither levels per channel
uniform vec3 uLift;        // colour added to the darkest tones
out vec4 outColor;

float bayer8(ivec2 p) { // 8x8 ordered-dither threshold in (0, 1)
  int v = 0;
  for (int i = 0; i < 3; i++) { int x = (p.x >> i) & 1, y = (p.y >> i) & 1; v |= (((x ^ y) << 1) | y) << (4 - 2 * i); }
  return (float(v) + 0.5) / 64.0;
}
float hash(uvec2 p) { uint h = p.x * 1597334677u ^ p.y * 3812015801u; h ^= h >> 16; h *= 2246822519u; h ^= h >> 13; return float(h) / 4294967296.0; }
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
ivec2 at(ivec2 p) { return clamp(p, ivec2(0), ivec2(uSize) - 1); }

void main() {
  ivec2 px = ivec2(gl_FragCoord.xy); px.y = int(uSize.y) - 1 - px.y; // row 0 = top, as in the canvases
  vec2 uv = (vec2(px) + 0.5) / uSize;
  vec4 alb = texelFetch(tAlbedo, px, 0);
  vec3 col = lin(uClear);
  if (alb.a > 0.0) {
    vec3 n0 = normalize(texelFetch(tNormal, px, 0).rgb * 2.0 - 1.0);
    float h = texelFetch(tHeight, px, 0).r * ${HMAX.toFixed(1)};
    // bump: tilt the normal by the material's height, measured across the screen
    float b0 = texelFetch(tBump, px, 0).r;
    float bx = clamp(texelFetch(tBump, at(px + ivec2(1, 0)), 0).r - b0, -0.3, 0.3);
    float by = clamp(texelFetch(tBump, at(px + ivec2(0, 1)), 0).r - b0, -0.3, 0.3);
    vec3 ta = normalize(uA - n0 * dot(n0, uA)), tb = normalize(-uB + n0 * dot(n0, uB));
    vec3 n = normalize(n0 - uBump * (bx * ta - by * tb));
    // world position from the screen position and the stored height
    vec2 s = (vec2(px) + 0.5 - uOrigin.xy) / uOrigin.z;
    vec2 xz = uInvXZ * (s - vec2(uA.y, uB.y) * h);
    vec3 P = vec3(xz.x, h, xz.y);
    float shade = 0.0; // cast shadows land on the ground only; soften them a little
    if (n0.y > 0.6 && h < 0.06) {
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) shade += texelFetch(tShadow, at(px + ivec2(i, j)), 0).r;
      shade /= 9.0;
    }
    vec3 light = mix(uGround, uSky, n.y * 0.5 + 0.5) + uSunCol * max(dot(n, uSunDir), 0.0) * (1.0 - shade * 0.85);
    for (int i = 0; i < ${MAX_LIGHTS}; i++) {
      if (i >= uNL) break;
      vec3 d = uLP[i].xyz - P; float dist = max(length(d), 1e-3);
      float flicker = 1.0 + 0.10 * sin(uTime * 11.0 + float(i) * 5.3) + 0.06 * sin(uTime * 23.0 + float(i) * 2.1);
      float fall = uLC[i].w * flicker / (1.0 + dist * dist) * (1.0 - smoothstep(uLP[i].w * 0.6, uLP[i].w, dist));
      light += uLC[i].rgb * fall * max(dot(n, d / dist), 0.0);
    }
    vec3 lit = lin(alb.rgb) * light + lin(texelFetch(tEmit, px, 0).rgb) * uEmit;
    col = uAlphaOut > 0.5 ? lit : mix(col, lit, alb.a); // sprites keep their own edge colour
  }
  // glow: the emission buffer blurred through its mipmaps, and a halo round each light
  vec3 glow = lin(textureLod(tEmit, uv, 1.5).rgb) * 0.6 + lin(textureLod(tEmit, uv, 3.0).rgb) * 0.9;
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    if (i >= uNL) break;
    vec2 sp = uOrigin.xy + uOrigin.z * vec2(dot(uA, uLP[i].xyz), dot(uB, uLP[i].xyz));
    float r = length(vec2(px) + 0.5 - sp) / uOrigin.z;
    glow += uLC[i].rgb * uLC[i].w * 0.05 * exp(-r * r * 1.5);
  }
  col += glow * uGlow;
  // finish
  col = 1.0 - exp(-col * uGrade.x);                                  // tone curve
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uGrade.y);                                 // saturation
  vec2 q = uv - 0.5; q.x *= uSize.x / uSize.y;
  col *= 1.0 - uGrade.z * smoothstep(0.35, 1.0, length(q));          // vignette
  col += uLift * (1.0 - smoothstep(0.0, 0.25, l));                   // tint the shadows
  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  col += (hash(uvec2(px)) - 0.5) * uGrain;                           // grain
  col = floor(col * uGrade.w + bayer8(px)) / uGrade.w;               // ordered dither to a few levels
  outColor = vec4(col, uAlphaOut > 0.5 ? alb.a : 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
  return s;
}

/** Throws when WebGL2 is missing: bake the art where it is, or ship pre-lit images. */
export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL2 is not available here, so the art cannot be lit. Bake it where WebGL2 works, or ship pre-lit images.');
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('shader link: ' + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const loc = {}, U = (n) => (loc[n] ??= gl.getUniformLocation(prog, n));
  const tex = KEYS.map((k, i) => { gl.uniform1i(U('t' + k[0].toUpperCase() + k.slice(1)), i); return gl.createTexture(); });
  const vao = gl.createVertexArray(), lp = new Float32Array(MAX_LIGHTS * 4), lc = new Float32Array(MAX_LIGHTS * 4);
  let uploaded = -1;

  return {
    /** Light and finish `art` (after art.draw()). time drives the flicker; alphaOut keeps transparency (sprites). */
    render(art, time = 0, { alphaOut = false } = {}) {
      const { look } = art, g = look.grade;
      if (canvas.width !== art.w || canvas.height !== art.h) { canvas.width = art.w; canvas.height = art.h; }
      gl.useProgram(prog);
      if (uploaded !== art.version) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        KEYS.forEach((k, i) => {
          gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex[i]);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art.buf[k].canvas);
          const mip = k === 'emit';
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mip ? gl.LINEAR : gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          if (mip) gl.generateMipmap(gl.TEXTURE_2D);
        });
        uploaded = art.version;
      }
      const [a, b] = [art.a, art.b], det = a[0] * b[2] - a[2] * b[0];
      gl.uniform2f(U('uSize'), art.w, art.h);
      gl.uniform3f(U('uOrigin'), art.ox, art.oy, art.scale);
      gl.uniform3fv(U('uA'), a); gl.uniform3fv(U('uB'), b);
      gl.uniformMatrix2fv(U('uInvXZ'), false, [b[2] / det, -b[0] / det, -a[2] / det, a[0] / det]);
      const sun = look.sun.dir, sl = Math.hypot(...sun);
      gl.uniform3fv(U('uSky'), look.sky); gl.uniform3fv(U('uGround'), look.groundLight);
      gl.uniform3fv(U('uSunDir'), sun.map((v) => v / sl)); gl.uniform3fv(U('uSunCol'), look.sun.color);
      gl.uniform3fv(U('uClear'), hexRgb(look.clear));
      if (art.lights.length > MAX_LIGHTS) console.warn(`${art.lights.length} lights; only the first ${MAX_LIGHTS} are lit`);
      const n = Math.min(art.lights.length, MAX_LIGHTS), k = look.lightScale ?? 1;
      for (let i = 0; i < n; i++) {
        const L = art.lights[i];
        lp.set([...L.pos, L.radius], i * 4);
        lc.set([...L.rgb.map((v) => v ** 2.2), L.intensity * k], i * 4);
      }
      gl.uniform4fv(U('uLP'), lp); gl.uniform4fv(U('uLC'), lc); gl.uniform1i(U('uNL'), n);
      gl.uniform1f(U('uTime'), time); gl.uniform1f(U('uBump'), g.bump); gl.uniform1f(U('uEmit'), g.emit);
      gl.uniform1f(U('uGlow'), g.glow); gl.uniform1f(U('uGrain'), g.grain); gl.uniform1f(U('uAlphaOut'), alphaOut ? 1 : 0);
      gl.uniform4f(U('uGrade'), g.exposure, g.saturation, g.vignette, g.levels); gl.uniform3fv(U('uLift'), g.lift);
      gl.viewport(0, 0, art.w, art.h); gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
