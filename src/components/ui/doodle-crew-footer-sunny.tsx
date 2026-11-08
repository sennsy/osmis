"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface CrewMember {
  name: string;
  role: string;
  color: string;
  accent?: string;
  shape: "blob" | "tall" | "round" | "star" | "square";
  letter: number;
  offsetX?: number;
  lines: string[];
}

export interface DoodleCrewFooterProps {
  wordmark?: string;
  tagline?: string;
  eyebrow?: string;
  columns?: FooterColumn[];
  crew?: CrewMember[];
  copyright?: string;
  statusText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  palette?: {
    bg?: string;
    ink?: string;
    muted?: string;
    rule?: string;
    card?: string;
    accent?: string;
  };
  className?: string;
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  hideTopSection?: boolean;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Navigasi",
    links: [
      { label: "Sejarah OSMIS", href: "#history" },
      { label: "Struktur Inti", href: "#organization" },
      { label: "6 Divisi", href: "#divisions", badge: "Inti" },
      { label: "Galeri Kegiatan", href: "#gallery" },
      { label: "Ruang Kreativitas", href: "#features" },
    ],
  },
  {
    title: "Ekosistem Digital",
    links: [
      { label: "OSMIS Rekap", href: "/recap", badge: "New" },
      { label: "SMISFrame Studio", href: "/smisframe" },
      { label: "The SMIS MBTI", href: "/mbti" },
      { label: "Linguista Arab-Inggris", href: "/learn" },
    ],
  },
];

const DEFAULT_CREW: CrewMember[] = [
  {
    name: "Ustadz Piket",
    role: "Bagian Keamanan (AMN)",
    color: "#2e5942",
    accent: "#ffe600",
    shape: "tall",
    letter: 0,
    offsetX: -4,
    lines: ["Antum sudah apel malam?", "Tertib itu keren, akhi!", "Jangan lupa kunci lemari!"],
  },
  {
    name: "Muadzin Santri",
    role: "Bagian Ibadah",
    color: "#d69f30",
    accent: "#132a1e",
    shape: "round",
    letter: 1,
    offsetX: 4,
    lines: ["Shaf depan masih kosong nih!", "Waktunya muraja'ah!", "Masjid memanggilmu, bro!"],
  },
  {
    name: "Amirul Lughah",
    role: "Bagian Bahasa",
    color: "#1f7a54",
    accent: "#ffffff",
    shape: "blob",
    letter: 2,
    offsetX: 0,
    lines: ["Takallam bil 'Arabiyyah!", "Speak English or Arabic!", "Kosakata hari ini sudah hafal?"],
  },
  {
    name: "Kapten Ro'an",
    role: "Kebersihan & Olahraga",
    color: "#eab308",
    accent: "#1b3b2b",
    shape: "star",
    letter: 3,
    offsetX: 0,
    lines: ["Annadzofatu minal iman!", "Sabtu pagi siap futsal?", "Kamar rapi, hati tenang!"],
  },
  {
    name: "Tim Dapur & Sarpras",
    role: "Kesehatan & Logistik",
    color: "#10b981",
    accent: "#062317",
    shape: "square",
    letter: 4,
    offsetX: 4,
    lines: ["Menu makan siang mantap!", "Jaga fasilitas ma'had ya!", "Minum air putih yang cukup!"],
  },
];

