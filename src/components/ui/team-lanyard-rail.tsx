"use client";

import * as React from "react";

export interface LanyardLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface LanyardMember {
  id: string;
  /** Accessible name, printed on both faces of the badge. */
  name: string;
  role: string;
  /** Company or team line printed under the role, e.g. "OSMIS · Kebersihan". */
  team?: string;
  /** Portrait, cropped to a circle. A square image works best. */
  image: string;
  /** One or two sentences printed on the back. */
  bio?: string;
  /** Short chips on the back such as "OSMIS 26/27" or division name. */
  tags?: string[];
  /** Contact / action links on the back. */
  links?: LanyardLink[];
  /** Team colour: chart token 1–5 for the ribbon and the badge band. */
  tone?: 1 | 2 | 3 | 4 | 5;
  /** Extra lanyard length in pixels at a 140 px badge; it scales with the badge. */
  drop?: number;
  /** Optional Qism logo printed on the badge band. */
  qismLogo?: string;
  /** Optional Main OSMIS logo printed on the badge band. */
  mainLogo?: string;
}

export interface TeamLanyardRailLabels {
  /** Hint under the name while a badge faces the front. */
  flip: string;
  /** Hint under the name while a badge shows its back. */
  back: string;
  /** Prefix of the carousel dots on narrow screens. */
  show: string;
}

export interface TeamLanyardRailProps extends React.ComponentProps<"section"> {
  items: LanyardMember[];
  eyebrow?: string;
  /** Heading replaces "A team wall..." with Nama Qism (e.g. "KEBERSIHAN & OLAHRAGA"). */
  heading?: string;
  /** Shown under the rail while nobody is selected. */
  caption?: string;
  /** Optional Main OSMIS Logo shown in header & badges. */
  mainLogo?: string;
  /** Optional Qism Logo shown in header & badges. */
  qismLogo?: string;
  /** Optional Call to action rendered under the caption ("We're hiring" is removed by default). */
  action?: React.ReactNode;
  /** Turns the badges to the front and flips them one by one until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds a badge shows its back during autoplay. */
  interval?: number;
  /** Badge facing the front (controlled). */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  /** Badge turned to its back (controlled). */
  flipped?: number | null;
  onFlippedChange?: (index: number | null) => void;
  labels?: TeamLanyardRailLabels;
}

const RATIO = 96 / 62;
const MAX_W = 144;
const MIN_RAIL_W = 104;
const EM = 11.2;
const RAIL_PITCH_MIN = 1.16;
const RAIL_PITCH_MAX = 1.62;
const CAROUSEL_PITCH = 1.2;
const GAP = 0.07;
const PERSPECTIVE = 900;
const MAX_STRETCH = 64;
const FIRST_DELAY = 1100;
const FLIP_DELAY = 700;
const SWING_K = 28;
const SWING_DAMP = 2.2;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.5;
const REST_Y = [9, -10, 7, -8, 10, -7, 8, -9];
const REST_Z = [-1.6, 1.2, -2, 1.5, -1, 1.8, -1.3, 2];
const DROPS = [6, 20, 0, 13, 22, 4, 16, 9];
const TONES = ["tlr-tone-1", "tlr-tone-2", "tlr-tone-3", "tlr-tone-4", "tlr-tone-5"] as const;
const DEFAULT_LABELS: TeamLanyardRailLabels = {
  flip: "Klik kartu untuk membalik ID Card • Tarik ke bawah untuk mengayunkan",
  back: "Klik lagi atau tekan Esc untuk membalik kembali",
  show: "Tampilkan",
};
const METAL =
  "linear-gradient(to right, color-mix(in oklab, var(--tlr-muted-fg) 70%, black), color-mix(in oklab, var(--tlr-muted-fg) 22%, white) 38%, var(--tlr-muted-fg) 70%, color-mix(in oklab, var(--tlr-muted-fg) 65%, black))";
const PLASTIC =
  "linear-gradient(180deg, color-mix(in oklab, var(--tlr-muted-fg) 30%, var(--tlr-bg)), color-mix(in oklab, var(--tlr-muted-fg) 72%, var(--tlr-bg)))";

