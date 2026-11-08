"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Maximize2, ClipboardList, Sparkles } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type CoffeeVessel = "demitasse" | "glass-mug" | "cup" | "tall-glass";
export type CoffeeLiquid = "espresso" | "water" | "milk";

export interface CoffeeLayer {
  type: CoffeeLiquid;
  amount: number;
}

export interface CoffeeItem {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  vessel: CoffeeVessel;
  layers: CoffeeLayer[];
  crema?: boolean;
  foam?: number;
  art?: "heart" | "none";
  blend?: number;
  /** Portrait image for Pengurus Inti */
  image?: string;
  /** Badge label e.g. "BPH INTI #01" */
  badgeText?: string;
  /** CTA label to view work programs */
  actionLabel?: string;
  /** Callback to open work programs modal */
  onActionClick?: () => void;
  /** Callback to zoom portrait photo */
  onImageClick?: () => void;
}

export interface CoffeePourMenuProps {
  items?: CoffeeItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}

export const DEFAULT_COFFEE_ITEMS: CoffeeItem[] = [
  {
    id: "ketua",
    name: "Ketua OSMIS",
    subtitle: "BPH INTI #01",
    vessel: "cup",
    layers: [{ type: "espresso", amount: 0.7 }],
    image: "/logo_utama.png",
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export function CoffeePourMenu({
  items = DEFAULT_COFFEE_ITEMS,
  defaultValue,
  value,
  onValueChange,
  className,
}: CoffeePourMenuProps) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.id);
  const selectedId = value ?? inner;
  const selectedIndex = Math.max(
    0,
    items.findIndex((i) => i.id === selectedId)
  );
  const selected = items[selectedIndex] ?? items[0];
  const reduce = useReducedMotion() ?? false;
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const btns = React.useRef<(HTMLButtonElement | null)[]>([]);

  const select = (itemId: string) => {
    if (itemId === selectedId) return;
    if (value === undefined) setInner(itemId);
    onValueChange?.(itemId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = items.findIndex((it) => it.id === selectedId);
    let n = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % items.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      n = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = items.length - 1;
    if (n < 0) return;
    e.preventDefault();
    select(items[n].id);
    btns.current[n]?.focus();
  };

  return (
    <div className={`cpm-root ${className ?? ""}`}>
      <style>{`
        .cpm-root {
          position: relative;
          display: grid;
          width: 100%;
          align-items: center;
          gap: 1.5rem;
          border-radius: 0;
          background: transparent;
          padding: 0.5rem 0;
          color: #173826;
          box-shadow: none;
          border: none;
          overflow: visible;
        }
        [data-theme='dark'] .cpm-root {
          background: transparent;
          color: #ecfdf5;
          border: none;
          box-shadow: none;
        }
        @media (min-width: 768px) {
          .cpm-root {
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            gap: 2.5rem;
            padding: 1rem 0;
          }
        }
        .cpm-menu-list {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 0.6rem;
        }
        @media (min-width: 640px) {
          .cpm-menu-list {
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
          }
        }
        .cpm-menu-btn {
          position: relative;
          border-radius: 20px;
          padding: 0.95rem 1.1rem;
          text-align: left;
          outline: none;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        @media (min-width: 640px) {
          .cpm-menu-btn {
            padding: 1.05rem 1.4rem;
          }
        }
        .cpm-menu-btn:focus-visible {
          box-shadow: 0 0 0 2px #d69f30;
        }
        .cpm-active-pill {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 253, 244, 0.95) 0%, rgba(247, 239, 208, 0.92) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 0 0 1.5px rgba(214, 159, 48, 0.55),
            0 12px 28px -12px rgba(23, 56, 38, 0.28);
          pointer-events: none;
        }
        [data-theme='dark'] .cpm-active-pill {
          background: linear-gradient(135deg, rgba(24, 62, 43, 0.95) 0%, rgba(42, 58, 24, 0.92) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 0 0 1.5px rgba(234, 179, 8, 0.55),
            0 14px 30px -12px rgba(0, 0, 0, 0.55);
        }
        .cpm-btn-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .cpm-avatar-wrap {
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #d69f30;
          background: #2e5942;
          box-shadow: 0 4px 12px rgba(23, 56, 38, 0.22);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .cpm-menu-btn[aria-checked="true"] .cpm-avatar-wrap {
          border-color: #2e5942;
          box-shadow: 0 0 0 2px #d69f30, 0 6px 16px rgba(23, 56, 38, 0.28);
          transform: scale(1.05);
        }
        [data-theme='dark'] .cpm-menu-btn[aria-checked="true"] .cpm-avatar-wrap {
          border-color: #fbbf24;
        }
        .cpm-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }
        .cpm-text-col {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
        }
        .cpm-badge-line {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b88214;
          margin-bottom: 0.15rem;
        }
        [data-theme='dark'] .cpm-badge-line {
          color: #fbbf24;
        }
        .cpm-item-name {
          font-family: var(--font-display, serif);
          font-size: clamp(1.15rem, 2.2vw, 1.72rem);
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.02em;
          transition: color 0.25s ease;
          color: rgba(23, 56, 38, 0.52);
        }
        [data-theme='dark'] .cpm-item-name {
          color: rgba(236, 253, 245, 0.48);
        }
        .cpm-menu-btn:hover .cpm-item-name {
          color: rgba(23, 56, 38, 0.82);
        }
        [data-theme='dark'] .cpm-menu-btn:hover .cpm-item-name {
          color: rgba(236, 253, 245, 0.82);
        }
        .cpm-item-name[data-active="true"] {
          color: #173826;
        }
        [data-theme='dark'] .cpm-item-name[data-active="true"] {
          color: #ffffff;
        }
        .cpm-item-sub {
          margin-top: 0.22rem;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: color 0.25s ease;
          color: rgba(46, 89, 66, 0.68);
        }
        [data-theme='dark'] .cpm-item-sub {
          color: rgba(167, 243, 208, 0.65);
        }
        .cpm-item-sub[data-active="true"] {
          color: #2e5942;
        }
        [data-theme='dark'] .cpm-item-sub[data-active="true"] {
          color: #34d399;
        }

        /* Right Stage: Green & Gold Individual Portrait Stage */
        .cpm-stage-wrap {
          position: relative;
          z-index: 2;
          aspect-ratio: 9 / 10;
          width: 100%;
          overflow: hidden;
          border-radius: 26px;
          background: radial-gradient(
            82% 68% at 50% 44%,
            #fffdf4 0%,
            #eff7f1 42%,
            #d6eadf 76%,
            #c2dfce 100%
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.85),
            inset 0 0 0 1.5px rgba(214, 159, 48, 0.35),
            0 28px 56px -26px rgba(23, 56, 38, 0.45);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        [data-theme='dark'] .cpm-stage-wrap {
          background: radial-gradient(
            82% 68% at 50% 44%,
            #1c4532 0%,
            #122e21 48%,
            #0b1f16 82%,
            #07150f 100%
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 0 0 1.5px rgba(234, 179, 8, 0.35),
            0 28px 56px -24px rgba(0, 0, 0, 0.75);
        }
        .cpm-stage-rings {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cpm-stage-ring-1 {
          position: absolute;
          width: 74%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1px dashed rgba(214, 159, 48, 0.45);
        }
        .cpm-stage-ring-2 {
          position: absolute;
          width: 56%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1px solid rgba(46, 89, 66, 0.22);
        }
        [data-theme='dark'] .cpm-stage-ring-2 {
          border-color: rgba(52, 211, 153, 0.22);
        }
        .cpm-stage-floor {
          position: absolute;
          bottom: -8%;
          left: 50%;
          transform: translateX(-50%);
          width: 82%;
          height: 24%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(214, 159, 48, 0.32) 0%,
            rgba(46, 89, 66, 0.18) 52%,
            transparent 76%
          );
          filter: blur(8px);
          pointer-events: none;
        }

        /* Top bar on stage */
        .cpm-stage-card {
          position: relative;
          z-index: 10;
          margin: 14px 14px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.65rem 0.9rem;
          border-radius: 16px;
          background: rgba(255, 253, 245, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(214, 159, 48, 0.42);
          box-shadow: 0 8px 20px rgba(23, 56, 38, 0.1);
        }
        [data-theme='dark'] .cpm-stage-card {
          background: rgba(13, 36, 25, 0.86);
          border-color: rgba(234, 179, 8, 0.4);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        }
        .cpm-stage-person {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }
        .cpm-stage-logo {
          width: 36px;
          height: 36px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .cpm-stage-meta {
          min-width: 0;
        }
        .cpm-stage-role {
          font-family: var(--font-mono, monospace);
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b88214;
          display: block;
        }
        [data-theme='dark'] .cpm-stage-role {
          color: #fbbf24;
        }
        .cpm-stage-name {
          font-weight: 700;
          font-size: 0.88rem;
          color: #173826;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        [data-theme='dark'] .cpm-stage-name {
          color: #ecfdf5;
        }
        .cpm-stage-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }
        .cpm-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.48rem 0.85rem;
          border-radius: 999px;
          border: 1px solid #d69f30;
          background: linear-gradient(135deg, #2e5942 0%, #1d3c2b 100%);
          color: #fef9c3;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(46, 89, 66, 0.28);
        }
        .cpm-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(214, 159, 48, 0.35);
        }

        /* Full-Bleed Individual Portrait Showcase */
        .cpm-portrait-stage {
          position: absolute;
          inset: 0;
          z-index: 4;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .cpm-portrait-card {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 26px;
          padding: 0;
          background: #173826;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
        }
        .cpm-portrait-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 26px;
          overflow: hidden;
          background: #173826;
        }
        .cpm-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 18%;
          display: block;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cpm-portrait-card:hover .cpm-portrait-img {
          transform: scale(1.04);
        }
        .cpm-portrait-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(12, 32, 22, 0.92) 0%,
            rgba(12, 32, 22, 0.42) 34%,
            transparent 62%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem 1.4rem 1.35rem;
          color: #ffffff;
        }
        .cpm-portrait-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          align-self: flex-start;
          padding: 0.24rem 0.7rem;
          border-radius: 999px;
          background: rgba(214, 159, 48, 0.92);
          color: #173826;
          font-family: var(--font-mono, monospace);
          font-size: 0.64rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .cpm-portrait-title {
          font-family: var(--font-display, serif);
          font-size: clamp(1.35rem, 2.3vw, 1.75rem);
          font-weight: 700;
          line-height: 1.15;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
          padding-right: 3rem;
        }
        .cpm-portrait-role {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 700;
          color: #fde68a;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 0.28rem;
        }
        .cpm-zoom-pill {
          position: absolute;
          bottom: 1.35rem;
          right: 1.35rem;
          z-index: 6;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(23, 56, 38, 0.82);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(214, 159, 48, 0.75);
          color: #fef08a;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        }
        .cpm-portrait-card:hover .cpm-zoom-pill {
          transform: scale(1.1);
          background: #d69f30;
          color: #173826;
        }
        .cpm-sr-only {
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
        @media (max-width: 767px) {
          .cpm-root {
            gap: 1.15rem;
            padding: 0.25rem 0;
          }
          .cpm-menu-list {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
          }
          .cpm-menu-btn {
            padding: 0.75rem 0.9rem;
            border-radius: 16px;
            min-height: 64px;
          }
          .cpm-active-pill {
            border-radius: 16px;
          }
          .cpm-btn-inner {
            gap: 0.75rem;
          }
          .cpm-avatar-wrap {
            width: 44px;
            height: 44px;
          }
          .cpm-badge-line {
            font-size: 0.62rem;
            letter-spacing: 0.1em;
          }
          .cpm-item-name {
            font-size: 1.05rem;
            line-height: 1.2;
          }
          .cpm-item-sub {
            font-size: 0.7rem;
          }
          .cpm-stage-wrap {
            aspect-ratio: 4 / 5;
            border-radius: 20px;
          }
          .cpm-portrait-card,
          .cpm-portrait-inner {
            border-radius: 20px;
          }
          .cpm-stage-card {
            margin: 10px 10px 0;
            padding: 0.55rem 0.75rem;
            border-radius: 14px;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .cpm-stage-person {
            flex: 1 1 140px;
            min-width: 0;
          }
          .cpm-stage-logo {
            width: 28px;
            height: 28px;
          }
          .cpm-stage-role {
            font-size: 0.58rem;
          }
          .cpm-stage-name {
            font-size: 0.8rem;
          }
          .cpm-stage-actions {
            width: 100%;
            justify-content: stretch;
          }
          .cpm-action-btn {
            width: 100%;
            justify-content: center;
            min-height: 38px;
            padding: 0.45rem 0.75rem;
            font-size: 0.65rem;
          }
          .cpm-portrait-overlay {
            padding: 1.15rem 1rem 1rem;
          }
          .cpm-portrait-title {
            font-size: 1.2rem;
            padding-right: 2.75rem;
          }
          .cpm-portrait-role {
            font-size: 0.68rem;
          }
          .cpm-zoom-pill {
            bottom: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      {/* Left Menu: Pengurus Inti List */}
      <div
        role="radiogroup"
        aria-label="Menu Bagian Inti"
        onKeyDown={onKeyDown}
        className="cpm-menu-list"
      >
        {items.map((it, i) => {
          const active = it.id === selected?.id;
          return (
            <button
              key={it.id}
              ref={(el) => {
                btns.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onPointerEnter={(e) => e.pointerType === "mouse" && select(it.id)}
              onFocus={() => select(it.id)}
              onClick={() => select(it.id)}
              className="cpm-menu-btn"
            >
              {active && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  className="cpm-active-pill"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className="cpm-btn-inner">
                {it.image && (
                  <span
                    className="cpm-avatar-wrap"
                    onClick={(e) => {
                      if (it.onImageClick) {
                        e.stopPropagation();
                        it.onImageClick();
                      }
                    }}
                    title="Klik untuk memperbesar foto"
                  >
                    <img
                      src={it.image}
                      alt={it.name}
                      draggable={false}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "/logo_utama.png";
                      }}
                      className="cpm-avatar-img"
                    />
                  </span>
                )}
                <span className="cpm-text-col">
                  {it.badgeText && (
                    <span className="cpm-badge-line">{it.badgeText}</span>
                  )}
                  <span className="cpm-item-name" data-active={active}>
                    {it.name}
                  </span>
                  {it.subtitle && (
                    <span className="cpm-item-sub" data-active={active}>
                      {it.subtitle}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Stage: Individual Portrait Showcase (Green & Gold) */}
      <div className="cpm-stage-wrap">
        {selected && (
          <div className="cpm-stage-card">
            <div className="cpm-stage-person">
              <img
                src="/logo_utama.png"
                alt="OSMIS"
                draggable={false}
                className="cpm-stage-logo"
              />
              <div className="cpm-stage-meta">
                <span className="cpm-stage-role">
                  {selected.subtitle || selected.badgeText || "PENGURUS INTI"}
                </span>
                <span className="cpm-stage-name">{selected.name}</span>
              </div>
            </div>
            <div className="cpm-stage-actions">
              {selected.onActionClick && (
                <button
                  type="button"
                  onClick={selected.onActionClick}
                  className="cpm-action-btn"
                >
                  <ClipboardList size={13} />
                  {selected.actionLabel || "Lihat Program Kerja"}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="cpm-portrait-stage">
          <AnimatePresence mode="popLayout">
            {selected && (
              <motion.div
                key={selected.id}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 1.08 }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1 }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96 }
                }
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 260, damping: 26, mass: 0.85 }
                }
                onClick={() => selected.onImageClick?.()}
                className="cpm-portrait-card"
                title="Klik untuk memperbesar foto"
              >
                <div className="cpm-portrait-inner">
                  <img
                    src={selected.image || "/logo_utama.png"}
                    alt={selected.name}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "/logo_utama.png";
                    }}
                    className="cpm-portrait-img"
                  />

                  <span className="cpm-zoom-pill" aria-hidden="true">
                    <Maximize2 size={15} />
                  </span>

                  <div className="cpm-portrait-overlay">
                    {selected.badgeText && (
                      <span className="cpm-portrait-badge">
                        <Sparkles size={10} />
                        {selected.badgeText}
                      </span>
                    )}
                    <h4 className="cpm-portrait-title">{selected.name}</h4>
                    {selected.subtitle && (
                      <span className="cpm-portrait-role">
                        {selected.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p aria-live="polite" className="cpm-sr-only">
          {selected
            ? `${selected.name}: ${selected.description ?? selected.subtitle ?? ""}`
            : ""}
        </p>
      </div>
    </div>
  );
}

export default CoffeePourMenu;
