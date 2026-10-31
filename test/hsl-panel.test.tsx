// The panel: the Target switch holds and lets go of the canvas's pick-drag
// tool (Escape lets go too), Tabs / All switch the layout (the preference picks
// the first), All shows a band switch while the target tool is on, and the
// mixer writes the photo's bands, each gesture one step. The mask instance
// writes the mask's own bands.

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { selectBand } from "../src/band-store";
import { HSL_MASK_PANEL, hslPanel } from "../src/HSLPanel";
import { React, initRuntime } from "../src/rt";
import { targetTool } from "../src/target";
import { DEFAULT_HSL, fakeApi } from "./support/fake-api";

const MIXED = { ...DEFAULT_HSL, saturation: { ...DEFAULT_HSL.saturation, blue: -30 } };

function setup(prefs: Record<string, unknown> = {}) {
  const rig = fakeApi(MIXED);
  for (const [k, v] of Object.entries(prefs)) rig.settings.set(k, v);
  initRuntime(rig.api);
  const tool = targetTool(rig.api);
  const Panel = hslPanel(tool);
  const view = render(<Panel />);
  return { rig, tool, view };
}

afterEach(() => {
  cleanup();
  selectBand("hue");
});

const pressed = (name: string) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("the HSL panel", () => {
  it("holds the target tool while Target is on", () => {
    const { rig, tool } = setup();
    expect(pressed("Target")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Target" }));
    expect(rig.held()).toBe(tool);
    expect(pressed("Target")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Target" }));
    expect(rig.held()).toBeNull();
  });

  it("lets go of the target tool on Escape", () => {
    const { rig } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Target" }));
    act(() => void window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(rig.held()).toBeNull();
  });

  it("opens on the layout Preferences ▸ HSL picks", () => {
    setup({ defaultView: "all" });
    expect(pressed("All")).toBe("true");
    expect(screen.queryByRole("group", { name: "HSL band" })).toBeNull();
  });

  it("shows one band in Tabs, eight sliders, and switches band", () => {
    const { rig, view } = setup();
    expect(rig.sliders(view.container).map((s) => s.ariaLabel)).toEqual([
      "red hue",
      "orange hue",
      "yellow hue",
      "green hue",
      "aqua hue",
      "blue hue",
      "purple hue",
      "magenta hue",
    ]);
    fireEvent.click(within(screen.getByRole("group", { name: "HSL band" })).getByRole("button", { name: "Sat" }));
    expect(rig.sliders(view.container)[5]).toMatchObject({ ariaLabel: "blue saturation", value: -30 });
  });

  it("shows every band in All, and a band switch only while the target tool is on", () => {
    const { rig, view } = setup();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(rig.sliders(view.container)).toHaveLength(24);
    expect(screen.queryByRole("group", { name: "Target band" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Target" }));
    const target = screen.getByRole("group", { name: "Target band" });
    fireEvent.click(within(target).getByRole("button", { name: "Lum" }));
    expect(within(target).getByRole("button", { name: "Lum" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("writes a slider into the photo's bands and commits under its colour", () => {
    const { rig, view } = setup();
    const orange = rig.sliders(view.container)[1];
    act(() => {
      orange.onChange(25);
      orange.onCommit?.();
    });
    expect(rig.calls).toEqual([
      { setParam: "hsl", value: { ...MIXED, hue: { ...MIXED.hue, orange: 25 } } },
      { commitEdit: "HSL orange" },
    ]);
  });
});

describe("the mask instance", () => {
  it("writes the mask's own bands from defaults, and commits under the mask", () => {
    const rig = fakeApi(MIXED);
    initRuntime(rig.api);
    const Mask = HSL_MASK_PANEL.component;
    const view = render(<Mask />);
    const red = rig.sliders(view.container)[0];
    expect(red.value).toBe(0);
    act(() => {
      red.onChange(-15);
      red.onCommit?.();
    });
    expect(rig.mask.hsl).toEqual({ ...DEFAULT_HSL, hue: { ...DEFAULT_HSL.hue, red: -15 } });
    expect(rig.mask.commits).toEqual(["Mask HSL red"]);
    expect(rig.calls).toEqual([]);
  });
});
