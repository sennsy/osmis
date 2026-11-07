'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

export interface LanyardMember {
  id: string
  name: string
  role: string
  avatar: string
  /** Accent hex/hsl/rgb — drives the badge gradient & back pattern. */
  accent?: string
  /** Optional location or cohort shown on the back of the badge. */
  meta?: string
  /** Optional short bio or quote shown on the back of the badge. */
  bio?: string
  /** Optional handle / code shown in the footer strip. */
  handle?: string
}

export interface TeamLanyardRailProps {
  eyebrow?: string
  heading?: React.ReactNode
  subheading?: string
  members?: LanyardMember[]
  /** Logo Utama path, e.g. "/logo_utama.png" */
  mainLogo?: string
  /** Logo Per-Qism path, e.g. "/kebersihan dan olahraga.png" */
  qismLogo?: string
  /** Optional callback when a member photo/card is clicked to zoom */
  onMemberClick?: (member: LanyardMember) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Per-card physics state (mutated in-place inside a single rAF loop)
// ---------------------------------------------------------------------------
interface CardPhysics {
  angle: number
  angVel: number
  dx: number
  dy: number
  vx: number
  vy: number
  flip: number
  flipVel: number
  flipped: boolean
  dragging: boolean
  dragStartX: number
  dragStartY: number
  movedDistance: number
  hover: boolean
  seed: number
}

const GRAVITY_SWING = 0.018
const DAMP_ANGLE = 0.94
const SPRING_POS = 0.14
const DAMP_POS = 0.82
const SPRING_FLIP = 0.12
const DAMP_FLIP = 0.8
const MAX_PULL_X = 70
const MAX_PULL_Y = 95

export const TeamLanyardRail: React.FC<TeamLanyardRailProps> = ({
  eyebrow = 'STRUKTUR ANGGOTA QISM // OSMIS',
  heading = 'KEBERSIHAN & OLAHRAGA',
  subheading = 'Tarik kartu ke bawah lalu lepaskan untuk melihat efek ayunan tali, atau klik kartu untuk membalik ID Card anggota.',
  members = [],
  mainLogo = '/logo_utama.png',
  qismLogo,
  onMemberClick,
  className = '',
}) => {
  const railRef = useRef<HTMLDivElement | null>(null)
  const cardElsRef = useRef<(HTMLDivElement | null)[]>([])
  const ribbonElsRef = useRef<(SVGPathElement | null)[]>([])
  const shadowElsRef = useRef<(HTMLDivElement | null)[]>([])
  const physicsRef = useRef<CardPhysics[]>([])
  const [, forceRender] = useState(0)

  if (physicsRef.current.length !== members.length) {
    physicsRef.current = members.map((_, i) => ({
      angle: ((i % 2 === 0 ? 1 : -1) * (2 + ((i * 3) % 4))),
      angVel: 0,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      flip: 0,
      flipVel: 0,
      flipped: false,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      movedDistance: 0,
      hover: false,
      seed: i * 1.37 + 0.4,
    }))
  }

  useEffect(() => {
    let rafId = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = (now - start) / 1000
      const list = physicsRef.current

      for (let i = 0; i < list.length; i++) {
        const p = list[i]
        const cardEl = cardElsRef.current[i]
        const ribbonEl = ribbonElsRef.current[i]
        const shadowEl = shadowElsRef.current[i]
        if (!cardEl) continue

        if (!p.dragging) {
          const breeze = Math.sin(t * 1.3 + p.seed) * 0.55
          const targetAngle = breeze + p.dx * 0.18
          p.angVel += (targetAngle - p.angle) * GRAVITY_SWING
          p.angVel *= DAMP_ANGLE
          p.angle += p.angVel

          p.vx += -p.dx * SPRING_POS
          p.vy += -p.dy * SPRING_POS
          p.vx *= DAMP_POS
          p.vy *= DAMP_POS
          p.dx += p.vx
          p.dy += p.vy
        } else {
          const targetAngle = Math.max(-28, Math.min(28, p.dx * 0.28))
          p.angVel += (targetAngle - p.angle) * 0.25
          p.angVel *= 0.75
          p.angle += p.angVel
        }

        const flipTarget = p.flipped ? 180 : 0
        p.flipVel += (flipTarget - p.flip) * SPRING_FLIP
        p.flipVel *= DAMP_FLIP
        p.flip += p.flipVel

        const lift = p.dragging ? -6 : p.hover ? -3 : 0
        cardEl.style.transform = `translate3d(${p.dx.toFixed(2)}px, ${(
          p.dy + lift
        ).toFixed(2)}px, 0) rotateZ(${p.angle.toFixed(
          2
        )}deg) rotateY(${p.flip.toFixed(2)}deg)`

        if (ribbonEl) {
          const topX = 60
          const topY = 0
          const endX = 60 + p.dx * 0.55
          const endY = 86 + Math.max(-18, p.dy * 0.65)
          const sag = Math.max(0, 18 - p.dy * 0.25)
          const ctrlX =
            (topX + endX) / 2 + Math.sin(p.angle * 0.05) * (10 + sag * 0.4)
          const ctrlY = (topY + endY) / 2 + sag
          ribbonEl.setAttribute(
            'd',
            `M ${topX} ${topY} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(
              1
            )} ${endX.toFixed(1)} ${endY.toFixed(1)}`
          )
        }

        if (shadowEl) {
          const scale = Math.max(0.65, 1 - Math.max(0, p.dy) * 0.002)
          const shiftX = p.dx * 0.7 + p.angle * 0.9
          shadowEl.style.transform = `translate3d(${shiftX.toFixed(
            1
          )}px, 0, 0) scale(${scale.toFixed(2)})`
          shadowEl.style.opacity = (p.dragging ? 0.55 : 0.35).toString()
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [members.length])

  const onPointerDown = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      const p = physicsRef.current[index]
      if (!p) return
      e.currentTarget.setPointerCapture(e.pointerId)
      p.dragging = true
      p.dragStartX = e.clientX - p.dx
      p.dragStartY = e.clientY - p.dy
      p.movedDistance = 0
    },
    []
  )

  const onPointerMove = useCallback(
    (index: number, e: React.PointerEvent<HTMLDivElement>) => {
      const p = physicsRef.current[index]
      if (!p) return
      if (p.dragging) {
        const rawX = e.clientX - p.dragStartX
        const rawY = e.clientY - p.dragStartY
        const clamp = (val: number, max: number) =>
          Math.sign(val) * Math.min( max, Math.abs(val) ** 0.88)
        const nextX = clamp(rawX, MAX_PULL_X)
        const nextY = Math.max(-28, clamp(rawY, MAX_PULL_Y))
        p.movedDistance += Math.hypot(nextX - p.dx, nextY - p.dy)
        p.dx = nextX
        p.dy = nextY
      }
    },
    []
  )

  const releaseDrag = useCallback((index: number) => {
    const p = physicsRef.current[index]
    if (!p || !p.dragging) return
    p.dragging = false
    p.angVel += -p.dx * 0.08
    p.vx = -p.dx * 0.12
    p.vy = -p.dy * 0.16
    if (p.movedDistance < 7) {
      p.flipped = !p.flipped
      forceRender((n) => n + 1)
    }
  }, [])

  const onKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    const p = physicsRef.current[index]
    if (!p) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      p.flipped = !p.flipped
      p.angVel += 1.4
      forceRender((n) => n + 1)
    }
  }, [])

  return (
    <section
      aria-label="Anggota Qism"
      className={`tlr-section ${className}`}
    >
      <style>{`
        .tlr-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: radial-gradient(ellipse at top, #0a261b 0%, #05130d 65%, #030a07 100%);
          color: #f8fafc;
          padding: 36px 20px 48px;
          border-radius: 24px;
          user-select: none;
        }
        .tlr-bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          pointer-events: none;
          background-image: linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .tlr-container {
          position: relative;
          max-width: 1240px;
          margin: 0 auto;
          z-index: 2;
        }
        .tlr-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 36px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }
        .tlr-header-left {
          max-width: 680px;
        }
        .tlr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #6ee7b7;
          margin-bottom: 10px;
        }
        .tlr-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }
        .tlr-heading {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: clamp(1.75rem, 3.6vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #ffffff;
          margin: 0;
        }
        .tlr-subheading {
          margin: 10px 0 0;
          font-size: 0.92rem;
          line-height: 1.6;
          color: rgba(209, 250, 229, 0.72);
        }
        .tlr-logos-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.28);
          padding: 10px 18px;
          border-radius: 18px;
          backdrop-filter: blur(10px);
        }
        .tlr-logo-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tlr-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
        }
        .tlr-logo-divider {
          width: 1px;
          height: 32px;
          background: rgba(255, 255, 255, 0.18);
        }
        .tlr-logo-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a7f3d0;
          line-height: 1.25;
        }
        .tlr-rail-bar-wrap {
          position: relative;
        }
        .tlr-rail-bar {
          position: relative;
          margin: 0 auto;
          height: 12px;
          width: 100%;
          border-radius: 999px;
          background: linear-gradient(to bottom, #475569, #1e293b, #0f172a);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 24px -4px rgba(0,0,0,0.7);
        }
        .tlr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px 16px;
          justify-items: center;
          padding-top: 2px;
        }
        .tlr-col {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 248px;
        }
        .tlr-clamp {
          position: relative;
          z-index: 20;
          margin-top: -10px;
          width: 24px;
          height: 20px;
          border-radius: 5px;
          background: linear-gradient(to bottom, #e2e8f0, #64748b);
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tlr-clamp-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #0f172a;
        }
        .tlr-ribbon-svg {
          pointer-events: none;
          margin-top: -4px;
          height: 92px;
          width: 120px;
          overflow: visible;
        }
        .tlr-card-perspective {
          margin-top: -14px;
          width: 100%;
          perspective: 1100px;
        }
        .tlr-card-3d {
          position: relative;
          margin: 0 auto;
          width: 232px;
          height: 330px;
          cursor: grab;
          touch-action: none;
          transform-style: preserve-3d;
          transform-origin: 50% -12px;
          will-change: transform;
          outline: none;
        }
        .tlr-card-3d:active {
          cursor: grabbing;
        }
        .tlr-card-face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(165deg, #0d2118 0%, #07120d 100%);
          border: 1px solid rgba(16, 185, 129, 0.28);
          padding: 16px;
          box-shadow: 0 22px 48px -16px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.14);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
        }
        .tlr-card-back {
          transform: rotateY(180deg);
        }
        .tlr-slot {
          margin: 0 auto 6px;
          height: 7px;
          width: 44px;
          border-radius: 999px;
          background: #030705;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.9);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tlr-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #a7f3d0;
        }
        .tlr-card-top-logos {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tlr-mini-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
        .tlr-avatar-wrap {
          position: relative;
          margin: 8px auto;
          width: 124px;
          height: 124px;
          border-radius: 18px;
          padding: 3px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.45);
        }
        .tlr-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 15px;
          object-fit: cover;
          object-position: top center;
          display: block;
          background: #064e3b;
        }
        .tlr-zoom-btn {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(4, 18, 12, 0.82);
          color: #ecfdf5;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 8px;
          padding: 3px 7px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }
        .tlr-member-info {
          text-align: center;
        }
        .tlr-member-name {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
        }
        .tlr-member-role {
          font-size: 0.76rem;
          font-weight: 700;
          color: #34d399;
          margin: 4px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .tlr-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 10px;
          font-family: monospace;
          color: rgba(209, 250, 229, 0.65);
        }
        .tlr-shadow {
          pointer-events: none;
          margin-top: 16px;
          height: 10px;
          width: 140px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.65);
          filter: blur(8px);
          transition: opacity 0.2s ease;
        }
        .tlr-legend {
          margin-top: 28px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: rgba(209, 250, 229, 0.7);
        }
      `}</style>

      <div className="tlr-bg-grid" />

      <div className="tlr-container">
        {/* Header with Qism Name + Both Logos (Logo Utama & Logo Per-Qism) */}
        <div className="tlr-header">
          <div className="tlr-header-left">
            <div className="tlr-eyebrow">
              <span className="tlr-dot" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="tlr-heading">{heading}</h2>
            {subheading && <p className="tlr-subheading">{subheading}</p>}
          </div>

          <div className="tlr-logos-wrap">
            {mainLogo && (
              <div className="tlr-logo-item">
                <img
                  src={mainLogo}
                  alt="Logo Utama OSMIS"
                  referrerPolicy="no-referrer"
                  className="tlr-logo-img"
                />
                <div className="tlr-logo-label">
                  OSMIS
                  <br />
                  AL-FARUQ
                </div>
              </div>
            )}
            {mainLogo && qismLogo && <div className="tlr-logo-divider" />}
            {qismLogo && (
              <div className="tlr-logo-item">
                <img
                  src={qismLogo}
                  alt="Logo Qism"
                  referrerPolicy="no-referrer"
                  className="tlr-logo-img"
                />
                <div className="tlr-logo-label">
                  LOGO
                  <br />
                  QISM
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overhead rail */}
        <div className="tlr-rail-bar-wrap">
          <div className="tlr-rail-bar" />

          <div className="tlr-grid">
            {members.map((m, i) => {
              const accent = m.accent ?? '#10b981'
              const isFlipped = physicsRef.current[i]?.flipped ?? false
              return (
                <div key={m.id} className="tlr-col">
                  <div className="tlr-clamp">
                    <span className="tlr-clamp-dot" />
                  </div>

                  <svg
                    viewBox="0 0 120 96"
                    className="tlr-ribbon-svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id={`lanyard-grad-${m.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
                        <stop offset="55%" stopColor={accent} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={accent} stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <path
                      ref={(el) => {
                        ribbonElsRef.current[i] = el
                      }}
                      d="M 60 0 Q 60 44 60 86"
                      stroke={`url(#lanyard-grad-${m.id})`}
                      strokeWidth={11}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 60 0 L 60 86"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                      fill="none"
                    />
                  </svg>

                  <div className="tlr-card-perspective">
                    <div
                      ref={(el) => {
                        cardElsRef.current[i] = el
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isFlipped}
                      aria-label={`${m.name}, ${m.role}`}
                      onPointerDown={(e) => onPointerDown(i, e)}
                      onPointerMove={(e) => onPointerMove(i, e)}
                      onPointerUp={() => releaseDrag(i)}
                      onPointerCancel={() => releaseDrag(i)}
                      onMouseEnter={() => {
                        if (physicsRef.current[i])
                          physicsRef.current[i].hover = true
                      }}
                      onMouseLeave={() => {
                        if (physicsRef.current[i])
                          physicsRef.current[i].hover = false
                      }}
                      onKeyDown={(e) => onKeyDown(i, e)}
                      className="tlr-card-3d"
                    >
                      {/* FRONT FACE */}
                      <div className="tlr-card-face">
                        <div>
                          <div className="tlr-slot" />
                          <div className="tlr-card-top">
                            <span>ID #{String(i + 1).padStart(2, '0')}</span>
                            <div className="tlr-card-top-logos">
                              {mainLogo && (
                                <img
                                  src={mainLogo}
                                  alt="OSMIS"
                                  referrerPolicy="no-referrer"
                                  className="tlr-mini-logo"
                                />
                              )}
                              {qismLogo && (
                                <img
                                  src={qismLogo}
                                  alt="Qism"
                                  referrerPolicy="no-referrer"
                                  className="tlr-mini-logo"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className="tlr-avatar-wrap"
                          style={{
                            background: `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.2))`,
                          }}
                        >
                          <img
                            src={m.avatar}
                            alt={m.name}
                            draggable={false}
                            referrerPolicy="no-referrer"
                            className="tlr-avatar-img"
                          />
                          {onMemberClick && (
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation()
                                onMemberClick(m)
                              }}
                              className="tlr-zoom-btn"
                              title={`Perbesar foto ${m.name}`}
                            >
                              🔍
                            </button>
                          )}
                        </div>

                        <div className="tlr-member-info">
                          <h3 className="tlr-member-name">{m.name}</h3>
                          <p className="tlr-member-role">{m.role}</p>
                        </div>

                        <div className="tlr-card-footer">
                          <span>{m.handle ?? 'OSMIS 26/27'}</span>
                          <span>BALIK ↻</span>
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div className="tlr-card-face tlr-card-back">
                        <div>
                          <div className="tlr-slot" />
                          <div className="tlr-card-top">
                            <span>KARTU ANGGOTA</span>
                            <span style={{ color: accent }}>● AKTIF</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'left', margin: '8px 0' }}>
                          <div
                            style={{
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              color: '#6ee7b7',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            }}
                          >
                            {m.meta ?? 'MA’HAD AL-FARUQ'}
                          </div>
                          <p
                            style={{
                              marginTop: '8px',
                              fontSize: '0.82rem',
                              lineHeight: 1.5,
                              color: '#ecfdf5',
                            }}
                          >
                            “
                            {m.bio ??
                              `Pengurus aktif ${heading} periode 2026–2027.`}
                            ”
                          </p>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: ' center',
                            gap: '12px',
                            padding: '8px',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                          }}
                        >
                          {mainLogo && (
                            <img
                              src={mainLogo}
                              alt="OSMIS"
                              referrerPolicy="no-referrer"
                              style={{ width: 28, height: 28, objectFit: 'contain' }}
                            />
                          )}
                          {qismLogo && (
                            <img
                              src={qismLogo}
                              alt="Qism"
                              referrerPolicy="no-referrer"
                              style={{ width: 28, height: 28, objectFit: 'contain' }}
                            />
                          )}
                        </div>

                        <div className="tlr-card-footer">
                          <span>KLIK UNTUK KEMBALI</span>
                          <span>↺ DEPAN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={(el) => {
                      shadowElsRef.current[i] = el
                    }}
                    className="tlr-shadow"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="tlr-legend">
          <span>
            💡 <strong>Tips Interaktif:</strong> Tarik kartu ke bawah untuk
            mengayunkan tali • Klik kartu untuk membalik ID Card • Klik 🔍 untuk
            memperbesar foto
          </span>
          <span>TOTAL: {members.length} PERSONEL QISM</span>
        </div>
      </div>
    </section>
  )
}

export default TeamLanyardRail
