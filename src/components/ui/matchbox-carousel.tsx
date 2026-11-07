"use client";
import * as React from "react";

/**
 * MatchboxCarousel: each item is a matchbox lying on a table, its title printed on
 * the sleeve. The open box's tray slides out to show the picture or text inside.
 * Moving on closes the tray, the boxes shuffle along, and the next tray opens.
 *
 * Wide containers lay the boxes sideways and the tray slides right; narrow ones
 * stand them up so the tray slides towards you and the picture stays large.
 * Buttons, arrow keys, swipe and clicking a neighbouring box all move it. Autoplay
 * waits while hovered, focused, off screen or in a hidden tab. Reduced motion:
 * no sliding, the content simply changes. Pure CSS 3D: no canvas, no libraries.
 */

export interface MatchboxItem {
  /** Optional image URL inside the tray (used for 2026-2027). */
  src?: string;
  /** Title printed on the sleeve and announced to screen readers. */
  title: string;
  /** Optional short line under the title on the sleeve. */
  detail?: string;
  /** Accessible description of the image; falls back to `title`. */
  alt?: string;
  /** Optional sleeve paper colour (CSS colour). Cycles a warm palette by default. */
  color?: string;
  /** Optional sleeve ink colour (CSS colour). */
  ink?: string;
  /** Optional custom content inside the tray when no image is shown (e.g. text structure). */
  content?: React.ReactNode;
}

