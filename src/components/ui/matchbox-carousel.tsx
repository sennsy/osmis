"use client";
import * as React from "react";

/**
 * MatchboxCarousel: each item is a matchbox lying on a table, its title printed on
 * the sleeve. The open box's tray slides out to show the picture inside. Moving on
 * closes the tray, the boxes shuffle along, and the next tray opens.
 *
 * Wide containers lay the boxes sideways and the tray slides right; narrow ones
 * stand them up so the tray slides towards you and the picture stays large.
 * Buttons, arrow keys, swipe and clicking a neighbouring box all move it. Autoplay
 * waits while hovered, focused, off screen or in a hidden tab. Reduced motion:
 * no sliding, the picture simply changes. Pure CSS 3D: no canvas, no WebGL.
 */
export type MatchboxItem = {
  /** Picture inside the tray. */
  src?: string;
  /** Optional rich content inside the tray (e.g. structure text or photo + structure). */
  content?: React.ReactNode;
  alt?: string;
  /** Printed large on the sleeve. */
  title: string;
  /** Small line under the title, such as a year or discipline. */
  detail?: string;
  /** Where the open picture links to. */
  href?: string;
  /** Sleeve colour. Text on it turns dark or light to stay readable. */
  tint?: string;
};

export type MatchboxCarouselProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  items: MatchboxItem[];
  /** Camera angle over the table. */
  view?: "flat" | "angle" | "low";
  /** Table colour behind the boxes. */
  table?: string;
  /** Colour of the counter and buttons. */
  ink?: string;
  autoplay?: boolean;
  /** Seconds between moves when autoplaying. */
  interval?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  showControls?: boolean;
  /** Accessible name for the carousel. */
  label?: string;
};

