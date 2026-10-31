# HSL for Safelight

The Develop **HSL** panel: hue, saturation and luminance for eight colours
(red, orange, yellow, green, aqua, blue, purple, magenta).

- **Tabs** shows one band at a time; **All** stacks Hue, Saturation and
  Luminance. Preferences ▸ HSL picks which one the panel opens on.
- **Target:** switch it on, then press on a colour in the photo and drag up or
  down to move the selected band for that colour. A colour between two bands
  moves both, by how much each one affects it. Escape switches it off; hold
  Ctrl, Cmd or Space to pan instead.
- Masks get the same mixer, over the mask's own bands.

Preferences ▸ HSL also sets how wide each colour's selection reaches (Colour
range), how softly neighbouring colours blend (Smoothness), and how far a
target drag moves the sliders. Each gesture is one Undo step. Right-click the
panel's header and choose **Reset to defaults** to clear every band as one
step.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.hsl`), so layouts saved before then keep it where it was, and photos
keep their HSL settings. While the extension is off or uninstalled, those
photos show without them; Develop says so and offers to bring it back. Masks'
own HSL keeps rendering either way.

## Release lines

A release's major version is its line: the process version its mixer was
written for. Line 1 runs on every pixel, as Safelight's first process version
did. Lines 2 and 3 skip the mixer while every band is at 0 and clip only what
they change. The installed release draws every photo with its line, so
picking a 1.x release in the Extensions store brings back the first look for
all photos.

To build another line, set `version` in both `safelight.json` and
`package.json` to that major version; `vite.config.ts` reads the line from it.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

`test/stages.test.ts` pins each line's stage text with the same hashes as
Safelight's own copy (`src/rendering/webgl/essential-stages.test.ts` in the
app). Change both together. The target tool's band weights (`src/bands.ts`)
mirror the program's `hslBandWeight`; change them only together.
