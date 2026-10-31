// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Develop "HSL" panel with its mask instance, Preferences ▸ HSL,
// and the mixer's stage of this release's line. It was core's built-in
// `core.hsl` until Safelight 3.2.0 and keeps that panel id, so saved layouts
// keep it where it was.

import { HSL_MASK_PANEL, hslPanel } from "./HSLPanel";
import { initRuntime } from "./rt";
import type { Line, SafelightAPI } from "./safelight";
import { HSL_SETTINGS } from "./settings";
import { hslStage } from "./stages";
import { hslCss } from "./styles";
import { targetTool } from "./target";

export const PANEL_ID = "core.hsl";
export const STYLESHEET_ID = "safelight.hsl.styles";

/** The release line: this release's major version (vite.config.ts). */
export const LINE = __SAFELIGHT_LINE__ as Line;

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerStylesheet({ id: STYLESHEET_ID, css: hslCss(host.ui.tokens) });
  host.registerProcessingStage(hslStage(LINE));
  host.registerPanel({
    id: PANEL_ID,
    title: "HSL",
    component: hslPanel(targetTool(host)),
    defaultDock: { module: "develop", direction: "right", order: 11, width: 280, height: 220 },
    onReset: () => void host.stores.useDevelopStore.getState().resetParams(["hsl"], "Reset HSL"),
    mask: HSL_MASK_PANEL,
  });
  host.registerSettings(HSL_SETTINGS);
}
