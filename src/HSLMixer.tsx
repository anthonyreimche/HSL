// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The controlled 8-colour hue/saturation/luminance mixer, shared by the HSL
// panel and its per-mask instance; the caller holds the values. Core's own
// until Safelight 3.2.0.

import { HSL_CHANNELS } from "./bands";
import { React, api } from "./rt";
import type { HSLAdjustments, HSLBand, HSLChannel } from "./safelight";
import { cls } from "./styles";

const BANDS: { key: HSLBand; label: string }[] = [
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Sat" },
  { key: "luminance", label: "Lum" },
];

export const HSL_CHANNEL_COLORS: Record<HSLChannel, string> = {
  red: "#e74c3c",
  orange: "#e67e22",
  yellow: "#f1c40f",
  green: "#2ecc71",
  aqua: "#1abc9c",
  blue: "#3498db",
  purple: "#9b59b6",
  magenta: "#e84393",
};

export interface HSLMixerProps {
  value: HSLAdjustments;
  onChange: (band: HSLBand, channel: HSLChannel, value: number) => void;
  onCommit: (channel: HSLChannel) => void;
  /** Controlled band selection (shared with the target tool). */
  selectedBand?: HSLBand;
  onBandChange?: (band: HSLBand) => void;
  /** "tabs": one band at a time (Hue|Sat|Lum). "all": every band stacked.
   *  Defaults to "tabs". */
  view?: "tabs" | "all";
}

/** The 8 colour sliders for one band. */
function BandSliders({
  band,
  value,
  onChange,
  onCommit,
}: {
  band: HSLBand;
  value: HSLAdjustments;
  onChange: HSLMixerProps["onChange"];
  onCommit: HSLMixerProps["onCommit"];
}) {
  const { Slider } = api.components;
  return (
    <div className={cls.sliders}>
      {HSL_CHANNELS.map((channel) => (
        <div key={channel} className={cls.row}>
          <span className={cls.dot} style={{ background: HSL_CHANNEL_COLORS[channel] }} />
          <div className={cls.grow}>
            <Slider
              label=""
              ariaLabel={`${channel} ${band}`}
              value={value[band][channel]}
              min={-100}
              max={100}
              onChange={(v) => onChange(band, channel, v)}
              onCommit={() => onCommit(channel)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HSLMixer({ value, onChange, onCommit, selectedBand, onBandChange, view = "tabs" }: HSLMixerProps) {
  const [internalBand, setInternalBand] = React.useState<HSLBand>("hue");
  const band = selectedBand ?? internalBand;
  const setBand = onBandChange ?? setInternalBand;

  if (view === "all") {
    return (
      <div className={cls.bands}>
        {BANDS.map((b) => (
          <div key={b.key}>
            <div className={cls.bandHeading}>{b.key}</div>
            <BandSliders band={b.key} value={value} onChange={onChange} onCommit={onCommit} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={`${cls.group} ${cls.spaced}`} role="group" aria-label="HSL band">
        {BANDS.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setBand(b.key)}
            aria-pressed={band === b.key}
            className={`${cls.segment} ${cls.fill}${band === b.key ? ` ${cls.on}` : ""}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <BandSliders band={band} value={value} onChange={onChange} onCommit={onCommit} />
    </>
  );
}
