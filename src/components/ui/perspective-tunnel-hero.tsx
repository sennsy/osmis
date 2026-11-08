"use client";

import {
  motion,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";

export interface TunnelImageItem {
  src: string;
  title: string;
  category?: string;
}

export interface PerspectiveTunnelHeroProps {
  images?: TunnelImageItem[];
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  scrollPromptLabel?: string;
  ctaLabel?: string;
  onTunnelComplete?: () => void;
  onExploreClick?: () => void;
  onSelectImage?: (index: number) => void;
}

const DEFAULT_IMAGES: TunnelImageItem[] = [
  { src: "/images/periode_2026_2027_new_card.jpg", title: "OSMIS 2026/2027" },
  { src: "/images/leaders/hariz al-atsary.jpg", title: "Kepemimpinan" },
  { src: "/images/leaders/azzam tsabit.jpg", title: "Kesehatan & Dapur" },
  { src: "/images/leaders/maula.JPG", title: "Ibadah & Ta'mir" },
  { src: "/images/leaders/rozan.jpg", title: "Keamanan" },
  { src: "/images/leaders/yahya.JPG", title: "Kebersihan & Olahraga" },
  { src: "/amn.png", title: "Qism Keamanan" },
  { src: "/ibadah.png", title: "Qism Ibadah" },
  { src: "/bahasa.png", title: "Qism Bahasa" },
];

interface TunnelCardData {
  item: TunnelImageItem;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
}

function buildTunnelCards(items: TunnelImageItem[]): TunnelCardData[] {
  return items.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    const radiusFactorX = 0.28 + (i % 3) * 0.08;
    const radiusFactorY = 0.26 + (i % 2) * 0.09;

    return {
      item,
      angleCos: Math.cos(goldenAngle),
      angleSin: Math.sin(goldenAngle),
      radiusFactorX,
      radiusFactorY,
      rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      index: i,
    };
  });
}

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

interface TunnelCardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: StageDimensions;
  onClick?: () => void;
}

