// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The HSL mixer's block of the develop program. Until Safelight 3.2.0 it was
// core's own; its GLSL is core's, moved as written. It runs at the develop
// program's hsl anchor, after the Tone Curve. Line 1 mixes every pixel, as core
// did for a version 1 photo; lines 2 and 3 skip default bands and clip only
// what they mix. The band weights (hslBandWeight, HSL_CENTERS) and colour
// conversions it calls stay in the program: the masks' mixer shares them. The
// uniforms keep core's names (an official extension's stage may); the bands
// come from the photo's `hsl` params, the band shaping from Preferences ▸ HSL.

import { HSL_CHANNELS } from "./bands";
import { RANGE_DEFAULT, SMOOTHNESS_DEFAULT } from "./settings";
import type { HSLAdjustments, Line, ProcessingStageContribution, StageDerive, UniformDeclaration } from "./safelight";

export const STAGE_ID = "safelight.hsl.mix";

const HSL_BANDS = (key: string): UniformDeclaration => ({
  key,
  glslType: "float",
  length: 8,
  default: [0, 0, 0, 0, 0, 0, 0, 0],
});

/** The bands, then Preferences ▸ HSL's band shaping (Colour range,
 *  Smoothness), which used to be the program's own uniforms. */
const HSL_UNIFORMS: UniformDeclaration[] = [
  ...["uHslHue", "uHslSat", "uHslLum"].map(HSL_BANDS),
  { key: "uHslRange", glslType: "float", default: 1 },
  { key: "uHslSmooth", glslType: "float", default: 1 },
];

const HSL_HELPERS = `vec3 applyHSL(vec3 c) {
  vec3 hsl = rgb2hsl(c);
  // Protect near-neutral pixels: an achromatic pixel has no real hue (rgb2hsl
  // reports 0 = red), so without this gate the Red sliders would tint/relight
  // every grey. Fades the whole effect in over a low saturation threshold, so
  // genuinely coloured pixels (even pale skies/skin) still respond fully.
  float chromaW = smoothstep(0.0, 0.10, hsl.y);
  if (chromaW < 1e-4) return c;

  float hueDeg = hsl.x * 360.0;

  float hueShift = 0.0;
  float satAdj = 0.0;
  float lumAdj = 0.0;
  for (int i = 0; i < 8; i++) {
    float wi = hslBandWeight(hueDeg, HSL_CENTERS[i], HSL_DPREV[i], HSL_DNEXT[i], uHslRange, uHslSmooth);
    hueShift += uHslHue[i] * wi;
    satAdj   += uHslSat[i] * wi;
    lumAdj   += uHslLum[i] * wi;
  }
  hueShift *= chromaW;
  satAdj   *= chromaW;
  lumAdj   *= chromaW;

  // Hue: rotate in HSL (luminance-invariant), ±30° at full slider.
  hsl.x = fract(hsl.x + hueShift * (30.0 / 360.0));
  vec3 rgb = hsl2rgb(hsl);

  // Saturation: perceptual. Scale chroma around the pixel's true luminance, so a
  // cut collapses the colour to its actual grey (not HSL-L's mid-range grey) and
  // a boost doesn't clip the bright channel into a different hue on the way up.
  if (abs(satAdj) > 1e-4) {
    float Lp = luma(rgb);
    rgb = mix(vec3(Lp), rgb, clamp(1.0 + satAdj, 0.0, 2.0));
  }

  // Luminance: hue-preserving gain (ratio-scale). Darkening a blue sky or lifting
  // reds keeps the hue and per-channel saturation intact, unlike an HSL-L add
  // which greys and shifts the colour. Gentle factor so shadows don't blow out.
  if (abs(lumAdj) > 1e-4) {
    rgb *= 1.0 + lumAdj * 0.6;
  }

  return clamp(rgb, 0.0, 1.0);
}`;

/** A percentage preference as the shader's factor, kept to [min, max]; 1
 *  for a value that isn't a number. */
export const preference = (value: unknown, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value / 100)) : 1;

/** True when every band is at 0. */
export const isDefaultHSL = (h: HSLAdjustments): boolean =>
  (["hue", "saturation", "luminance"] as const).every((band) => HSL_CHANNELS.every((ch) => h[band][ch] === 0));

/** The stage of release line `line`. */
export function hslStage(line: Line): ProcessingStageContribution {
  const base = { id: STAGE_ID, name: "HSL", phase: "display-adjust", anchor: "hsl" } as const;
  const values: StageDerive = ({ hsl }, ctx) => ({
    uHslHue: HSL_CHANNELS.map((ch) => hsl.hue[ch] / 100),
    uHslSat: HSL_CHANNELS.map((ch) => hsl.saturation[ch] / 100),
    uHslLum: HSL_CHANNELS.map((ch) => hsl.luminance[ch] / 100),
    uHslRange: preference(ctx.settings("hueRange", RANGE_DEFAULT), 0.25, 2),
    uHslSmooth: preference(ctx.settings("smoothness", SMOOTHNESS_DEFAULT), 0, 1),
  });
  if (line === 1) {
    return { ...base, glsl: "c = applyHSL(c);", helpers: HSL_HELPERS, uniforms: HSL_UNIFORMS, derive: values };
  }
  return {
    ...base,
    glsl: "if (uHslActive) c = applyHSL(clamp(c, 0.0, 1.0));",
    helpers: HSL_HELPERS,
    uniforms: [...HSL_UNIFORMS, { key: "uHslActive", glslType: "bool", default: false }],
    derive: (params, ctx) => ({ ...values(params, ctx), uHslActive: !isDefaultHSL(params.hsl) }),
  };
}
