// A stand-in Safelight API over real React and zustand. The develop store holds
// the HSL params the way core's does and records every write; the settings are
// a plain map; the pick-drag tool is held as core holds it, by this extension.
// Core's Panel draws its children, and core's Slider is replaced by a stub that
// keeps the props it was last rendered with, so a test can drive a drag and its
// commit the way the real one would.

import * as React from "react";
import { create } from "zustand";
import type {
  DevelopParams,
  DevelopStoreState,
  HSLAdjustments,
  MaskScope,
  PanelContribution,
  PanelProps,
  PickDragTool,
  ProcessingStageContribution,
  SafelightAPI,
  SettingsContribution,
  SliderProps,
  StoreApi,
  StylesheetContribution,
  UiTokens,
} from "../../src/safelight";

export type DevelopCall =
  | { setParam: keyof DevelopParams; value: HSLAdjustments }
  | { commitEdit: string }
  | { resetParams: (keyof DevelopParams)[]; label: string };

const BAND = { red: 0, orange: 0, yellow: 0, green: 0, aqua: 0, blue: 0, purple: 0, magenta: 0 };
export const DEFAULT_HSL: HSLAdjustments = { hue: BAND, saturation: BAND, luminance: BAND };

export const TOKENS: UiTokens = {
  surface2: "var(--color-surface-2)",
  surface3: "var(--color-surface-3)",
  border: "var(--color-border)",
  borderSubtle: "var(--color-border-subtle)",
  accent: "var(--color-accent)",
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
};

export interface Rig {
  api: SafelightAPI;
  develop: StoreApi<DevelopStoreState>;
  /** Every develop store write, in order. */
  calls: DevelopCall[];
  panels: PanelContribution[];
  stages: ProcessingStageContribution[];
  stylesheets: StylesheetContribution[];
  settingsSections: SettingsContribution[];
  /** The extension's settings, as api.settings reads them. */
  settings: Map<string, unknown>;
  /** The params each captureFrame was asked to draw, in order. */
  captures: DevelopParams[];
  /** The tool this extension holds on the canvas, or null. */
  held(): PickDragTool | null;
  /** The mask sub-panel's scope: its bands and its commits. */
  mask: { hsl: HSLAdjustments | undefined; commits: string[] };
  /** The latest props of each slider drawn in `root`, in document order. */
  sliders(root: ParentNode): SliderProps[];
}

export function fakeApi(hsl: HSLAdjustments = DEFAULT_HSL): Rig {
  const calls: DevelopCall[] = [];
  const panels: PanelContribution[] = [];
  const stages: ProcessingStageContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const settingsSections: SettingsContribution[] = [];
  const settings = new Map<string, unknown>();
  const captures: DevelopParams[] = [];
  const pick = create<{ tool: PickDragTool | null }>(() => ({ tool: null }));
  const mask: Rig["mask"] = { hsl: undefined, commits: [] };
  const sliderProps = new Map<number, SliderProps>();
  let nextSlider = 0;

  const develop: StoreApi<DevelopStoreState> = create<DevelopStoreState>()((set) => ({
    params: { hsl },
    setParam: (key, value) => {
      calls.push({ setParam: key, value });
      set((s) => ({ params: { ...s.params, [key]: value } }));
    },
    commitEdit: async (label) => {
      calls.push({ commitEdit: label });
    },
    resetParams: async (keys, label) => {
      calls.push({ resetParams: keys, label });
      set({ params: { hsl: DEFAULT_HSL } });
    },
  }));

  function Panel({ children, title }: PanelProps) {
    return React.createElement("section", { "aria-label": title }, children);
  }

  function Slider(props: SliderProps) {
    const id = React.useRef(nextSlider++).current;
    sliderProps.set(id, props);
    return React.createElement("div", { "data-slider": id }, `${props.ariaLabel ?? props.label} ${props.value}`);
  }

  const PickerIcon = () => React.createElement("svg", { "data-testid": "picker-icon" });

  const maskStore = create<{ hsl: HSLAdjustments | undefined }>(() => ({ hsl: undefined }));

  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.hsl",
    react: React,
    registerPanel: (c) => void panels.push(c),
    registerProcessingStage: (c) => void stages.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    registerSettings: (c) => void settingsSections.push(c),
    settings: {
      get: <T,>(key: string, fallback: T) => (settings.has(key) ? (settings.get(key) as T) : fallback),
      onChange: () => () => {},
    },
    components: { Panel, Slider, PickerIcon },
    stores: { useDevelopStore: develop },
    develop: {
      captureFrame: async (params) => {
        captures.push(params);
        return { width: 100, height: 100, close: () => {} } as unknown as ImageBitmap;
      },
      setPickDrag: (tool) => pick.setState({ tool }),
      usePickDragHeld: () => pick((s) => s.tool !== null),
      useMaskScope: (): MaskScope => {
        const value = maskStore((s) => s.hsl);
        return {
          hsl: value,
          setHsl: (next) => {
            mask.hsl = next;
            maskStore.setState({ hsl: next });
          },
          commit: (label) => void mask.commits.push(label),
        };
      },
    },
    ui: { tokens: TOKENS },
  };

  return {
    api,
    develop,
    calls,
    panels,
    stages,
    stylesheets,
    settingsSections,
    settings,
    captures,
    held: () => pick.getState().tool,
    mask,
    sliders: (root) =>
      [...root.querySelectorAll("[data-slider]")].map((el) => {
        const props = sliderProps.get(Number(el.getAttribute("data-slider")));
        if (!props) throw new Error("a slider without props");
        return props;
      }),
  };
}
