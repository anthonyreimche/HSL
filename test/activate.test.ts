// What activate() registers: the HSL panel under core's old panel id, title,
// dock spot, reset and mask instance (so saved layouts and masks keep it),
// Preferences ▸ HSL as core had it, the stylesheet, and the mixer's stage of
// this release's line.

import { describe, expect, it } from "vitest";
import { HSL_MASK_PANEL } from "../src/HSLPanel";
import { LINE, PANEL_ID, STYLESHEET_ID, activate } from "../src/index";
import type { ProcessingStageContribution } from "../src/safelight";
import { HSL_SETTINGS } from "../src/settings";
import { hslStage } from "../src/stages";
import manifest from "../safelight.json";
import { DEFAULT_HSL, fakeApi } from "./support/fake-api";

const text = ({ derive: _, ...rest }: ProcessingStageContribution) => rest;

describe("activate", () => {
  it("registers the HSL panel, as core's core.hsl did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.hsl",
        title: "HSL",
        component: expect.any(Function),
        defaultDock: { module: "develop", direction: "right", order: 11, width: 280, height: 220 },
        onReset: expect.any(Function),
        mask: HSL_MASK_PANEL,
      },
    ]);
    expect(PANEL_ID).toBe("core.hsl");
    expect(HSL_MASK_PANEL).toMatchObject({ order: 40, owns: ["hsl"] });
  });

  it("resets the bands as one step from the dock header", () => {
    const rig = fakeApi({ ...DEFAULT_HSL, hue: { ...DEFAULT_HSL.hue, red: 30 } });
    activate(rig.api);
    rig.panels[0].onReset?.();
    expect(rig.calls).toEqual([{ resetParams: ["hsl"], label: "Reset HSL" }]);
  });

  it("registers Preferences ▸ HSL with core's keys", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.settingsSections).toEqual([HSL_SETTINGS]);
    expect(HSL_SETTINGS.fields.map((f) => [f.key, f.default])).toEqual([
      ["defaultView", "tabs"],
      ["hueRange", 100],
      ["smoothness", 100],
      ["pickerSensitivity", 0.5],
    ]);
  });

  it("registers the stage of the line its major version names", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(LINE).toBe(Number(manifest.version.split(".")[0]));
    expect(rig.stages.map(text)).toEqual([text(hslStage(LINE))]);
  });

  it("is a line 3 release", () => {
    expect(LINE).toBe(3);
  });

  it("registers its stylesheet once, in the theme's colours", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    expect(rig.stylesheets[0].css).toContain("var(--color-accent)");
  });
});