const TINTS = ["#163828", "#C8553D", "#2F4B7C", "#D49B35", "#5A7D5A", "#1F1D1B", "#3E8A95"];
const CLOSE = 380;
const SHIFT = 560;
const OPEN = 620;
const EASE = "cubic-bezier(.32,.08,.18,1)";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Signed place of item i relative to the open box. */
const offset = (i: number, at: number, N: number, half: number) => {
  const k = mod(i - at, N);
  return k > N - 1 - half ? k - N : k;
};
const useIso = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function MatchboxCarousel({
  items,
  view = "angle",
  table = "#E8E2D5",
  ink = "#1C2820",
  autoplay = false,
  interval = 5,
  defaultIndex = 0,
  onIndexChange,
  showControls = true,
  label = "Projects",
  className,
  style,
  onKeyDown,
  ...rest
}: MatchboxCarouselProps) {
  const N = items.length;
  const root = React.useRef<HTMLDivElement>(null);
  const scope = "mbx" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [box, setBox] = React.useState({ w: 1360, h: 820 });
  const [calm, setCalm] = React.useState(false);
  const [index, setIndex] = React.useState(() => mod(defaultIndex, Math.max(1, N)));
  const [seq, setSeq] = React.useState(0);
  // What the table shows lags the index: the tray closes, the row moves, then the new tray opens.
  const [pos, setPos] = React.useState({ shown: index, from: index });
  const [open, setOpen] = React.useState(true);
  const [moving, setMoving] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const busyUntil = React.useRef(0);
  const indexRef = React.useRef(index);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useIso(() => {
    const el = root.current;
    if (!el) return;
    const read = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
    };
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setCalm(q.matches);
    read();
    q.addEventListener("change", read);
    return () => q.removeEventListener("change", read);
  }, []);

  const go = React.useCallback(
    (dir: number, to?: number) => {
      if (N < 2) return;
      const busy = calm ? 300 : CLOSE + SHIFT + OPEN * 0.6;
      // A press during a move waits for it instead of cutting it short.
      const wait = Math.max(0, busyUntil.current - Date.now());
      const run = () => {
        const n = mod(to ?? indexRef.current + dir, N);
        if (n === indexRef.current) return;
        busyUntil.current = Date.now() + busy;
        indexRef.current = n;
        setIndex(n);
        setSeq((s) => s + 1);
        onIndexChange?.(n);
        const land = () => setPos((p) => ({ shown: n, from: p.shown }));
        if (calm) return land();
        setOpen(false);
        timers.current.push(
          setTimeout(() => {
            setMoving(true);
            land();
          }, CLOSE),
          setTimeout(() => {
            setMoving(false);
            setOpen(true);
          }, CLOSE + SHIFT)
        );
      };
      if (wait > 0 && wait < busy) setTimeout(run, wait);
      else run();
    },
    [N, calm, onIndexChange]
  );
  const next = React.useCallback(() => go(1), [go]);
  const prev = React.useCallback(() => go(-1), [go]);

  React.useEffect(() => {
    if (!autoplay) return;
    const el = root.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting && e.intersectionRatio > 0.35), {
        threshold: [0, 0.35, 0.6],
      });
      io.observe(el);
    } else setSeen(true);
    const vis = () => setHidden(document.visibilityState === "hidden");
    vis();
    document.addEventListener("visibilitychange", vis);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [autoplay]);

  React.useEffect(() => {
    if (!autoplay || held || !seen || hidden || N < 2) return;
    const t = setTimeout(next, clamp(interval, 1.5, 20) * 1000);
    return () => clearTimeout(t);
  }, [autoplay, interval, held, seen, hidden, seq, N, next]);

  const g = layout(box.w, box.h, view);
  const drag = useDrag({ onNext: next, onPrev: prev, reach: g.P, enabled: N > 1 });
  const half = Math.floor((N - 1) / 2);
  const current = items[index];

  const boxes = items.map((it, i) => {
    const k = offset(i, pos.shown, N, half);
    // Boxes wrapping round from one end to the other jump instead of sliding across.
    const jump = Math.abs(offset(i, pos.from, N, half) - k) > 1;
    const active = k === 0;
    const amount = open ? 1 : 0;
    // Sideways boxes push their right-hand neighbours along to make room for the tray.
    const x = g.x0 + k * g.P + (!g.up && k > 0 ? g.slide * amount : 0) + drag.offset;
    const far = Math.abs(k) > 2;
    const tint = it.tint || TINTS[i % TINTS.length];
    const out = active ? g.slide * amount : 0;
    const speed = active && !open ? CLOSE : OPEN;
    return (
      <div
        key={i}
        role="group"
        aria-roledescription="slide"
        aria-label={`${i + 1} of ${N}: ${it.title}`}
        aria-hidden={!active}
        onClick={() => !active && !drag.wasDrag() && go(k > 0 ? 1 : -1, i)}
        className={active ? "mbx-box mbx-on" : "mbx-box"}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: g.bw,
          height: g.bd,
          transformStyle: "preserve-3d",
          transform: `translate3d(${x - g.bw / 2}px, ${g.y0 - g.bd / 2}px, 0)`,
          transition: jump || drag.offset ? "none" : `transform ${moving ? SHIFT : OPEN}ms ${EASE}, opacity .4s`,
          opacity: far ? 0 : 1,
          cursor: active ? "default" : "pointer",
          pointerEvents: far ? "none" : "auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -g.bw * 0.05,
            top: -g.bd * 0.02,
            width: g.bw * 1.1 + (g.up ? 0 : out),
            height: g.bd * 1.08 + (g.up ? out : 0),
            borderRadius: g.m * 0.04,
            background: "rgba(48,32,18,.30)",
            filter: `blur(${g.m * 0.035}px)`,
            transform: `translateZ(0.5px) translate(${g.bw * 0.02}px, ${g.bd * 0.05}px)`,
            transition: `width ${speed}ms ${EASE}, height ${speed}ms ${EASE}`,
          }}
        />
        <Tray g={g} it={it} out={out} speed={speed} active={active} wasDrag={drag.wasDrag} />
        <Sleeve g={g} it={it} n={i + 1} tint={tint} />
      </div>
    );
  });

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      className={[scope, className].filter(Boolean).join(" ")}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
        }
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
      {...drag.bind}
      {...rest}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: box.w < 640 ? "3 / 4.6" : "16 / 9.2",
        minHeight: box.w < 640 ? 640 : 760,
        overflow: "hidden",
        background: table,
        borderRadius: 24,
        border: "1px solid rgba(22, 56, 40, 0.16)",
        boxShadow: "0 20px 60px rgba(20, 32, 24, 0.10)",
        touchAction: "pan-y",
        userSelect: "none",
        fontFamily: "inherit",
        ...style,
      }}
    >
      <style>{css(scope)}</style>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(90% 70% at 50% 42%, rgba(255,255,255,.32), transparent 70%), radial-gradient(140% 100% at 50% 50%, transparent 55%, rgba(60,40,20,.14))",
        }}
      />
      <div style={{ position: "absolute", inset: 0, perspective: g.persp, perspectiveOrigin: "50% 20%" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: g.cy,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `rotateX(${g.tilt}deg)`,
          }}
        >
          {boxes}
        </div>
      </div>
      {showControls && N > 1 ? (
        <div
          style={{
            position: "absolute",
            zIndex: 5,
            left: "50%",
            bottom: Math.max(14, box.h * 0.035),
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: ink,
            background: "rgba(250, 246, 238, 0.86)",
            backdropFilter: "blur(8px)",
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid rgba(28, 40, 32, 0.14)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.04em",
              marginRight: 4,
              whiteSpace: "nowrap",
            }}
          >
            {String(index + 1).padStart(2, "0")}{" "}
            <span style={{ opacity: 0.45 }}>/ {String(N).padStart(2, "0")}</span>
          </span>
          {current ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#163828",
                paddingRight: 6,
                borderRight: "1px solid rgba(28, 40, 32, 0.18)",
                whiteSpace: "nowrap",
              }}
            >
              {current.title}
            </span>
          ) : null}
          <Arrow dir={-1} onClick={prev} />
          <Arrow dir={1} onClick={next} />
        </div>
      ) : null}
      <div className="mbx-sr" aria-live="polite">
        {current ? `${current.title}, ${index + 1} of ${N}` : ""}
      </div>
    </div>
  );
}

