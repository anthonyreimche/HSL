// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The target tool: press on a colour in the image and drag up or down to move
// the selected band's sliders for that colour. The drag spreads over the bands
// by their weights at the pressed hue (bands.ts), and a whole drag is one undo
// step, "HSL Picker". It runs as the canvas's pick-drag tool, so core probes
// the colour under the press. That colour is shown after HSL's own shift, so
// while any band is moved the tool reads the press from a capture of the view
// with HSL at its defaults instead: the bands are weighted by the colour HSL
// receives, as the program weights them.

import { HSL_CHANNELS, bandWeights, rgbToHue } from "./bands";
import { selectedBand } from "./band-store";
import { RANGE_DEFAULT, SENSITIVITY_DEFAULT, SMOOTHNESS_DEFAULT } from "./settings";
import { preference } from "./stages";
import type { CanvasPoint, HSLAdjustments, PickDragTool, SafelightAPI } from "./safelight";

/** Weights under this move nothing. */
const NEGLIGIBLE = 0.01;

type Rgb = readonly [number, number, number];

/** The sRGB colour of a captured frame's pixel at a canvas point, or null. */
export type PixelReader = (frame: ImageBitmap, point: CanvasPoint) => Rgb | null;

const NEUTRAL_BAND = { red: 0, orange: 0, yellow: 0, green: 0, aqua: 0, blue: 0, purple: 0, magenta: 0 };
const NEUTRAL_HSL: HSLAdjustments = { hue: NEUTRAL_BAND, saturation: NEUTRAL_BAND, luminance: NEUTRAL_BAND };

const isNeutral = (hsl: HSLAdjustments) =>
  Object.values(hsl).every((band) => Object.values(band).every((v) => v === 0));

let scratch: OffscreenCanvas | null = null;

const readBitmapPixel: PixelReader = (frame, point) => {
  if (frame.width < 1 || frame.height < 1) return null;
  scratch ??= new OffscreenCanvas(1, 1);
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const x = Math.min(frame.width - 1, Math.max(0, Math.floor(point.x)));
  const y = Math.min(frame.height - 1, Math.max(0, Math.floor(point.y)));
  ctx.clearRect(0, 0, 1, 1);
  ctx.drawImage(frame, x, y, 1, 1, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
};

interface Drag {
  startY: number;
  start: number[];
  /** Null until the press's colour has been read. */
  weights: number[] | null;
  /** The latest pointer y, to land once the weights are known. */
  y: number | null;
  moved: boolean;
  released: boolean;
}

export function targetTool(api: SafelightAPI, readPixel: PixelReader = readBitmapPixel): PickDragTool {
  let drag: Drag | null = null;
  /** The newest press, released or not: a read that lands after a later
   *  press began would drag from stale bands over that press's. */
  let latest: Drag | null = null;
  const develop = api.stores.useDevelopStore;

  const weightsOf = ([r, g, b]: Rgb) =>
    bandWeights(
      rgbToHue(r, g, b),
      preference(api.settings.get("hueRange", RANGE_DEFAULT), 0.25, 2),
      preference(api.settings.get("smoothness", SMOOTHNESS_DEFAULT), 0, 1),
    );

  const apply = (d: Drag) => {
    if (!d.weights || d.y === null) return;
    d.moved = true;
    // Up raises the band; the sensitivity is slider units per pixel.
    const delta = -(d.y - d.startY) * api.settings.get("pickerSensitivity", SENSITIVITY_DEFAULT);
    const { hsl } = develop.getState().params;
    const band = selectedBand();
    const values = { ...hsl[band] };
    d.weights.forEach((weight, i) => {
      if (weight < NEGLIGIBLE) return;
      values[HSL_CHANNELS[i]] = Math.max(-100, Math.min(100, d.start[i] + delta * weight));
    });
    develop.getState().setParam("hsl", { ...hsl, [band]: values });
  };

  const commit = (d: Drag) => {
    if (d.moved) void develop.getState().commitEdit("HSL Picker");
  };

  /** The colour under the press as HSL receives it; the shown one when the
   *  view can't be captured. */
  const original = async (shown: Rgb, point: CanvasPoint): Promise<Rgb> => {
    const frame = await api.develop.captureFrame({ ...develop.getState().params, hsl: NEUTRAL_HSL });
    try {
      return readPixel(frame, point) ?? shown;
    } finally {
      frame.close();
    }
  };

  return {
    onDown(shown, point) {
      const { hsl } = develop.getState().params;
      const band = hsl[selectedBand()];
      const d: Drag = {
        startY: point.y,
        start: HSL_CHANNELS.map((ch) => band[ch]),
        weights: null,
        y: null,
        moved: false,
        released: false,
      };
      drag = d;
      latest = d;
      if (isNeutral(hsl)) {
        d.weights = weightsOf(shown);
        return;
      }
      void original(shown, point)
        .catch(() => shown)
        .then((rgb) => {
          if (latest !== d) return;
          d.weights = weightsOf(rgb);
          apply(d);
          if (d.released) commit(d);
        });
    },
    onMove(point) {
      if (!drag) return;
      drag.y = point.y;
      apply(drag);
    },
    onUp() {
      const d = drag;
      if (!d) return;
      drag = null;
      d.released = true;
      if (d.weights) commit(d);
    },
  };
}
