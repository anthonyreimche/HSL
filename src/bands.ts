// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The eight colour bands and their weights at a hue, in TypeScript: the same
// hat weights the program's hslBandWeight gives applyHSL, with Preferences ▸
// HSL's shaping (`range` scales the half-widths, `smoothness` blends linear
// and smoothstep falloff). The target tool spreads a drag by these weights, so
// it stays honest only while they match the shader's: the sliders then move as
// much as the pixels under the cursor change. range 1, smoothness 1 is the
// default partition-of-unity tiling.

import type { HSLChannel } from "./safelight";

export const HSL_CHANNELS: readonly HSLChannel[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "aqua",
  "blue",
  "purple",
  "magenta",
];

/** Each band's centre hue, as the program's HSL_CENTERS. */
const CENTERS = [0, 30, 60, 120, 180, 240, 280, 320];
/** The circular gap from each centre to the one before and after it, as the
 *  program's HSL_DPREV / HSL_DNEXT. */
const DPREV = [40, 30, 30, 60, 60, 60, 40, 40];
const DNEXT = [30, 30, 60, 60, 60, 40, 40, 40];

/** Each band's weight at `hueDeg`. */
export function bandWeights(hueDeg: number, range: number, smoothness: number): number[] {
  return CENTERS.map((center, i) => {
    const d = ((hueDeg - center + 540) % 360) - 180; // signed -180..180
    const dp = DPREV[i] * range;
    const dn = DNEXT[i] * range;
    let t: number;
    if (d <= 0) {
      if (d <= -dp) return 0;
      t = (d + dp) / dp;
    } else {
      if (d >= dn) return 0;
      t = 1 - d / dn;
    }
    return (1 - smoothness) * t + smoothness * (t * t * (3 - 2 * t));
  });
}

/** The hue of an sRGB colour, in degrees; 0 for a grey. */
export function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let hue: number;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return hue * 360;
}