export default MatchboxCarousel;

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button type="button" className="mbx-btn" aria-label={dir < 0 ? "Previous" : "Next"} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ transform: dir < 0 ? "none" : "scaleX(-1)" }}>
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

type G = ReturnType<typeof layout>;

/** Box size and spacing from the container — scaled up so the open tray is large and easy to read on desktop. */
function layout(W: number, H: number, view: string) {
  const tilt = view === "flat" ? 0 : view === "low" ? 48 : 14;
  const up = W / H < 0.88;
  const fore = Math.cos((tilt * Math.PI) / 180);
  let bw: number, bd: number;
  if (up) {
    bd = Math.max(120, Math.min((H * 0.78) / (1.92 * fore), (W * 0.88) / 0.74));
    bw = bd * 0.74;
  } else {
    bw = Math.max(160, Math.min(W * 0.46, (H * 0.82) / 0.78, (W * 0.94) / 1.92));
    bd = bw * 0.78;
  }
  const m = Math.max(bw, bd);
  const slide = m * 0.95;
  return {
    up,
    bw,
    bd,
    m,
    t: m * 0.16,
    slide,
    P: bw * 1.14,
    x0: up ? W / 2 : W / 2 - slide / 2,
    y0: up ? -slide / 2 : 0,
    cy: H * (up ? 0.43 : 0.44),
    tilt,
    persp: Math.max(W, H) * 2.4,
    e: Math.max(1.5, m * 0.012),
  };
}

