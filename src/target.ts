// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The target tool: press on a colour in the image and drag up or down to move
// the selected band's sliders for that colour. The drag spreads over the bands
// by their weights at the pressed hue (bands.ts), and a whole drag is one undo
// step, "HSL Picker". It runs as the canvas's pick-drag tool, so core probes
// the colour under the press.

import { HSL_CHANNELS, bandWeights, rgbToHue } from "./bands";
import { selectedBand } from "./band-store";
import { RANGE_DEFAULT, SENSITIVITY_DEFAULT, SMOOTHNESS_DEFAULT } from "./settings";
import { preference } from "./stages";
import type { PickDragTool, SafelightAPI } from "./safelight";

/** Weights under this move nothing. */
const NEGLIGIBLE = 0.01;

export function targetTool(api: SafelightAPI): PickDragTool {
  let drag: { startY: number; weights: number[]; start: number[] } | null = null;
  const develop = api.stores.useDevelopStore;

  return {
    onDown([r, g, b], point) {
      const weights = bandWeights(
        rgbToHue(r, g, b),
        preference(api.settings.get("hueRange", RANGE_DEFAULT), 0.25, 2),
        preference(api.settings.get("smoothness", SMOOTHNESS_DEFAULT), 0, 1),
      );
      const band = develop.getState().params.hsl[selectedBand()];
      drag = { startY: point.y, weights, start: HSL_CHANNELS.map((ch) => band[ch]) };
    },
    onMove(point) {
      if (!drag) return;
      // Up raises the band; the sensitivity is slider units per pixel.
      const delta = -(point.y - drag.startY) * api.settings.get("pickerSensitivity", SENSITIVITY_DEFAULT);
      const { hsl } = develop.getState().params;
      const band = selectedBand();
      const values = { ...hsl[band] };
      drag.weights.forEach((weight, i) => {
        if (weight < NEGLIGIBLE) return;
        values[HSL_CHANNELS[i]] = Math.max(-100, Math.min(100, drag!.start[i] + delta * weight));
      });
      develop.getState().setParam("hsl", { ...hsl, [band]: values });
    },
    onUp() {
      if (!drag) return;
      drag = null;
      void develop.getState().commitEdit("HSL Picker");
    },
  };
}
