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
	spaced: `${h}-spaced`,
	bands: `${h}-bands`,
	bandHeading: `${h}-band-heading`,
	sliders: `${h}-sliders`,
	row: `${h}-row`,
	dot: `${h}-dot`,
	grow: `${h}-grow`
};
function _(e) {
	return `
:where(.${g.toolbar}) { margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
:where(.${g.spaced}) { margin-bottom: 0.5rem; }
:where(.${g.bands} > :not(:last-child)) { margin-block: 0 0.75rem; }
:where(.${g.bandHeading}) { margin-bottom: 0.25rem; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: ${e.textMuted}; }
:where(.${g.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${g.row}) { display: flex; align-items: center; gap: 0.375rem; }
:where(.${g.dot}) { height: 0.5rem; width: 0.5rem; flex-shrink: 0; border-radius: 9999px; }
:where(.${g.grow}) { flex: 1; }
html.sl-larger-text .${g.bandHeading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${g.bandHeading} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/HSLMixer.tsx
var v = [
	{
		value: "hue",
		label: "Hue"
	},
	{
		value: "saturation",
		label: "Sat"
	},
	{
		value: "luminance",
		label: "Lum"
	}
], y = {
	red: "#e74c3c",
	orange: "#e67e22",
	yellow: "#f1c40f",
	green: "#2ecc71",
	aqua: "#1abc9c",
	blue: "#3498db",
	purple: "#9b59b6",
	magenta: "#e84393"
};
function b({ band: n, value: r, onChange: i, onCommit: a }) {
	let { Slider: o } = t.components;
	return /* @__PURE__ */ e.createElement("div", { className: g.sliders }, l.map((t) => /* @__PURE__ */ e.createElement("div", {
		key: t,
		className: g.row
	}, /* @__PURE__ */ e.createElement("span", {
		className: g.dot,
		style: { background: y[t] }
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
function x({ value: n, onChange: r, onCommit: i, selectedBand: a, onBandChange: o, view: s = "tabs" }) {
	let [c, l] = e.useState("hue"), u = a ?? c, d = o ?? l, { SegmentedControl: f } = t.ui;
	return s === "all" ? /* @__PURE__ */ e.createElement("div", { className: g.bands }, v.map((t) => /* @__PURE__ */ e.createElement("div", { key: t.value }, /* @__PURE__ */ e.createElement("div", { className: g.bandHeading }, t.value), /* @__PURE__ */ e.createElement(b, {
		band: t.value,
		value: n,
		onChange: r,
		onCommit: i
	})))) : /* @__PURE__ */ e.createElement(e.Fragment, null, /* @__PURE__ */ e.createElement("div", {
		className: g.spaced,
		role: "group",
		"aria-label": "HSL band"
	}, /* @__PURE__ */ e.createElement(f, {
		size: "sm",
		value: u,
		onChange: (e) => {
			let t = v.find((t) => t.value === e);
			t && d(t.value);
		},
		options: v
	})), /* @__PURE__ */ e.createElement(b, {
		band: u,
		value: n,
		onChange: r,
		onCommit: i
	}));
}
//#endregion
//#region src/settings.ts
var S = "tabs", C = .5, w = {
	title: "HSL",
	order: 60,
	keywords: [
		"hue",
		"saturation",
		"luminance",
		"colour mixer",
		"target",
		"tat"
	],
	fields: [
		{
			key: "defaultView",
			label: "Default layout",
			hint: "Tabs shows one band at a time; All stacks Hue, Saturation and Luminance.",
			type: "select",
			default: S,
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
			default: C,
			min: .1,
			max: 1.5,
			step: .05
		}
	]
}, T = [{
	value: "tabs",
	label: "Tabs"
}, {
	value: "all",
	label: "All"
}], E = (e, t, n, r) => ({
	...e,
	[t]: {
		...e[t],
		[n]: r
	}
});
function D(n) {
	return function() {
		let { Panel: r, PickerIcon: i } = t.components, { Button: a, SegmentedControl: s } = t.ui, l = t.stores.useDevelopStore, u = l((e) => e.params.hsl), d = l((e) => e.setParam), f = l((e) => e.commitEdit), p = t.develop.usePickDragHeld(), m = c(), [h, _] = e.useState(() => t.settings.get("defaultView", S));
		return /* @__PURE__ */ e.createElement(r, { title: "HSL" }, /* @__PURE__ */ e.createElement("div", { className: g.toolbar }, /* @__PURE__ */ e.createElement(a, {
			size: "sm",
			active: p,
			"aria-pressed": p,
			title: `Click-drag up/down on the image to adjust ${m}`,
			onClick: () => t.develop.setPickDrag(p ? null : n)
		}, /* @__PURE__ */ e.createElement(i, null), "Target"), /* @__PURE__ */ e.createElement("div", {
			role: "group",
			"aria-label": "HSL view"
		}, /* @__PURE__ */ e.createElement(s, {
			size: "sm",
			value: h,
			onChange: (e) => {
				let t = T.find((t) => t.value === e);
				t && _(t.value);
			},
			options: T
		}))), h === "all" && p && /* @__PURE__ */ e.createElement("div", {
			className: g.spaced,
			role: "group",
			"aria-label": "Target band"
		}, /* @__PURE__ */ e.createElement(s, {
			size: "sm",
			value: m,
			onChange: (e) => {
				let t = v.find((t) => t.value === e);
				t && o(t.value);
			},
			options: v
		})), /* @__PURE__ */ e.createElement(x, {
			value: u,
			onChange: (e, t, n) => d("hsl", E(u, e, t, n)),
			onCommit: (e) => void f(`HSL ${e}`),
			selectedBand: m,
			onBandChange: o,
			view: h
		}));
	};
}
var O = {
	red: 0,
	orange: 0,
	yellow: 0,
	green: 0,
	aqua: 0,
	blue: 0,
	purple: 0,
	magenta: 0
}, k = {
	hue: O,
	saturation: O,
	luminance: O
};
function A() {
	let n = t.develop.useMaskScope(), r = n.hsl ?? k;
	return /* @__PURE__ */ e.createElement(x, {
		value: r,
		onChange: (e, t, i) => n.setHsl(E(r, e, t, i)),
		onCommit: (e) => n.commit(`Mask HSL ${e}`)
	});
}
var j = {
	component: A,
	order: 40,
	owns: ["hsl"]
}, M = "safelight.hsl.mix", N = [
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
], P = "vec3 applyHSL(vec3 c) {\n  vec3 hsl = rgb2hsl(c);\n  // Protect near-neutral pixels: an achromatic pixel has no real hue (rgb2hsl\n  // reports 0 = red), so without this gate the Red sliders would tint/relight\n  // every grey. Fades the whole effect in over a low saturation threshold, so\n  // genuinely coloured pixels (even pale skies/skin) still respond fully.\n  float chromaW = smoothstep(0.0, 0.10, hsl.y);\n  if (chromaW < 1e-4) return c;\n\n  float hueDeg = hsl.x * 360.0;\n\n  float hueShift = 0.0;\n  float satAdj = 0.0;\n  float lumAdj = 0.0;\n  for (int i = 0; i < 8; i++) {\n    float wi = hslBandWeight(hueDeg, HSL_CENTERS[i], HSL_DPREV[i], HSL_DNEXT[i], uHslRange, uHslSmooth);\n    hueShift += uHslHue[i] * wi;\n    satAdj   += uHslSat[i] * wi;\n    lumAdj   += uHslLum[i] * wi;\n  }\n  hueShift *= chromaW;\n  satAdj   *= chromaW;\n  lumAdj   *= chromaW;\n\n  // Hue: rotate in HSL (luminance-invariant), ±30° at full slider.\n  hsl.x = fract(hsl.x + hueShift * (30.0 / 360.0));\n  vec3 rgb = hsl2rgb(hsl);\n\n  // Saturation: perceptual. Scale chroma around the pixel's true luminance, so a\n  // cut collapses the colour to its actual grey (not HSL-L's mid-range grey) and\n  // a boost doesn't clip the bright channel into a different hue on the way up.\n  if (abs(satAdj) > 1e-4) {\n    float Lp = luma(rgb);\n    rgb = mix(vec3(Lp), rgb, clamp(1.0 + satAdj, 0.0, 2.0));\n  }\n\n  // Luminance: hue-preserving gain (ratio-scale). Darkening a blue sky or lifting\n  // reds keeps the hue and per-channel saturation intact, unlike an HSL-L add\n  // which greys and shifts the colour. Gentle factor so shadows don't blow out.\n  if (abs(lumAdj) > 1e-4) {\n    rgb *= 1.0 + lumAdj * 0.6;\n  }\n\n  return clamp(rgb, 0.0, 1.0);\n}", F = (e, t, n) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e / 100)) : 1, I = (e) => [
	"hue",
	"saturation",
	"luminance"
].every((t) => l.every((n) => e[t][n] === 0));
function L(e) {
	let t = {
		id: M,
		name: "HSL",
		phase: "display-adjust",
		anchor: "hsl"
	}, n = ({ hsl: e }, t) => ({
		uHslHue: l.map((t) => e.hue[t] / 100),
		uHslSat: l.map((t) => e.saturation[t] / 100),
		uHslLum: l.map((t) => e.luminance[t] / 100),
		uHslRange: F(t.settings("hueRange", 100), .25, 2),
		uHslSmooth: F(t.settings("smoothness", 100), 0, 1)
	});
	return e === 1 ? {
		...t,
		glsl: "c = applyHSL(c);",
		helpers: P,
		uniforms: N,
		derive: n
	} : {
		...t,
		glsl: "if (uHslActive) c = applyHSL(clamp(c, 0.0, 1.0));",
		helpers: P,
		uniforms: [...N, {
			key: "uHslActive",
			glslType: "bool",
			default: !1
		}],
		dormantWhen: { uHslActive: !1 },
		derive: (e, t) => ({
			...n(e, t),
			uHslActive: !I(e.hsl)
		})
	};
}
//#endregion
//#region src/target.ts
var R = .01, z = {
	red: 0,
	orange: 0,
	yellow: 0,
	green: 0,
	aqua: 0,
	blue: 0,
	purple: 0,
	magenta: 0
}, B = {
	hue: z,
	saturation: z,
	luminance: z
}, V = (e) => Object.values(e).every((e) => Object.values(e).every((e) => e === 0)), H = null, U = (e, t) => {
	if (e.width < 1 || e.height < 1) return null;
	H ??= new OffscreenCanvas(1, 1);
	let n = H.getContext("2d", { willReadFrequently: !0 });
	if (!n) return null;
	let r = Math.min(e.width - 1, Math.max(0, Math.floor(t.x))), i = Math.min(e.height - 1, Math.max(0, Math.floor(t.y)));
	n.clearRect(0, 0, 1, 1), n.drawImage(e, r, i, 1, 1, 0, 0, 1, 1);
	let [a, o, s] = n.getImageData(0, 0, 1, 1).data;
	return [
		a / 255,
		o / 255,
		s / 255
	];
};
function W(e, t = U) {
	let n = null, r = null, i = e.stores.useDevelopStore, o = ([t, n, r]) => p(m(t, n, r), F(e.settings.get("hueRange", 100), .25, 2), F(e.settings.get("smoothness", 100), 0, 1)), s = (t) => {
		if (!t.weights || t.y === null) return;
		t.moved = !0;
		let n = -(t.y - t.startY) * e.settings.get("pickerSensitivity", C), { hsl: r } = i.getState().params, o = a(), s = { ...r[o] };
		t.weights.forEach((e, r) => {
			e < R || (s[l[r]] = Math.max(-100, Math.min(100, t.start[r] + n * e)));
		}), i.getState().setParam("hsl", {
			...r,
			[o]: s
		});
	}, c = (e) => {
		e.moved && i.getState().commitEdit("HSL Picker");
	}, u = async (n, r) => {
		let a = await e.develop.captureFrame({
			...i.getState().params,
			hsl: B
		});
		try {
			return t(a, r) ?? n;
		} finally {
			a.close();
		}
	};
	return {
		onDown(e, t) {
			let { hsl: d } = i.getState().params, f = d[a()], p = {
				startY: t.y,
				start: l.map((e) => f[e]),
				weights: null,
				y: null,
				moved: !1,
				released: !1
			};
			n = p, r = p, V(d) ? p.weights = o(e) : u(e, t).catch(() => e).then((e) => {
				r === p && (p.weights = o(e), s(p), p.released && c(p));
			});
		},
		onMove(e) {
			n && (n.y = e.y, s(n));
		},
		onUp() {
			let e = n;
			e && (n = null, e.released = !0, e.weights && c(e));
		}
	};
}
//#endregion
//#region src/index.tsx
var G = "core.hsl", K = "safelight.hsl.styles", q = 3;
function J(e) {
	n(e), e.registerStylesheet({
		id: K,
		css: _(e.ui.tokens)
	}), e.registerProcessingStage(L(3)), e.registerPanel({
		id: G,
		title: "HSL",
		component: D(W(e)),
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 11,
			width: 280,
			height: 220
		},
		modules: ["develop"],
		onReset: () => void e.stores.useDevelopStore.getState().resetParams(["hsl"], "Reset HSL"),
		mask: j
	}), e.registerSettings(w);
}
//#endregion
export { q as LINE, G as PANEL_ID, K as STYLESHEET_ID, J as activate };

//# sourceMappingURL=index.js.map