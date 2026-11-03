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

// The view shows each colour after HSL's own shift, so the tool reads the
// colour under the press from a capture with HSL at its defaults: with Orange
// Hue at +100 (+30°), an orange renders near yellow, and pressing it must still
// move Orange, however often it is dragged.
describe("targetTool over HSL's own adjustment", () => {
  const ORANGE = [1, 0.5, 0] as const; // 30°
  const SHOWN = [1, 1, 0] as const; // 60°: that orange after +30°
  const shifted = { ...DEFAULT_HSL, hue: { ...DEFAULT_HSL.hue, orange: 100 } };
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  function shiftedRig(original: readonly [number, number, number] | null = ORANGE) {
    const rig = fakeApi(shifted);
    initRuntime(rig.api);
    return { rig, tool: targetTool(rig.api, () => original) };
  }

  it("moves the band of the colour before HSL, not the one the view shows", async () => {
    const { rig, tool } = shiftedRig();
    tool.onDown(SHOWN, { x: 5, y: 100 });
    tool.onMove({ x: 5, y: 140 });
    await settle();
    const { hue } = rig.develop.getState().params.hsl;
    expect(hue.orange).toBeCloseTo(80);
    expect(hue.yellow).toBe(0);
    expect(rig.captures).toEqual([{ hsl: DEFAULT_HSL }]);
  });

  it("keeps moving Orange on the next drag", async () => {
    const { rig, tool } = shiftedRig();
    tool.onDown(SHOWN, { x: 5, y: 100 });
    tool.onMove({ x: 5, y: 120 });
    await settle();
    tool.onUp();
    tool.onDown(SHOWN, { x: 5, y: 100 });
    await settle();
    tool.onMove({ x: 5, y: 120 });
    const { hue } = rig.develop.getState().params.hsl;
    expect(hue.orange).toBeCloseTo(80);
    expect(hue.yellow).toBe(0);
  });

  it("commits a drag released before the colour is read, once it is", async () => {
    const { rig, tool } = shiftedRig();
    tool.onDown(SHOWN, { x: 5, y: 100 });
    tool.onMove({ x: 5, y: 140 });
    tool.onUp();
    expect(rig.calls).toEqual([]);
    await settle();
    expect(rig.develop.getState().params.hsl.hue.orange).toBeCloseTo(80);
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "HSL Picker" });
  });

  it("falls back to the colour shown when the view can't be captured", async () => {
    const { rig, tool } = shiftedRig(null);
    tool.onDown(SHOWN, { x: 5, y: 100 });
    await settle();
    tool.onMove({ x: 5, y: 140 });
    expect(rig.develop.getState().params.hsl.hue.yellow).toBeCloseTo(-20);
  });

  it("captures nothing while HSL is at its defaults", () => {
    const { rig, tool } = setup();
    tool.onDown(GREEN, { x: 0, y: 100 });
    tool.onMove({ x: 0, y: 90 });
    expect(rig.captures).toEqual([]);
    expect(rig.develop.getState().params.hsl.hue.green).toBeCloseTo(5);
  });
});

describe("targetTool's history", () => {
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("adds no history step for a click that never moved", () => {
    const { rig, tool } = setup();
    tool.onDown(GREEN, { x: 0, y: 100 });
    tool.onUp();
    expect(rig.calls).toEqual([]);
  });

  it("drops a colour read for an earlier press once a later press has begun", async () => {
    const shifted = { ...DEFAULT_HSL, hue: { ...DEFAULT_HSL.hue, orange: 100 } };
    const rig = fakeApi(shifted);
    initRuntime(rig.api);
    const frames: (() => void)[] = [];
    const capture = rig.api.develop.captureFrame;
    rig.api.develop.captureFrame = (params) =>
      new Promise((resolve) => frames.push(() => void capture(params).then(resolve)));
    const tool = targetTool(rig.api, () => [1, 0.5, 0]);
    tool.onDown([1, 1, 0], { x: 5, y: 100 });
    tool.onMove({ x: 5, y: 200 });
    tool.onUp();
    tool.onDown([1, 1, 0], { x: 5, y: 100 });
    frames[1]();
    await settle();
    tool.onMove({ x: 5, y: 120 });
    frames[0]();
    await settle();
    tool.onUp();
    expect(rig.develop.getState().params.hsl.hue.orange).toBeCloseTo(90);
    expect(rig.calls.filter((c) => "commitEdit" in c)).toEqual([{ commitEdit: "HSL Picker" }]);
  });
});