const SCOPED_CSS = `
[data-slot="team-lanyard-rail"] {
  --tlr-bg: var(--color-background, var(--bg-color, #f8f6f0));
  --tlr-fg: var(--color-foreground, var(--text-color, #1a1a1a));
  --tlr-card: #ffffff;
  --tlr-card-fg: #14181f;
  --tlr-muted: rgba(46, 89, 66, 0.08);
  --tlr-muted-fg: #5a655e;
  --tlr-border: rgba(20, 24, 31, 0.12);
  --tlr-ring: var(--osmis-green, #2e5942);
  position: relative;
  isolation: isolate;
  width: 100%;
  overflow: hidden;
  background-color: var(--tlr-bg);
  color: var(--tlr-fg);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
}
[data-theme="dark"] [data-slot="team-lanyard-rail"] {
  --tlr-card: #131924;
  --tlr-card-fg: #f0f6fc;
  --tlr-muted: rgba(255, 255, 255, 0.07);
  --tlr-muted-fg: #94a3b8;
  --tlr-border: rgba(255, 255, 255, 0.14);
}
[data-slot="team-lanyard-rail"] * {
  box-sizing: border-box;
}
.tlr-tone-1 { color: #2e5942; }
.tlr-tone-2 { color: #d69f30; }
.tlr-tone-3 { color: #2563eb; }
.tlr-tone-4 { color: #059669; }
.tlr-tone-5 { color: #7c3aed; }
[data-theme="dark"] .tlr-tone-1 { color: #10b981; }
[data-theme="dark"] .tlr-tone-2 { color: #f59e0b; }
[data-theme="dark"] .tlr-tone-3 { color: #3b82f6; }
[data-theme="dark"] .tlr-tone-4 { color: #14b8a6; }
[data-theme="dark"] .tlr-tone-5 { color: #8b5cf6; }

.tlr-header {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1.5rem 0.25rem;
  text-align: center;
}
.tlr-logos {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--tlr-fg) 5%, transparent);
  border: 1px solid var(--tlr-border);
  margin-bottom: 0.25rem;
}
.tlr-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: block;
}
.tlr-logo-sep {
  width: 1px;
  height: 18px;
  background: var(--tlr-border);
}
.tlr-eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--osmis-green, #2e5942);
  margin: 0;
  font-family: var(--font-mono, monospace);
}
.tlr-heading {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  font-family: var(--font-display, serif);
  color: var(--tlr-fg);
}
.tlr-stage {
  position: relative;
  margin-top: 0.5rem;
  width: 100%;
  touch-action: pan-y;
  user-select: none;
  overflow-x: clip;
}
.tlr-slot {
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
}
.tlr-badge-btn {
  pointer-events: auto;
  position: absolute;
  left: 0;
  cursor: pointer;
  border-radius: 0.85em;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  text-align: left;
  outline: none;
  font-family: inherit;
}
.tlr-badge-btn:focus-visible {
  outline: 2px solid var(--tlr-ring);
  outline-offset: 4px;
}
.tlr-flip {
  position: absolute;
  inset: 0;
  display: block;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}
.tlr-face-front {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 0.85em;
  border: 1px solid var(--tlr-border);
  background-color: var(--tlr-card);
  color: var(--tlr-card-fg);
  padding: 0 0.75em 0.65em;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(1px);
}
.tlr-face-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 0.85em;
  border: 1px solid var(--tlr-border);
  background-color: var(--tlr-card);
  color: var(--tlr-card-fg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: rotateY(180deg) translateZ(1px);
}
.tlr-band {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: block;
  background: repeating-linear-gradient(
      135deg,
      transparent 0 0.45em,
      color-mix(in oklab, white 10%, transparent) 0.45em 0.56em
    ),
    linear-gradient(
      180deg,
      color-mix(in oklab, currentColor 80%, white),
      currentColor 72%,
      color-mix(in oklab, currentColor 86%, black)
    );
}
.tlr-band-tall {
  height: 4.3em;
}
.tlr-band-short {
  height: 2.15em;
}
.tlr-band-logos {
  position: absolute;
  inset: 0.42em 0.55em auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}
.tlr-band-logo-badge {
  width: 1.45em;
  height: 1.45em;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.14em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.tlr-band-logo-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.tlr-hole {
  position: absolute;
  left: 50%;
  top: 0.72em;
  display: block;
  height: 0.56em;
  width: 2.7em;
  transform: translateX(-50%);
  border-radius: 999px;
  background-color: var(--tlr-bg);
  box-shadow:
    inset 0 0.09em 0.2em color-mix(in oklab, black 55%, transparent),
    0 0.05em 0 color-mix(in oklab, white 30%, transparent);
  z-index: 2;
}
.tlr-avatar-ring {
  position: relative;
  margin-top: 1.95em;
  display: block;
  width: 5.4em;
  height: 5.4em;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--tlr-card);
  padding: 0.2em;
  box-shadow: 0 0.15em 0.5em color-mix(in oklab, var(--tlr-fg) 22%, transparent);
  z-index: 2;
}
.tlr-avatar-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  background-color: var(--tlr-muted);
}
.tlr-avatar-img {
  pointer-events: none;
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  object-fit: cover;
  object-position: top center;
}
.tlr-name {
  margin-top: 0.5em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
  text-align: center;
  font-size: 0.96em;
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.01em;
  color: var(--tlr-card-fg);
}
.tlr-role {
  margin-top: 0.2em;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 0.72em;
  font-weight: 700;
  line-height: 1.25;
  color: var(--osmis-green, #2e5942);
  font-family: var(--font-mono, monospace);
}
.tlr-team {
  margin-top: 0.3em;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 0.56em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--tlr-muted-fg);
}
.tlr-barcode-wrap {
  margin-top: auto;
  display: block;
  width: 100%;
  border-top: 1px dashed var(--tlr-border);
  padding-top: 0.45em;
}
.tlr-barcode-svg {
  display: block;
  height: 1.45em;
  width: 100%;
  color: var(--tlr-card-fg);
  opacity: 0.8;
}
.tlr-barcode-num {
  margin-top: 0.2em;
  display: block;
  text-align: center;
  font-family: var(--font-mono, monospace);
  font-size: 0.5em;
  letter-spacing: 0.28em;
  color: var(--tlr-muted-fg);
}
.tlr-tag {
  display: block;
  border-radius: 999px;
  border: 1px solid var(--tlr-border);
  background: var(--tlr-muted);
  padding: 0.16em 0.55em;
  font-size: 0.58em;
  line-height: 1.2;
  color: var(--tlr-muted-fg);
  font-weight: 600;
}
.tlr-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  border-radius: 0.45em;
  padding: 0.22em 0.45em;
  font-size: 0.65em;
  font-weight: 600;
  line-height: 1.2;
  background: var(--tlr-muted);
  color: var(--tlr-card-fg);
  border: 1px solid var(--tlr-border);
  cursor: pointer;
  text-decoration: none;
}
.tlr-link-btn:hover {
  background: var(--osmis-green, #2e5942);
  color: #fff;
}
.tlr-footer {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 1.5rem 1.5rem;
  text-align: center;
}
.tlr-dots {
  position: relative;
  z-index: 10;
  margin-top: 0.25rem;
  display: flex;
  justify-content: center;
  gap: 0.375rem;
}
.tlr-dot {
  height: 0.375rem;
  border-radius: 999px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: color-mix(in oklab, var(--tlr-fg) 25%, transparent);
  transition: width 0.3s ease, background-color 0.3s ease;
}
.tlr-dot[aria-current="true"] {
  width: 1.5rem;
  background: var(--osmis-green, #2e5942);
}
.tlr-dot:not([aria-current="true"]) {
  width: 0.375rem;
}
`;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function qrPath(seed: number) {
  const size = 21;
  const next = random(seed);
  const corners = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const corner = corners.find(
        ([cx = 0, cy = 0]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
      );
      const quiet =
        (x < 8 && y < 8) ||
        (x >= size - 8 && y < 8) ||
        (x < 8 && y >= size - 8);
      let on: boolean;
      if (corner)
        on =
          Math.max(
            Math.abs(x - (corner[0] ?? 0) - 3),
            Math.abs(y - (corner[1] ?? 0) - 3)
          ) !== 2;
      else if (quiet) on = false;
      else if (x === 6 || y === 6) on = (x + y) % 2 === 0;
      else on = next() > 0.52;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

function barcode(seed: number) {
  const next = random(seed ^ 0x9e3779b9);
  let x = 0;
  let d = "";
  while (x < 92) {
    const w = 1 + Math.floor(next() * 3);
    d += `M${x} 0h${w}v20h-${w}z`;
    x += w + 1 + Math.floor(next() * 2.2);
  }
  return { d, width: x };
}

function soft(distance: number, max: number) {
  const knee = max * 0.75;
  if (distance <= knee) return distance;
  return (
    knee + (max - knee) * (1 - Math.exp(-(distance - knee) / (max - knee)))
  );
}

function geometry(W: number, items: LanyardMember[]) {
  const u = W / MAX_W;
  const H = W * RATIO;
  const railR = Math.max(3, 4.2 * u);
  const railY = 14 + railR;
  const ring = 9 * u;
  const pivotY = railY + ring * 0.8;
  const strapW = Math.max(8, 11 * u);
  const crimp = 6 * u;
  const reel = 21 * u;
  const cordRest = 12 * u;
  const clipH = 13 * u;
  const clipW = 30 * u;
  const base = 52 * u;
  const straps = items.map(
    (item, i) =>
      base + Math.max(0, item.drop ?? DROPS[i % DROPS.length] ?? 0) * u
  );
  const reelTops = straps.map((len) => pivotY + len + crimp * 0.6);
  const clipTops = reelTops.map((top) => top + reel * 0.82 + cordRest);
  const cardTops = clipTops.map((top) => top + clipH * 0.62);
  const pendulum = cardTops.map((top) => top + H / 2 - pivotY);
  const restLength =
    pivotY +
    base +
    crimp * 0.6 +
    reel * 0.82 +
    cordRest +
    clipH * 0.62 +
    H / 2 -
    pivotY;
  const bottom = Math.max(0, ...cardTops.map((top) => top + H));
  return {
    W,
    H,
    u,
    railR,
    railY,
    ring,
    pivotY,
    strapW,
    crimp,
    reel,
    cordRest,
    clipH,
    clipW,
    straps,
    reelTops,
    clipTops,
    cardTops,
    pendulum,
    swingK: pendulum.map((len) => (SWING_K * restLength) / len),
    couple: pendulum.map((len) => (0.25 * 57.3) / len),
    maxStretch: Math.round(MAX_STRETCH * Math.min(1, W / 118)),
    height: Math.ceil(bottom + 16 * u + 8),
  };
}

function layoutTargets(
  width: number,
  W: number,
  carousel: boolean,
  center: number | null,
  count: number
) {
  if (!carousel) {
    const pitch = clamp(
      (width - 40 - W * 0.6) / Math.max(1, count),
      W * RAIL_PITCH_MIN,
      W * RAIL_PITCH_MAX
    );
    const start = width / 2 - (pitch * (count - 1)) / 2;
    return {
      xs: Array.from({ length: count }, (_, i) => start + i * pitch),
      total: 0,
    };
  }
  const pitch = W * CAROUSEL_PITCH;
  const total = pitch * count;
  const cyclic = count > 2 && total >= width + W * 2;
  const c = center ?? 0;
  const xs = Array.from({ length: count }, (_, i) => {
    let k = i - c;
    if (cyclic) {
      k = ((k % count) + count) % count;
      if (k >= count / 2) k -= count;
    }
    return width / 2 + k * pitch;
  });
  return { xs, total: cyclic ? total : 0 };
}

type Sim = {
  x: number[];
  vx: number[];
  px: number[];
  tx: number[];
  sw: number[];
  vsw: number[];
  beta: number[];
  ry: number[];
  vry: number[];
  tr: number[];
  rz: number[];
  vrz: number[];
  tz: number[];
  lift: number[];
  vlift: number[];
  tl: number[];
  pop: number[];
  vpop: number[];
  tp: number[];
  st: number[];
  vst: number[];
  drag: number;
  grab: number;
  pull: number;
  free: number;
  last: number;
  raf: number;
  carousel: boolean | null;
};

function emptySim(): Sim {
  return {
    x: [],
    vx: [],
    px: [],
    tx: [],
    sw: [],
    vsw: [],
    beta: [],
    ry: [],
    vry: [],
    tr: [],
    rz: [],
    vrz: [],
    tz: [],
    lift: [],
    vlift: [],
    tl: [],
    pop: [],
    vpop: [],
    tp: [],
    st: [],
    vst: [],
    drag: -1,
    grab: 0,
    pull: -1,
    free: 0,
    last: 0,
    raf: 0,
    carousel: null,
  };
}

function spring(
  value: number[],
  velocity: number[],
  target: number,
  i: number,
  k: number,
  zeta: number,
  h: number
) {
  const v = velocity[i] ?? 0;
  const x = value[i] ?? 0;
  const next = v + (-k * (x - target) - 2 * zeta * Math.sqrt(k) * v) * h;
  velocity[i] = next;
  value[i] = x + next * h;
}

function badgeWidth(s: Sim, W: number, i: number) {
  return W * (1 + 0.08 * (s.pop[i] ?? 0));
}

function minGap(s: Sim, W: number, a: number, b: number) {
  return (badgeWidth(s, W, a) + badgeWidth(s, W, b)) / 2 + W * GAP;
}

function stops(s: Sim, W: number, width: number, count: number) {
  return [
    W * 0.32 + badgeWidth(s, W, 0) / 2,
    width - W * 0.32 - badgeWidth(s, W, count - 1) / 2,
  ] as const;
}

type EdgeGeometry = {
  W: number;
  H: number;
  pivotY: number;
  clipTops: number[];
  cardTops: number[];
};

function cardEdge(s: Sim, g: EdgeGeometry, i: number, side: 1 | -1) {
  const theta = ((s.sw[i] ?? 0) * Math.PI) / 180;
  const psi = (((s.beta[i] ?? 0) + (s.rz[i] ?? 0)) * Math.PI) / 180;
  const scale = 1 + 0.08 * (s.pop[i] ?? 0);
  const clipDepth =
    (g.clipTops[i] ?? 0) + (s.st[i] ?? 0) - 4 * (s.lift[i] ?? 0) - g.pivotY;
  const offset = (g.cardTops[i] ?? 0) - (g.clipTops[i] ?? 0);
  const cx = (s.x[i] ?? 0) - clipDepth * Math.sin(theta);
  const half = (g.W / 2) * scale * Math.cos(psi) * side;
  return [
    cx + half - offset * scale * Math.sin(psi),
    cx + half - (offset + g.H) * scale * Math.sin(psi),
    clipDepth + offset * scale,
    clipDepth + (offset + g.H) * scale,
  ] as const;
}

function LinkIcon({ label }: { label: string }) {
  if (/foto|zoom|lihat/i.test(label)) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        style={{ width: "1.05em", height: "1.05em", flexShrink: 0 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      style={{ width: "1.05em", height: "1.05em", flexShrink: 0 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11 11 5M6.2 5H11v4.8" />
    </svg>
  );
}

function Band({
  tone,
  tall,
  mainLogo,
  qismLogo,
}: {
  tone: string;
  tall?: boolean;
  mainLogo?: string;
  qismLogo?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`tlr-band ${tone} ${tall ? "tlr-band-tall" : "tlr-band-short"}`}
    >
      {(mainLogo || qismLogo) && (
        <span className="tlr-band-logos">
          {mainLogo ? (
            <span className="tlr-band-logo-badge">
              <img src={mainLogo} alt="" draggable={false} />
            </span>
          ) : (
            <span />
          )}
          {qismLogo ? (
            <span className="tlr-band-logo-badge">
              <img src={qismLogo} alt="" draggable={false} />
            </span>
          ) : (
            <span />
          )}
        </span>
      )}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "1px",
          background: "rgba(0,0,0,0.15)",
        }}
      />
    </span>
  );
}

function Hole() {
  return <span aria-hidden="true" className="tlr-hole" />;
}

function Finish() {
  return (
    <>
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "-50%",
          display: "block",
          width: "200%",
          opacity: 0.55,
          background:
            "linear-gradient(100deg, transparent 40%, color-mix(in oklab, white 26%, transparent) 48%, color-mix(in oklab, white 8%, transparent) 52%, transparent 58%)",
          transform: "translateX(var(--gx, 0%))",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          display: "block",
          background: "#000",
          opacity: "var(--shade, 0)",
        }}
      />
    </>
  );
}

