"use client"

import * as React from "react"

/* ------------------------------------------------------------------------------------------------
 * DotTiles by Louis Studios
 * A grid of black glass metric tiles with dot-matrix numerals. Digits count up dot by dot,
 * bottom visuals draw in, slider markers ease into place and live values can drift a little.
 * Self-contained: React only, no assets. Every size is relative to the tile width, so a tile
 * looks the same at 160 px or 400 px.
 * ---------------------------------------------------------------------------------------------- */

/** Built-in icon names. Pass any React node instead if you need your own glyph. */
export type DotTileIconName = "heart" | "moon" | "clock" | "pulse" | "bolt" | "battery" | "spark" | "drop" | "flame"

/** The small visual at the bottom of a tile. Every position is a fraction from 0 (left) to 1 (right). */
export type DotTileVisual =
  | {
      /** A row of fine ticks with a white marker block, for a value between two named ends. */
      type: "slider"
      /** Marker position, 0 to 1. Changes ease to the new position. */
      value: number
      /** "glow" lights the ticks around the marker, "fill" lights every tick left of it. Defaults to "glow". */
      mode?: "glow" | "fill"
      /** Number of ticks. Defaults to 44. */
      ticks?: number
      /** Grey captions under the left and right ends. */
      labels?: [string, string]
    }
  | {
      /** A stepped histogram, bottom aligned, like a night of sleep stages. */
      type: "steps"
      /** Bar heights from 0 to 1, drawn as equal-width steps from `from` to `to`. */
      data: number[]
      /** Where the steps start on the axis, 0 to 1. Defaults to 0. */
      from?: number
      /** Where the steps end on the axis, 0 to 1. Defaults to 1. */
      to?: number
      /** Number of faint hour lines behind the chart. Defaults to 15. */
      slots?: number
      /** Grey captions under the left and right ends, for example ["9 PM", "9 AM"]. */
      labels?: [string, string]
    }
  | {
      /** A dotted timeline: one dot per slot, sized by value. `null` leaves a faint hour line. */
      type: "dots"
      /** Dot sizes from 0 (pin point) to 1 (the large dot). */
      data: (number | null)[]
      /** Number of slots across the axis. Defaults to 15. */
      slots?: number
      /** Grey captions under the left and right ends, for example ["01 AM", "01 PM"]. */
      labels?: [string, string]
    }
  | {
      /** Sparse solid blocks, for sessions on a timeline. */
      type: "blocks"
      /** Each block as [start, end], 0 to 1. */
      data: [number, number][]
      /** Number of faint hour lines behind the blocks. Defaults to 15. */
      slots?: number
      /** Grey captions under the left and right ends. */
      labels?: [string, string]
    }
  | {
      /** A bar that rises in four steps up to `value`, like charge or progress through the day. */
      type: "rise"
      /** Where the bar ends, 0 to 1. */
      value: number
      /** Number of faint hour lines behind the bar. Defaults to 15. */
      slots?: number
      /** Grey captions under the left and right ends. */
      labels?: [string, string]
    }

/** One metric tile. */
export interface DotTileData {
  /** Large white title in the top left, for example "Heart Rate". Long titles shrink to fit one line. */
  title: string
  /** Small grey line under the title, for example "resting". */
  subtitle?: string
  /**
   * The big dot-matrix value. Digits, ":" and "." are drawn as dots, for example 61, "7:45" or "2.4".
   * Numbers and h:mm times count up on mount.
   */
  value: string | number
  /** Small unit at the right of the value, for example "bpm" or "%". */
  unit?: string
  /** Draw an icon in the unit slot instead of text, for example "clock". */
  unitIcon?: DotTileIconName | React.ReactNode
  /** Icon at the right of the value. A built-in name or your own node (draw it at 24 x 24 with currentColor). */
  icon?: DotTileIconName | React.ReactNode
  /** The bottom visual. Leave it out for a tile with only text and value. */
  visual?: DotTileVisual
  /** Live drift: every few seconds the value moves by up to this many units and settles back. 0 turns it off. */
  jitter?: number
  /** Optional badge on top right, e.g. "🔥 HOT". */
  badge?: string
  /** Optional navigation href when clicking the tile. */
  href?: string
  /** Optional click handler when clicking the tile. */
  onClick?: () => void
  /** Stable key for React lists. Defaults to the title. */
  id?: string
}

export interface DotTileProps extends DotTileData {
  /** Colour of the dots, title, icons and visuals. Grey text is mixed from it. Defaults to "#ffffff". */
  dotColor?: string
  /** Base colour of the tile. Its edges stay a little translucent so the backdrop glows through. Defaults to "#000000". */
  tileColor?: string
  /** Count up, draw in and drift. Set false for a static tile. Reduced motion settings always win. Defaults to true. */
  animate?: boolean
  /** Milliseconds before this tile starts its intro. Defaults to 0. */
  delay?: number
  /** Replay the count and draw-in every this many milliseconds (at least 4000), for kiosks and hero loops. Off by default. */
  replayEvery?: number
  /** Position in a grid. Seeds the drift timing so neighbouring tiles never tick together. Defaults to 0. */
  index?: number
  /** Class on the tile element. */
  className?: string
  /** Inline style on the tile element. Set a width here when you use a tile on its own. */
  style?: React.CSSProperties
}

