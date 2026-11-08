"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type TiltStackCard = {
  title: string;
  /** Small line above the title, e.g. "7 days · Dolomites". */
  kicker?: string;
  description: string;
  image: string;
  alt?: string;
  /** Optional feature icon (e.g. Lucide icon) displayed prominently on the card. */
  icon?: React.ReactNode;
  /** Optional badge on top-right, e.g. "🔥 HOT". */
  badge?: string;
  /** Short chips under the copy. */
  tags?: string[];
  /** Big figure on the right, e.g. "01" or feature category code. */
  price?: string;
  priceNote?: string;
  cta?: string;
  href?: string;
  /** Optional click handler (used when opening a modal or custom action instead of navigation). */
  onClick?: () => void;
  /** Tint for the chip dots and the button. */
  accent?: string;
};

export type TiltStackScrollProps = {
  cards: TiltStackCard[];
  eyebrow?: string;
  heading?: string;
  /** Height of the sticky stage. Defaults to `"100svh"`. */
  stageHeight?: string;
  /** Scroll distance per card transition, in vh. Defaults to `95`. */
  stepVh?: number;
  className?: string;
};

/**
 * Full-bleed sticky card stack. Scrolling tilts the active card back into
 * depth while the next card rises from below. Each card has a photo backdrop,
 * feature icon badge, index, kicker + title + body, tags, and a CTA.
 */
