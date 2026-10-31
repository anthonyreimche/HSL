// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/catalog/types.ts,
// src/state/develop-store.ts, src/modules/develop/{mask-scope,pick-drag}.ts
// and src/ui/components/{Panel,Slider,PickerIcon}.tsx. Extensions are
// standalone bundles, so the host's source is not on the type path; React
// types come from @types/react (dev only).

import type { ComponentType, ReactNode } from "react";

/** A release line: the process version its stage text was written for, and
 *  the extension's major version. */
export type Line = 1 | 2 | 3;

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

export type HSLChannel = "red" | "orange" | "yellow" | "green" | "aqua" | "blue" | "purple" | "magenta";
export type HSLBand = "hue" | "saturation" | "luminance";
/** Each band's eight colours, -100 to 100. */
export type HSLAdjustments = Record<HSLBand, Record<HSLChannel, number>>;

/** The develop params this extension reads. Core's carry many more fields. */
export interface DevelopParams {
  hsl: HSLAdjustments;
}

export interface DevelopStoreState {
  params: DevelopParams;
  setParam<K extends keyof DevelopParams>(key: K, value: DevelopParams[K]): void;
  /** End a gesture: one undoable history step under `label`. */
  commitEdit(label: string): Promise<void>;
  /** Put `keys` back to their defaults as one undoable step under `label`. */
  resetParams(keys: (keyof DevelopParams)[], label: string): Promise<void>;
}

export interface PanelDockDefault {
  module: "library" | "develop";
  direction: "left" | "right" | "bottom";
  order?: number;
  width?: number;
  height?: number;
}

/** A panel's per-mask variant, listed among a mask's sub-panels. */
export interface MaskPanelContribution {
  component: ComponentType;
  /** Sort position among a mask's sub-panels (lower = higher up). */
  order?: number;
  /** The mask values this sub-panel edits ("hsl": the mask's own bands). */
  owns: readonly string[];
}

export interface PanelContribution {
  /** Globally unique, e.g. "core.hsl" or "my-ext.fancy-curves". */
  id: string;
  title: string;
  component: ComponentType;
  defaultDock?: PanelDockDefault;
  /** Right-clicking the panel's dock header offers "Reset to defaults". */
  onReset?: () => void;
  mask?: MaskPanelContribution;
}

export type SettingsField =
  | {
      key: string;
      label: string;
      hint?: string;
      type: "number";
      default: number;
      min?: number;
      max?: number;
      step?: number;
    }
  | {
      key: string;
      label: string;
      hint?: string;
      type: "select";
      default: string;
      options: { value: string; label: string }[];
    };

export interface SettingsContribution {
  title?: string;
  fields: SettingsField[];
  /** Sort position in Preferences (lower = higher up). */
  order?: number;
  /** Extra words that find this section in the Preferences search. */
  keywords?: string[];
}

export type GlslType = "float" | "int" | "bool" | "vec2" | "vec3" | "vec4";

export interface UniformDeclaration {
  key: string;
  glslType: GlslType;
  /** An array uniform's length. */
  length?: number;
  default: number | number[] | boolean;
}

export type StageValue = number | boolean | number[];

export interface StageDeriveContext {
  /** One of this extension's settings, or `fallback`. */
  settings<T>(key: string, fallback: T): T;
}

export type StageDerive = (params: DevelopParams, ctx: StageDeriveContext) => Record<string, StageValue>;

export interface ProcessingStageContribution {
  id: string;
  name: string;
  phase: "display-adjust";
  priority?: number;
  /** Where in the develop program the block runs (official stages only). */
  anchor?: "hsl";
  /** The stage's block in the develop program; `c` is the display colour. */
  glsl: string;
  /** Functions the block calls, declared ahead of main(). */
  helpers?: string;
  uniforms: UniformDeclaration[];
  /** Textures the block samples (none here; part of a line's text). */
  textures?: { key: string; kind: "photo" }[];
  /** The uniforms' values for a photo, from its params and this extension's
   *  settings (official extensions only). */
  derive?: StageDerive;
}

export interface StylesheetContribution {
  id: string;
  css: string;
}

/** The theme's CSS variables as `var(--color-…)` strings. */
export interface UiTokens {
  readonly surface2: string;
  readonly surface3: string;
  readonly border: string;
  readonly borderSubtle: string;
  readonly accent: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
}

export interface PanelProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export interface SliderProps {
  label: string;
  /** The accessible name when `label` is empty. */
  ariaLabel?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange(value: number): void;
  onCommit?(): void;
}

/** A point on the develop canvas, in its pixels, from its top-left corner. */
export interface CanvasPoint {
  x: number;
  y: number;
}

/** The canvas's pick-drag tool: a press on the image hands `onDown` the colour
 *  the view shows there, then the drag. */
export interface PickDragTool {
  onDown(rgb: readonly [number, number, number], point: CanvasPoint): void;
  onMove(point: CanvasPoint): void;
  onUp(): void;
}

/** The mask a mask sub-panel instance belongs to. */
export interface MaskScope {
  hsl: HSLAdjustments | undefined;
  setHsl(value: HSLAdjustments): void;
  /** End a gesture: one undoable step under `label`. */
  commit(label: string): void;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerPanel(c: PanelContribution): void;
  registerProcessingStage(c: ProcessingStageContribution): void;
  registerStylesheet(c: StylesheetContribution): void;
  registerSettings(c: SettingsContribution): void;
  settings: {
    get<T>(key: string, fallback: T): T;
    /** Fires when any of this extension's settings change (any window). */
    onChange(cb: (key: string, value: unknown) => void): () => void;
  };
  components: {
    /** Core's collapsible panel; inside a dock panel of the same title it
     *  draws its content only. */
    Panel: ComponentType<PanelProps>;
    Slider: ComponentType<SliderProps>;
    /** The eyedropper icon core's pickers show. */
    PickerIcon: ComponentType;
  };
  stores: {
    useDevelopStore: StoreApi<DevelopStoreState>;
  };
  develop: {
    /** Hold the canvas's pick-drag tool, or with null let go of it. */
    setPickDrag(tool: PickDragTool | null): void;
    /** React hook: whether this extension holds the pick-drag tool. */
    usePickDragHeld(): boolean;
    /** The mask a PanelContribution.mask component belongs to. */
    useMaskScope(): MaskScope;
  };
  ui: { tokens: UiTokens };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