export interface DotTilesProps {
  /** The tiles, in reading order. Defaults to six Louis Studios sample tiles. */
  tiles?: DotTileData[]
  /** Tiles per row. Defaults to 3. */
  columns?: number
  /** Colour of the dots, titles, icons and visuals in every tile. Defaults to "#ffffff". */
  dotColor?: string
  /** Base colour of every tile. Defaults to "#000000". */
  tileColor?: string
  /** Count up, draw in and drift. Set false for static tiles. Reduced motion settings always win. Defaults to true. */
  animate?: boolean
  /** Milliseconds between tile intros, so the grid ripples in. Defaults to 90. */
  stagger?: number
  /** Replay the count and draw-in every this many milliseconds (at least 4000). Off by default. */
  replayEvery?: number
  /** Class on the grid wrapper. */
  className?: string
  /** Inline style on the grid wrapper. Its width sets the tile size. */
  style?: React.CSSProperties
}

/* ------------------------------------------------------------------------------------------------
 * Sample tiles (our copy). The Louis Studios tile leads the grid.
 * ---------------------------------------------------------------------------------------------- */

export const DOT_TILES_SAMPLE: DotTileData[] = [
  {
    title: "Louis Studios",
    subtitle: "in flow",
    value: 15,
    icon: "spark",
    unit: "hrs",
    visual: { type: "slider", value: 0.71, mode: "glow", labels: ["scattered", "focused"] },
  },
  {
    title: "Rest",
    subtitle: "slept deep",
    value: "7:20",
    icon: "moon",
    unitIcon: "clock",
    visual: {
      type: "steps",
      from: 0.12,
      to: 0.82,
      data: [0.3, 0.3, 0.3, 0.3, 0.6, 0.6, 0.6, 1, 1, 1, 1, 1, 0.7, 0.7, 0.3, 0.7, 0.7, 0.7, 1, 1, 1, 1, 1, 0.6, 0.6, 0.6, 0.6, 0.6, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.7, 0.7, 0.7, 0.3, 0.5, 0.5, 0.5, 0.25],
      labels: ["10 PM", "10 AM"],
    },
  },
  {
    title: "Tension",
    subtitle: "easy going",
    value: 18,
    icon: "pulse",
    unit: "%",
    visual: { type: "dots", data: [0.1, 0.25, 0.4, 0.2, 0.6, 1, 0.3, 0.15, 0.25], labels: ["06 AM", "06 PM"] },
  },
  {
    title: "Pulse",
    subtitle: "at ease",
    value: 58,
    icon: "heart",
    unit: "bpm",
    jitter: 1,
    visual: { type: "slider", value: 0.32, mode: "fill", labels: ["calm", "racing"] },
  },
  {
    title: "Movement",
    subtitle: "on the move",
    value: 46,
    icon: "bolt",
    unit: "min",
    visual: { type: "blocks", data: [[0.18, 0.23], [0.43, 0.5], [0.55, 0.6], [0.7, 0.72]], labels: ["06 AM", "06 PM"] },
  },
  {
    title: "Charge",
    subtitle: "nearly full",
    value: 92,
    icon: "battery",
    unit: "%",
    jitter: 1,
    visual: { type: "rise", value: 0.6, labels: ["06 AM", "06 PM"] },
  },
]

/* ------------------------------------------------------------------------------------------------
 * Geometry. Everything is laid out in "tile units": a tile is 206 units wide and 204 tall, and
 * one unit is 100cqw / 206 of the tile's own width.
 * ---------------------------------------------------------------------------------------------- */

const TW = 206
const TH = 214
const GAP = 6 // between tiles
const PAD = 18.5 // left and right text inset
const TRACK_X0 = 18.5
const TRACK_X1 = 187.5
const VIS_Y = 171 // centre line of the bottom visuals
const PITCH = 7.1 // dot pitch
const DOT_R = 2.98 // dot radius
const VAL_X = 22 // centre of the first dot column
const VAL_Y = 97.5 // centre of the first dot row (gives room for 2-line subtitle above)
const VAL_MAX_W = 136 // widest value before the matrix scales down

const u = (n: number) => `calc(${+(n / TW).toFixed(5)} * 100cqw)`

/* ------------------------------------------------------------------------------------------------
 * Dot font: 7 rows, 5 columns for most digits. Measured from the reference style.
 * ---------------------------------------------------------------------------------------------- */

const GLYPHS: Record<string, string[]> = {
  "0": [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  "1": ["..X..", ".XX..", "X.X..", "..X..", "..X..", "..X..", "XXXXX"],
  "2": [".XXX.", "X...X", "....X", "..XX.", ".X...", "X....", "XXXXX"],
  "3": ["XXXXX", "....X", "...X.", "..XX.", "....X", "X...X", ".XXX."],
  "4": ["...X", "..XX", ".X.X", "X..X", "XXXX", "...X", "...X"],
  "5": ["XXXXX", "X....", "X.XX.", "XX..X", "....X", "X...X", ".XXX."],
  "6": ["..XX.", ".X...", "X....", "X.XX.", "XX..X", "X...X", ".XXX."],
  "7": ["XXXXX", "....X", "...X.", "...X.", "..X..", ".X...", ".X..."],
  "8": [".XXX.", "X...X", "X...X", ".XXX.", "X...X", "X...X", ".XXX."],
  "9": [".XXX.", "X...X", "X..XX", ".XX.X", "....X", "...X.", ".XX.."],
  ":": [".", ".", "X", ".", "X", ".", "."],
  ".": [".", ".", ".", ".", ".", ".", "X"],
  "-": ["...", "...", "...", "XXX", "...", "...", "..."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
}

/** Columns and lit cells for a string, glyphs separated by one empty column. */
function layoutText(s: string): { cols: number; on: Set<number> } {
  const on = new Set<number>()
  let x = 0
  let first = true
  for (const ch of s) {
    const g = GLYPHS[ch] ?? GLYPHS[" "]
    if (!first) x += 1
    first = false
    const w = g[0].length
    for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) if (g[r][c] === "X") on.add(r * 64 + x + c)
    x += w
  }
  return { cols: x, on }
}

/* ------------------------------------------------------------------------------------------------
 * Value parsing: numbers and h:mm times can count and drift while preserving leading zero padding.
 * ---------------------------------------------------------------------------------------------- */

type Parsed =
  | { kind: "num"; n: number; dec: number; padZeroLen: number; text: string }
  | { kind: "time"; n: number; text: string }
  | { kind: "text"; text: string }

function parseValue(v: string | number): Parsed {
  const text = String(v).trim()
  const t = /^(\d+):(\d{2})$/.exec(text)
  if (t) return { kind: "time", n: +t[1] * 60 + +t[2], text }
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const intPart = text.split(".")[0] ?? ""
    const hasLeadingZero = intPart.length > 1 && intPart.startsWith("0")
    return {
      kind: "num",
      n: +text,
      dec: (text.split(".")[1] ?? "").length,
      padZeroLen: hasLeadingZero ? text.length : 0,
      text,
    }
  }
  return { kind: "text", text }
}