export function DoodleCrewFooter({
  wordmark = "OSMIS",
  tagline = "Membina kepribadian, menjaga ukhuwah, dan mengabdi sepenuh hati di Ma'had Imam Syafi'i.",
  eyebrow = "Organisasi Santri Ma'had Imam Syafi'i · Brebes",
  columns = DEFAULT_COLUMNS,
  crew = DEFAULT_CREW,
  copyright,
  statusText = "Semua divisi aktif & siap mengabdi",
  ctaLabel = "Kembali ke Atas ↑",
  ctaHref = "#",
  onCtaClick,
  palette,
  className = "",
  topSlot,
  bottomSlot,
  hideTopSection = false,
}: DoodleCrewFooterProps) {
  const uid = useId().replace(/:/g, "");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [pointer, setPointer] = useState<{ x: number; y: number; inside: boolean }>({
    x: 0.5,
    y: 0.3,
    inside: false,
  });

  const [pokes, setPokes] = useState<Record<number, number>>({});
  const [speaking, setSpeaking] = useState<Record<number, number | null>>({});
  const [waveAll, setWaveAll] = useState(false);
  const [doodles, setDoodles] = useState<
    Array<{ id: number; x: number; y: number; kind: "star" | "heart" | "spark" | "note"; color: string }>
  >([]);

  const colors = {
    bg: palette?.bg ?? "#f8f6f0",
    ink: palette?.ink ?? "#141d18",
    muted: palette?.muted ?? "#56635b",
    rule: palette?.rule ?? "rgba(46, 89, 66, 0.16)",
    card: palette?.card ?? "rgba(46, 89, 66, 0.06)",
    accent: palette?.accent ?? "#2e5942",
  };

  const letters = useMemo(() => wordmark.slice(0, 8).toUpperCase().split(""), [wordmark]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / Math.max(1, r.width);
        const y = (e.clientY - r.top) / Math.max(1, r.height);
        setPointer({
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y)),
          inside: y >= -0.2 && y <= 1.1,
        });
      });
    };
    const onLeave = () => setPointer((p) => ({ ...p, inside: false }));
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const pokeMember = (idx: number, clientX?: number, clientY?: number) => {
    setPokes((p) => ({ ...p, [idx]: (p[idx] ?? 0) + 1 }));
    setSpeaking((s) => {
      const cur = s[idx];
      const lines = crew[idx]?.lines ?? ["Assalamu'alaikum!"];
      const next = cur === null || cur === undefined ? 0 : (cur + 1) % lines.length;
      return { ...s, [idx]: next };
    });

    if (svgRef.current && clientX !== undefined && clientY !== undefined) {
      const r = svgRef.current.getBoundingClientRect();
      const vx = ((clientX - r.left) / Math.max(1, r.width)) * 1200;
      const vy = ((clientY - r.top) / Math.max(1, r.height)) * 420;
      const kinds: Array<"star" | "heart" | "spark" | "note"> = ["star", "heart", "spark", "note"];
      const id = Date.now() + Math.random();
      setDoodles((d) => [
        ...d.slice(-14),
        {
          id,
          x: vx + (Math.random() - 0.5) * 40,
          y: vy - 30,
          kind: kinds[(pokes[idx] ?? 0) % kinds.length],
          color: crew[idx]?.color ?? colors.accent,
        },
      ]);
    }
  };

  const onStageClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest("[data-crew]")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / Math.max(1, r.width)) * 1200;
    const vy = ((e.clientY - r.top) / Math.max(1, r.height)) * 420;
    const kinds: Array<"star" | "heart" | "spark" | "note"> = ["star", "heart", "spark", "note"];
    const palettePool = crew.map((c) => c.color);
    const id = Date.now() + Math.random();
    setDoodles((d) => [
      ...d.slice(-14),
      {
        id,
        x: vx,
        y: vy,
        kind: kinds[d.length % kinds.length],
        color: palettePool[d.length % palettePool.length] ?? colors.accent,
      },
    ]);
  };

  const triggerRollCall = () => {
    setWaveAll(true);
    const nextSpeak: Record<number, number> = {};
    crew.forEach((_, i) => {
      nextSpeak[i] = ((pokes[i] ?? 0) + i) % (crew[i]?.lines.length || 1);
    });
    setSpeaking(nextSpeak);
    setTimeout(() => setWaveAll(false), 1400);
  };

  const viewW = 1200;
  const viewH = 420;
  const padX = 70;
  const usableW = viewW - padX * 2;
  const letterCount = Math.max(1, letters.length);
  const slotW = usableW / letterCount;
  const letterTopY = 185;
  const letterBaselineY = 385;

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer
      ref={stageRef}
      style={{
        backgroundColor: colors.bg,
        color: colors.ink,
        borderTop: `1px solid ${colors.rule}`,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        userSelect: "none",
      }}
      className={`osmis-doodle-footer ${className}`}
    >
      <style>{`
        @keyframes dc-bob-${uid} {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1.2deg); }
        }
        @keyframes dc-hop-${uid} {
          0%   { transform: translateY(0) scale(1, 1) rotate(0deg); }
          25%  { transform: translateY(6px) scale(1.12, 0.88) rotate(-4deg); }
          55%  { transform: translateY(-34px) scale(0.94, 1.08) rotate(6deg); }
          80%  { transform: translateY(3px) scale(1.05, 0.95) rotate(-2deg); }
          100% { transform: translateY(0) scale(1, 1) rotate(0deg); }
        }
        @keyframes dc-wave-${uid} {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-28deg); }
          50% { transform: rotate(18deg); }
          75% { transform: rotate(-22deg); }
        }
        @keyframes dc-float-${uid} {
          0%   { opacity: 0; transform: translateY(8px) scale(0.5) rotate(-8deg); }
          20%  { opacity: 1; transform: translateY(-6px) scale(1.05) rotate(6deg); }
          100% { opacity: 0; transform: translateY(-58px) scale(0.85) rotate(18deg); }
        }
        @keyframes dc-blink-${uid} {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        .dc-char-${uid} {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: dc-bob-${uid} 3.4s ease-in-out infinite;
          cursor: pointer;
          transition: filter 0.2s ease;
        }
        .dc-char-${uid}:hover {
          filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.18));
        }
        .dc-char-hop-${uid} {
          animation: dc-hop-${uid} 0.62s cubic-bezier(.22,1.2,.36,1) 1;
        }
        .dc-arm-wave-${uid} {
          transform-box: fill-box;
          transform-origin: 0% 50%;
          animation: dc-wave-${uid} 0.7s ease-in-out 2;
        }
        .dc-eye-${uid} {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: dc-blink-${uid} 4.6s ease-in-out infinite;
        }
        .dc-doodle-${uid} {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: dc-float-${uid} 1.5s ease-out forwards;
          pointer-events: none;
        }
        .dc-container-${uid} {
          max-width: 1240px;
          margin: 0 auto;
          padding: 3.5rem 1.75rem 1.5rem;
          position: relative;
          z-index: 2;
        }
        .dc-top-grid-${uid} {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 3rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid ${colors.rule};
        }
        .dc-cols-grid-${uid} {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .dc-eyebrow-${uid} {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.38rem 0.9rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background: ${colors.card};
          border: 1px solid ${colors.rule};
          margin-bottom: 1.1rem;
        }
        .dc-tagline-${uid} {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.45rem, 2.5vw, 2.15rem);
          font-weight: 800;
          line-height: 1.22;
          letter-spacing: -0.02em;
          margin: 0 0 1.4rem;
          max-width: 540px;
        }
        .dc-btn-row-${uid} {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
        }
        .dc-primary-btn-${uid} {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.3rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          background: ${colors.ink};
          color: ${colors.bg};
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dc-primary-btn-${uid}:hover {
          transform: translateY(-2px);
        }
        .dc-secondary-btn-${uid} {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.2rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          background: ${colors.card};
          color: ${colors.ink};
          border: 1px solid ${colors.rule};
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .dc-secondary-btn-${uid}:hover {
          transform: translateY(-2px);
          border-color: ${colors.accent};
        }
        .dc-col-title-${uid} {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: ${colors.muted};
          margin-bottom: 1rem;
        }
        .dc-link-list-${uid} {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .dc-link-${uid} {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: ${colors.ink};
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .dc-link-${uid}:hover {
          opacity: 1;
          transform: translateX(4px);
        }
        .dc-legend-row-${uid} {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1.2rem 0 0.5rem;
          font-size: 0.76rem;
          color: ${colors.muted};
        }
        .dc-chip-wrap-${uid} {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .dc-chip-${uid} {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          background: ${colors.card};
          color: ${colors.ink};
          border: 1px solid ${colors.rule};
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .dc-chip-${uid}:hover {
          transform: translateY(-2px);
        }
        .dc-bottom-bar-${uid} {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid ${colors.rule};
          font-size: 0.78rem;
          color: ${colors.muted};
        }
        @media (max-width: 900px) {
          .dc-top-grid-${uid} {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 600px) {
          .dc-cols-grid-${uid} {
            grid-template-columns: 1fr;
          }
          .dc-container-${uid} {
            padding: 2.5rem 1.15rem 1.25rem;
          }
        }
      `}</style>

      {/* Subtle dotted grid backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.45,
          backgroundImage: `radial-gradient(${colors.rule} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <div className={`dc-container-${uid}`}>
        {topSlot && <div style={{ marginBottom: "2.25rem" }}>{topSlot}</div>}

        {!hideTopSection && (
          <>
            <div className={`dc-top-grid-${uid}`}>
              <div>
                <div className={`dc-eyebrow-${uid}`}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: colors.accent,
                      display: "inline-block",
                    }}
                  />
                  {eyebrow}
                </div>
                <h2 className={`dc-tagline-${uid}`}>{tagline}</h2>

                <div className={`dc-btn-row-${uid}`}>
                  <a
                    href={ctaHref}
                    onClick={(e) => {
                      if (onCtaClick) {
                        e.preventDefault();
                        onCtaClick();
                      }
                    }}
                    className={`dc-primary-btn-${uid}`}
                  >
                    <span>{ctaLabel}</span>
                  </a>

                  <button
                    type="button"
                    onClick={triggerRollCall}
                    className={`dc-secondary-btn-${uid}`}
                  >
                    <span>👋 Sapa Kru Santri OSMIS</span>
                  </button>
                </div>
              </div>

              <div className={`dc-cols-grid-${uid}`}>
                {columns.map((col) => (
                  <div key={col.title}>
                    <div className={`dc-col-title-${uid}`}>{col.title}</div>
                    <ul className={`dc-link-list-${uid}`}>
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <a
                            href={l.href}
                            onClick={l.onClick}
                            className={`dc-link-${uid}`}
                          >
                            <span>{l.label}</span>
                            {l.badge && (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  padding: "2px 7px",
                                  borderRadius: 999,
                                  backgroundColor: colors.accent,
                                  color: "#ffffff",
                                }}
                              >
                                {l.badge}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {bottomSlot && <div style={{ marginTop: "2rem" }}>{bottomSlot}</div>}

            {/* Crew legend chips */}
            <div className={`dc-legend-row-${uid}`}>
              <div className={`dc-chip-wrap-${uid}`}>
                {crew.map((m, i) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => pokeMember(i)}
                    className={`dc-chip-${uid}`}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        backgroundColor: m.color,
                        display: "inline-block",
                      }}
                    />
                    <span>{m.name}</span>
                    <span style={{ color: colors.muted, fontWeight: 500 }}>· {m.role}</span>
                  </button>
                ))}
              </div>
              <span>Klik karakter di atas huruf O·S·M·I·S untuk menyapa ✨</span>
            </div>
          </>
        )}

        {hideTopSection && (
          <div style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.85rem", opacity: 0.75, fontFamily: "var(--font-mono, monospace)" }}>
            Klik karakter di atas huruf O·S·M·I·S untuk menyapa ✨
          </div>
        )}

        {/* Interactive Wordmark + Doodle Crew Stage */}
        <div style={{ position: "relative", marginTop: "0.25rem" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewW} ${viewH}`}
            onClick={onStageClick}
            style={{ width: "100%", height: "auto", display: "block", overflow: "visible", cursor: "pointer" }}
            role="img"
            aria-label={`${wordmark} illustrated crew footer`}
          >
            <defs>
              <filter id={`dc-sketch-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
              </filter>
              <linearGradient id={`dc-wordgrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.ink} stopOpacity="1" />
                <stop offset="100%" stopColor={colors.ink} stopOpacity="0.82" />
              </linearGradient>
            </defs>

            <line
              x1={padX - 20}
              y1={letterBaselineY + 4}
              x2={viewW - padX + 20}
              y2={letterBaselineY + 4}
              stroke={colors.ink}
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeOpacity="0.25"
            />

            {letters.map((ch, i) => {
              const cx = padX + slotW * (i + 0.5);
              return (
                <g key={`${ch}-${i}`}>
                  <ellipse
                    cx={cx}
                    cy={letterBaselineY + 6}
                    rx={slotW * 0.36}
                    ry={6}
                    fill={colors.ink}
                    opacity="0.08"
                  />
                  <text
                    x={cx}
                    y={letterBaselineY}
                    textAnchor="middle"
                    fill={`url(#dc-wordgrad-${uid})`}
                    style={{
                      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                      fontWeight: 900,
                      fontSize: Math.min(255, slotW * 1.28),
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {ch}
                  </text>
                </g>
              );
            })}

            {crew.map((member, idx) => {
              const letterIdx = Math.max(0, Math.min(letterCount - 1, member.letter));
              const anchorX = padX + slotW * (letterIdx + 0.5) + (member.offsetX ?? 0);
              const anchorY = letterTopY;

              const charNormX = anchorX / viewW;
              const charNormY = anchorY / viewH;
              const dx = pointer.x - charNormX;
              const dy = pointer.y - charNormY;
              const dist = Math.hypot(dx, dy) || 1;
              const maxPupil = 4.2;
              const px = pointer.inside ? (dx / dist) * Math.min(maxPupil, dist * 16) : 0;
              const py = pointer.inside ? (dy / dist) * Math.min(maxPupil, dist * 16) : 0;
              const lean = pointer.inside ? Math.max(-6, Math.min(6, dx * 14)) : 0;

              const pokeCount = pokes[idx] ?? 0;
              const speakIdx = speaking[idx];
              const line =
                speakIdx !== null && speakIdx !== undefined
                  ? member.lines[speakIdx % member.lines.length]
                  : null;

              return (
                <g
                  key={member.name}
                  data-crew={idx}
                  transform={`translate(${anchorX}, ${anchorY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    pokeMember(idx, e.clientX, e.clientY);
                  }}
                >
                  {/* Legs */}
                  <g stroke={colors.ink} strokeWidth="3.2" strokeLinecap="round" fill="none">
                    <path
                      d={`M -14 0 Q -18 18 ${(-15 + Math.sin(pointer.x * 6 + idx) * 4).toFixed(3)} 32`}
                    />
                    <path
                      d={`M 14 0 Q 18 18 ${(15 + Math.cos(pointer.x * 6 + idx) * 4).toFixed(3)} 32`}
                    />
                    <ellipse cx={Number((-16 + Math.sin(pointer.x * 6 + idx) * 4).toFixed(3))} cy={35} rx="7" ry="4" fill={colors.ink} />
                    <ellipse cx={Number((16 + Math.cos(pointer.x * 6 + idx) * 4).toFixed(3))} cy={35} rx="7" ry="4" fill={colors.ink} />
                  </g>

                  <g
                    key={pokeCount}
                    className={`dc-char-${uid} ${pokeCount > 0 ? `dc-char-hop-${uid}` : ""}`}
                    style={{ animationDelay: `${idx * 0.35}s` }}
                  >
                    <g transform={`rotate(${lean})`}>
                      {renderBody(member, colors.ink)}

                      {/* Face */}
                      <g transform={`translate(0, ${getFaceY(member.shape)})`}>
                        <g transform="translate(-13, 0)">
                          <g className={`dc-eye-${uid}`} style={{ animationDelay: `${idx * 0.6}s` }}>
                            <circle r="9.5" fill="#FFFFFF" stroke={colors.ink} strokeWidth="2.8" />
                            <circle cx={px} cy={py} r="4.2" fill={colors.ink} />
                            <circle cx={px - 1.4} cy={py - 1.6} r="1.4" fill="#FFFFFF" />
                          </g>
                        </g>
                        <g transform="translate(13, 0)">
                          <g className={`dc-eye-${uid}`} style={{ animationDelay: `${idx * 0.6}s` }}>
                            <circle r="9.5" fill="#FFFFFF" stroke={colors.ink} strokeWidth="2.8" />
                            <circle cx={px} cy={py} r="4.2" fill={colors.ink} />
                            <circle cx={px - 1.4} cy={py - 1.6} r="1.4" fill="#FFFFFF" />
                          </g>
                        </g>
                        <ellipse cx="-22" cy="10" rx="4.5" ry="2.6" fill="#FF8FA3" opacity="0.7" />
                        <ellipse cx="22" cy="10" rx="4.5" ry="2.6" fill="#FF8FA3" opacity="0.7" />
                        {pokeCount % 2 === 1 || waveAll ? (
                          <path
                            d="M -9 11 Q 0 22 9 11 Z"
                            fill={colors.ink}
                            stroke={colors.ink}
                            strokeWidth="2.4"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <path
                            d="M -8 12 Q 0 18 8 12"
                            stroke={colors.ink}
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            fill="none"
                          />
                        )}
                      </g>

                      {/* Waving right arm */}
                      <g
                        transform={`translate(38, ${getFaceY(member.shape) + 8})`}
                        className={waveAll || pokeCount > 0 ? `dc-arm-wave-${uid}` : ""}
                      >
                        <path
                          d="M 0 0 Q 18 -12 22 -28"
                          stroke={colors.ink}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <circle cx="22" cy="-30" r="5" fill={member.color} stroke={colors.ink} strokeWidth="2.6" />
                      </g>

                      <path
                        d={`M -38 ${getFaceY(member.shape) + 8} Q -52 ${getFaceY(member.shape) + 22} -44 ${getFaceY(member.shape) + 34}`}
                        stroke={colors.ink}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  </g>

                  {line && (
                    <g
                      key={`${pokeCount}-${speakIdx}`}
                      transform={`translate(0, ${getBubbleY(member.shape)})`}
                    >
                      {renderSpeechBubble(line, colors.ink, "#FFFFFF", member.color)}
                    </g>
                  )}
                </g>
              );
            })}

            {doodles.map((d) => (
              <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
                <g className={`dc-doodle-${uid}`}>{renderDoodle(d.kind, d.color, colors.ink)}</g>
              </g>
            ))}
          </svg>
        </div>

        {/* Bottom bar */}
        <div className={`dc-bottom-bar-${uid}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                position: "relative",
                display: "inline-flex",
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: "#10B981",
              }}
            />
            <span>{statusText}</span>
          </div>

          <div>
            {copyright ?? `© ${year} ${wordmark} — Organisasi Santri Ma'had Imam Syafi'i Brebes.`}
          </div>
        </div>
      </div>
    </footer>
  );
}

function getFaceY(shape: CrewMember["shape"]): number {
  switch (shape) {
    case "tall":
      return -72;
    case "star":
      return -58;
    case "square":
      return -54;
    case "round":
      return -50;
    case "blob":
    default:
      return -54;
  }
}

function getBubbleY(shape: CrewMember["shape"]): number {
  switch (shape) {
    case "tall":
      return -150;
    case "star":
      return -132;
    default:
      return -126;
  }
}

function renderBody(member: CrewMember, ink: string) {
  const { shape, color, accent = "#FFFFFF" } = member;
  switch (shape) {
    case "tall":
      return (
        <g>
          <path
            d="M -36 0 L -32 -88 Q -32 -112 0 -112 Q 32 -112 32 -88 L 36 0 Z"
            fill={color}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M -22 -112 Q -10 -128 0 -116 Q 12 -130 20 -112" fill={accent} stroke={ink} strokeWidth="2.8" strokeLinejoin="round" />
        </g>
      );
    case "round":
      return (
        <g>
          <circle cx="0" cy="-46" r="46" fill={color} stroke={ink} strokeWidth="3.2" />
          <path
            d="M -30 -82 Q 0 -98 30 -82"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    case "star":
      return (
        <g>
          <path
            d="M 0 -108 L 16 -74 L 52 -70 L 26 -44 L 34 -4 L 0 -22 L -34 -4 L -26 -44 L -52 -70 L -16 -74 Z"
            fill={color}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>
      );
    case "square":
      return (
        <g>
          <rect
            x="-42"
            y="-92"
            width="84"
            height="92"
            rx="20"
            fill={color}
            stroke={ink}
            strokeWidth="3.2"
          />
          <line x1="-18" y1="-92" x2="-26" y2="-112" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx="-26" cy="-115" r="5" fill={accent} stroke={ink} strokeWidth="2.5" />
          <line x1="18" y1="-92" x2="26" y2="-112" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx="26" cy="-115" r="5" fill={accent} stroke={ink} strokeWidth="2.5" />
        </g>
      );
    case "blob":
    default:
      return (
        <g>
          <path
            d="M -42 0 C -48 -36 -44 -78 -22 -94 C -6 -106 6 -106 22 -94 C 44 -78 48 -36 42 0 Z"
            fill={color}
            stroke={ink}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-104" r="7" fill={accent} stroke={ink} strokeWidth="2.8" />
        </g>
      );
  }
}

function renderSpeechBubble(text: string, ink: string, fill: string, accent: string) {
  const paddingX = 14;
  const charW = 7.4;
  const w = Math.max(88, Math.min(240, text.length * charW + paddingX * 2));
  const h = 34;
  return (
    <g>
      <rect
        x={-w / 2 + 3}
        y={-h + 3}
        width={w}
        height={h}
        rx={h / 2}
        fill={ink}
      />
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={h / 2}
        fill={fill}
        stroke={ink}
        strokeWidth="2.6"
      />
      <path
        d={`M -6 0 L 0 9 L 8 0 Z`}
        fill={fill}
        stroke={ink}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx={-w / 2 + 14} cy={-h / 2} r="4" fill={accent} />
      <text
        x={4}
        y={-h / 2 + 4}
        textAnchor="middle"
        fill={ink}
        style={{
          fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {text}
      </text>
    </g>
  );
}

function renderDoodle(
  kind: "star" | "heart" | "spark" | "note",
  color: string,
  ink: string
) {
  switch (kind) {
    case "heart":
      return (
        <path
          d="M 0 6 C -12 -6 -22 4 -10 18 L 0 28 L 10 18 C 22 4 12 -6 0 6 Z"
          fill={color}
          stroke={ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      );
    case "spark":
      return (
        <path
          d="M 0 -14 L 4 -4 L 14 0 L 4 4 L 0 14 L -4 4 L -14 0 L -4 -4 Z"
          fill={color}
          stroke={ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
    case "note":
      return (
        <g stroke={ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -4 8 L -4 -12 L 12 -16 L 12 4" fill="none" />
          <ellipse cx="-8" cy="9" rx="5" ry="3.8" fill={color} />
          <ellipse cx="8" cy="5" rx="5" ry="3.8" fill={color} />
        </g>
      );
    case "star":
    default:
      return (
        <path
          d="M 0 -14 L 4 -4 L 15 -3 L 7 4 L 9 15 L 0 9 L -9 15 L -7 4 L -15 -3 L -4 -4 Z"
          fill={color}
          stroke={ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      );
  }
}

export default DoodleCrewFooter;
