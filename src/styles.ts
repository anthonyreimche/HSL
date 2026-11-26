// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the HSL panel and its mixer with Tailwind utilities, as
// plain CSS (the app's Tailwind build never scans an extension). `:where()`
// drops every rule to zero specificity, so a stylesheet that restyles the
// panel or its buttons wins over them. The `html.sl-larger-text` and
// `html.sl-title-headings` rules repeat core's Accessibility rules for 10 px,
// uppercase and widely tracked text.

import type { UiTokens } from "./safelight";

const P = "safelight-hsl";

export const cls = {
  toolbar: `${P}-toolbar`,
  spaced: `${P}-spaced`,
  bands: `${P}-bands`,
  bandHeading: `${P}-band-heading`,
  sliders: `${P}-sliders`,
  row: `${P}-row`,
  dot: `${P}-dot`,
  grow: `${P}-grow`,
} as const;


export function hslCss(t: UiTokens): string {
  return `
:where(.${cls.toolbar}) { margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
:where(.${cls.spaced}) { margin-bottom: 0.5rem; }
:where(.${cls.bands} > :not(:last-child)) { margin-block: 0 0.75rem; }
:where(.${cls.bandHeading}) { margin-bottom: 0.25rem; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${t.textMuted}; }
:where(.${cls.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${cls.row}) { display: flex; align-items: center; gap: 0.375rem; }
:where(.${cls.dot}) { height: 0.5rem; width: 0.5rem; flex-shrink: 0; border-radius: 9999px; }
:where(.${cls.grow}) { flex: 1; }
html.sl-larger-text .${cls.bandHeading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${cls.bandHeading} { text-transform: capitalize !important; }
`;
}