function formatValue(p: Parsed, n: number): string {
  if (p.kind === "time") {
    const m = Math.max(0, Math.round(n))
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`
  }
  if (p.kind === "num") {
    const raw = n.toFixed(p.dec)
    return p.padZeroLen > 0 ? raw.padStart(p.padZeroLen, "0") : raw
  }
  return p.text
}

/* ------------------------------------------------------------------------------------------------
 * Easing and helpers
 * ---------------------------------------------------------------------------------------------- */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)
const easeInQuad = (x: number) => x * x
function hash(a: number, b: number) {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const COUNT_MS = 1500
const DRAW_MS = 1400
const OUT_MS = 700
const POP_IN_MS = 210
const POP_OUT_MS = 150

/* ------------------------------------------------------------------------------------------------
 * Icons, drawn on a 24 x 24 grid
 * ---------------------------------------------------------------------------------------------- */

const ICON_SIZE: Record<DotTileIconName, number> = { heart: 14, moon: 12.8, clock: 12.5, pulse: 13.2, bolt: 12.6, battery: 14, spark: 13, drop: 12.5, flame: 12.5 }
const ICON_DY: Partial<Record<DotTileIconName, number>> = { heart: 1.2, moon: -0.6, pulse: -0.4, bolt: -0.4, battery: 0.6, clock: -1.6 }
const ICON_DX: Partial<Record<DotTileIconName, number>> = { moon: 1.3 }

function Icon({ name }: { name: DotTileIconName }) {
  const common = { viewBox: "0 0 24 24", width: "100%", height: "100%", "aria-hidden": true as const, style: { display: "block", overflow: "visible" } }
  switch (name) {
    case "heart":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 21.2C9.4 19.1 1.8 14 1.8 8.3 1.8 5.1 4.2 2.8 7 2.8c2.1 0 3.8 1.1 5 2.9 1.2-1.8 2.9-2.9 5-2.9 2.8 0 5.2 2.3 5.2 5.5 0 5.7-7.6 10.8-10.2 12.9Z" />
        </svg>
      )
    case "moon":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12.7 2.23A9.8 9.8 0 1 0 21.8 11.71 6.6 6.6 0 0 1 12.7 2.23Z" />
        </svg>
      )
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" strokeWidth="2.3" />
          <path d="M11.6 6.2v6.4l3.4 2.6" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "pulse":
      return (
        <svg {...common}>
          <path d="M0.8 12.4h4.4l1.7-6.6 2.9 13 2.6-10.4 1.6 5 1.5-2.4h2.6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="20.9" cy="11.6" r="2.3" fill="currentColor" />
        </svg>
      )
    case "bolt":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M15.2 1 4.6 13.6h6.2L8.9 23 19.6 10.2h-6.3L15.2 1Z" />
        </svg>
      )
    case "battery":
      return (
        <svg {...common}>
          <path fill="currentColor" fillRule="evenodd" d="M7.2 5.4h9.6a5.2 5.2 0 0 1 5.2 5.2v2.8a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 13.4v-2.8a5.2 5.2 0 0 1 5.2-5.2Zm-.6 3.5a1 1 0 0 0-1 1v4.2a1 1 0 0 0 1 1h3.6a1 1 0 0 0 1-1V9.9a1 1 0 0 0-1-1H6.6Z" />
        </svg>
      )
    case "spark":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 1.2c.9 5.9 4.9 9.9 10.8 10.8-5.9.9-9.9 4.9-10.8 10.8C11.1 16.9 7.1 12.9 1.2 12 7.1 11.1 11.1 7.1 12 1.2Z" />
        </svg>
      )
    case "drop":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 1.8s7.2 8 7.2 13a7.2 7.2 0 0 1-14.4 0c0-5 7.2-13 7.2-13Z" />
        </svg>
      )
    case "flame":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12.6 1.4c.6 3.8 6.6 6.6 6.6 12.4a7.2 7.2 0 0 1-14.4 0c0-3.2 1.8-5.2 3.6-6.6 0 2.2.8 3.6 2.2 4.2.2-4.2 1.6-7.2 2-10Z" />
        </svg>
      )
  }
}

function IconSlot({ icon, cy: cy0 }: { icon: DotTileIconName | React.ReactNode; cy: number }) {
  const named = typeof icon === "string" && icon in ICON_SIZE
  const size = named ? ICON_SIZE[icon as DotTileIconName] : 14
  const cy = cy0 + (named ? ICON_DY[icon as DotTileIconName] ?? 0 : 0)
  return (
    <span
      aria-hidden
      className="lsdt-icon-slot"
      style={{
        position: "absolute",
        left: u(174.5 + (named ? ICON_DX[icon as DotTileIconName] ?? 0 : 0) - size / 2),
        top: u(cy - size / 2),
        width: u(size),
        height: u(size),
        color: "var(--dt-ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {named ? <Icon name={icon as DotTileIconName} /> : icon}
    </span>
  )
}

/* ------------------------------------------------------------------------------------------------
 * Styles (scoped by class prefix, injected once per tree)
 * ---------------------------------------------------------------------------------------------- */

const FONT = `"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

const CSS = `
.lsdt-grid{display:grid;width:100%;container-type:inline-size;text-align:left}
.lsdt-tile{position:relative;container-type:inline-size;aspect-ratio:${TW}/${TH};border-radius:14.6%/14.2%;isolation:isolate;
  font-family:${FONT};color:var(--dt-ink);text-align:left;-webkit-font-smoothing:antialiased;
  box-shadow:0 0 4px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.18),0 10px 24px -8px rgba(0,0,0,.42),0 26px 48px -20px rgba(0,0,0,.34);
  transition:transform .45s cubic-bezier(.2,.9,.25,1),box-shadow .45s cubic-bezier(.2,.9,.25,1);will-change:transform}
.lsdt-tile[data-clickable="true"]{cursor:pointer}
.lsdt-icon-slot > svg{width:100% !important;height:100% !important;display:block}
.lsdt-glass{position:absolute;inset:0;border-radius:inherit;overflow:hidden;
  background:color-mix(in srgb,var(--dt-tile) 88%,transparent);
  -webkit-backdrop-filter:blur(14px) saturate(1.25);backdrop-filter:blur(14px) saturate(1.25)}
.lsdt-glass::before{content:"";position:absolute;left:7%;right:7%;top:-2.5%;bottom:5%;border-radius:12%;background:var(--dt-tile);filter:blur(${u(10)})}
.lsdt-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 0.5px color-mix(in srgb,var(--dt-ink) 14%,transparent)}
.lsdt-face{position:absolute;inset:0;pointer-events:none;text-align:left;overflow:hidden;border-radius:inherit}
.lsdt-badge{position:absolute;right:${u(14)};top:${u(15.5)};padding:${u(2.6)} ${u(6.5)};border-radius:999px;background:linear-gradient(135deg,#d69f30,#b88624);color:#fff;font-size:${u(7.2)};font-weight:700;letter-spacing:0.05em;line-height:1.1;box-shadow:0 4px 12px rgba(214,159,48,.35);z-index:3}
.lsdt-title{position:absolute;left:${u(PAD)};right:${u(PAD)};top:${u(17.5)};font-size:calc(var(--fit,1) * ${(21.5 / TW).toFixed(5)} * 100cqw);line-height:1.15;font-weight:600;letter-spacing:-0.024em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;text-align:left}
.lsdt-sub{position:absolute;left:${u(PAD)};right:${u(PAD)};top:${u(46.5)};font-size:${u(9.6)};line-height:1.32;font-weight:400;letter-spacing:-0.005em;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-align:left;color:color-mix(in srgb,var(--dt-ink) 68%,transparent)}
.lsdt-unit{position:absolute;left:${u(144.5)};width:${u(60)};text-align:center;font-size:${u(8.6)};line-height:1;font-weight:600;letter-spacing:0.04em;white-space:nowrap;color:color-mix(in srgb,var(--dt-ink) 84%,transparent)}
.lsdt-unit[data-wide]{font-size:${u(12.6)};font-weight:500;color:var(--dt-ink)}
.lsdt-lab-row{position:absolute;left:${u(PAD)};right:${u(PAD)};top:${u(182)};display:flex;align-items:center;justify-content:space-between;gap:${u(6)}}
.lsdt-lab{font-size:${u(9.4)};line-height:1.1;font-weight:500;letter-spacing:-0.01em;white-space:nowrap;color:color-mix(in srgb,var(--dt-ink) 64%,transparent)}
.lsdt-lab-cta{font-size:${u(9.4)};line-height:1.1;font-weight:600;letter-spacing:0.01em;white-space:nowrap;color:color-mix(in srgb,var(--dt-ink) 92%,transparent)}
.lsdt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (hover:hover){.lsdt-tile[data-hover]:hover{transform:translateY(-2.4%) scale(1.015);
  box-shadow:0 2px 4px rgba(0,0,0,.18),0 18px 34px -10px rgba(0,0,0,.5),0 40px 64px -24px rgba(0,0,0,.4)}}
@media (prefers-reduced-motion:reduce){.lsdt-tile{transition:none}}
`

const StyleCtx = React.createContext(false)

/* ------------------------------------------------------------------------------------------------
 * Bottom visuals: static markup with refs, animated by the tile engine
 * ---------------------------------------------------------------------------------------------- */

type VisualRefs = {
  ticks: (SVGRectElement | null)[]
  marker: SVGRectElement | null
  path: SVGPathElement | null
  dots: (SVGCircleElement | null)[]
  blocks: (SVGRectElement | null)[]
  lines: (SVGRectElement | null)[]
}

const TRACK_W = TRACK_X1 - TRACK_X0
const STEP_BASE = 175
const STEP_MAX = 12
const RISE_SHAPE = [
  [0, 0.108, 1 / 6],
  [0.108, 0.385, 2 / 6],
  [0.385, 0.752, 3 / 6],
  [0.752, 1, 4 / 6],
]

function slotX(i: number, slots: number) {
  return TRACK_X0 + (slots <= 1 ? 0 : (i * TRACK_W) / (slots - 1))
}

/** Step segments for "steps" and "rise" as [x0, x1, level]. */
function stepSegments(v: DotTileVisual): [number, number, number][] {
  if (v.type === "steps") {
    const from = v.from ?? 0
    const to = v.to ?? 1
    const n = Math.max(1, v.data.length)
    const w = (to - from) / n
    return v.data.map((d, i) => [TRACK_X0 + (from + i * w) * TRACK_W, TRACK_X0 + (from + (i + 1) * w) * TRACK_W, clamp01(d)])
  }
  if (v.type === "rise") {
    const end = clamp01(v.value)
    return RISE_SHAPE.map(([a, b, l]) => [TRACK_X0 + a * end * TRACK_W, TRACK_X0 + b * end * TRACK_W, l])
  }
  return []
}

function stepPath(segs: [number, number, number][], draw: number): string {
  if (!segs.length) return ""
  const x0 = segs[0][0]
  const span = segs[segs.length - 1][1] - x0 || 1
  let d = `M${x0.toFixed(2)} ${STEP_BASE}`
  for (const [a, b, l] of segs) {
    const f = (a + b) / 2 - x0
    const k = easeOutCubic(clamp01((draw * 1.45 - (f / span) * 0.95) / 0.5))
    const y = (STEP_BASE - l * STEP_MAX * k).toFixed(2)
    d += `L${a.toFixed(2)} ${y}L${b.toFixed(2)} ${y}`
  }
  return d + `L${segs[segs.length - 1][1].toFixed(2)} ${STEP_BASE}Z`
}

function Visual({ v, refs, gid }: { v: DotTileVisual; refs: React.MutableRefObject<VisualRefs>; gid: string }) {
  const r = refs.current
  const slots = "slots" in v && v.slots ? v.slots : 15
  const tickCount = v.type === "slider" ? Math.max(2, Math.round(v.ticks ?? 44)) : 0
  r.ticks.length = tickCount
  const lineSlots: number[] = []
  if (v.type !== "slider") {
    for (let i = 0; i < slots; i++) {
      if (v.type === "dots" && v.data[i] != null) continue
      lineSlots.push(i)
    }
  }
  const initialMarkerX = v.type === "slider" ? TRACK_X0 + clamp01(v.value) * TRACK_W : TRACK_X0
  const initialStepPath = v.type === "steps" || v.type === "rise" ? stepPath(stepSegments(v), 1) : ""
  return (
    <svg
      aria-hidden
      viewBox={`0 147 ${TW} 36`}
      style={{ position: "absolute", left: 0, top: u(147), width: "100%", height: u(36), overflow: "visible", display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lineSlots.map((i, k) => (
        <rect
          key={"l" + i}
          ref={(el) => {
            r.lines[k] = el
          }}
          x={slotX(i, slots) - 0.55}
          y={VIS_Y - 9.5}
          width={1.1}
          height={19}
          fill={`url(#${gid})`}
          opacity={0.15}
        />
      ))}
      {v.type === "slider" &&
        Array.from({ length: tickCount }, (_, i) => {
          const x = TRACK_X0 + (i * TRACK_W) / (tickCount - 1)
          const d = Math.abs(x - initialMarkerX) - 4.5
          const mode = v.mode ?? "glow"
          const initOp = d < 1.4 ? 0 : mode === "fill" ? (x < initialMarkerX ? 0.94 : 0.24) : Math.max(0.24, 0.84 - 0.021 * d)
          return (
            <rect
              key={i}
              ref={(el) => {
                r.ticks[i] = el
              }}
              x={x - 0.62}
              y={VIS_Y - 4.5}
              width={1.24}
              height={9}
              fill="currentColor"
              opacity={initOp.toFixed(3)}
            />
          )
        })}
      {v.type === "slider" && (
        <rect
          ref={(el) => {
            r.marker = el
          }}
          x={(initialMarkerX - 4.5).toFixed(2)}
          y={VIS_Y - 6.8}
          width={9}
          height={13.6}
          rx={0.6}
          fill="currentColor"
          opacity={1}
        />
      )}
      {(v.type === "steps" || v.type === "rise") && (
        <path
          ref={(el) => {
            r.path = el
          }}
          fill="currentColor"
          d={initialStepPath}
        />
      )}
      {v.type === "dots" &&
        v.data.map((d, i) =>
          d == null ? null : (
            <circle
              key={i}
              ref={(el) => {
                r.dots[i] = el
              }}
              cx={slotX(i, slots)}
              cy={VIS_Y}
              r={(1 + 2.75 * clamp01(d)).toFixed(3)}
              fill="currentColor"
            />
          ),
        )}
      {v.type === "blocks" &&
        v.data.map((b, i) => (
          <rect
            key={i}
            ref={(el) => {
              r.blocks[i] = el
            }}
            x={TRACK_X0 + clamp01(b[0]) * TRACK_W}
            y={VIS_Y - 4.5}
            width={Math.max(0, (clamp01(b[1]) - clamp01(b[0])) * TRACK_W).toFixed(2)}
            height={9}
            fill="currentColor"
          />
        ))}
    </svg>
  )
}

function updateVisual(v: DotTileVisual, r: VisualRefs, draw: number, markerX: number) {
  const slots = "slots" in v && v.slots ? v.slots : 15
  // faint hour lines
  let k = 0
  if (v.type !== "slider") {
    for (let i = 0; i < slots; i++) {
      if (v.type === "dots" && v.data[i] != null) continue
      const el = r.lines[k++]
      if (el) el.setAttribute("opacity", (0.15 * clamp01(draw * 2.2 - (i / slots) * 1.2)).toFixed(3))
    }
  }
  if (v.type === "slider") {
    const n = r.ticks.length
    const mode = v.mode ?? "glow"
    const mx = TRACK_X0 + markerX * TRACK_W
    for (let i = 0; i < n; i++) {
      const el = r.ticks[i]
      if (!el) continue
      const x = TRACK_X0 + (i * TRACK_W) / (n - 1)
      const reveal = clamp01((draw * 1.5 - (i / n) * 1.0) / 0.4)
      const d = Math.abs(x - mx) - 4.5
      let o: number
      if (d < 1.4) o = 0
      else if (mode === "fill") o = x < mx ? 0.94 : 0.24
      else o = Math.max(0.24, 0.84 - 0.021 * d)
      el.setAttribute("opacity", (o * reveal).toFixed(3))
    }
    if (r.marker) {
      r.marker.setAttribute("x", (mx - 4.5).toFixed(2))
      r.marker.setAttribute("opacity", clamp01(draw * 4).toFixed(3))
    }
    return
  }
  if (v.type === "steps" || v.type === "rise") {
    r.path?.setAttribute("d", stepPath(stepSegments(v), draw))
    return
  }
  if (v.type === "dots") {
    const n = v.data.length
    v.data.forEach((d, i) => {
      const el = r.dots[i]
      if (!el || d == null) return
      const p = clamp01((draw * 1.6 - (i / Math.max(1, n)) * 1.0) / 0.45)
      const rad = (1 + 2.75 * clamp01(d)) * (p <= 0 ? 0 : easeOutBack(p))
      el.setAttribute("r", Math.max(0, rad).toFixed(3))
    })
    return
  }
  if (v.type === "blocks") {
    v.data.forEach((b, i) => {
      const el = r.blocks[i]
      if (!el) return
      const p = easeOutCubic(clamp01((draw * 1.5 - clamp01(b[0]) * 1.0) / 0.45))
      el.setAttribute("width", Math.max(0, (clamp01(b[1]) - clamp01(b[0])) * TRACK_W * p).toFixed(2))
    })
  }
}

/* ------------------------------------------------------------------------------------------------
 * Reduced motion
 * ---------------------------------------------------------------------------------------------- */

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/* ------------------------------------------------------------------------------------------------
 * DotTile
 * ---------------------------------------------------------------------------------------------- */

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return reduced
}

/** One metric tile with a dot-matrix value. Use it alone or let `DotTiles` lay several out. */
export function DotTile(props: DotTileProps) {
  const {
    title,
    subtitle,
    value,
    unit,
    unitIcon,
    icon,
    visual,
    jitter = 0,
    badge,
    href,
    onClick,
    dotColor = "#ffffff",
    tileColor = "#000000",
    animate = true,
    delay = 0,
    replayEvery,
    className,
    style,
    index = 0,
  } = props
  const styled = React.useContext(StyleCtx)
  const parsed = React.useMemo(() => parseValue(value), [value])
  const uid = "lsdt" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const reducedPref = useReducedMotion()

  // Matrix width: room for the target and for drift either side, so the layout never jumps.
  const cols = React.useMemo(() => {
    let w = layoutText(parsed.text).cols
    if (parsed.kind !== "text" && jitter > 0) {
      const step = parsed.kind === "num" ? jitter * Math.pow(10, -parsed.dec) : jitter
      w = Math.max(w, layoutText(formatValue(parsed, parsed.n + step)).cols)
    }
    return Math.max(1, w)
  }, [parsed, jitter])
  const scale = Math.min(1, VAL_MAX_W / (cols * PITCH))

  const initialOn = React.useMemo(() => layoutText(parsed.text).on, [parsed.text])
  const maxCharsAtFullSize = badge ? 11.5 : 14.5
  const initialFit = Number(Math.max(0.58, Math.min(badge ? 0.88 : 1, maxCharsAtFullSize / Math.max(1, title.length))).toFixed(3))

  const dotRefs = React.useRef<(SVGCircleElement | null)[]>([])
  const visRefs = React.useRef<VisualRefs>({ ticks: [], marker: null, path: null, dots: [], blocks: [], lines: [] })
  const tileRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLHeadingElement>(null)

  // Keep the newest props for the running engine without restarting it.
  const live = React.useRef({ parsed, visual, jitter, cols })
  live.current = { parsed, visual, jitter, cols }

  // Fit long titles to one line, reserving right space if badge is present so they never overlap.
  useIsoLayoutEffect(() => {
    const el = titleRef.current
    const tile = tileRef.current
    if (!el || !tile) return
    let alive = true
    const fit = () => {
      if (!alive) return
      if (tile.clientWidth <= 0) {
        el.style.setProperty("--fit", String(initialFit))
        return
      }
      el.style.right = "auto"
      el.style.setProperty("--fit", "1")
      const badgeReserve = badge ? 46 : 0
      const avail = tile.clientWidth * ((TW - PAD * 2 - badgeReserve) / TW)
      const w = el.scrollWidth
      el.style.right = badge ? u(PAD + 46) : u(PAD)
      if (w > avail && w > 0) {
        const computed = Math.max(0.55, Math.min(initialFit, (avail / w) * 0.96))
        el.style.setProperty("--fit", String(computed))
      } else {
        el.style.setProperty("--fit", String(initialFit))
      }
    }
    fit()
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null
    ro?.observe(tile)
    document.fonts?.ready.then(fit).catch(() => {})
    return () => {
      alive = false
      ro?.disconnect()
    }
  }, [title, badge, initialFit])

  // The engine: one rAF loop per tile, writing attributes directly.
  useIsoLayoutEffect(() => {
    const reduced = !animate || reducedPref || prefersReducedMotion()
    const R = DOT_R / PITCH // radius in pitch units
    const N = cols * 7
    const cur = new Float32Array(N)
    const from = new Float32Array(N)
    const to = new Float32Array(N)
    const t0 = new Float32Array(N)
    let shown = ""
    let markerX = 0
    let lastDraw = -1
    let lastMarker = -1
    let lastVis: DotTileVisual | undefined
    let lastNow = 0
    let raf = 0
    let visible = true
    const replay = replayEvery && replayEvery >= 4000 ? replayEvery : 0

    const cellIndex = (key: number) => {
      const r = Math.floor(key / 64)
      const c = key % 64
      return c < cols ? r * cols + c : -1
    }

    const retarget = (s: string, now: number, instant: boolean) => {
      shown = s
      const { on } = layoutText(s)
      const want = new Uint8Array(N)
      on.forEach((key) => {
        const i = cellIndex(key)
        if (i >= 0) want[i] = 1
      })
      for (let i = 0; i < N; i++) {
        const target = want[i] ? 1 : 0
        if (to[i] === target) continue
        const r = Math.floor(i / cols)
        const c = i % cols
        from[i] = cur[i]
        to[i] = target
        t0[i] = instant ? -1e9 : now + c * 6 + r * 9 + hash(i, index) * 26
      }
    }

    const writeDots = (now: number) => {
      const els = dotRefs.current
      let busy = false
      for (let i = 0; i < N; i++) {
        if (cur[i] === to[i] && t0[i] < now) continue
        const dur = to[i] > from[i] ? POP_IN_MS : POP_OUT_MS
        const p = clamp01((now - t0[i]) / dur)
        const e = to[i] > from[i] ? easeOutBack(p) : easeInQuad(p)
        const v = p >= 1 ? to[i] : from[i] + (to[i] - from[i]) * e
        if (p < 1) busy = true
        if (v !== cur[i] || p >= 1) {
          cur[i] = v
          els[i]?.setAttribute("r", Math.max(0, v * R).toFixed(4))
        }
      }
      return busy
    }

    const targetString = (phase: number, cycleOn: boolean): string => {
      const { parsed: p, jitter: j } = live.current
      const blank = " ".repeat(p.text.length)
      if (cycleOn) return blank
      if (p.kind === "text") return p.text
      if (p.kind === "num" && p.padZeroLen > 0 && j <= 0) return p.text
      if (phase < COUNT_MS) {
        const steps = Math.max(6, Math.round(COUNT_MS / 105))
        const q = Math.floor((phase / COUNT_MS) * steps) / steps
        const unitStep = p.kind === "num" ? Math.pow(10, -p.dec) : 1
        const n = Math.round((p.n * easeOutCubic(q)) / unitStep) * unitStep
        return formatValue(p, n).padStart(p.text.length, " ")
      }
      if (j > 0 && !reduced) {
        const period = 2600 + ((index * 733) % 1500)
        const k = Math.floor((phase - COUNT_MS - 900) / period)
        if (k >= 0) {
          const span = Math.round(j)
          const off = Math.floor(hash(index + 17, k) * (span * 2 + 1)) - span
          const unitStep = p.kind === "num" ? Math.pow(10, -p.dec) : 1
          return formatValue(p, p.n + off * unitStep)
        }
      }
      return p.text
    }

    const vis = () => live.current.visual

    const applyStatic = () => {
      retarget(live.current.parsed.text, 0, true)
      const els = dotRefs.current
      for (let i = 0; i < N; i++) {
        cur[i] = to[i]
        els[i]?.setAttribute("r", (cur[i] * R).toFixed(4))
      }
      const v = vis()
      if (v) updateVisual(v, visRefs.current, 1, v.type === "slider" ? clamp01(v.value) : 0)
    }

    if (reduced) {
      applyStatic()
      const node = tileRef.current as any
      if (node) node.__lsdtKick = applyStatic
      return () => {
        if (node) delete node.__lsdtKick
      }
    }

    // Initialize in settled state first so offscreen tiles are never blank
    applyStatic()
    shown = ""
    for (let i = 0; i < N; i++) {
      cur[i] = 0
      from[i] = 0
      to[i] = 0
    }
    const start = performance.now() + delay
    lastNow = performance.now()

    const frame = (nowArg?: number) => {
      raf = 0
      const now = typeof nowArg === "number" ? nowArg : performance.now()
      const dt = Math.min(100, Math.max(0, now - lastNow))
      lastNow = now
      const t = Math.max(0, now - start)
      let phase = t
      let out = false
      let draw = 1
      if (replay) {
        phase = t % replay
        out = phase > replay - OUT_MS
      }
      if (out) draw = 1 - easeInOutCubic(clamp01((phase - (replay - OUT_MS)) / (OUT_MS * 0.85)))
      else draw = clamp01(Math.max(0.2, phase / DRAW_MS))

      const s = targetString(phase, out)
      if (s !== shown) retarget(s, now, false)
      const busy = writeDots(now)

      const v = vis()
      if (v) {
        let target = 0
        if (v.type === "slider") {
          const intro = out ? 0 : easeInOutCubic(clamp01((phase - 60) / 950))
          target = clamp01(v.value) * (out ? draw : Math.max(0.25, intro))
          const introRunning = !out && phase < 1100
          if (introRunning || out) markerX = target
          else markerX += (target - markerX) * (1 - Math.exp(-dt / 110))
          if (Math.abs(target - markerX) < 0.0005) markerX = target
        }
        if (draw !== lastDraw || markerX !== lastMarker || v !== lastVis) {
          updateVisual(v, visRefs.current, draw, markerX)
          lastDraw = draw
          lastMarker = markerX
          lastVis = v
        }
      }

      const settled = t > COUNT_MS + DRAW_MS && !busy && !replay && !(live.current.jitter > 0) && !(v?.type === "slider" && markerX !== clamp01(v.value))
      if (visible && !settled) raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }
    const node = tileRef.current as any
    if (node) node.__lsdtKick = kick

    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== "undefined" && tileRef.current) {
      io = new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting && document.visibilityState !== "hidden"
        if (visible) kick()
      })
      io.observe(tileRef.current)
    }
    const onVis = () => {
      visible = document.visibilityState !== "hidden"
      if (visible) kick()
    }
    document.addEventListener("visibilitychange", onVis)
    frame(performance.now())
    return () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      visible = false
      io?.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      if (node) delete node.__lsdtKick
    }
    // The engine reads value, visual and jitter through `live`; geometry changes restart it.
  }, [animate, reducedPref, cols, delay, replayEvery, index])

  // Value or visual changed after mount: wake a sleeping engine so it morphs to the new state.
  React.useEffect(() => {
    ;(tileRef.current as any)?.__lsdtKick?.()
  }, [parsed.text, visual])

  const label = `${title}${subtitle ? `, ${subtitle}` : ""}: ${parsed.text}${unit ? ` ${unit}` : ""}`
  const wideUnit = !!unit && /^[%°]/.test(unit)
  const clickable = Boolean(onClick || href)

  const handleActivate = () => {
    if (onClick) {
      onClick()
    } else if (href && typeof window !== "undefined") {
      window.location.href = href
    }
  }

  return (
    <div
      ref={tileRef}
      role={clickable ? "button" : "group"}
      tabIndex={clickable ? 0 : undefined}
      aria-label={label}
      data-hover=""
      data-clickable={clickable ? "true" : undefined}
      onClick={clickable ? handleActivate : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleActivate()
              }
            }
          : undefined
      }
      className={`lsdt-tile${className ? ` ${className}` : ""}`}
      style={{ ["--dt-ink" as any]: dotColor, ["--dt-tile" as any]: tileColor, ...style }}
    >
      {!styled && <style>{CSS}</style>}
      <div className="lsdt-glass" />
      <div className="lsdt-face">
        {badge && <span className="lsdt-badge">{badge}</span>}
        <h3
          ref={titleRef}
          className="lsdt-title"
          style={{
            ["--fit" as any]: initialFit,
            right: badge ? u(PAD + 46) : u(PAD),
          }}
        >
          {title}
        </h3>
        {subtitle && <div className="lsdt-sub">{subtitle}</div>}
        <span className="lsdt-sr">{`${parsed.text}${unit ? ` ${unit}` : ""}`}</span>
        <svg
          aria-hidden
          viewBox={`0 0 ${cols} 7`}
          style={{
            position: "absolute",
            left: u(VAL_X - (PITCH * scale) / 2),
            top: u(VAL_Y - (PITCH * scale) / 2),
            width: u(cols * PITCH * scale),
            height: u(7 * PITCH * scale),
            overflow: "visible",
            display: "block",
            color: "var(--dt-ink)",
          }}
        >
          {Array.from({ length: cols * 7 }, (_, i) => {
            const r = Math.floor(i / cols)
            const c = i % cols
            const isLit = initialOn.has(r * 64 + c)
            return (
              <circle
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el
                }}
                cx={c + 0.5}
                cy={r + 0.5}
                r={isLit ? (DOT_R / PITCH).toFixed(4) : 0}
                fill="currentColor"
              />
            )
          })}
        </svg>
        {icon != null && <IconSlot icon={icon} cy={104.5} />}
        {unitIcon != null ? (
          <IconSlot icon={unitIcon} cy={130} />
        ) : unit ? (
          <span className="lsdt-unit" aria-hidden data-wide={wideUnit ? "" : undefined} style={{ top: u(wideUnit ? 122 : 124.5) }}>
            {unit}
          </span>
        ) : null}
        {visual && (
          <>
            <div style={{ color: "var(--dt-ink)" }}>
              <Visual v={visual} refs={visRefs} gid={`${uid}g`} />
            </div>
            {visual.labels && (
              <div className="lsdt-lab-row" aria-hidden>
                <span className="lsdt-lab">{visual.labels[0]}</span>
                <span className="lsdt-lab-cta">{visual.labels[1]}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * DotTiles
 * ---------------------------------------------------------------------------------------------- */

/** A grid of metric tiles with dot-matrix numerals that count up, draw in and drift. */
export function DotTiles({
  tiles = DOT_TILES_SAMPLE,
  columns = 3,
  dotColor = "#ffffff",
  tileColor = "#000000",
  animate = true,
  stagger = 90,
  replayEvery,
  className,
  style,
}: DotTilesProps) {
  const cols = Math.max(1, Math.floor(columns))
  const g = GAP / TW
  const gap = `calc(100cqw * ${(g / (cols + g * (cols - 1))).toFixed(5)})`
  return (
    <StyleCtx.Provider value>
      <style>{CSS}</style>
      <div className={`lsdt-grid${className ? ` ${className}` : ""}`} style={style} role="list">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
          {tiles.map((t, i) => (
            <div role="listitem" key={t.id ?? `${t.title}-${i}`}>
              <DotTile {...t} index={i} dotColor={dotColor} tileColor={tileColor} animate={animate} delay={i * stagger} replayEvery={replayEvery} />
            </div>
          ))}
        </div>
      </div>
    </StyleCtx.Provider>
  )
}

export default DotTiles