export interface MatchboxCarouselProps {
  items: MatchboxItem[];
  /** Starting index when uncontrolled. @default 0 */
  defaultIndex?: number;
  /** Controlled active index. */
  index?: number;
  /** Called whenever the active item changes. */
  onIndexChange?: (index: number) => void;
  /** Autoplay interval in ms; `0` or `false` disables autoplay. @default 0 */
  autoplay?: number | false;
  /** Accessible label for the carousel region. @default "Matchbox carousel" */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PALETTE: Array<{ paper: string; ink: string; accent: string; stamp: string }> = [
  { paper: "#18392b", ink: "#f6f2e8", accent: "#d4af37", stamp: "ARSIP • MASA BAKTI" },
  { paper: "#f4efe2", ink: "#18392b", accent: "#b8893a", stamp: "ARSIP • MASA BAKTI" },
];

const CLOSE_MS = 380;
const MOVE_MS = 460;

type Phase = "open" | "closing" | "moving";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function signedOffset(i: number, active: number, total: number) {
  const raw = i - active;
  if (total <= 2) return raw;
  const half = total / 2;
  if (raw > half) return raw - total;
  if (raw < -half) return raw + total;
  return raw;
}

export function MatchboxCarousel({
  items,
  defaultIndex = 0,
  index: controlledIndex,
  onIndexChange,
  autoplay = 0,
  ariaLabel = "Perjalanan OSMIS Matchbox Carousel",
  className,
  style,
}: MatchboxCarouselProps) {
  const total = items.length;
  const isControlled = controlledIndex !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(() =>
    total > 0 ? mod(defaultIndex, total) : 0
  );
  const target = isControlled ? mod(controlledIndex!, Math.max(1, total)) : uncontrolled;

  const [visual, setVisual] = React.useState(target);
  const [phase, setPhase] = React.useState<Phase>("open");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [docVisible, setDocVisible] = React.useState(true);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const timersRef = React.useRef<number[]>([]);
  const dragRef = React.useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setNarrow(w < 680);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setDocVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const goTo = React.useCallback(
    (nextRaw: number) => {
      if (total <= 1) return;
      const next = mod(nextRaw, total);
      if (!isControlled) setUncontrolled(next);
      onIndexChange?.(next);
    },
    [total, isControlled, onIndexChange]
  );

  // Two-step choreography: close the open tray, shuffle boxes, slide the new tray out.
  React.useEffect(() => {
    if (total === 0) return;
    if (target === visual && phase === "open") return;

    clearTimers();

    if (reducedMotion) {
      setVisual(target);
      setPhase("open");
      return;
    }

    if (phase === "open") {
      setPhase("closing");
      const t1 = window.setTimeout(() => {
        setVisual(target);
        setPhase("moving");
        const t2 = window.setTimeout(() => {
          setPhase("open");
        }, MOVE_MS);
        timersRef.current.push(t2);
      }, CLOSE_MS);
      timersRef.current.push(t1);
    } else {
      setVisual(target);
      setPhase("moving");
      const t = window.setTimeout(() => setPhase("open"), MOVE_MS);
      timersRef.current.push(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion, total]);

  const busy = phase !== "open";

  React.useEffect(() => {
    if (!autoplay || autoplay <= 0 || total <= 1) return;
    if (hovered || focused || !inView || !docVisible || busy) return;
    const id = window.setTimeout(() => {
      goTo(target + 1);
    }, autoplay);
    return () => window.clearTimeout(id);
  }, [autoplay, total, hovered, focused, inView, docVisible, busy, target, goTo]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (total <= 1) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goTo(target + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goTo(target - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest(".mbx-tray-scroll")) return;
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) d.moved = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const primary = narrow ? dx : dy;
    const secondary = narrow ? dy : dx;
    const delta = Math.abs(primary) >= Math.abs(secondary) ? primary : secondary;
    if (Math.abs(delta) > 42) {
      goTo(target + (delta < 0 ? 1 : -1));
    }
  };

  const scope = React.useId().replace(/:/g, "");

  if (total === 0) return null;

  const activeItem = items[visual] ?? items[0];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragRef.current = null;
      }}
      className={["mbx-root", `mbx-${scope}`, narrow ? "is-narrow" : "is-wide", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <style>{css(scope)}</style>

      <div className="mbx-sr" aria-live="polite" aria-atomic="true">
        {`Periode ${visual + 1} dari ${total}: ${activeItem.title}`}
      </div>

      {/* Tabletop surface */}
      <div className="mbx-stage">
        <div className="mbx-scene">
          {items.map((it, i) => {
            const off = signedOffset(i, visual, total);
            const abs = Math.abs(off);
            const isActive = off === 0;
            const isOpen = isActive && phase === "open";
            // Show active box + immediate neighbours (-1 and +1) so nothing overflows top/bottom
            const visible = abs <= 1;
            const pal = PALETTE[i % PALETTE.length];
            const paper = it.color ?? pal.paper;
            const ink = it.ink ?? pal.ink;

            return (
              <div
                key={i}
                aria-hidden={!isActive}
                onClick={() => {
                  if (dragRef.current?.moved) return;
                  if (!isActive) goTo(i);
                }}
                className={[
                  "mbx-slot",
                  isActive ? "is-active" : "is-idle",
                  isOpen ? "is-open" : "",
                  !visible ? "is-hidden" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--off": off,
                    "--abs": abs,
                    "--paper": paper,
                    "--ink": ink,
                    "--accent": pal.accent,
                    zIndex: isOpen ? 30 : 20 - abs * 6,
                  } as React.CSSProperties
                }
              >
                <div className="mbx-box">
                  {/* Soft contact shadow on the table */}
                  <div className="mbx-shadow" />

                  {/* Inner cardboard tray that slides out of the sleeve */}
                  <div className="mbx-tray">
                    <Tray it={it} />
                  </div>

                  {/* Outer printed sleeve (5 visible faces + dark mouth cavity) */}
                  <div className="mbx-sleeve">
                    <div className="mbx-cavity" />
                    <div className="mbx-face mbx-top">
                      <SleeveFace
                        index={i}
                        title={it.title}
                        detail={it.detail}
                        stamp={pal.stamp}
                        narrow={narrow}
                        is2627={it.title.includes("2026")}
                      />
                    </div>
                    <div className="mbx-face mbx-left" />
                    <div className="mbx-face mbx-right" />
                    <div className="mbx-face mbx-back" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption & tactile controls floating cleanly in a glass pill bar */}
      <div className="mbx-bar">
        <div className="mbx-meta">
          <span className="mbx-index">
            {String(visual + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="mbx-sep" aria-hidden="true">
            ·
          </span>
          <span className="mbx-title">{activeItem.title}</span>
          {activeItem.detail && <span className="mbx-detail">— {activeItem.detail}</span>}
        </div>

        <div className="mbx-controls">
          <div className="mbx-dots" role="tablist" aria-label="Pilih periode OSMIS">
            {items.map((it, i) => {
              const current = i === target;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={current}
                  aria-label={`${i + 1}: ${it.title}`}
                  onClick={() => goTo(i)}
                  className={["mbx-dot", current ? "is-current" : ""].filter(Boolean).join(" ")}
                />
              );
            })}
          </div>

          <div className="mbx-arrows">
            <button
              type="button"
              aria-label="Periode sebelumnya"
              disabled={total <= 1}
              onClick={() => goTo(target - 1)}
              className="mbx-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 3.5L5.5 8L10 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Periode selanjutnya"
              disabled={total <= 1}
              onClick={() => goTo(target + 1)}
              className="mbx-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 3.5L10.5 8L6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SleeveFace({
  index,
  title,
  detail,
  stamp,
  narrow,
  is2627,
}: {
  index: number;
  title: string;
  detail?: string;
  stamp: string;
  narrow: boolean;
  is2627?: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="mbx-print">
      <div className="mbx-border">
        <div className="mbx-corner tl" />
        <div className="mbx-corner tr" />
        <div className="mbx-corner bl" />
        <div className="mbx-corner br" />

        <div className="mbx-row-top">
          <span className="mbx-stamp">{stamp}</span>
          <span className="mbx-no">№ {num}</span>
        </div>

        <div className="mbx-center">
          <div className="mbx-emblem" aria-hidden="true">
            <svg viewBox="0 0 48 26" width="44" height="24">
              <ellipse
                cx="24"
                cy="13"
                rx="22"
                ry="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <ellipse
                cx="24"
                cy="13"
                rx="18"
                ry="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
              <line
                x1="14"
                y1="13"
                x2="31"
                y2="13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <ellipse cx="33" cy="13" rx="3.2" ry="2.3" fill="var(--accent)" />
            </svg>
          </div>
          <div className="mbx-sleeve-title">{title}</div>
          {detail && <div className="mbx-sleeve-detail">{detail}</div>}
        </div>

        <div className="mbx-row-bot">
          <span>{is2627 ? "FOTO PENGURUS AKTIF" : "SUSUNAN PENGURUS"}</span>
          <span className="mbx-pull" aria-hidden="true">
            {narrow ? "▼" : "▶"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Tray({ it }: { it: MatchboxItem }) {
  return (
    <div className="mbx-tray-body">
      <div className="mbx-tray-well">
        {it.src ? (
          <>
            <img
              src={it.src}
              alt={it.alt ?? it.title}
              draggable={false}
              loading="eager"
              referrerPolicy="no-referrer"
              className="mbx-img"
            />
            <div className="mbx-img-gloss" />
          </>
        ) : (
          <div className="mbx-tray-scroll">{it.content}</div>
        )}
        <div className="mbx-well- lip-t" />
        <div className="mbx-well- lip-b" />
        <div className="mbx-well- lip-l" />
        <div className="mbx-well- lip-r" />
      </div>
      <div className="mbx-tray-wall wt" />
      <div className="mbx-tray-wall wb" />
      <div className="mbx-tray-wall wl" />
      <div className="mbx-tray-wall wr">
        <span className="mbx-notch" />
      </div>
    </div>
  );
}

function css(scope: string) {
  const s = `.mbx-${scope}`;
  return `
${s}.mbx-root {
  --bw: 292px;
  --bh: 194px;
  --bd: 28px;
  --slide: 92%;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 24px 28px 22px;
  border-radius: 28px;
  color: var(--text-color, #18392b);
  /* Seamlessly blends with the site's warm ivory/cream background */
  background:
    radial-gradient(65% 58% at 50% 46%, rgba(24, 57, 43, 0.055) 0%, rgba(212, 175, 55, 0.04) 48%, transparent 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(244, 239, 226, 0.35) 100%);
  border: 1px solid rgba(24, 57, 43, 0.11);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 20px 50px -28px rgba(24, 57, 43, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: inherit;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
  outline: none;
  overflow: hidden;
}
${s}.mbx-root:focus-visible {
  border-color: rgba(24, 57, 43, 0.35);
}
${s} .mbx-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

${s} .mbx-stage {
  position: relative;
  width: 100%;
  height: 460px;
  perspective: 1400px;
  perspective-origin: 50% 44%;
}
${s}.is-narrow .mbx-stage {
  --bw: 204px;
  --bh: 274px;
  --bd: 26px;
  height: 540px;
  perspective: 1200px;
}

${s} .mbx-scene {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateX(24deg) rotateZ(-7deg);
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
${s}.is-narrow .mbx-scene {
  transform: rotateX(20deg) rotateZ(-3deg);
}

${s} .mbx-slot {
  position: absolute;
  top: 47%;
  left: 50%;
  width: var(--bw);
  height: var(--bh);
  margin-left: calc(var(--bw) / -2);
  margin-top: calc(var(--bh) / -2);
  transform-style: preserve-3d;
  transition:
    transform 460ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease;
  will-change: transform, opacity;
  /* Wide: well-spaced so neighboring boxes never collide with bottom bar or cut off titles */
  transform:
    translate3d(
      calc(-142px + var(--off) * 44px),
      calc(var(--off) * 124px),
      calc(var(--abs) * -28px)
    )
    rotateZ(calc(var(--off) * -4deg))
    scale(calc(1 - var(--abs) * 0.08));
}
${s}.is-narrow .mbx-slot {
  top: 46%;
  transform:
    translate3d(
      calc(var(--off) * 144px),
      calc(-118px + var(--abs) * 18px),
      calc(var(--abs) * -26px)
    )
    rotateZ(calc(var(--off) * 4deg))
    scale(calc(1 - var(--abs) * 0.09));
}

${s} .mbx-slot.is-idle {
  cursor: pointer;
  opacity: 0.86;
}
${s} .mbx-slot.is-idle:hover {
  opacity: 0.96;
  filter: brightness(1.03);
}
/* Hide bottom row text on background boxes so it is never half-covered by the front box */
${s} .mbx-slot.is-idle .mbx-row-bot {
  opacity: 0;
}
${s} .mbx-slot.is-hidden {
  opacity: 0;
  pointer-events: none;
}

${s} .mbx-box {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

/* Soft drop shadow on the table beneath the box and its open tray */
${s} .mbx-shadow {
  position: absolute;
  inset: 6px;
  border-radius: 8px;
  background: rgba(18, 34, 25, 0.24);
  filter: blur(16px);
  transform: translate3d(10px, 16px, -2px);
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
${s}.is-wide .mbx-slot.is-open .mbx-shadow {
  width: calc(100% + var(--bw) * 0.88);
}
${s}.is-narrow .mbx-slot.is-open .mbx-shadow {
  height: calc(100% + var(--bh) * 0.88);
}

/* ---------- Inner cardboard tray ---------- */
${s} .mbx-tray {
  position: absolute;
  top: 5px;
  left: 5px;
  width: calc(var(--bw) - 10px);
  height: calc(var(--bh) - 10px);
  transform-style: preserve-3d;
  transform: translate3d(0, 0, 2px);
  transition: transform 380ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
${s} .mbx-slot.is-open .mbx-tray {
  transition: transform 520ms cubic-bezier(0.18, 1.12, 0.32, 1);
}
${s}.is-wide .mbx-slot.is-open .mbx-tray {
  transform: translate3d(var(--slide), 0, 2px);
}
${s}.is-narrow .mbx-slot.is-open .mbx-tray {
  transform: translate3d(0, var(--slide), 2px);
}

${s} .mbx-tray-body {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  background: #d5c19d;
  border-radius: 3px;
}

${s} .mbx-tray-well {
  position: absolute;
  inset: 7px;
  background: #18261e;
  border-radius: 2px;
  overflow: hidden;
  transform: translateZ(calc(var(--bd) - 7px));
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(90, 62, 32, 0.28);
}
${s} .mbx-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 72%;
  display: block;
  pointer-events: none;
  transform: scale(1.015);
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
}
${s} .mbx-slot.is-open .mbx-img {
  transform: scale(1);
}
${s} .mbx-img-gloss {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(125deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 38%),
    radial-gradient(100% 100% at 50% 50%, transparent 65%, rgba(15, 10, 5, 0.22) 100%);
  pointer-events: none;
}

/* Custom scrollable text inside tray for non-26-27 periods */
${s} .mbx-tray-scroll {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  background: linear-gradient(180deg, #faf7f0 0%, #f1eadb 100%);
  color: #18392b;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(24, 57, 43, 0.35) transparent;
  user-select: text;
  -webkit-user-select: text;
  touch-action: pan-y;
}
${s} .mbx-tray-scroll::-webkit-scrollbar {
  width: 4px;
}
${s} .mbx-tray-scroll::-webkit-scrollbar-thumb {
  background: rgba(24, 57, 43, 0.35);
  border-radius: 4px;
}

/* Inner cardboard rim shadows around the well */
${s} .mbx-well- {
  position: absolute;
  pointer-events: none;
}
${s} .lip-t { top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to bottom, rgba(40,24,10,0.35), transparent); }
${s} .lip-b { bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to top, rgba(255,235,200,0.22), transparent); }
${s} .lip-l { top: 0; bottom: 0; left: 0; width: 4px; background: linear-gradient(to right, rgba(40,24,10,0.32), transparent); }
${s} .lip-r { top: 0; bottom: 0; right: 0; width: 4px; background: linear-gradient(to left, rgba(40,24,10,0.25), transparent); }

/* Raw kraft cardboard walls of the tray */
${s} .mbx-tray-wall {
  position: absolute;
  background: linear-gradient(to bottom, #dfd0b2, #c4ae86);
  box-shadow: inset 0 0 0 1px rgba(95, 66, 32, 0.22);
}
${s} .mbx-tray-wall.wt {
  top: 0; left: 0;
  width: 100%;
  height: calc(var(--bd) - 4px);
  transform-origin: top center;
  transform: rotateX(-90deg);
  background: linear-gradient(to bottom, #d1be9a, #b8a078);
}
${s} .mbx-tray-wall.wb {
  bottom: 0; left: 0;
  width: 100%;
  height: calc(var(--bd) - 4px);
  transform-origin: bottom center;
  transform: rotateX(90deg);
  background: linear-gradient(to top, #e7d8bb, #ccb78f);
}
${s} .mbx-tray-wall.wl {
  top: 0; left: 0;
  width: calc(var(--bd) - 4px);
  height: 100%;
  transform-origin: center left;
  transform: rotateY(90deg);
  background: #c2ab82;
}
${s} .mbx-tray-wall.wr {
  top: 0; right: 0;
  width: calc(var(--bd) - 4px);
  height: 100%;
  transform-origin: center right;
  transform: rotateY(-90deg);
  background: linear-gradient(to left, #e5d5b5, #c9b289);
  display: flex;
  align-items: center;
  justify-content: center;
}
${s} .mbx-notch {
  width: 8px;
  height: 22px;
  border-radius: 999px;
  background: rgba(60, 40, 18, 0.32);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* ---------- Outer printed sleeve ---------- */
${s} .mbx-sleeve {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}

/* Dark mouth where the tray emerges so the sleeve reads as hollow */
${s} .mbx-cavity {
  position: absolute;
  inset: 3px;
  background: #101914;
  border-radius: 3px;
  transform: translateZ(1px);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.85);
}

${s} .mbx-face {
  position: absolute;
  backface-visibility: hidden;
}

${s} .mbx-top {
  inset: 0;
  border-radius: 5px;
  background:
    radial-gradient(120% 100% at 20% 10%, rgba(255, 255, 255, 0.12), transparent 60%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.1)),
    var(--paper);
  color: var(--ink);
  transform: translateZ(var(--bd));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* Side walls with the rough phosphorus striker strip */
${s} .mbx-left {
  top: 0; left: 0;
  width: 100%;
  height: var(--bd);
  transform-origin: top center;
  transform: rotateX(-90deg);
  background: var(--paper);
  filter: brightness(0.82);
}
${s} .mbx-right {
  bottom: 0; left: 0;
  width: 100%;
  height: var(--bd);
  transform-origin: bottom center;
  transform: rotateX(90deg);
  background:
    radial-gradient(circle at 3px 3px, rgba(255, 210, 160, 0.22) 1px, transparent 1.5px) 0 0 / 6px 6px,
    radial-gradient(circle at 1px 4px, rgba(20, 8, 4, 0.45) 1px, transparent 1.5px) 0 0 / 5px 5px,
    linear-gradient(to right, var(--paper) 0%, var(--paper) 8%, #5e291e 8%, #471d14 92%, var(--paper) 92%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
}
${s} .mbx-back {
  top: 0; left: 0;
  width: var(--bd);
  height: 100%;
  transform-origin: center left;
  transform: rotateY(90deg);
  background:
    radial-gradient(circle at 3px 3px, rgba(255, 210, 160, 0.22) 1px, transparent 1.5px) 0 0 / 6px 6px,
    linear-gradient(to bottom, var(--paper) 0%, var(--paper) 10%, #5e291e 10%, #471d14 90%, var(--paper) 90%);
  filter: brightness(0.88);
}

/* ---------- Vintage matchbox label print ---------- */
${s} .mbx-print {
  position: absolute;
  inset: 0;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
}
${s} .mbx-border {
  position: relative;
  flex: 1;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  padding: 8px 11px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 0 2px var(--paper), inset 0 0 0 3px currentColor;
}
${s} .mbx-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border: 1px solid currentColor;
  background: var(--paper);
}
${s} .mbx-corner.tl { top: -1px; left: -1px; }
${s} .mbx-corner.tr { top: -1px; right: -1px; }
${s} .mbx-corner.bl { bottom: -1px; left: -1px; }
${s} .mbx-corner.br { bottom: -1px; right: -1px; }

${s} .mbx-row-top,
${s} .mbx-row-bot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
  transition: opacity 250ms ease;
}
${s} .mbx-stamp {
  padding: 1px 5px;
  border: 1px solid currentColor;
  border-radius: 2px;
  font-size: 8.5px;
}
${s} .mbx-no {
  font-variant-numeric: tabular-nums;
}

${s} .mbx-center {
  text-align: center;
  padding: 2px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
${s} .mbx-emblem {
  color: currentColor;
  opacity: 0.85;
  line-height: 0;
}
${s} .mbx-sleeve-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.12;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
${s}.is-narrow .mbx-sleeve-title {
  font-size: 17px;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
${s} .mbx-sleeve-detail {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.76;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
${s} .mbx-pull {
  color: var(--accent);
  font-size: 9px;
}

/* ---------- Bottom caption & controls bar (elevated pill so it never overlaps) ---------- */
${s} .mbx-bar {
  position: relative;
  z-index: 45;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(250, 247, 239, 0.92);
  border: 1px solid rgba(24, 57, 43, 0.14);
  box-shadow: 0 8px 24px -10px rgba(24, 57, 43, 0.16);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
${s}.is-narrow .mbx-bar {
  border-radius: 18px;
  padding: 12px 14px;
}
${s} .mbx-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  flex: 1 1 200px;
}
${s} .mbx-index {
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: rgba(24, 57, 43, 0.6);
}
${s} .mbx-sep {
  color: rgba(24, 57, 43, 0.35);
}
${s} .mbx-title {
  font-size: 14px;
  font-weight: 700;
  color: #18392b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
${s} .mbx-detail {
  font-size: 12.5px;
  color: rgba(24, 57, 43, 0.72);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

${s} .mbx-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
${s} .mbx-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}
${s} .mbx-dot {
  appearance: none;
  border: 0;
  padding: 0;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(24, 57, 43, 0.22);
  cursor: pointer;
  transition: width 240ms ease, background-color 240ms ease, transform 240ms ease;
}
${s} .mbx-dot:hover {
  background: rgba(24, 57, 43, 0.48);
}
${s} .mbx-dot.is-current {
  width: 22px;
  background: #18392b;
}
${s} .mbx-dot:focus-visible {
  outline: 2px solid #18392b;
  outline-offset: 2px;
}

${s} .mbx-arrows {
  display: flex;
  gap: 6px;
}
${s} .mbx-btn {
  appearance: none;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(24, 57, 43, 0.2);
  background: #ffffff;
  color: #18392b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease, border-color 160ms ease;
}
${s} .mbx-btn:hover:not(:disabled) {
  background: #18392b;
  color: #f6f2e8;
  border-color: #18392b;
}
${s} .mbx-btn:active:not(:disabled) {
  transform: scale(0.95);
}
${s} .mbx-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
${s} .mbx-btn:focus-visible {
  outline: 2px solid #18392b;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  ${s} .mbx-scene,
  ${s} .mbx-slot,
  ${s} .mbx-tray,
  ${s} .mbx-img,
  ${s} .mbx-shadow {
    transition: none !important;
  }
}
`;
}

export default MatchboxCarousel;