function TunnelCard({
  card,
  progress,
  pointer,
  total,
  stage,
  onClick,
}: TunnelCardProps) {
  const staggerSpan = 0.55;
  const start = (card.index / Math.max(1, total)) * (1 - staggerSpan);
  const end = start + staggerSpan;

  const localProgress = useTransform(progress, [start, end], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

  const opacity = useTransform(
    localProgress,
    [0, 0.18, 0.82, 0.98],
    [0, 1, 1, 0]
  );

  const cardWidth = stage.isMobile
    ? Math.max(135, Math.min(185, stage.width * 0.38))
    : Math.max(185, Math.min(275, stage.width * 0.18));

  const baseX = card.angleCos * (stage.width * card.radiusFactorX);
  const baseY = card.angleSin * (stage.height * card.radiusFactorY);
  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currZ, px, py]: number[]) => {
      const offsetX = baseX - (px ?? 0) * panStrength;
      const offsetY = baseY - (py ?? 0) * panStrength;
      return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
    }
  );

  return (
    <motion.div
      style={{
        width: cardWidth,
        transform,
        opacity,
        zIndex: card.index + 1,
      }}
      onClick={onClick}
      className="pth-tunnel-card"
    >
      <div className="pth-tunnel-card-inner">
        <img
          src={card.item.src}
          alt={card.item.title}
          draggable={false}
          referrerPolicy="no-referrer"
          onContextMenu={(e) => e.preventDefault()}
          onError={(e) => {
            e.currentTarget.src = "/images/periode_2026_2027_new_card.jpg";
          }}
          className="pth-tunnel-card-img"
        />
        <div className="pth-tunnel-card-overlay">
          <span className="pth-tunnel-card-badge">
            {String(card.index + 1).padStart(2, "0")} // {card.item.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function PerspectiveTunnelHero({
  images,
  eyebrow = "ARSIP VISUAL // OSMIS MA’HAD AL-FARUQ",
  titleLine1 = "JELAJAHI",
  titleLine2 = "SELURUH GALERI.",
  subtitle = "Scroll mouse atau usap layar untuk menembus lorong dokumentasi 3D hingga akhir untuk membuka galeri lengkap.",
  scrollPromptLabel = "Scroll untuk Menjelajah",
  ctaLabel = "Buka Galeri Lengkap ↓",
  onTunnelComplete,
  onExploreClick,
  onSelectImage,
}: PerspectiveTunnelHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const completedFiredRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const [stage, setStage] = useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
  });

  const [progressPct, setProgressPct] = useState(0);

  const tunnelCards = useMemo(() => {
    const source =
      images && images.length > 0 ? images.slice(0, 14) : DEFAULT_IMAGES;
    return buildTunnelCards(source);
  }, [images]);

  useEffect(() => {
    const updateDimensions = () => {
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Raw motion value controlled directly by mouse wheel / touch trackpad
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0001,
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const pct = Math.round(Math.min(1, Math.max(0, latest)) * 100);
    setProgressPct(pct);

    if (latest >= 0.96 && !completedFiredRef.current) {
      completedFiredRef.current = true;
      onTunnelComplete?.();
    } else if (latest < 0.85) {
      completedFiredRef.current = false;
    }
  });

  // Handle wheel & touch scrolling locally inside the 100svh viewport container,
  // then seamlessly hand off to page scroll once the tunnel reaches the end (1.0).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const current = rawProgress.get();

      // Scrolling down while inside the tunnel: advance tunnel progress first
      if (e.deltaY > 0 && current < 0.995) {
        e.preventDefault();
        const delta = e.deltaY * 0.00085;
        const next = Math.min(1, Math.max(0, current + delta));
        rawProgress.set(next);
        return;
      }

      // Scrolling up while at the top of the page: rewind tunnel progress
      if (e.deltaY < 0 && current > 0.005 && window.scrollY <= 20) {
        e.preventDefault();
        const delta = e.deltaY * 0.00085;
        const next = Math.min(1, Math.max(0, current + delta));
        rawProgress.set(next);
        return;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY;
      const current = rawProgress.get();

      if (deltaY > 0 && current < 0.995) {
        e.preventDefault();
        const next = Math.min(1, Math.max(0, current + deltaY * 0.0022));
        rawProgress.set(next);
        touchStartYRef.current = currentY;
      } else if (deltaY < 0 && current > 0.005 && window.scrollY <= 20) {
        e.preventDefault();
        const next = Math.min(1, Math.max(0, current + deltaY * 0.0022));
        rawProgress.set(next);
        touchStartYRef.current = currentY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [rawProgress]);

  const pointer = useCameraParallax(!reduce);

  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
  const titleOpacity = useTransform(
    smoothProgress,
    [0, 0.12, 0.82, 0.96],
    [0.25, 1, 1, 0]
  );
  const promptOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const endBridgeOpacity = useTransform(smoothProgress, [0.82, 0.96], [0, 1]);
  const endBridgeY = useTransform(smoothProgress, [0.82, 0.96], [24, 0]);

  const handleSkipOrEnter = () => {
    rawProgress.set(1);
    onTunnelComplete?.();
    onExploreClick?.();
  };

  return (
    <div
      ref={containerRef}
      className="pth-stage-root"
      style={{
        perspective: stage.isMobile ? "900px" : "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      <style>{`
        .pth-stage-root {
          position: relative;
          height: 100svh;
          width: 100%;
          overflow: hidden;
          background-color: var(--bg-color, #f8f6f0);
          color: var(--text-color, #1a1a1a);
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.4s ease, color 0.4s ease;
        }
        .pth-dot-grid {
          pointer-events: none;
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(46, 89, 66, 0.25) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
          opacity: 0.75;
        }
        [data-theme='dark'] .pth-dot-grid {
          background-image: radial-gradient(rgba(0, 255, 136, 0.22) 1px, transparent 1px);
          opacity: 0.65;
        }
        .pth-center-glow {
          pointer-events: none;
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(46, 89, 66, 0.14) 0%, rgba(214, 159, 48, 0.06) 38%, transparent 72%);
        }
        [data-theme='dark'] .pth-center-glow {
          background: radial-gradient(circle at center, rgba(0, 255, 136, 0.16) 0%, rgba(255, 230, 0, 0.05) 38%, transparent 75%);
        }
        .pth-ring-inner {
          pointer-events: none;
          position: absolute;
          height: 48vmin;
          width: 48vmin;
          border-radius: 9999px;
          border: 1px solid rgba(46, 89, 66, 0.18);
        }
        [data-theme='dark'] .pth-ring-inner {
          border-color: rgba(0, 255, 136, 0.14);
        }
        .pth-ring-outer {
          pointer-events: none;
          position: absolute;
          height: 76vmin;
          width: 76vmin;
          border-radius: 9999px;
          border: 1px dashed rgba(46, 89, 66, 0.22);
        }
        [data-theme='dark'] .pth-ring-outer {
          border-color: rgba(255, 255, 255, 0.12);
        }
        .pth-anchor-wrap {
          pointer-events: none;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 1.5rem;
          max-width: 42rem;
        }
        .pth-anchor-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.36em;
          color: var(--osmis-green, #2e5942);
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .pth-anchor-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.94;
          margin: 0;
          background: linear-gradient(180deg, var(--text-color, #1a1a1a) 0%, var(--osmis-green, #2e5942) 65%, rgba(46, 89, 66, 0.45) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        [data-theme='dark'] .pth-anchor-title {
          background: linear-gradient(180deg, #ffffff 0%, #a7f3d0 60%, rgba(0, 255, 136, 0.35) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pth-anchor-subtitle {
          margin-top: 1.1rem;
          max-width: 38ch;
          font-size: clamp(0.88rem, 1.4vw, 1rem);
          font-weight: 400;
          line-height: 1.6;
          color: var(--color-muted-foreground, #56635b);
        }
        .pth-scroll-prompt {
          pointer-events: none;
          position: absolute;
          bottom: 2.2rem;
          z-index: 25;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.55rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: var(--color-muted-foreground, #56635b);
        }
        .pth-scroll-line {
          height: 1.75rem;
          width: 1px;
          background: linear-gradient(to bottom, var(--osmis-green, #2e5942), transparent);
        }
        .pth-z-plane {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transform-style: preserve-3d;
        }
        .pth-tunnel-card {
          pointer-events: auto;
          position: absolute;
          left: 50%;
          top: 50%;
          aspect-ratio: 4 / 5;
          will-change: transform, opacity;
          user-select: none;
          cursor: pointer;
        }
        .pth-tunnel-card-inner {
          position: relative;
          height: 100%;
          width: 100%;
          overflow: hidden;
          border-radius: 1rem;
          background-color: var(--card-bg, rgba(255, 255, 255, 0.4));
          box-shadow: 0 22px 45px -12px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(46, 89, 66, 0.22);
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
        }
        [data-theme='dark'] .pth-tunnel-card-inner {
          background-color: #111827;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .pth-tunnel-card:hover .pth-tunnel-card-inner {
          border-color: var(--osmis-green, #2e5942);
          box-shadow: 0 25px 55px -10px rgba(46, 89, 66, 0.35);
        }
        [data-theme='dark'] .pth-tunnel-card:hover .pth-tunnel-card-inner {
          border-color: var(--osmis-green, #00ff88);
          box-shadow: 0 25px 55px -10px rgba(0, 255, 136, 0.25);
        }
        .pth-tunnel-card-img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pth-tunnel-card:hover .pth-tunnel-card-img {
          transform: scale(1.1);
        }
        .pth-tunnel-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.12) 55%, transparent 100%);
          display: flex;
          align-items: flex-end;
          padding: 1rem 1.15rem;
        }
        .pth-tunnel-card-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
          font-weight: 700;
        }
        .pth-end-bridge {
          position: absolute;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 1.5rem;
        }
        .pth-end-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--osmis-yellow, #d69f30);
          margin-bottom: 0.6rem;
        }
        .pth-end-title {
          font-family: var(--font-display, serif);
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          color: var(--osmis-green, #2e5942);
          margin: 0 0 1.25rem;
        }
        .pth-end-btn {
          font-family: var(--font-mono, monospace);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          border: 1px solid var(--osmis-green, #2e5942);
          background: var(--osmis-green, #2e5942);
          color: #ffffff;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 10px 28px rgba(46, 89, 66, 0.28);
        }
        [data-theme='dark'] .pth-end-btn {
          color: #052e16;
          box-shadow: 0 10px 28px rgba(0, 255, 136, 0.25);
        }
        .pth-end-btn:hover {
          transform: translateY(-2px);
        }
        .pth-hud-bar {
          position: absolute;
          bottom: 1.25rem;
          right: 1.5rem;
          left: 1.5rem;
          z-index: 35;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }
        .pth-progress-pill {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          background: var(--card-bg, rgba(255, 255, 255, 0.65));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          color: var(--text-color, #1a1a1a);
        }
        .pth-progress-track {
          width: 72px;
          height: 4px;
          border-radius: 999px;
          background: rgba(128, 128, 128, 0.25);
          overflow: hidden;
        }
        .pth-progress-fill {
          height: 100%;
          background: var(--osmis-green, #2e5942);
          transition: width 0.12s ease-out;
        }
        .pth-skip-pill {
          pointer-events: auto;
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          background: var(--card-bg, rgba(255, 255, 255, 0.65));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
          color: var(--text-color, #1a1a1a);
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .pth-skip-pill:hover {
          border-color: var(--osmis-green, #2e5942);
        }
        .pth-bottom-fade {
          pointer-events: none;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 90px;
          background: linear-gradient(to bottom, transparent, var(--bg-color, #f8f6f0));
          z-index: 20;
        }
        @media (max-width: 767px) {
          .pth-anchor-wrap {
            padding: 0 1rem;
          }
          .pth-anchor-eyebrow {
            font-size: 0.65rem;
            letter-spacing: 0.2em;
            margin-bottom: 0.65rem;
          }
          .pth-anchor-title {
            font-size: clamp(2rem, 8.5vw, 2.85rem);
            line-height: 1.02;
          }
          .pth-anchor-subtitle {
            font-size: 0.84rem;
            line-height: 1.5;
            margin-top: 0.85rem;
          }
          .pth-scroll-prompt {
            bottom: 4.5rem;
            font-size: 0.62rem;
            letter-spacing: 0.18em;
          }
          .pth-hud-bar {
            bottom: 0.9rem;
            left: 0.85rem;
            right: 0.85rem;
            gap: 0.5rem;
          }
          .pth-progress-pill {
            padding: 0.4rem 0.7rem;
            font-size: 0.62rem;
            gap: 0.45rem;
          }
          .pth-progress-track {
            width: 46px;
          }
          .pth-skip-pill {
            min-height: 36px;
            padding: 0.4rem 0.75rem;
            font-size: 0.62rem;
          }
        }
      `}</style>

      {/* Immersive Background Grid & Glow */}
      <div className="pth-dot-grid" />
      <div className="pth-center-glow" />

      {/* Depth Ring Guides */}
      <div className="pth-ring-inner" />
      <div className="pth-ring-outer" />

      {/* Central Anchor Typography */}
      <motion.div
        style={{ scale: titleScale, opacity: titleOpacity }}
        className="pth-anchor-wrap"
      >
        <p className="pth-anchor-eyebrow">{eyebrow}</p>
        <h1 className="pth-anchor-title">
          {titleLine1}
          <br />
          {titleLine2}
        </h1>
        <p className="pth-anchor-subtitle">{subtitle}</p>
      </motion.div>

      {/* End-of-Tunnel Bridge connecting directly into the Full Gallery Menu */}
      <motion.div
        style={{
          opacity: endBridgeOpacity,
          y: endBridgeY,
          pointerEvents: progressPct >= 85 ? "auto" : "none",
        }}
        className="pth-end-bridge"
      >
        <span className="pth-end-eyebrow">LORONG SELESAI // 100%</span>
        <h2 className="pth-end-title">{titleLine2}</h2>
        <button
          type="button"
          onClick={handleSkipOrEnter}
          className="pth-end-btn"
        >
          {ctaLabel}
        </button>
      </motion.div>

      {/* Scroll Prompt */}
      <motion.div
        style={{ opacity: promptOpacity }}
        className="pth-scroll-prompt"
      >
        <span>{scrollPromptLabel}</span>
        <div className="pth-scroll-line" />
      </motion.div>

      {/* 3D Z-Space Plane */}
      <div className="pth-z-plane">
        {tunnelCards.map((card, i) => (
          <TunnelCard
            key={`${card.item.src}-${i}`}
            card={card}
            progress={smoothProgress}
            pointer={pointer}
            total={tunnelCards.length}
            stage={stage}
            onClick={() => onSelectImage?.(i)}
          />
        ))}
      </div>

      {/* Subtle Bottom Progress & Skip HUD */}
      <div className="pth-hud-bar">
        <div className="pth-progress-pill">
          <span>TUNNEL {progressPct}%</span>
          <div className="pth-progress-track">
            <div
              className="pth-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkipOrEnter}
          className="pth-skip-pill"
        >
          {ctaLabel}
        </button>
      </div>

      {/* Seamless Bottom Fade into the Full Gallery Archive */}
      <div className="pth-bottom-fade" />
    </div>
  );
}

export default PerspectiveTunnelHero;
