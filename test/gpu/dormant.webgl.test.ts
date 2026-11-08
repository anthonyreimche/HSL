// The HSL stage on the real renderer (run via `npm run test:gpu`): with every
// band at 0 it leaves the frame as it would be without the stage, and the live
// view leaves it out; move a band's hue, saturation or luminance and it is back
// in and the frame changes. Line 1 mixes every pixel and declares no rule.

import { DEFAULT_DEVELOP_PARAMS, proveDormancy } from "./dormancy-rig";
import { STAGE_ID, hslStage } from "@ext/stages";

const HSL = DEFAULT_DEVELOP_PARAMS.hsl;

proveDormancy("safelight.hsl", (line) => [hslStage(line)], {
  title: "HSL",
  stageId: STAGE_ID,
  lines: [2, 3],
  moves: {
    "a hue": { hsl: { ...HSL, hue: { ...HSL.hue, red: 100 } } },
    "a saturation": { hsl: { ...HSL, saturation: { ...HSL.saturation, orange: -100 } } },
    "a luminance": { hsl: { ...HSL, luminance: { ...HSL.luminance, yellow: 100 } } },
  },
});
