// The target tool: a press on a colour picks the bands it belongs to, a drag up
// or down moves the selected band's sliders for them by their weights, and the
// release commits the drag as one step. The band weights are the program's.

import { afterEach, describe, expect, it } from "vitest";
import { HSL_CHANNELS, bandWeights, rgbToHue } from "../src/bands";
import { selectBand } from "../src/band-store";
import { initRuntime } from "../src/rt";
import { targetTool } from "../src/target";
import { DEFAULT_HSL, fakeApi } from "./support/fake-api";

const GREEN = [0.2, 0.8, 0.2] as const;

function setup() {
  const rig = fakeApi();
  initRuntime(rig.api);
  return { rig, tool: targetTool(rig.api) };
}

afterEach(() => selectBand("hue"));

describe("bandWeights", () => {
  it("gives a band's own centre all of it", () => {
    expect(bandWeights(120, 1, 1)).toEqual([0, 0, 0, 1, 0, 0, 0, 0]);
  });

  it("tiles the hue circle: the weights sum to 1 everywhere", () => {
    for (let hue = 0; hue < 360; hue += 7) {
      const sum = bandWeights(hue, 1, 1).reduce((a, b) => a + b, 0);
      expect(sum, String(hue)).toBeCloseTo(1, 10);
    }
  });

  it("narrows the bands with a lower range", () => {
    expect(bandWeights(85, 0.5, 1)[3]).toBe(0);
    expect(bandWeights(85, 1, 1)[3]).toBeGreaterThan(0);
  });

  it("falls off linearly at smoothness 0", () => {
    expect(bandWeights(90, 1, 0)[3]).toBeCloseTo(0.5, 10);
  });
});

describe("rgbToHue", () => {
  it("reads the hue of a colour and 0 for a grey", () => {
    expect(rgbToHue(1, 0, 0)).toBe(0);
    expect(rgbToHue(0, 1, 0)).toBe(120);
    expect(rgbToHue(0, 0, 1)).toBe(240);
    expect(rgbToHue(0.5, 0.5, 0.5)).toBe(0);
  });
});

describe("targetTool", () => {
  it("raises the pressed colour's hue when dragged up, by the default sensitivity", () => {
    const { rig, tool } = setup();
    tool.onDown(GREEN, { x: 10, y: 100 });
    tool.onMove({ x: 10, y: 60 });
    expect(rig.develop.getState().params.hsl.hue.green).toBeCloseTo(20);
    expect(rig.develop.getState().params.hsl.hue.red).toBe(0);
    tool.onUp();
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "HSL Picker" });
  });

  it("drags from where the sliders were at the press, not from the last move", () => {
    const { rig, tool } = setup();
    tool.onDown(GREEN, { x: 0, y: 100 });
    tool.onMove({ x: 0, y: 80 });
    tool.onMove({ x: 0, y: 90 });
    expect(rig.develop.getState().params.hsl.hue.green).toBeCloseTo(5);
  });

  it("moves the selected band, and keeps to -100..100", () => {
    const { rig, tool } = setup();
    selectBand("luminance");
    tool.onDown(GREEN, { x: 0, y: 0 });
    tool.onMove({ x: 0, y: 1000 });
    const { hsl } = rig.develop.getState().params;
    expect(hsl.luminance.green).toBe(-100);
    expect(hsl.hue).toEqual(DEFAULT_HSL.hue);
  });

  it("follows the sensitivity preference", () => {
    const { rig, tool } = setup();
    rig.settings.set("pickerSensitivity", 1.5);
    tool.onDown(GREEN, { x: 0, y: 10 });
    tool.onMove({ x: 0, y: 0 });
    expect(rig.develop.getState().params.hsl.hue.green).toBeCloseTo(15);
  });

  it("spreads a colour between two bands by their weights", () => {
    const { rig, tool } = setup();
    const yellowish = [1, 0.75, 0] as const; // 45°: between orange and yellow
    tool.onDown(yellowish, { x: 0, y: 100 });
    tool.onMove({ x: 0, y: 0 });
    const weights = bandWeights(45, 1, 1);
    const { hue } = rig.develop.getState().params.hsl;
    HSL_CHANNELS.forEach((ch, i) => expect(hue[ch], ch).toBeCloseTo(weights[i] >= 0.01 ? 50 * weights[i] : 0));
  });

  it("writes and commits nothing without a press", () => {
    const { rig, tool } = setup();
    tool.onMove({ x: 0, y: 0 });
    tool.onUp();
    expect(rig.calls).toEqual([]);
  });
});
