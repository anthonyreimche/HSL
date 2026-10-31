// The stage each release line registers. Its text is pinned with the hashes
// Safelight's own tests hold for its copy of it
// (src/rendering/webgl/essential-stages.test.ts in the app): a change here
// fails until the app's copy changes the same way, so the program a line
// builds stays the one the app froze for that line's process version.

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { Line, ProcessingStageContribution, StageDeriveContext } from "../src/safelight";
import { STAGE_ID, hslStage, isDefaultHSL } from "../src/stages";
import { DEFAULT_HSL } from "./support/fake-api";

const LINE_HASHES: Record<Line, string> = {
  1: "e228a29720f17db7a9c6699b9c538c7ab0b8552f63067651fb901c56b702fcca",
  2: "3389038c079d541875c2a95a0d756a854633bb7ced64c2e8cbe68062da5d2df5",
  3: "3389038c079d541875c2a95a0d756a854633bb7ced64c2e8cbe68062da5d2df5",
};

/** What a line's hash covers, as the app's stageText writes it. */
const stageText = (s: ProcessingStageContribution): string =>
  JSON.stringify([s.id, s.phase, s.priority ?? null, s.anchor ?? null, s.glsl, s.helpers ?? null, s.uniforms, s.textures ?? null]);

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const prefs = (values: Record<string, unknown> = {}): StageDeriveContext => ({
  settings: <T,>(key: string, fallback: T) => (key in values ? (values[key] as T) : fallback),
});

const MIXED = {
  hue: { ...DEFAULT_HSL.hue, red: 20, blue: -100 },
  saturation: { ...DEFAULT_HSL.saturation, orange: -40 },
  luminance: { ...DEFAULT_HSL.luminance, magenta: 55 },
};

describe("hslStage", () => {
  it.each([1, 2, 3] as const)("registers line %i's text as the app froze it", (line) => {
    expect(sha256(stageText(hslStage(line)))).toBe(LINE_HASHES[line]);
  });

  it("runs at the hsl anchor", () => {
    expect(hslStage(3)).toMatchObject({ id: STAGE_ID, phase: "display-adjust", anchor: "hsl" });
  });

  it("mixes every pixel on line 1, and only while in use from line 2", () => {
    expect(hslStage(1).glsl).toBe("c = applyHSL(c);");
    for (const line of [2, 3] as const) {
      expect(hslStage(line).glsl).toBe("if (uHslActive) c = applyHSL(clamp(c, 0.0, 1.0));");
    }
  });

  it("takes the bands from the photo, a slider's 100 as 1, in the program's colour order", () => {
    expect(hslStage(1).derive?.({ hsl: MIXED }, prefs())).toEqual({
      uHslHue: [0.2, 0, 0, 0, 0, -1, 0, 0],
      uHslSat: [0, -0.4, 0, 0, 0, 0, 0, 0],
      uHslLum: [0, 0, 0, 0, 0, 0, 0, 0.55],
      uHslRange: 1,
      uHslSmooth: 1,
    });
  });

  it("says from line 2 whether any band moves", () => {
    expect(hslStage(3).derive?.({ hsl: MIXED }, prefs())).toMatchObject({ uHslActive: true });
    expect(hslStage(3).derive?.({ hsl: DEFAULT_HSL }, prefs())).toMatchObject({ uHslActive: false });
  });

  it.each([
    [{ hueRange: 150, smoothness: 40 }, 1.5, 0.4],
    [{ hueRange: 10, smoothness: 300 }, 0.25, 1],
    [{ hueRange: 500, smoothness: -5 }, 2, 0],
    [{ hueRange: Number.NaN, smoothness: "soft" }, 1, 1],
  ])("shapes the bands from Preferences ▸ HSL %o", (values, range, smooth) => {
    expect(hslStage(3).derive?.({ hsl: DEFAULT_HSL }, prefs(values))).toMatchObject({
      uHslRange: range,
      uHslSmooth: smooth,
    });
  });

  it.each([1, 3] as const)("derives a value for every uniform line %i declares, and nothing else", (line) => {
    const stage = hslStage(line);
    expect(Object.keys(stage.derive?.({ hsl: MIXED }, prefs()) ?? {}).sort()).toEqual(
      stage.uniforms.map((u) => u.key).sort(),
    );
  });
});

describe("isDefaultHSL", () => {
  it("is true only when every band is at 0", () => {
    expect(isDefaultHSL(DEFAULT_HSL)).toBe(true);
    expect(isDefaultHSL({ ...DEFAULT_HSL, luminance: { ...DEFAULT_HSL.luminance, aqua: 1 } })).toBe(false);
  });
});