export function TiltStackScroll({
  cards,
  eyebrow = "Interactive Features",
  heading = "Fitur Eksklusif OSMIS.",
  stageHeight = "100svh",
  stepVh = 95,
  className = "",
}: TiltStackScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || cards.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".tss-card", stage);
      const imgEls = cardEls.map((el) => el.querySelector<HTMLElement>(".tss-img"));
      const veilEls = cardEls.map((el) => el.querySelector<HTMLElement>(".tss-veil"));
      const contentEls = cardEls.map((el) => el.querySelector<HTMLElement>(".tss-body"));
      const dots = gsap.utils.toArray<HTMLElement>(".tss-dot", stage);

      const n = cardEls.length;

      cardEls.forEach((el, i) => {
        gsap.set(el, {
          zIndex: i + 1,
          yPercent: i === 0 ? 0 : 108,
          rotationX: 0,
          rotationZ: 0,
          scale: 1,
          transformOrigin: "50% 12%",
          force3D: true,
        });
      });
      veilEls.forEach((el) => el && gsap.set(el, { opacity: 0 }));
      imgEls.forEach((el, i) => el && gsap.set(el, { scale: i === 0 ? 1.04 : 1.18 }));

      if (n <= 1) return;

      const setActiveDot = (idx: number) => {
        dots.forEach((d, i) => d.setAttribute("data-active", i === idx ? "true" : "false"));
      };
      setActiveDot(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${(n - 1) * (stepVh / 100) * window.innerHeight}`,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(n - 1, Math.round(self.progress * (n - 1)));
            setActiveDot(idx);
          },
        },
      });

      for (let i = 0; i < n - 1; i++) {
        const current = cardEls[i];
        const next = cardEls[i + 1];
        const currentImg = imgEls[i];
        const nextImg = imgEls[i + 1];
        const currentVeil = veilEls[i];
        const currentBody = contentEls[i];
        const nextBody = contentEls[i + 1];
        const tiltDir = i % 2 === 0 ? -1.4 : 1.4;
        const at = i;

        // Incoming card rises into the frame
        tl.to(
          next,
          {
            yPercent: 0,
            ease: "power2.inOut",
            duration: 1,
          },
          at
        );
        if (nextImg) {
          tl.to(
            nextImg,
            {
              scale: 1.04,
              ease: "power2.out",
              duration: 1,
            },
            at
          );
        }
        if (nextBody) {
          tl.fromTo(
            nextBody,
            { y: 28, opacity: 0.35 },
            { y: 0, opacity: 1, ease: "power2.out", duration: 0.85 },
            at + 0.15
          );
        }

        // Current card tilts back into depth and dims
        tl.to(
          current,
          {
            scale: 0.88,
            yPercent: -6,
            rotationX: 9,
            rotationZ: tiltDir,
            ease: "power2.inOut",
            duration: 1,
          },
          at
        );
        if (currentImg) {
          tl.to(
            currentImg,
            {
              scale: 1.16,
              ease: "power2.inOut",
              duration: 1,
            },
            at
          );
        }
        if (currentVeil) {
          tl.to(
            currentVeil,
            {
              opacity: 0.58,
              ease: "power1.inOut",
              duration: 1,
            },
            at
          );
        }
        if (currentBody) {
          tl.to(
            currentBody,
            {
              y: -18,
              opacity: 0.35,
              ease: "power2.inOut",
              duration: 0.9,
            },
            at
          );
        }

        // Earlier cards sink a notch deeper so the stack edge stays clean
        for (let k = 0; k < i; k++) {
          const depth = i - k + 1;
          tl.to(
            cardEls[k],
            {
              scale: Math.max(0.78, 1 - depth * 0.065),
              yPercent: -6 - (depth - 1) * 2.5,
              ease: "power2.inOut",
              duration: 1,
            },
            at
          );
        }
      }
    }, root);

    return () => ctx.revert();
  }, [cards, stepVh]);

  const total = String(cards.length).padStart(2, "0");

  return (
    <div ref={rootRef} className={`tss-root ${className}`}>
      {(eyebrow || heading) && (
        <header className="tss-header">
          {eyebrow && <p className="tss-eyebrow mono-font">{eyebrow}</p>}
          {heading && <h2 className="tss-heading display-font">{heading}</h2>}
        </header>
      )}

      <div ref={stageRef} className="tss-stage" style={{ height: stageHeight }}>
        <div className="tss-frame">
          {cards.map((c, i) => {
            const idx = String(i + 1).padStart(2, "0");
            const accent = c.accent || "#D4AF37";
            return (
              <article
                key={`${c.title}-${i}`}
                className="tss-card"
                style={{ ["--tss-accent" as string]: accent }}
              >
                <img
                  className="tss-img"
                  src={c.image}
                  alt={c.alt || c.title}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className="tss-scrim" aria-hidden="true" />
                <div className="tss-veil" aria-hidden="true" />

                <div className="tss-body">
                  <div className="tss-top">
                    <div className="tss-top-left">
                      <span className="tss-idx">
                        <b>{idx}</b>
                        <i>/</i>
                        <span>{total}</span>
                      </span>
                      {c.icon && (
                        <div className="tss-icon-badge" aria-hidden="true">
                          {c.icon}
                        </div>
                      )}
                    </div>
                    <div className="tss-top-right">
                      {c.badge && <span className="tss-hot-badge">{c.badge}</span>}
                      {c.kicker && <span className="tss-kicker">{c.kicker}</span>}
                    </div>
                  </div>

                  <div className="tss-bottom">
                    <div className="tss-copy">
                      <div className="tss-title-row">
                        {c.icon && (
                          <span className="tss-title-icon" aria-hidden="true">
                            {c.icon}
                          </span>
                        )}
                        <h3 className="tss-title display-font">{c.title}</h3>
                      </div>
                      <p className="tss-desc">{c.description}</p>
                      {c.tags && c.tags.length > 0 && (
                        <ul className="tss-tags" aria-label="Highlights">
                          {c.tags.map((t) => (
                            <li key={t} className="tss-tag">
                              <span className="tss-tag-dot" aria-hidden="true" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {(c.price || c.cta) && (
                      <div className="tss-aside">
                        {c.price && (
                          <div className="tss-price-wrap">
                            {c.priceNote && <span className="tss-price-note">{c.priceNote}</span>}
                            <span className="tss-price">{c.price}</span>
                          </div>
                        )}
                        {c.cta &&
                          (c.onClick ? (
                            <button
                              type="button"
                              className="tss-cta"
                              onClick={c.onClick}
                            >
                              <span>{c.cta}</span>
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3.5 8h9M8.5 4l4 4-4 4"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          ) : (
                            <a className="tss-cta" href={c.href || "#"}>
                              <span>{c.cta}</span>
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3.5 8h9M8.5 4l4 4-4 4"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <nav className="tss-rail" aria-label="Slide progress">
          {cards.map((c, i) => (
            <span
              key={`dot-${i}`}
              className="tss-dot"
              data-active={i === 0 ? "true" : "false"}
              title={c.title}
            />
          ))}
        </nav>
      </div>

      <style>{`
        .tss-root {
          --tss-bg: var(--bg-color, #F7F4EB);
          --tss-fg: var(--text-color, #163828);
          --tss-muted: color-mix(in oklab, var(--tss-fg) 62%, transparent);
          position: relative;
          width: 100%;
          background: var(--tss-bg);
          color: var(--tss-fg);
          font-family: inherit;
        }

        .tss-header {
          max-width: 1240px;
          margin: 0 auto;
          padding: clamp(3.5rem, 7vw, 6.5rem) clamp(1.5rem, 4vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
        }
        .tss-eyebrow {
          margin: 0;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--osmis-yellow, #B8860B);
          font-weight: 600;
        }
        .tss-heading {
          margin: 0;
          font-size: clamp(2.1rem, 4.6vw, 3.6rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          font-weight: 700;
          max-width: 24ch;
          text-wrap: balance;
          color: var(--tss-fg);
        }

        .tss-stage {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 2.4vw, 2rem);
          box-sizing: border-box;
          overflow: hidden;
        }

        .tss-frame {
          position: relative;
          width: 100%;
          max-width: 1280px;
          height: min(82svh, 760px);
          perspective: 1800px;
          transform-style: preserve-3d;
        }

        .tss-card {
          position: absolute;
          inset: 0;
          border-radius: clamp(20px, 2.4vw, 30px);
          overflow: hidden;
          background: #0d1f17;
          color: #f7f6f2;
          box-shadow:
            0 30px 80px -25px rgba(0, 0, 0, 0.55),
            0 0 0 1px rgba(255, 255, 255, 0.12) inset;
          will-change: transform;
          backface-visibility: hidden;
        }

        .tss-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          pointer-events: none;
          will-change: transform;
          filter: saturate(1.05) contrast(1.02);
        }

        .tss-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(10, 24, 18, 0.5) 0%, rgba(10, 24, 18, 0.15) 38%, rgba(8, 20, 14, 0.88) 85%, rgba(6, 15, 11, 0.96) 100%),
            radial-gradient(90% 70% at 15% 100%, rgba(0, 0, 0, 0.55) 0%, transparent 70%);
          pointer-events: none;
        }

        .tss-veil {
          position: absolute;
          inset: 0;
          background: #050a08;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
        }

        .tss-body {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(1.5rem, 3.6vw, 3.25rem);
          box-sizing: border-box;
          will-change: transform, opacity;
        }

        .tss-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .tss-top-left {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tss-top-right {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .tss-idx {
          display: inline-flex;
          align-items: baseline;
          gap: 0.35rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: rgba(15, 32, 24, 0.52);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .tss-idx b {
          font-weight: 700;
          color: #fff;
        }
        .tss-idx i {
          font-style: normal;
          opacity: 0.45;
        }
        .tss-idx span {
          opacity: 0.65;
        }

        .tss-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 255, 255, 0.07) 100%
          );
          backdrop-filter: blur(16px) saturate(160%);
          -webkit-backdrop-filter: blur(16px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.28),
            0 1px 0 rgba(255, 255, 255, 0.3) inset;
          color: var(--tss-accent, #D4AF37);
        }

        .tss-hot-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.42rem 0.9rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          box-shadow: 0 6px 18px rgba(231, 76, 60, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .tss-kicker {
          font-size: 0.76rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          background: rgba(15, 32, 24, 0.52);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.92);
        }

        .tss-bottom {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: clamp(1.25rem, 3vw, 3rem);
        }

        .tss-copy {
          max-width: 62ch;
        }

        .tss-title-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin: 0 0 0.75rem 0;
        }

        .tss-title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: var(--tss-accent, #D4AF37);
        }

        .tss-title {
          margin: 0;
          font-size: clamp(1.85rem, 4.2vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          font-weight: 700;
          color: #ffffff;
          text-wrap: balance;
        }

        .tss-desc {
          margin: 0;
          font-size: clamp(0.95rem, 1.2vw, 1.12rem);
          line-height: 1.6;
          color: rgba(247, 246, 242, 0.86);
          max-width: 54ch;
        }

        .tss-tags {
          list-style: none;
          margin: 1.15rem 0 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tss-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          letter-spacing: 0.02em;
          padding: 0.38rem 0.8rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.94);
        }

        .tss-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--tss-accent, #D4AF37);
          box-shadow: 0 0 10px var(--tss-accent, #D4AF37);
        }

        .tss-aside {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.9rem;
          padding-top: 0.5rem;
        }

        .tss-price-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1;
        }
        .tss-price-note {
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 0.35rem;
        }
        .tss-price {
          font-size: clamp(1.5rem, 2.6vw, 2.25rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
        }

        .tss-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.35rem;
          border-radius: 999px;
          background: #ffffff;
          color: #102A1E;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 220ms ease, background-color 220ms ease, color 220ms ease, box-shadow 220ms ease;
          box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.55);
        }
        .tss-cta:hover {
          transform: translateY(-2px);
          background: var(--tss-accent, #D4AF37);
          color: #0b1c14;
        }
        .tss-cta svg {
          transition: transform 220ms ease;
        }
        .tss-cta:hover svg {
          transform: translateX(3px);
        }

        .tss-rail {
          position: absolute;
          right: clamp(0.6rem, 1.6vw, 1.4rem);
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          z-index: 20;
        }
        .tss-dot {
          width: 4px;
          height: 18px;
          border-radius: 999px;
          background: color-mix(in oklab, var(--tss-fg) 26%, transparent);
          transition: height 260ms ease, background-color 260ms ease;
        }
        .tss-dot[data-active="true"] {
          height: 34px;
          background: var(--tss-fg);
        }

        @media (max-width: 720px) {
          .tss-frame {
            height: 84svh;
          }
          .tss-bottom {
            grid-template-columns: 1fr;
            align-items: start;
          }
          .tss-aside {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.16);
            padding-top: 0.9rem;
          }
          .tss-price-wrap {
            align-items: flex-start;
          }
          .tss-rail {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tss-stage {
            height: auto !important;
            padding-block: 2rem;
          }
          .tss-frame {
            height: auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .tss-card {
            position: relative;
            height: 520px;
          }
        }
      `}</style>
    </div>
  );
}

export default TiltStackScroll;
