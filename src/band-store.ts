// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The band the panel shows and the target tool drags (Hue, Saturation or
// Luminance), shared by both. Ephemeral: it starts at Hue each session, as
// core's did.

import { React } from "./rt";
import type { HSLBand } from "./safelight";

let band: HSLBand = "hue";
const listeners = new Set<() => void>();

export const selectedBand = (): HSLBand => band;

export function selectBand(next: HSLBand): void {
  if (next === band) return;
  band = next;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** React hook: the selected band. */
export const useSelectedBand = (): HSLBand => React.useSyncExternalStore(subscribe, selectedBand);
