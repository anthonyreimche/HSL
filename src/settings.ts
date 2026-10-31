// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Preferences ▸ HSL, as core's built-in registered it: the panel's default
// layout, the band shaping the stage reads (Colour range, Smoothness), and the
// target tool's sensitivity. The keys are core's, which Safelight 3.2.0 moved
// under this extension's id with the rest of its settings.

import type { SettingsContribution } from "./safelight";

export type HslView = "tabs" | "all";

export const VIEW_DEFAULT: HslView = "tabs";
export const RANGE_DEFAULT = 100;
export const SMOOTHNESS_DEFAULT = 100;
export const SENSITIVITY_DEFAULT = 0.5;

export const HSL_SETTINGS: SettingsContribution = {
  title: "HSL",
  order: 60,
  keywords: ["hue", "saturation", "luminance", "color mixer", "target", "tat"],
  fields: [
    {
      key: "defaultView",
      label: "Default layout",
      hint: "Tabs shows one band at a time; All stacks Hue, Saturation and Luminance.",
      type: "select",
      default: VIEW_DEFAULT,
      options: [
        { value: "tabs", label: "Tabs (one band)" },
        { value: "all", label: "All bands" },
      ],
    },
    {
      key: "hueRange",
      label: "Colour range",
      hint: "How wide each colour's selection reaches. Lower is more surgical (tighter bands); higher blends neighbouring colours. 100 is the default seamless tiling.",
      type: "number",
      default: RANGE_DEFAULT,
      min: 50,
      max: 150,
      step: 5,
    },
    {
      key: "smoothness",
      label: "Smoothness",
      hint: "How soft the transition between colours is. Lower gives more defined band edges; higher feathers them. 100 matches the default.",
      type: "number",
      default: SMOOTHNESS_DEFAULT,
      min: 0,
      max: 100,
      step: 5,
    },
    {
      key: "pickerSensitivity",
      label: "Target tool sensitivity",
      hint: "How far an on-image drag moves the sliders (units per pixel).",
      type: "number",
      default: SENSITIVITY_DEFAULT,
      min: 0.1,
      max: 1.5,
      step: 0.05,
    },
  ],
};
