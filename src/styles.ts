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
  target: `${P}-target`,
  on: `${P}-on`,
  group: `${P}-group`,
  spaced: `${P}-spaced`,
  segment: `${P}-segment`,
  fill: `${P}-fill`,
  bands: `${P}-bands`,
  bandHeading: `${P}-band-heading`,
  sliders: `${P}-sliders`,
  row: `${P}-row`,
  dot: `${P}-dot`,
  grow: `${P}-grow`,
} as const;

const SMALL_CAPS = [cls.target, cls.segment, cls.bandHeading];

export function hslCss(t: UiTokens): string {
  return `
:where(.${cls.toolbar}) { margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
:where(.${cls.target}) { display: flex; align-items: center; gap: 0.25rem; border-radius: 0.25rem; border: 1px solid ${t.borderSubtle}; padding: 0.125rem 0.5rem; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${t.textSecondary}; }
:where(.${cls.target}:hover) { border-color: ${t.border}; color: ${t.textPrimary}; }
:where(.${cls.target}.${cls.on}) { border-color: ${t.accent}; background-color: color-mix(in srgb, ${t.accent} 30%, transparent); color: ${t.textPrimary}; }
:where(.${cls.group}) { display: flex; border-radius: 0.25rem; background-color: ${t.surface2}; }
:where(.${cls.spaced}) { margin-bottom: 0.5rem; }
:where(.${cls.segment}) { padding: 0.125rem 0.5rem; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${t.textMuted}; }
:where(.${cls.segment}:first-child) { border-top-left-radius: 0.25rem; border-bottom-left-radius: 0.25rem; }
:where(.${cls.segment}:last-child) { border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
:where(.${cls.segment}:hover) { color: ${t.textSecondary}; }
:where(.${cls.segment}.${cls.on}) { background-color: ${t.surface3}; color: ${t.textPrimary}; }
:where(.${cls.fill}) { flex: 1; padding: 0.25rem 0; }
:where(.${cls.bands} > :not(:last-child)) { margin-block: 0 0.75rem; }
:where(.${cls.bandHeading}) { margin-bottom: 0.25rem; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${t.textMuted}; }
:where(.${cls.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${cls.row}) { display: flex; align-items: center; gap: 0.375rem; }
:where(.${cls.dot}) { height: 0.5rem; width: 0.5rem; flex-shrink: 0; border-radius: 9999px; }
:where(.${cls.grow}) { flex: 1; }
${SMALL_CAPS.map((c) => `html.sl-larger-text .${c}`).join(", ")} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
${SMALL_CAPS.map((c) => `html.sl-title-headings .${c}`).join(", ")} { text-transform: capitalize !important; }
`;
}
