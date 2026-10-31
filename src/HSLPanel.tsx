// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Develop "HSL" panel: the target tool's switch, the Tabs / All layout
// switch and the mixer over the photo's bands; and its per-mask instance, the
// same mixer over a mask's own bands. The target tool drives the photo's bands
// only.

import { useSelectedBand, selectBand } from "./band-store";
import { HSLMixer } from "./HSLMixer";
import { React, api } from "./rt";
import type { HSLAdjustments, HSLBand, HSLChannel, MaskPanelContribution, PickDragTool } from "./safelight";
import { VIEW_DEFAULT, type HslView } from "./settings";
import { cls } from "./styles";

const VIEWS: { key: HslView; label: string }[] = [
  { key: "tabs", label: "Tabs" },
  { key: "all", label: "All" },
];

const TARGET_BANDS: { key: HSLBand; label: string }[] = [
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "luminance", label: "Lum" },
];

const withValue = (hsl: HSLAdjustments, band: HSLBand, channel: HSLChannel, value: number): HSLAdjustments => ({
  ...hsl,
  [band]: { ...hsl[band], [channel]: value },
});

/** The panel, with the target tool it switches on. */
export function hslPanel(target: PickDragTool) {
  return function HSLPanel() {
    const { Panel, PickerIcon } = api.components;
    const useDevelopStore = api.stores.useDevelopStore;
    const hsl = useDevelopStore((s) => s.params.hsl);
    const setParam = useDevelopStore((s) => s.setParam);
    const commitEdit = useDevelopStore((s) => s.commitEdit);
    const picking = api.develop.usePickDragHeld();
    const band = useSelectedBand();
    const [view, setView] = React.useState<HslView>(() => api.settings.get("defaultView", VIEW_DEFAULT));

    // Escape puts the target tool down.
    React.useEffect(() => {
      if (!picking) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") api.develop.setPickDrag(null);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [picking]);

    return (
      <Panel title="HSL">
        <div className={cls.toolbar}>
          <button
            type="button"
            onClick={() => api.develop.setPickDrag(picking ? null : target)}
            aria-pressed={picking}
            className={`${cls.target}${picking ? ` ${cls.on}` : ""}`}
            title={`Click-drag up/down on the image to adjust ${band}`}
          >
            <PickerIcon />
            Target
          </button>

          <div className={cls.group} role="group" aria-label="HSL view">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                aria-pressed={view === v.key}
                className={`${cls.segment}${view === v.key ? ` ${cls.on}` : ""}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* The All layout has no band tabs, so while the target tool is on a
            compact band switch gives the drag its target. */}
        {view === "all" && picking && (
          <div className={`${cls.group} ${cls.spaced}`} role="group" aria-label="Target band">
            {TARGET_BANDS.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => selectBand(b.key)}
                aria-pressed={band === b.key}
                className={`${cls.segment} ${cls.fill}${band === b.key ? ` ${cls.on}` : ""}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        <HSLMixer
          value={hsl}
          onChange={(b, channel, v) => setParam("hsl", withValue(hsl, b, channel, v))}
          onCommit={(channel) => void commitEdit(`HSL ${channel}`)}
          selectedBand={band}
          onBandChange={selectBand}
          view={view}
        />
      </Panel>
    );
  };
}

const DEFAULT_BAND = { red: 0, orange: 0, yellow: 0, green: 0, aqua: 0, blue: 0, purple: 0, magenta: 0 };
const DEFAULT_HSL: HSLAdjustments = { hue: DEFAULT_BAND, saturation: DEFAULT_BAND, luminance: DEFAULT_BAND };

function HSLMaskPanel() {
  const scope = api.develop.useMaskScope();
  const hsl = scope.hsl ?? DEFAULT_HSL;
  return (
    <HSLMixer
      value={hsl}
      onChange={(band, channel, v) => scope.setHsl(withValue(hsl, band, channel, v))}
      onCommit={(channel) => scope.commit(`Mask HSL ${channel}`)}
    />
  );
}

export const HSL_MASK_PANEL: MaskPanelContribution = {
  component: HSLMaskPanel,
  order: 40,
  owns: ["hsl"],
};