function Sleeve({ g, it, n, tint }: { g: G; it: MatchboxItem; n: number; tint: string }) {
  const ink = readable(tint);
  const short = Math.min(g.bw, g.bd);
  const pad = short * 0.09;
  const small = Math.max(10, short * 0.056);
  const title = Math.min(g.bd * 0.22, short * 0.27, (g.bw * 1.38) / Math.max(4, it.title.length + 1));
  const side = shade(tint, -0.18);
  return (
    <>
      {g.up ? (
        // Standing up, the end facing us is the open mouth of the sleeve.
        <div
          style={{
            position: "absolute",
            left: 0,
            top: g.bd,
            width: g.bw,
            height: g.t,
            transformOrigin: "50% 0",
            transform: `translateZ(${g.t}px) rotateX(-90deg)`,
            boxSizing: "border-box",
            border: `${g.e}px solid ${side}`,
            borderBottom: "none",
            backfaceVisibility: "hidden",
          }}
        />
      ) : (
        // Lying sideways, the long side facing us carries the striker.
        <div
          style={{
            position: "absolute",
            left: 0,
            top: g.bd,
            width: g.bw,
            height: g.t,
            transformOrigin: "50% 0",
            transform: `translateZ(${g.t}px) rotateX(-90deg)`,
            background: side,
            backfaceVisibility: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: g.bw * 0.03,
              right: g.bw * 0.03,
              top: "22%",
              bottom: "22%",
              borderRadius: 2,
              background: "#5A4232",
              backgroundImage:
                "radial-gradient(rgba(255,255,255,.18) 0.6px, transparent 0.8px), radial-gradient(rgba(0,0,0,.35) 0.6px, transparent 0.8px)",
              backgroundSize: "3px 3px, 4px 4px",
              backgroundPosition: "0 0, 1px 2px",
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${g.t}px)`,
          background: `linear-gradient(160deg, ${shade(tint, 0.08)}, ${tint} 45%, ${shade(tint, -0.08)})`,
          color: ink,
          borderRadius: g.m * 0.006,
          padding: pad,
          boxSizing: "border-box",
          overflow: "hidden",
          boxShadow: `inset 0 ${Math.max(1, g.m * 0.003)}px 0 rgba(255,255,255,.18)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: pad * 0.55,
            border: `1px solid ${ink}`,
            opacity: 0.38,
            borderRadius: g.m * 0.004,
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: small * 0.92,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            <span>ARSIP · NO. {String(n).padStart(2, "0")}</span>
            <span
              style={{
                width: short * 0.15,
                height: short * 0.15,
                borderRadius: "50%",
                border: `1px solid ${ink}`,
                display: "grid",
                placeItems: "center",
                fontSize: short * 0.068,
                letterSpacing: 0,
                opacity: 0.9,
              }}
            >
              {String(n)}
            </span>
          </div>
          <div
            style={{
              fontSize: title,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {it.title}
          </div>
          <div
            style={{
              fontSize: small,
              letterSpacing: "0.04em",
              fontWeight: 600,
              opacity: 0.88,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {it.detail}
          </div>
        </div>
      </div>
    </>
  );
}

function Tray({
  g,
  it,
  out,
  speed,
  active,
  wasDrag,
}: {
  g: G;
  it: MatchboxItem;
  out: number;
  speed: number;
  active: boolean;
  wasDrag: () => boolean;
}) {
  const e = g.e;
  const tw = g.bw - e * 2;
  const td = g.bd - e * 2;
  // Low walls keep the bottom of the picture in view.
  const th = g.t * 0.62;
  const paper = "#F2EDE5";
  const inner = "#E3DACB";
  return (
    <div
      className="mbx-tray"
      style={{
        position: "absolute",
        left: e,
        top: e,
        width: tw,
        height: td,
        transformStyle: "preserve-3d",
        transform: g.up ? `translate3d(0, ${out}px, 0)` : `translate3d(${out}px, 0, 0)`,
        transition: `transform ${speed}ms ${EASE}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${e}px)`,
          background: inner,
          overflow: "hidden",
        }}
      >
        {it.content ? (
          <div
            className="mbx-tray-scroll"
            onWheel={(ev) => ev.stopPropagation()}
            style={{
              position: "absolute",
              inset: e * 0.6,
              width: `calc(100% - ${e * 1.2}px)`,
              height: `calc(100% - ${e * 1.2}px)`,
              boxSizing: "border-box",
              background: "#FAF6EE",
              color: "#1E1B18",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {it.content}
          </div>
        ) : it.src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src}
              alt={it.alt ?? it.title}
              draggable={false}
              decoding="async"
              referrerPolicy="no-referrer"
              style={{
                position: "absolute",
                inset: e * 0.6,
                width: `calc(100% - ${e * 1.2}px)`,
                height: `calc(100% - ${e * 1.2}px)`,
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(rgba(40,26,14,.28), transparent 16%), linear-gradient(90deg, rgba(40,26,14,.16), transparent 5%, transparent 95%, rgba(40,26,14,.16))",
              }}
            />
          </>
        ) : null}
        {active && it.href ? (
          <a
            className="mbx-link"
            href={it.href}
            aria-label={[it.title, it.detail].filter(Boolean).join(", ")}
            onClick={(ev) => wasDrag() && ev.preventDefault()}
            draggable={false}
          />
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: tw,
          height: th,
          transformOrigin: "50% 0",
          transform: "rotateX(-90deg)",
          background: `linear-gradient(${shade(inner, -0.12)}, ${inner})`,
          backfaceVisibility: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: tw,
          top: 0,
          width: th,
          height: td,
          transformOrigin: "0 50%",
          transform: "rotateY(-90deg)",
          background: `linear-gradient(90deg, ${shade(inner, -0.22)}, ${shade(inner, -0.1)})`,
          backfaceVisibility: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: th,
          height: td,
          transformOrigin: "0 50%",
          transform: `translateZ(${th}px) rotateY(90deg)`,
          background: `linear-gradient(90deg, ${shade(inner, -0.1)}, ${shade(inner, -0.22)})`,
          backfaceVisibility: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: td,
          width: tw,
          height: th,
          transformOrigin: "50% 0",
          transform: `translateZ(${th}px) rotateX(-90deg)`,
          background: `linear-gradient(${paper}, ${shade(paper, -0.06)})`,
          backfaceVisibility: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: td - e,
          width: tw,
          height: e,
          transform: `translateZ(${th}px)`,
          background: shade(paper, 0.4),
        }}
      />
    </div>
  );
}

/** A drag that follows the finger; past a third of `reach`, or a flick, it moves on. */
function useDrag(o: { onNext: () => void; onPrev: () => void; reach: number; enabled: boolean }) {
  const [d, setD] = React.useState(0);
  const start = React.useRef<{ x: number; y: number; t: number; id: number; locked: boolean | null } | null>(null);
  const moved = React.useRef(false);
  const end = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || s.id !== e.pointerId) return;
    const delta = e.clientX - s.x;
    const v = delta / Math.max(1, Date.now() - s.t);
    setD(0);
    if (!s.locked) return;
    if (delta < -o.reach / 3 || v < -0.5) o.onNext();
    else if (delta > o.reach / 3 || v > 0.5) o.onPrev();
  };
  return {
    offset: d,
    wasDrag: () => moved.current,
    bind: !o.enabled
      ? {}
      : {
          onPointerDown: (e: React.PointerEvent) => {
            if (e.button !== 0) return;
            const targetEl = e.target as HTMLElement | null;
            if (targetEl?.closest(".mbx-tray-scroll")) return;
            start.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId, locked: null };
            moved.current = false;
          },
          onPointerMove: (e: React.PointerEvent) => {
            const s = start.current;
            if (!s || s.id !== e.pointerId) return;
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (s.locked === null && Math.hypot(dx, dy) > 6) {
              // Only take over sideways drags, so the page still scrolls.
              s.locked = Math.abs(dx) > Math.abs(dy);
              if (s.locked) {
                moved.current = true;
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch {}
              } else start.current = null;
            }
            if (s.locked) setD(dx);
          },
          onPointerUp: end,
          onPointerCancel: end,
        },
  };
}

/** Near-black or near-white, whichever reads on the sleeve. */
function readable(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#FBF8F3";
  const n = parseInt(m[1], 16);
  const l = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return l > 0.6 ? "#1E1B18" : "#FBF8F3";
}

/** Lighten (positive) or darken (negative) a hex colour. */
function shade(hex: string, k: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(clamp(k >= 0 ? v + (255 - v) * k : v * (1 + k), 0, 255))
  );
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const css = (s: string) => `
.${s}{outline:none;-webkit-tap-highlight-color:transparent}
.${s}:focus-visible{box-shadow:inset 0 0 0 2px #163828}
.${s} .mbx-btn{all:unset;box-sizing:border-box;width:38px;height:38px;border-radius:50%;border:1px solid currentColor;display:grid;place-items:center;cursor:pointer;opacity:.82;transition:opacity .2s,transform .2s}
.${s} .mbx-btn:hover{opacity:1;transform:scale(1.06)}
.${s} .mbx-btn:active{transform:scale(.96)}
.${s} .mbx-btn:focus-visible{opacity:1;box-shadow:0 0 0 2px #163828}
.${s} .mbx-link{position:absolute;inset:0;z-index:2}
.${s} .mbx-link:focus-visible{box-shadow:inset 0 0 0 2px #163828}
.${s} .mbx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.${s} img{-webkit-user-drag:none;user-select:none}
.${s} .mbx-box:not(.mbx-on):hover .mbx-tray{transform:translate3d(6%,0,0)!important}
.${s} .mbx-tray-scroll::-webkit-scrollbar{width:6px}
.${s} .mbx-tray-scroll::-webkit-scrollbar-track{background:rgba(22,56,40,.06)}
.${s} .mbx-tray-scroll::-webkit-scrollbar-thumb{background:rgba(22,56,40,.35);border-radius:4px}
@media (prefers-reduced-motion: reduce){.${s} .mbx-box:not(.mbx-on):hover .mbx-tray{transform:none!important}.${s} *{transition-duration:0s!important}}
`;
