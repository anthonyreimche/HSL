//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/band-store.ts
var r = "hue", i = /* @__PURE__ */ new Set(), a = () => r;
function o(e) {
	if (e !== r) {
		r = e;
		for (let e of i) e();
	}
}
var s = (e) => (i.add(e), () => void i.delete(e)), c = () => e.useSyncExternalStore(s, a), l = [
	"red",
	"orange",
	"yellow",
	"green",
	"aqua",
	"blue",
	"purple",
	"magenta"
], u = [
	0,
	30,
	60,
	120,
	180,
	240,
	280,
	320
], d = [
	40,
	30,
	30,
	60,
	60,
	60,
	40,
	40
], f = [
	30,
	30,
	60,
	60,
	60,
	40,
	40,
	40
];
function p(e, t, n) {
	return u.map((r, i) => {
		let a = (e - r + 540) % 360 - 180, o = d[i] * t, s = f[i] * t, c;
		if (a <= 0) {
			if (a <= -o) return 0;
			c = (a + o) / o;
		} else {
			if (a >= s) return 0;
			c = 1 - a / s;
		}
		return (1 - n) * c + n * (c * c * (3 - 2 * c));
	});
}
function m(e, t, n) {
	let r = Math.max(e, t, n), i = Math.min(e, t, n);
	if (r === i) return 0;
	let a = r - i, o;
	return o = r === e ? ((t - n) / a + (t < n ? 6 : 0)) / 6 : r === t ? ((n - e) / a + 2) / 6 : ((e - t) / a + 4) / 6, o * 360;
}
//#endregion
//#region src/styles.ts
var h = "safelight-hsl", g = {
	toolbar: `${h}-toolbar`,
	target: `${h}-target`,
	on: `${h}-on`,
	group: `${h}-group`,
	spaced: `${h}-spaced`,
	segment: `${h}-segment`,
	fill: `${h}-fill`,
	bands: `${h}-bands`,
	bandHeading: `${h}-band-heading`,
	sliders: `${h}-sliders`,
	row: `${h}-row`,
	dot: `${h}-dot`,
	grow: `${h}-grow`
}, _ = [
	g.target,
	g.segment,
	g.bandHeading
];
function v(e) {
	return `
:where(.${g.toolbar}) { margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
:where(.${g.target}) { display: flex; align-items: center; gap: 0.25rem; border-radius: 0.25rem; border: 1px solid ${e.borderSubtle}; padding: 0.125rem 0.5rem; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${e.textSecondary}; }
:where(.${g.target}:hover) { border-color: ${e.border}; color: ${e.textPrimary}; }
:where(.${g.target}.${g.on}) { border-color: ${e.accent}; background-color: color-mix(in srgb, ${e.accent} 30%, transparent); color: ${e.textPrimary}; }
:where(.${g.group}) { display: flex; border-radius: 0.25rem; background-color: ${e.surface2}; }
:where(.${g.spaced}) { margin-bottom: 0.5rem; }
:where(.${g.segment}) { padding: 0.125rem 0.5rem; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${e.textMuted}; }
:where(.${g.segment}:first-child) { border-top-left-radius: 0.25rem; border-bottom-left-radius: 0.25rem; }
:where(.${g.segment}:last-child) { border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem; }
:where(.${g.segment}:hover) { color: ${e.textSecondary}; }
:where(.${g.segment}.${g.on}) { background-color: ${e.surface3}; color: ${e.textPrimary}; }
:where(.${g.fill}) { flex: 1; padding: 0.25rem 0; }
:where(.${g.bands} > :not(:last-child)) { margin-block: 0 0.75rem; }
:where(.${g.bandHeading}) { margin-bottom: 0.25rem; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${e.textMuted}; }
:where(.${g.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${g.row}) { display: flex; align-items: center; gap: 0.375rem; }
:where(.${g.dot}) { height: 0.5rem; width: 0.5rem; flex-shrink: 0; border-radius: 9999px; }
:where(.${g.grow}) { flex: 1; }
${_.map((e) => `html.sl-larger-text .${e}`).join(", ")} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
${_.map((e) => `html.sl-title-headings .${e}`).join(", ")} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/HSLMixer.tsx
var y = [
	{
		key: "hue",
		label: "Hue"
	},
	{
		key: "saturation",
		label: "Sat"
	},
	{
		key: "luminance",
		label: "Lum"
	}
], b = {
	red: "#e74c3c",
	orange: "#e67e22",
	yellow: "#f1c40f",
	green: "#2ecc71",
	aqua: "#1abc9c",
	blue: "#3498db",
	purple: "#9b59b6",
	magenta: "#e84393"
};
function x({ band: n, value: r, onChange: i, onCommit: a }) {
	let { Slider: o } = t.components;
	return /* @__PURE__ */ e.createElement("div", { className: g.sliders }, l.map((t) => /* @__PURE__ */ e.createElement("div", {
		key: t,
		className: g.row
	}, /* @__PURE__ */ e.createElement("span", {
		className: g.dot,
		style: { background: b[t] }
	}), /* @__PURE__ */ e.createElement("div", { className: g.grow }, /* @__PURE__ */ e.createElement(o, {
		label: "",
		ariaLabel: `${t} ${n}`,
		value: r[n][t],
		min: -100,
		max: 100,
		onChange: (e) => i(n, t, e),
		onCommit: () => a(t)
	})))));
}
function S({ value: t, onChange: n, onCommit: r, selectedBand: i, onBandChange: a, view: o = "tabs" }) {
	let [s, c] = e.useState("hue"), l = i ?? s, u = a ?? c;
	return o === "all" ? /* @__PURE__ */ e.createElement("div", { className: g.bands }, y.map((i) => /* @__PURE__ */ e.createElement("div", { key: i.key }, /* @__PURE__ */ e.createElement("div", { className: g.bandHeading }, i.key), /* @__PURE__ */ e.createElement(x, {
		band: i.key,
		value: t,
		onChange: n,
		onCommit: r
	})))) : /* @__PURE__ */ e.createElement(e.Fragment, null, /* @__PURE__ */ e.createElement("div", {
		className: `${g.group} ${g.spaced}`,
		role: "group",
		"aria-label": "HSL band"
	}, y.map((t) => /* @__PURE__ */ e.createElement("button", {
		key: t.key,
		type: "button",
		onClick: () => u(t.key),
		"aria-pressed": l === t.key,
		className: `${g.segment} ${g.fill}${l === t.key ? ` ${g.on}` : ""}`
	}, t.label))), /* @__PURE__ */ e.createElement(x, {
		band: l,
		value: t,
		onChange: n,
		onCommit: r
	}));
}
//#endregion
//#region src/settings.ts
var C = "tabs", w = .5, T = {
	title: "HSL",
	order: 60,
	keywords: [
		"hue",
		"saturation",
		"luminance",
		"color mixer",
		"target",
		"tat"
	],
	fields: [
		{
			key: "defaultView",
			label: "Default layout",
			hint: "Tabs shows one band at a time; All stacks Hue, Saturation and Luminance.",
			type: "select",
			default: C,
			options: [{
				value: "tabs",
				label: "Tabs (one band)"
			}, {
				value: "all",
				label: "All bands"
			}]
		},
		{
			key: "hueRange",
			label: "Colour range",
			hint: "How wide each colour's selection reaches. Lower is more surgical (tighter bands); higher blends neighbouring colours. 100 is the default seamless tiling.",
			type: "number",
			default: 100,
			min: 50,
			max: 150,
			step: 5
		},
		{
			key: "smoothness",
			label: "Smoothness",
			hint: "How soft the transition between colours is. Lower gives more defined band edges; higher feathers them. 100 matches the default.",
			type: "number",
			default: 100,
			min: 0,
			max: 100,
			step: 5
		},
		{
			key: "pickerSensitivity",
			label: "Target tool sensitivity",
			hint: "How far an on-image drag moves the sliders (units per pixel).",
			type: "number",
			default: w,
			min: .1,
			max: 1.5,
			step: .05
		}
	]
}, E = [{
	key: "tabs",
	label: "Tabs"
}, {
	key: "all",
	label: "All"
}], D = [
	{
		key: "hue",
		label: "Hue"
	},
	{
		key: "saturation",
		label: "Sat"
	},
	{
		key: "luminance",
		label: "Lum"
	}
], O = (e, t, n, r) => ({
	...e,
	[t]: {
		...e[t],
		[n]: r
	}
});
function k(n) {
	return function() {
		let { Panel: r, PickerIcon: i } = t.components, a = t.stores.useDevelopStore, s = a((e) => e.params.hsl), l = a((e) => e.setParam), u = a((e) => e.commitEdit), d = t.develop.usePickDragHeld(), f = c(), [p, m] = e.useState(() => t.settings.get("defaultView", C));
		return e.useEffect(() => {
			if (!d) return;
			let e = (e) => {
				e.key === "Escape" && t.develop.setPickDrag(null);
			};
			return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
		}, [d]), /* @__PURE__ */ e.createElement(r, { title: "HSL" }, /* @__PURE__ */ e.createElement("div", { className: g.toolbar }, /* @__PURE__ */ e.createElement("button", {
			type: "button",
			onClick: () => t.develop.setPickDrag(d ? null : n),
			"aria-pressed": d,
			className: `${g.target}${d ? ` ${g.on}` : ""}`,
			title: `Click-drag up/down on the image to adjust ${f}`
		}, /* @__PURE__ */ e.createElement(i, null), "Target"), /* @__PURE__ */ e.createElement("div", {
			className: g.group,
			role: "group",
			"aria-label": "HSL view"
		}, E.map((t) => /* @__PURE__ */ e.createElement("button", {
			key: t.key,
			type: "button",
			onClick: () => m(t.key),
			"aria-pressed": p === t.key,
			className: `${g.segment}${p === t.key ? ` ${g.on}` : ""}`
		}, t.label)))), p === "all" && d && /* @__PURE__ */ e.createElement("div", {
			className: `${g.group} ${g.spaced}`,
			role: "group",
			"aria-label": "Target band"
		}, D.map((t) => /* @__PURE__ */ e.createElement("button", {
			key: t.key,
			type: "button",
			onClick: () => o(t.key),
			"aria-pressed": f === t.key,
			className: `${g.segment} ${g.fill}${f === t.key ? ` ${g.on}` : ""}`
		}, t.label))), /* @__PURE__ */ e.createElement(S, {
			value: s,
			onChange: (e, t, n) => l("hsl", O(s, e, t, n)),
			onCommit: (e) => void u(`HSL ${e}`),
			selectedBand: f,
			onBandChange: o,
			view: p
		}));
	};
}
var A = {
	red: 0,
	orange: 0,
	yellow: 0,
	green: 0,
	aqua: 0,
	blue: 0,
	purple: 0,
	magenta: 0
}, j = {
	hue: A,
	saturation: A,
	luminance: A
};
function M() {
	let n = t.develop.useMaskScope(), r = n.hsl ?? j;
	return /* @__PURE__ */ e.createElement(S, {
		value: r,
		onChange: (e, t, i) => n.setHsl(O(r, e, t, i)),
		onCommit: (e) => n.commit(`Mask HSL ${e}`)
	});
}
var N = {
	component: M,
	order: 40,
	owns: ["hsl"]
}, P = "safelight.hsl.mix", F = [
	...[
		"uHslHue",
		"uHslSat",
		"uHslLum"
	].map((e) => ({
		key: e,
		glslType: "float",
		length: 8,
		default: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		]
	})),
	{
		key: "uHslRange",
		glslType: "float",
		default: 1
	},
	{
		key: "uHslSmooth",
		glslType: "float",
		default: 1
	}
], I = "vec3 applyHSL(vec3 c) {\n  vec3 hsl = rgb2hsl(c);\n  // Protect near-neutral pixels: an achromatic pixel has no real hue (rgb2hsl\n  // reports 0 = red), so without this gate the Red sliders would tint/relight\n  // every grey. Fades the whole effect in over a low saturation threshold, so\n  // genuinely coloured pixels (even pale skies/skin) still respond fully.\n  float chromaW = smoothstep(0.0, 0.10, hsl.y);\n  if (chromaW < 1e-4) return c;\n\n  float hueDeg = hsl.x * 360.0;\n\n  float hueShift = 0.0;\n  float satAdj = 0.0;\n  float lumAdj = 0.0;\n  for (int i = 0; i < 8; i++) {\n    float wi = hslBandWeight(hueDeg, HSL_CENTERS[i], HSL_DPREV[i], HSL_DNEXT[i], uHslRange, uHslSmooth);\n    hueShift += uHslHue[i] * wi;\n    satAdj   += uHslSat[i] * wi;\n    lumAdj   += uHslLum[i] * wi;\n  }\n  hueShift *= chromaW;\n  satAdj   *= chromaW;\n  lumAdj   *= chromaW;\n\n  // Hue: rotate in HSL (luminance-invariant), ±30° at full slider.\n  hsl.x = fract(hsl.x + hueShift * (30.0 / 360.0));\n  vec3 rgb = hsl2rgb(hsl);\n\n  // Saturation: perceptual. Scale chroma around the pixel's true luminance, so a\n  // cut collapses the colour to its actual grey (not HSL-L's mid-range grey) and\n  // a boost doesn't clip the bright channel into a different hue on the way up.\n  if (abs(satAdj) > 1e-4) {\n    float Lp = luma(rgb);\n    rgb = mix(vec3(Lp), rgb, clamp(1.0 + satAdj, 0.0, 2.0));\n  }\n\n  // Luminance: hue-preserving gain (ratio-scale). Darkening a blue sky or lifting\n  // reds keeps the hue and per-channel saturation intact, unlike an HSL-L add\n  // which greys and shifts the colour. Gentle factor so shadows don't blow out.\n  if (abs(lumAdj) > 1e-4) {\n    rgb *= 1.0 + lumAdj * 0.6;\n  }\n\n  return clamp(rgb, 0.0, 1.0);\n}", L = (e, t, n) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e / 100)) : 1, R = (e) => [
	"hue",
	"saturation",
	"luminance"
].every((t) => l.every((n) => e[t][n] === 0));
function z(e) {
	let t = {
		id: P,
		name: "HSL",
		phase: "display-adjust",
		anchor: "hsl"
	}, n = ({ hsl: e }, t) => ({
		uHslHue: l.map((t) => e.hue[t] / 100),
		uHslSat: l.map((t) => e.saturation[t] / 100),
		uHslLum: l.map((t) => e.luminance[t] / 100),
		uHslRange: L(t.settings("hueRange", 100), .25, 2),
		uHslSmooth: L(t.settings("smoothness", 100), 0, 1)
	});
	return e === 1 ? {
		...t,
		glsl: "c = applyHSL(c);",
		helpers: I,
		uniforms: F,
		derive: n
	} : {
		...t,
		glsl: "if (uHslActive) c = applyHSL(clamp(c, 0.0, 1.0));",
		helpers: I,
		uniforms: [...F, {
			key: "uHslActive",
			glslType: "bool",
			default: !1
		}],
		derive: (e, t) => ({
			...n(e, t),
			uHslActive: !R(e.hsl)
		})
	};
}
//#endregion
//#region src/target.ts
var B = .01;
function V(e) {
	let t = null, n = e.stores.useDevelopStore;
	return {
		onDown([r, i, o], s) {
			let c = p(m(r, i, o), L(e.settings.get("hueRange", 100), .25, 2), L(e.settings.get("smoothness", 100), 0, 1)), u = n.getState().params.hsl[a()];
			t = {
				startY: s.y,
				weights: c,
				start: l.map((e) => u[e])
			};
		},
		onMove(r) {
			if (!t) return;
			let i = -(r.y - t.startY) * e.settings.get("pickerSensitivity", w), { hsl: o } = n.getState().params, s = a(), c = { ...o[s] };
			t.weights.forEach((e, n) => {
				e < B || (c[l[n]] = Math.max(-100, Math.min(100, t.start[n] + i * e)));
			}), n.getState().setParam("hsl", {
				...o,
				[s]: c
			});
		},
		onUp() {
			t && (t = null, n.getState().commitEdit("HSL Picker"));
		}
	};
}
//#endregion
//#region src/index.tsx
var H = "core.hsl", U = "safelight.hsl.styles", W = 3;
function G(e) {
	n(e), e.registerStylesheet({
		id: U,
		css: v(e.ui.tokens)
	}), e.registerProcessingStage(z(3)), e.registerPanel({
		id: H,
		title: "HSL",
		component: k(V(e)),
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 11,
			width: 280,
			height: 220
		},
		onReset: () => void e.stores.useDevelopStore.getState().resetParams(["hsl"], "Reset HSL"),
		mask: N
	}), e.registerSettings(T);
}
//#endregion
export { W as LINE, H as PANEL_ID, U as STYLESHEET_ID, G as activate };

//# sourceMappingURL=index.js.map