function Silhouette() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      style={{
        width: "100%",
        height: "100%",
        color: "var(--tlr-muted-fg)",
        opacity: 0.5,
      }}
    >
      <circle cx="20" cy="15" r="7" fill="currentColor" />
      <path d="M6 38c1.5-8 7-12 14-12s12.5 4 14 12z" fill="currentColor" />
    </svg>
  );
}

const BadgeFaces = React.memo(function BadgeFaces({
  item,
  tone,
  defaultMainLogo,
  defaultQismLogo,
}: {
  item: LanyardMember;
  tone: string;
  defaultMainLogo?: string;
  defaultQismLogo?: string;
}) {
  const seed = React.useMemo(
    () => hash(`${item.id}:${item.name}`),
    [item.id, item.name]
  );
  const qr = React.useMemo(() => qrPath(seed), [seed]);
  const bars = React.useMemo(() => barcode(seed), [seed]);
  const digits = String(seed % 1000000000).padStart(9, "0");
  const [failed, setFailed] = React.useState(false);
  const tags = (item.tags ?? []).slice(0, 3);
  const links = (item.links ?? []).slice(0, 3);
  const mLogo = item.mainLogo ?? defaultMainLogo;
  const qLogo = item.qismLogo ?? defaultQismLogo;

  return (
    <>
      <span data-face="front" className="tlr-face-front">
        <Band tone={tone} tall mainLogo={mLogo} qismLogo={qLogo} />
        <Hole />
        <span className="tlr-avatar-ring">
          <span className="tlr-avatar-inner">
            <Silhouette />
            {!failed && item.image && (
              <img
                src={item.image}
                alt={item.name}
                draggable={false}
                decoding="async"
                onError={() => setFailed(true)}
                className="tlr-avatar-img"
              />
            )}
          </span>
        </span>
        <span className="tlr-name">{item.name}</span>
        <span className="tlr-role">{item.role}</span>
        {item.team && <span className="tlr-team">{item.team}</span>}
        <span className="tlr-barcode-wrap">
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${bars.width} 20`}
            preserveAspectRatio="none"
            className="tlr-barcode-svg"
          >
            <path d={bars.d} fill="currentColor" />
          </svg>
          <span className="tlr-barcode-num">{digits}</span>
        </span>
        <Finish />
      </span>

      <span data-face="back" className="tlr-face-back">
        <Band tone={tone} mainLogo={mLogo} qismLogo={qLogo} />
        <Hole />
        <span
          style={{
            position: "absolute",
            left: "0.85em",
            right: "0.85em",
            top: "2.55em",
            display: "block",
          }}
        >
          <span
            style={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.92em",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {item.name}
          </span>
          <span
            style={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.7em",
              lineHeight: 1.3,
              color: "var(--osmis-green, #2e5942)",
              fontWeight: 600,
            }}
          >
            {item.role}
          </span>
        </span>
        {item.bio && (
          <span
            style={{
              position: "absolute",
              left: "0.85em",
              right: "0.85em",
              top: "4.9em",
              display: "block",
            }}
          >
            <span
              data-bio
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "0.7em",
                lineHeight: 1.38,
                color: "var(--tlr-muted-fg)",
              }}
            >
              {item.bio}
            </span>
          </span>
        )}
        {tags.length > 0 && (
          <span
            style={{
              position: "absolute",
              left: "0.85em",
              right: "0.85em",
              top: "9.4em",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.28em",
            }}
          >
            {tags.map((tag) => (
              <span key={tag} className="tlr-tag">
                {tag}
              </span>
            ))}
          </span>
        )}
        {links.length > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "0.75em",
              left: "0.65em",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.18em",
              opacity: "var(--drawn, 1)",
              transition: "opacity 0.15s ease",
            }}
          >
            {links.map((link) => (
              <span key={link.label} className="tlr-link-btn">
                <LinkIcon label={link.label} />
                {link.label}
              </span>
            ))}
          </span>
        )}
        <svg
          aria-hidden="true"
          viewBox="-1 -1 23 23"
          style={{
            position: "absolute",
            bottom: "0.75em",
            right: "0.75em",
            width: "3.6em",
            height: "3.6em",
            color: "var(--tlr-card-fg)",
          }}
        >
          <path d={qr} fill="currentColor" />
        </svg>
        <Finish />
      </span>

      {[0, 1].map((side) => (
        <span
          key={side}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "0.85em",
            bottom: "0.85em",
            display: "block",
            width: "2px",
            [side ? "right" : "left"]: 0,
            transform: `translateX(${side ? 1 : -1}px) rotateY(90deg)`,
            background:
              "color-mix(in oklab, var(--tlr-fg) 30%, var(--tlr-card))",
          }}
        />
      ))}
    </>
  );
});

export function TeamLanyardRail({
  items,
  eyebrow,
  heading,
  caption,
  mainLogo = "/logo_utama.png",
  qismLogo,
  action,
  autoplay = false,
  interval = 2800,
  active: activeProp,
  onActiveChange,
  flipped: flippedProp,
  onFlippedChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: TeamLanyardRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const slots = React.useRef([] as (HTMLDivElement | null)[]);
  const swings = React.useRef([] as (HTMLSpanElement | null)[]);
  const straps = React.useRef([] as (HTMLSpanElement | null)[]);
  const cords = React.useRef([] as (HTMLSpanElement | null)[]);
  const hangs = React.useRef([] as (HTMLSpanElement | null)[]);
  const buttons = React.useRef([] as (HTMLButtonElement | null)[]);
  const flips = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const linkLayers = React.useRef([] as (HTMLDivElement | null)[]);
  const sim = React.useRef(emptySim());
  const [size, setSize] = React.useState({
    width: 0,
    W: MAX_W,
    carousel: false,
  });
  const [innerActive, setInnerActive] = React.useState(null as number | null);
  const [innerFlipped, setInnerFlipped] = React.useState(
    null as number | null
  );
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({
    id: -1,
    index: -1,
    x: 0,
    y: 0,
    mode: "",
    kind: "",
    lastX: 0,
    lastY: 0,
    lastT: 0,
    v: 0,
    swipe: 0,
    angle: 0,
    hoverX: 0,
    hoverT: 0,
    hoverHit: -1,
  });
  const valid = (value: number | null | undefined) =>
    value === null || value === undefined || value < 0 || value >= count
      ? null
      : value;
  const active = valid(activeProp !== undefined ? activeProp : innerActive);
  const flipped = valid(flippedProp !== undefined ? flippedProp : innerFlipped);
  const geo = React.useMemo(() => geometry(size.W, items), [size.W, items]);
  const live = React.useRef({
    active,
    flipped,
    size,
    geo,
    reduced,
    count,
    carouselIndex: 0,
    cyclic: false,
    activeControlled: false,
    flippedControlled: false,
  });
  live.current = {
    ...live.current,
    active,
    flipped,
    size,
    geo,
    reduced,
    count,
    activeControlled: activeProp !== undefined,
    flippedControlled: flippedProp !== undefined,
  };
  const callbacks = React.useRef({ onActiveChange, onFlippedChange });
  callbacks.current = { onActiveChange, onFlippedChange };

  const setActive = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.active === index) return;
    L.active = index;
    if (index !== null) L.carouselIndex = index;
    if (!L.activeControlled) setInnerActive(index);
    callbacks.current.onActiveChange?.(index);
  }, []);

  const setFlipped = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.flipped === index) return;
    const old = L.flipped;
    if (
      old !== null &&
      linkLayers.current[old]?.contains(document.activeElement)
    )
      buttons.current[old]?.focus({ preventScroll: true });
    L.flipped = index;
    if (!L.flippedControlled) setInnerFlipped(index);
    callbacks.current.onFlippedChange?.(index);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    setPlaying(autoplay);
  }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const n = Math.max(1, live.current.count);
      const railW = Math.min(MAX_W, (width - 40) / (n * RAIL_PITCH_MIN + 0.4));
      const carousel = railW < MIN_RAIL_W;
      const W =
        Math.round((carousel ? clamp(width * 0.3, 102, 132) : railW) * 4) / 4;
      setSize((old) =>
        Math.abs(old.width - width) < 0.5 &&
        old.carousel === carousel &&
        old.W === W
          ? old
          : { width, W, carousel }
      );
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0];
      if (box) measure(box.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const g = live.current.geo;
    const slot = slots.current[i];
    if (!slot) return;
    slot.style.transform = `translate3d(${(
      (s.x[i] ?? 0) -
      g.W / 2
    ).toFixed(2)}px,0,0)`;
    const sw = s.sw[i] ?? 0;
    const swing = swings.current[i];
    if (swing) swing.style.transform = `rotate(${sw.toFixed(3)}deg)`;
    const st = s.st[i] ?? 0;
    straps.current[i]?.style.setProperty("--stretch", `${st.toFixed(2)}px`);
    const cord = cords.current[i];
    if (cord)
      cord.style.transform = `scaleY(${Math.max(
        0.12,
        (g.cordRest + st) / g.cordRest
      ).toFixed(4)})`;
    const lift = s.lift[i] ?? 0;
    const pop = s.pop[i] ?? 0;
    const hang = hangs.current[i];
    if (hang)
      hang.style.transform = `translate3d(0,${(st - 4 * lift).toFixed(
        2
      )}px,0) rotate(${(
        (s.beta[i] ?? 0) -
        sw +
        (s.rz[i] ?? 0)
      ).toFixed(3)}deg) scale(${(1 + 0.08 * pop).toFixed(4)})`;
    const ry = s.ry[i] ?? 0;
    const flip = flips.current[i];
    const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
    if (flip) {
      flip.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ry.toFixed(
        2
      )}deg)`;
      flip.style.setProperty("--shade", ((1 - facing) * 0.45).toFixed(3));
      const phi = ((((ry + 90) % 180) + 180) % 180) - 90;
      flip.style.setProperty("--gx", `${(phi * 0.9).toFixed(1)}%`);
    }
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(${(
        g.W * 0.045 +
        lift * 3 * g.u
      ).toFixed(2)}px,${(g.H * 0.03 + lift * 7 * g.u).toFixed(
        2
      )}px,0) scale(${(
        Math.max(0.12, facing) *
        (1 + 0.03 * lift + 0.05 * pop)
      ).toFixed(3)},${(1 + 0.03 * lift + 0.05 * pop).toFixed(3)})`;
      shadow.style.opacity = (0.72 + 0.28 * lift).toFixed(3);
    }
    const layer = linkLayers.current[i];
    const on =
      !!layer &&
      Math.abs(ry - 180) < (layer.style.visibility === "visible" ? 24 : 9);
    if (layer) {
      layer.style.opacity = on ? "1" : "0";
      layer.style.visibility = on ? "visible" : "hidden";
    }
    flip?.style.setProperty("--drawn", on ? "0" : "1");
  }, []);

  const step = React.useCallback(
    (now: number) => {
      const s = sim.current;
      const L = live.current;
      const n = L.count;
      const g = L.geo;
      const { width, carousel } = L.size;
      const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
      s.last = now;
      const sub = Math.max(3, Math.ceil(dt / 0.006));
      const h = dt / sub;
      let busy = false;
      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < n; i++) {
          const before = s.vx[i] ?? 0;
          if (i !== s.drag) {
            const restoring = now > s.free;
            const ax = restoring
              ? -130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) -
                2 * Math.sqrt(130) * 0.86 * before
              : -3.2 * before;
            s.vx[i] = before + ax * h;
            s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
          }
        }
        if (!carousel && n > 0) {
          const [left, right] = stops(s, g.W, width, n);
          if (s.drag >= 0) {
            const d = s.drag;
            for (let j = d - 1; j >= 0; j--) {
              const limit = (s.x[j + 1] ?? 0) - minGap(s, g.W, j, j + 1);
              if ((s.x[j] ?? 0) > limit) {
                s.x[j] = limit;
                s.vx[j] = Math.min(s.vx[j] ?? 0, s.vx[j + 1] ?? 0);
              }
            }
            for (let j = d + 1; j < n; j++) {
              const limit = (s.x[j - 1] ?? 0) + minGap(s, g.W, j - 1, j);
              if ((s.x[j] ?? 0) < limit) {
                s.x[j] = limit;
                s.vx[j] = Math.max(s.vx[j] ?? 0, s.vx[j - 1] ?? 0);
              }
            }
          } else {
            for (let pass = 0; pass < 3; pass++) {
              for (let j = 0; j < n - 1; j++) {
                const a = s.x[j] ?? 0;
                const b = s.x[j + 1] ?? 0;
                const overlap = minGap(s, g.W, j, j + 1) - (b - a);
                if (overlap <= 0) continue;
                s.x[j] = a - overlap / 2;
                s.x[j + 1] = b + overlap / 2;
                const va = s.vx[j] ?? 0;
                const vb = s.vx[j + 1] ?? 0;
                if (va > vb) {
                  const shared = (va + vb) / 2;
                  s.vx[j] = shared;
                  s.vx[j + 1] = shared;
                }
              }
            }
            if ((s.x[0] ?? 0) < left) {
              s.x[0] = left;
              s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3;
            }
            for (let j = 1; j < n; j++)
              s.x[j] = Math.max(
                s.x[j] ?? 0,
                (s.x[j - 1] ?? 0) + minGap(s, g.W, j - 1, j)
              );
            if ((s.x[n - 1] ?? 0) > right) {
              s.x[n - 1] = right;
              s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3;
            }
            for (let j = n - 2; j >= 0; j--)
              s.x[j] = Math.min(
                s.x[j] ?? 0,
                (s.x[j + 1] ?? 0) - minGap(s, g.W, j, j + 1)
              );
          }
        }
        for (let i = 0; i < n; i++) {
          const dv = (s.vx[i] ?? 0) - (s.px[i] ?? 0);
          s.px[i] = s.vx[i] ?? 0;
          if (i !== s.pull) {
            const sw = s.sw[i] ?? 0;
            const vsw = clamp(
              (s.vsw[i] ?? 0) + (g.couple[i] ?? 0.07) * clamp(dv, -900, 900),
              -90,
              90
            );
            const next =
              vsw + (-(g.swingK[i] ?? SWING_K) * sw - SWING_DAMP * vsw) * h;
            s.vsw[i] = next;
            s.sw[i] = clamp(sw + next * h, -18, 18);
          }
          s.beta[i] =
            (s.beta[i] ?? 0) +
            ((s.sw[i] ?? 0) - (s.beta[i] ?? 0)) * Math.min(1, h / LAG);
          spring(s.ry, s.vry, s.tr[i] ?? 0, i, 170, 0.62, h);
          spring(s.rz, s.vrz, s.tz[i] ?? 0, i, 120, 0.8, h);
          spring(s.lift, s.vlift, s.tl[i] ?? 0, i, 200, 0.75, h);
          spring(s.pop, s.vpop, s.tp[i] ?? 0, i, 160, 0.55, h);
          if (i !== s.pull) {
            spring(s.st, s.vst, 0, i, REEL_K, REEL_ZETA, h);
            s.st[i] = Math.max(-g.cordRest * 0.85, s.st[i] ?? 0);
          }
        }
        for (let a = 0; a < n - 1; a++) {
          const b = a + 1;
          if ((s.x[b] ?? 0) <= (s.x[a] ?? 0)) continue;
          const [aTop, aBottom, aArmTop, aArmBottom] = cardEdge(s, g, a, 1);
          const [bTop, bBottom, bArmTop, bArmBottom] = cardEdge(s, g, b, -1);
          const topExcess = aTop - bTop + 2;
          const bottomExcess = aBottom - bBottom + 2;
          const excess = Math.max(topExcess, bottomExcess);
          if (excess <= 0) continue;
          const arm = Math.max(
            40,
            topExcess > bottomExcess
              ? (aArmTop + bArmTop) / 2
              : (aArmBottom + bArmBottom) / 2
          );
          const push = (Math.asin(clamp(excess / arm, 0, 1)) * 180) / Math.PI;
          const share = a === s.pull ? 0 : b === s.pull ? 1 : 0.5;
          s.sw[a] = clamp((s.sw[a] ?? 0) + push * share, -18, 18);
          s.beta[a] = (s.beta[a] ?? 0) + push * share;
          s.sw[b] = clamp((s.sw[b] ?? 0) - push * (1 - share), -18, 18);
          s.beta[b] = (s.beta[b] ?? 0) - push * (1 - share);
          const va = s.vsw[a] ?? 0;
          const vb = s.vsw[b] ?? 0;
          if (vb - va > 0) {
            const mean = (va + vb) / 2;
            if (a !== s.pull) s.vsw[a] = mean + (vb - va) * 0.15;
            if (b !== s.pull) s.vsw[b] = mean - (vb - va) * 0.15;
          }
        }
      }
      for (let i = 0; i < n; i++) {
        paint(i);
        if (
          Math.abs(s.vx[i] ?? 0) > 0.4 ||
          (now > s.free && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) ||
          Math.abs((s.ry[i] ?? 0) - (s.tr[i] ?? 0)) > 0.05 ||
          Math.abs(s.vry[i] ?? 0) > 0.05 ||
          Math.abs((s.rz[i] ?? 0) - (s.tz[i] ?? 0)) > 0.02 ||
          Math.abs(s.vrz[i] ?? 0) > 0.05 ||
          Math.abs((s.lift[i] ?? 0) - (s.tl[i] ?? 0)) > 0.002 ||
          Math.abs(s.vlift[i] ?? 0) > 0.01 ||
          Math.abs((s.pop[i] ?? 0) - (s.tp[i] ?? 0)) > 0.002 ||
          Math.abs(s.vpop[i] ?? 0) > 0.01 ||
          Math.abs(s.sw[i] ?? 0) > 0.02 ||
          Math.abs(s.vsw[i] ?? 0) > 0.05 ||
          Math.abs((s.beta[i] ?? 0) - (s.sw[i] ?? 0)) > 0.01 ||
          Math.abs(s.st[i] ?? 0) > 0.05 ||
          Math.abs(s.vst[i] ?? 0) > 0.1
        )
          busy = true;
      }
      if (s.drag >= 0 || s.pull >= 0 || now < s.free) busy = true;
      if (busy) s.raf = requestAnimationFrame(step);
      else {
        s.raf = 0;
        s.last = 0;
        for (let i = 0; i < n; i++) {
          if (now > s.free) {
            s.x[i] = s.tx[i] ?? 0;
            s.vx[i] = 0;
            s.px[i] = 0;
          }
          s.sw[i] = 0;
          s.vsw[i] = 0;
          s.beta[i] = 0;
          s.st[i] = 0;
          s.vst[i] = 0;
          s.ry[i] = s.tr[i] ?? 0;
          s.vry[i] = 0;
          s.rz[i] = s.tz[i] ?? 0;
          s.vrz[i] = 0;
          s.lift[i] = s.tl[i] ?? 0;
          s.vlift[i] = 0;
          s.pop[i] = s.tp[i] ?? 0;
          s.vpop[i] = 0;
          paint(i);
        }
      }
    },
    [paint]
  );

  const snap = React.useCallback(() => {
    const s = sim.current;
    for (let i = 0; i < live.current.count; i++) {
      s.x[i] = s.tx[i] ?? 0;
      s.vx[i] = 0;
      s.px[i] = 0;
      s.sw[i] = 0;
      s.vsw[i] = 0;
      s.beta[i] = 0;
      if (i !== s.pull) {
        s.st[i] = 0;
        s.vst[i] = 0;
      }
      s.ry[i] = s.tr[i] ?? 0;
      s.vry[i] = 0;
      s.rz[i] = s.tz[i] ?? 0;
      s.vrz[i] = 0;
      s.lift[i] = s.tl[i] ?? 0;
      s.vlift[i] = 0;
      s.pop[i] = s.tp[i] ?? 0;
      s.vpop[i] = 0;
      paint(i);
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      snap();
      return;
    }
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  }, [snap, step]);

  const impulse = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current;
      if (live.current.reduced || i < 0 || i >= live.current.count) return;
      s.vsw[i] = (s.vsw[i] ?? 0) + amount;
      kick();
    },
    [kick]
  );

  const tug = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current;
      if (live.current.reduced || i < 0 || i >= live.current.count) return;
      s.vst[i] = (s.vst[i] ?? 0) + amount;
      kick();
    },
    [kick]
  );

  React.useLayoutEffect(() => {
    if (!size.width) return;
    const s = sim.current;
    const L = live.current;
    const center = size.carousel ? active ?? L.carouselIndex : null;
    const { xs, total } = layoutTargets(
      size.width,
      size.W,
      size.carousel,
      center,
      count
    );
    L.cyclic = total > 0;
    const fresh = s.x.length !== count || s.carousel !== size.carousel;
    s.carousel = size.carousel;
    for (let i = 0; i < count; i++) {
      const tx = (xs[i] ?? 0) + (size.carousel ? pointer.current.swipe : 0);
      if (!fresh && total > 0) {
        const shift = Math.round((tx - (s.tx[i] ?? tx)) / total) * total;
        if (shift) s.x[i] = (s.x[i] ?? 0) + shift;
      }
      s.tx[i] = tx;
      const front = flipped === i || active === i;
      s.tr[i] =
        flipped === i ? 180 : active === i ? 0 : REST_Y[i % REST_Y.length] ?? 0;
      s.tz[i] = front ? 0 : REST_Z[i % REST_Z.length] ?? 0;
      s.tl[i] = front ? 1 : 0;
      s.tp[i] = flipped === i ? 1 : 0;
      if (fresh) {
        s.x[i] = tx;
        s.vx[i] = 0;
        s.px[i] = 0;
        s.sw[i] = 0;
        s.vsw[i] = 0;
        s.beta[i] = 0;
        s.st[i] = 0;
        s.vst[i] = 0;
        s.ry[i] = s.tr[i] ?? 0;
        s.vry[i] = 0;
        s.rz[i] = s.tz[i] ?? 0;
        s.vrz[i] = 0;
        s.lift[i] = s.tl[i] ?? 0;
        s.vlift[i] = 0;
        s.pop[i] = s.tp[i] ?? 0;
        s.vpop[i] = 0;
      }
    }
    for (const key of [
      "x",
      "vx",
      "px",
      "tx",
      "sw",
      "vsw",
      "beta",
      "ry",
      "vry",
      "tr",
      "rz",
      "vrz",
      "tz",
      "lift",
      "vlift",
      "tl",
      "pop",
      "vpop",
      "tp",
      "st",
      "vst",
    ] as const)
      s[key].length = count;
    if (fresh) for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [size, active, flipped, count, paint, kick]);

  React.useEffect(() => {
    if (reduced) kick();
  }, [reduced, kick]);

  const swayed = React.useRef(false);
  const ready = size.width > 0;
  React.useEffect(() => {
    if (!ready || reduced || swayed.current) return;
    const timers = Array.from({ length: count }, (_, i) =>
      window.setTimeout(
        () => impulse(i, (i % 2 ? -1 : 1) * (30 - (i % 4) * 3)),
        60 + i * 70
      )
    );
    const done = window.setTimeout(() => {
      swayed.current = true;
    }, 80 + count * 70);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(done);
    };
  }, [ready, reduced, count, impulse]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(sim.current.raf);
      sim.current.raf = 0;
    },
    []
  );

  const previous = React.useRef({
    active: null as number | null,
    flipped: null as number | null,
  });
  React.useEffect(() => {
    const old = previous.current;
    const wrap = (i: number) =>
      live.current.cyclic ? ((i % count) + count) % count : i;
    if (old.active !== active) {
      if (active !== null) {
        impulse(wrap(active - 1), 16);
        impulse(wrap(active + 1), -16);
      }
      if (old.active !== null) {
        impulse(wrap(old.active - 1), -6);
        impulse(wrap(old.active + 1), 6);
      }
    }
    if (old.flipped !== flipped) {
      if (flipped !== null) {
        impulse(flipped, flipped % 2 ? 9 : -9);
        tug(flipped, 70);
      }
      if (old.flipped !== null) tug(old.flipped, 40);
    }
    previous.current = { active, flipped };
  }, [active, flipped, count, impulse, tug]);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || count === 0 || !ready) return;
    let timer = 0;
    function front(index: number) {
      setActive(index);
      timer = window.setTimeout(() => flip(index), FLIP_DELAY);
    }
    function flip(index: number) {
      setFlipped(index);
      timer = window.setTimeout(() => {
        setFlipped(null);
        front((index + 1) % Math.max(1, live.current.count));
      }, interval);
    }
    const current = live.current.active;
    timer =
      current === null
        ? window.setTimeout(() => front(0), FIRST_DELAY)
        : window.setTimeout(() => flip(current), FLIP_DELAY);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, count, ready, interval, setActive, setFlipped]);

  React.useEffect(() => {
    if (flipped === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const stage = stageRef.current;
      if (stage && event.target instanceof Node && stage.contains(event.target))
        return;
      setFlipped(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flipped, setFlipped]);

  const toggle = React.useCallback(
    (index: number) => {
      stop();
      const next = live.current.flipped === index ? null : index;
      if (next !== null) setActive(index);
      setFlipped(next);
    },
    [stop, setActive, setFlipped]
  );

  const retarget = () => {
    const s = sim.current;
    const L = live.current;
    const { xs } = layoutTargets(
      L.size.width,
      L.size.W,
      L.size.carousel,
      L.size.carousel ? L.active ?? L.carouselIndex : null,
      L.count
    );
    for (let i = 0; i < L.count; i++)
      s.tx[i] = (xs[i] ?? 0) + (L.size.carousel ? pointer.current.swipe : 0);
    if (L.reduced) snap();
    else kick();
  };

  const feasible = (d: number) => {
    const s = sim.current;
    const L = live.current;
    const W = L.geo.W;
    const n = L.count;
    let [lo, hi] = stops(s, W, L.size.width, n);
    for (let k = 0; k < d; k++) lo += minGap(s, W, k, k + 1);
    for (let k = n - 1; k > d; k--) hi -= minGap(s, W, k - 1, k);
    return [lo, Math.max(lo, hi)] as const;
  };

  const nearest = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const g = live.current.geo;
    const s = sim.current;
    if (y < g.railY - 12) return null;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      if (y > (g.cardTops[i] ?? 0) + g.H + Math.max(0, s.st[i] ?? 0) + 8)
        continue;
      const d = Math.abs(x - (s.x[i] ?? 0));
      if (d < g.W / 2 + 6 && d < distance) {
        best = i;
        distance = d;
      }
    }
    return best;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    const now = performance.now();
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      const dy = event.clientY - p.y;
      if (!p.mode && Math.hypot(dx, dy) > 8) {
        if (Math.abs(dy) > Math.abs(dx))
          p.mode = dy > 0 && p.index >= 0 ? "pull" : "none";
        else
          p.mode = L.size.carousel
            ? "swipe"
            : p.index >= 0 && !L.reduced
              ? "drag"
              : "none";
        if (p.mode !== "none") {
          stop();
          if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        }
        if (p.mode === "pull") s.pull = p.index;
        if (p.mode === "drag") {
          s.drag = p.index;
          s.grab =
            event.clientX -
            stage.getBoundingClientRect().left -
            (s.x[p.index] ?? 0);
        }
      }
      const elapsed = Math.max(1, now - p.lastT);
      p.v = p.v * 0.6 + ((event.clientX - p.lastX) / elapsed) * 0.4;
      p.lastX = event.clientX;
      p.lastY = event.clientY;
      p.lastT = now;
      if (p.mode === "pull") {
        const i = p.index;
        s.st[i] = soft(Math.max(0, dy), L.geo.maxStretch);
        s.vst[i] = 0;
        const angle = clamp(
          (-Math.atan2(dx, (L.geo.pendulum[i] ?? 200) + (s.st[i] ?? 0)) * 180) /
            Math.PI,
          -16,
          16
        );
        s.vsw[i] = ((angle - (s.sw[i] ?? 0)) / elapsed) * 1000 * 0.5;
        s.sw[i] = angle;
        if (L.reduced) paint(i);
        else kick();
      } else if (p.mode === "drag" && s.drag >= 0) {
        const [lo, hi] = feasible(s.drag);
        s.x[s.drag] = clamp(
          event.clientX - stage.getBoundingClientRect().left - s.grab,
          lo,
          hi
        );
        s.vx[s.drag] = p.v * 1000;
        s.free = now + 900;
        kick();
      } else if (p.mode === "swipe") {
        p.swipe = dx;
        retarget();
      }
      return;
    }
    if (event.pointerType !== "mouse" || p.id >= 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const hoverV =
      (event.clientX - p.hoverX) / Math.max(1, now - p.hoverT);
    p.hoverX = event.clientX;
    p.hoverT = now;
    if (L.size.carousel) {
      const center = L.active ?? L.carouselIndex;
      if (hit !== null && hit === center && L.active !== hit) {
        stop();
        setActive(hit);
      }
      return;
    }
    if (hit !== null && hit !== p.hoverHit)
      impulse(hit, clamp(-hoverV * 22, -24, 24));
    p.hoverHit = hit ?? -1;
    if (hit !== null && hit !== L.active) {
      stop();
      setActive(hit);
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = {
      ...pointer.current,
      id: event.pointerId,
      index: hit ?? -1,
      x: event.clientX,
      y: event.clientY,
      mode: "",
      kind: event.pointerType,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: now,
      v: 0,
      swipe: 0,
    };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId))
      stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (p.mode === "pull") {
      const i = s.pull;
      s.pull = -1;
      if (L.reduced) {
        s.st[i] = 0;
        s.vst[i] = 0;
        s.sw[i] = 0;
        s.vsw[i] = 0;
        s.beta[i] = 0;
        paint(i);
      } else kick();
      return;
    }
    if (p.mode === "drag") {
      s.drag = -1;
      s.free = performance.now() + 700;
      kick();
      return;
    }
    if (p.mode === "swipe") {
      const dx = event.clientX - p.x;
      const n = L.count;
      const current = L.active ?? L.carouselIndex;
      const by =
        Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      const next = L.cyclic
        ? (((current + by) % n) + n) % n
        : clamp(current + by, 0, n - 1);
      if (next === L.active) retarget();
      else setActive(next);
      return;
    }
    if (cancelled || p.mode || p.index < 0) return;
    stop();
    if (
      (p.kind !== "mouse" || L.size.carousel) &&
      L.active !== p.index
    )
      setActive(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const L = live.current;
    if (event.key === "Escape") {
      if (L.flipped !== null) {
        event.preventDefault();
        setFlipped(null);
      }
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    const badge = target?.dataset.badge;
    if (event.key === "ArrowDown") {
      if (badge === undefined) return;
      event.preventDefault();
      stop();
      tug(Number(badge), 300);
      return;
    }
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = L.active ?? focusIndex;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? L.count - 1
          : clamp(
              from + (event.key === "ArrowRight" ? 1 : -1),
              0,
              L.count - 1
            );
    setFocusIndex(next);
    setActive(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  const g = geo;
  const W = g.W;
  const base = W / EM;
  const current = active ?? flipped;
  const person = current === null ? null : items[current] ?? null;
  const showingBack = current !== null && current === flipped;
  const centerIndex = size.carousel
    ? active ?? live.current.carouselIndex
    : null;
  const line1 = person ? `${person.name} — ${person.role}` : caption;
  const line2 = person ? (showingBack ? labels.back : labels.flip) : "";

  return (
    <section
      {...rest}
      data-slot="team-lanyard-rail"
      data-mode={size.carousel ? "carousel" : "rail"}
      data-active={active ?? ""}
      data-flipped={flipped ?? ""}
      className={className}
    >
      <style>{SCOPED_CSS}</style>

      {(eyebrow || heading || mainLogo || qismLogo) && (
        <header className="tlr-header">
          {(mainLogo || qismLogo) && (
            <div className="tlr-logos">
              {mainLogo && (
                <img
                  src={mainLogo}
                  alt="Logo Utama OSMIS"
                  className="tlr-logo-img"
                  draggable={false}
                />
              )}
              {mainLogo && qismLogo && <span className="tlr-logo-sep" />}
              {qismLogo && (
                <img
                  src={qismLogo}
                  alt={heading ?? "Logo Qism"}
                  className="tlr-logo-img"
                  draggable={false}
                />
              )}
            </div>
          )}
          {eyebrow && <p className="tlr-eyebrow">{eyebrow}</p>}
          {heading && <h2 className="tlr-heading">{heading}</h2>}
        </header>
      )}

      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? "Anggota Bagian"}
        aria-roledescription="lanyard rail"
        className="tlr-stage"
        style={{ height: g.height }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerLeave={(event) => {
          pointer.current.hoverHit = -1;
          if (
            event.pointerType === "mouse" &&
            pointer.current.id < 0 &&
            !size.carousel &&
            !document.activeElement?.matches("[data-badge]:focus-visible")
          )
            setActive(null);
        }}
        onKeyDown={onKeyDown}
      >
        {/* Top metallic rail bar */}
        <div
          aria-hidden="true"
          data-rail
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            right: 0,
            top: g.railY - g.railR,
            height: g.railR * 2,
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: g.railR * 2 + 2,
              height: 12,
              borderRadius: 999,
              background: "rgba(0,0,0,0.12)",
              filter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background:
                "linear-gradient(to bottom, color-mix(in oklab, var(--tlr-muted-fg) 35%, white) 0%, white 20%, color-mix(in oklab, var(--tlr-muted-fg) 70%, white) 40%, var(--tlr-muted-fg) 64%, color-mix(in oklab, var(--tlr-muted-fg) 55%, black) 100%)",
              boxShadow:
                "0 1px 0 color-mix(in oklab, var(--tlr-fg) 18%, transparent)",
            }}
          />
          {!size.carousel &&
            [0, 1].map((side) => (
              <div
                key={side}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 28,
                  width: 16,
                  borderRadius: 3,
                  [side ? "right" : "left"]: 6,
                  background:
                    "linear-gradient(to right, color-mix(in oklab, var(--tlr-muted-fg) 60%, white), var(--tlr-muted-fg) 55%, color-mix(in oklab, var(--tlr-muted-fg) 60%, black))",
                  boxShadow:
                    "0 3px 6px color-mix(in oklab, var(--tlr-fg) 18%, transparent)",
                }}
              />
            ))}
        </div>

        {items.map((item, i) => {
          const tone =
            TONES[((item.tone ?? (i % 5) + 1) - 1) % TONES.length] ?? TONES[0];
          const isActive = active === i;
          const isFlipped = flipped === i;
          const strap = g.straps[i] ?? 0;
          const reelTop = g.reelTops[i] ?? 0;
          const clipTop = g.clipTops[i] ?? 0;
          const cardOffset = (g.cardTops[i] ?? 0) - clipTop;
          const links = (item.links ?? []).slice(0, 3);
          return (
            <div
              key={item.id}
              ref={(node) => {
                slots.current[i] = node;
              }}
              data-lanyard={i}
              className={`tlr-slot ${tone}`}
              style={{
                width: W,
                height: g.height,
                zIndex: isFlipped ? 40 : isActive ? 30 : 10 + i,
                transform: `translate3d(${(
                  (sim.current.x[i] ?? 0) -
                  W / 2
                ).toFixed(2)}px,0,0)`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  display: "block",
                  borderRadius: "50%",
                  left: W / 2 - 4.5 * g.u,
                  top: g.railY - g.ring,
                  width: 9 * g.u,
                  height: g.ring * 2,
                  border: `${Math.max(1.6, 2.2 * g.u).toFixed(
                    2
                  )}px solid color-mix(in oklab, var(--tlr-muted-fg) 45%, white)`,
                  boxShadow:
                    "inset 1px 0 0 color-mix(in oklab, black 25%, transparent), 1px 1px 2px color-mix(in oklab, black 20%, transparent)",
                }}
              />
              <span
                ref={(node) => {
                  swings.current[i] = node;
                }}
                data-swing
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  transformOrigin: `${W / 2}px ${g.pivotY}px`,
                }}
              >
                <span
                  ref={(node) => {
                    straps.current[i] = node;
                  }}
                  data-strap
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "block",
                    ["--stretch" as string]: "0px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      display: "block",
                      background: "rgba(0,0,0,0.2)",
                      filter: "blur(2px)",
                      left: W / 2 - g.strapW / 2 + 3 * g.u,
                      top: g.pivotY + 3,
                      width: g.strapW,
                      height: strap,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      display: "block",
                      left: W / 2 - g.strapW / 2,
                      top: g.pivotY - 2,
                      width: g.strapW,
                      height: strap + 2,
                      background: [
                        "repeating-linear-gradient(135deg, color-mix(in oklab, white 16%, transparent) 0 1px, transparent 1px 3px)",
                        "repeating-linear-gradient(45deg, color-mix(in oklab, black 13%, transparent) 0 1px, transparent 1px 3px)",
                        "linear-gradient(90deg, color-mix(in oklab, currentColor 68%, black) 0%, currentColor 16%, color-mix(in oklab, currentColor 86%, white) 48%, currentColor 80%, color-mix(in oklab, currentColor 66%, black) 100%)",
                      ].join(","),
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 1.5,
                        right: 1.5,
                        display: "block",
                        borderLeft: "1px dashed rgba(255,255,255,0.35)",
                        borderRight: "1px dashed rgba(255,255,255,0.35)",
                      }}
                    />
                  </span>
                  <svg
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      overflow: "visible",
                      left: W / 2 - g.strapW * 0.75,
                      top: g.pivotY - 4 * g.u,
                      width: g.strapW * 1.5,
                      height: 8 * g.u,
                    }}
                    viewBox="0 0 30 16"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="26"
                      height="10"
                      rx="5"
                      fill="none"
                      stroke="color-mix(in oklab, var(--tlr-muted-fg) 40%, white)"
                      strokeWidth="3"
                    />
                    <path
                      d="M7 4.5 H23"
                      stroke="white"
                      strokeOpacity="0.6"
                      strokeWidth="1"
                    />
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      display: "block",
                      borderRadius: 2,
                      left: W / 2 - g.strapW / 2 - 1.5,
                      top: g.pivotY + strap - g.crimp * 0.4,
                      width: g.strapW + 3,
                      height: g.crimp,
                      background: METAL,
                      boxShadow: "0 1px 1.5px rgba(0,0,0,0.3)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      display: "block",
                      borderRadius: "50%",
                      left: W / 2 - g.reel / 2,
                      top: reelTop,
                      width: g.reel,
                      height: g.reel,
                      background:
                        "radial-gradient(circle at 34% 30%, color-mix(in oklab, var(--tlr-fg) 48%, var(--tlr-bg)) 0%, var(--tlr-fg) 58%, color-mix(in oklab, var(--tlr-fg) 82%, var(--tlr-bg)) 100%)",
                      boxShadow:
                        "inset 0 -1px 2px rgba(0,0,0,0.4), 0 2px 3px rgba(0,0,0,0.28)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: "14%",
                        display: "block",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        display: "block",
                        width: "32%",
                        height: "32%",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "50%",
                        background: METAL,
                      }}
                    />
                  </span>
                  <span
                    ref={(node) => {
                      cords.current[i] = node;
                    }}
                    style={{
                      position: "absolute",
                      display: "block",
                      width: 1.5,
                      background: "var(--tlr-fg)",
                      opacity: 0.6,
                      left: W / 2 - 0.75,
                      top: reelTop + g.reel * 0.82,
                      height: g.cordRest,
                      transformOrigin: "50% 0",
                    }}
                  />
                </span>

                <span
                  ref={(node) => {
                    hangs.current[i] = node;
                  }}
                  data-hang
                  style={{
                    position: "absolute",
                    left: 0,
                    display: "block",
                    top: clipTop,
                    width: W,
                    height: cardOffset + g.H,
                    transformOrigin: `${W / 2}px 0px`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      display: "block",
                      top: cardOffset,
                      width: W,
                      height: g.H,
                      filter: `blur(${Math.max(4, 8 * g.u).toFixed(1)}px)`,
                    }}
                  >
                    <span
                      ref={(node) => {
                        shadows.current[i] = node;
                      }}
                      data-shadow
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "block",
                        borderRadius: 10,
                        background: "rgba(0,0,0,0.3)",
                      }}
                    />
                  </span>

                  <button
                    ref={(node) => {
                      buttons.current[i] = node;
                    }}
                    type="button"
                    data-badge={i}
                    data-flipped={isFlipped ? "true" : "false"}
                    data-active={isActive || undefined}
                    tabIndex={i === (active ?? focusIndex) ? 0 : -1}
                    aria-label={`${item.name}, ${item.role}`}
                    aria-describedby={`${uid}-caption`}
                    aria-pressed={isFlipped}
                    className="tlr-badge-btn"
                    style={{
                      top: cardOffset,
                      width: W,
                      height: g.H,
                      fontSize: base,
                    }}
                    onFocus={() => {
                      setFocusIndex(i);
                      if (pointer.current.id < 0) {
                        stop();
                        setActive(i);
                      }
                    }}
                    onClick={(event) => {
                      const pending = pendingOpen.current;
                      pendingOpen.current = -1;
                      if (event.detail === 0 || pending === i) toggle(i);
                    }}
                  >
                    <span
                      ref={(node) => {
                        flips.current[i] = node;
                      }}
                      data-flip
                      className="tlr-flip"
                      style={{
                        transform: `perspective(${PERSPECTIVE}px) rotateY(${
                          REST_Y[i % REST_Y.length] ?? 0
                        }deg)`,
                      }}
                    >
                      <BadgeFaces
                        item={item}
                        tone={tone}
                        defaultMainLogo={mainLogo}
                        defaultQismLogo={qismLogo}
                      />
                    </span>
                  </button>

                  <span
                    aria-hidden="true"
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      display: "block",
                      left: W / 2 - g.clipW / 2,
                      top: 0,
                      width: g.clipW,
                      height: g.clipH + 10 * g.u,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        display: "block",
                        transform: "translateX(-50%)",
                        borderRadius: "0 0 2px 2px",
                        top: g.clipH * 0.7,
                        width: g.clipW * 0.42,
                        height:
                          cardOffset -
                          g.clipH * 0.7 +
                          0.72 * base +
                          0.3 * base,
                        background: PLASTIC,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        display: "block",
                        height: g.clipH,
                        clipPath:
                          "polygon(24% 0, 76% 0, 100% 72%, 94% 100%, 6% 100%, 0 72%)",
                        background: PLASTIC,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        display: "block",
                        background: "rgba(255,255,255,0.5)",
                        left: "30%",
                        right: "30%",
                        top: 1,
                        height: 1,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        display: "block",
                        transform: "translateX(-50%)",
                        borderRadius: "50%",
                        background: "var(--tlr-bg)",
                        top: g.clipH * 0.14,
                        width: g.clipH * 0.34,
                        height: g.clipH * 0.34,
                        boxShadow: "inset 0 1px 1px rgba(0,0,0,0.45)",
                      }}
                    />
                  </span>

                  {isFlipped && links.length > 0 && (
                    <div
                      ref={(node) => {
                        linkLayers.current[i] = node;
                      }}
                      data-links
                      style={{
                        pointerEvents: "none",
                        position: "absolute",
                        left: 0,
                        top: cardOffset,
                        width: W,
                        height: g.H,
                        fontSize: base,
                        opacity: 0,
                        visibility: "hidden",
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0.75em",
                          left: "0.65em",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "0.18em",
                        }}
                      >
                        {links.map((link) => (
                          <button
                            key={link.label}
                            type="button"
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              stop();
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              link.onClick?.();
                            }}
                            onFocus={stop}
                            className="tlr-link-btn"
                            style={{ pointerEvents: "auto" }}
                          >
                            <LinkIcon label={link.label} />
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {size.carousel && count > 1 && (
        <div className="tlr-dots" role="group" aria-label={labels.show}>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${labels.show} ${item.name}`}
              aria-current={centerIndex === i}
              onClick={() => {
                stop();
                setActive(i);
              }}
              className="tlr-dot"
            />
          ))}
        </div>
      )}

      <div className="tlr-footer">
        <div
          id={`${uid}-caption`}
          aria-live="polite"
          style={{ minHeight: "2.4rem" }}
        >
          <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
            {line1}
          </p>
          {line2 && (
            <p
              style={{
                margin: "0.2rem 0 0",
                fontSize: "0.8rem",
                color: "var(--tlr-muted-fg)",
              }}
            >
              {line2}
            </p>
          )}
        </div>
        {action}
      </div>
    </section>
  );
}

export default TeamLanyardRail;
