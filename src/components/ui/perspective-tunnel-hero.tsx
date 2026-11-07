'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export interface TunnelImageItem {
  src: string
  title: string
  category?: string
}

export interface PerspectiveTunnelHeroProps {
  images?: TunnelImageItem[]
  eyebrow?: string
  titleLine1?: string
  titleLine2?: string
  subtitle?: string
  ctaLabel?: string
  onExploreClick?: () => void
  onSelectImage?: (index: number) => void
}

const DEFAULT_ITEMS: TunnelImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    title: 'KEGIATAN SANTRI',
  },
  {
    src: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    title: 'KEBERSAMAAN OSMIS',
  },
]

interface TunnelCardProps {
  item: TunnelImageItem
  index: number
  total: number
  progress: any
  onClick?: () => void
}

const TunnelCard: React.FC<TunnelCardProps> = ({
  item,
  index,
  total,
  progress,
  onClick,
}) => {
  // Evenly distribute cards along the depth tunnel
  const step = 0.72 / Math.max(1, total - 1)
  const start = index * step
  const end = start + 0.28

  const z = useTransform(progress, [start, end], [-1400, 750])
  const opacity = useTransform(
    progress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0]
  )
  const scale = useTransform(progress, [start, end], [0.42, 1.35])

  const angle = index * 2.25
  const radius = 250
  const xOffset = Math.cos(angle) * radius
  const yOffset = Math.sin(angle) * (radius * 0.75)

  const x = useTransform(progress, [start, end], [xOffset * 0.18, xOffset * 1.65])
  const y = useTransform(progress, [start, end], [yOffset * 0.18, yOffset * 1.65])
  const rotateZ = useTransform(
    progress,
    [start, end],
    [index % 2 === 0 ? -6 : 6, index % 2 === 0 ? 6 : -6]
  )

  return (
    <motion.div
      style={{
        position: 'absolute',
        z,
        x,
        y,
        opacity,
        scale,
        rotateZ,
        transformStyle: 'preserve-3d',
      }}
      onClick={onClick}
      className="pth-card-outer"
    >
      <div className="pth-card-inner">
        <img
          src={item.src}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="pth-card-img"
        />
        <div className="pth-card-gradient" />

        <div className="pth-card-meta">
          <span className="pth-card-index">
            DOKUMENTASI // 0{index + 1}
          </span>
          <h3 className="pth-card-title">{item.title}</h3>
        </div>
      </div>
    </motion.div>
  )
}

export const PerspectiveTunnelHero: React.FC<PerspectiveTunnelHeroProps> = ({
  images,
  eyebrow = 'ARSIP VISUAL // OSMIS MA’HAD AL-FARUQ',
  titleLine1 = 'JELAJAHI',
  titleLine2 = 'SELURUH GALERI.',
  subtitle = 'Gunakan scroll mouse atau usap layar untuk menembus lorong dokumentasi kegiatan santri, lalu lanjutkan ke galeri lengkap di bawah.',
  ctaLabel = 'LIHAT GRID GALERI ↓',
  onExploreClick,
  onSelectImage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = images && images.length > 0 ? images.slice(0, 12) : DEFAULT_ITEMS

  const [scrollProgress, setScrollProgress] = useState(0)
  const rawProgress = useSpring(0, { stiffness: 45, damping: 20, mass: 1 })
  const touchStartYRef = useRef<number | null>(null)

  useEffect(() => {
    const unsubscribe = rawProgress.on('change', (v) => {
      setScrollProgress(v)
    })
    return () => unsubscribe()
  }, [rawProgress])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      const current = rawProgress.get()

      // If scrolling down and tunnel hasn't finished yet, drive the 3D tunnel
      if (e.deltaY > 0 && current < 0.98) {
        e.preventDefault()
        const next = Math.min(1, Math.max(0, current + e.deltaY * 0.00085))
        rawProgress.set(next)
        return
      }

      // If scrolling up while near the top of the page and tunnel is > 0, rewind the tunnel
      if (e.deltaY < 0 && current > 0.02 && window.scrollY <= 24) {
        e.preventDefault()
        const next = Math.min(1, Math.max(0, current + e.deltaY * 0.00085))
        rawProgress.set(next)
        return
      }
      // Otherwise let native page scroll proceed naturally to the gallery grid below!
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || e.touches.length !== 1) return
      const currentY = e.touches[0].clientY
      const deltaY = touchStartYRef.current - currentY
      const current = rawProgress.get()

      if (deltaY > 0 && current < 0.98) {
        e.preventDefault()
        const next = Math.min(1, Math.max(0, current + deltaY * 0.0022))
        rawProgress.set(next)
        touchStartYRef.current = currentY
      } else if (deltaY < 0 && current > 0.02 && window.scrollY <= 24) {
        e.preventDefault()
        const next = Math.min(1, Math.max(0, current + deltaY * 0.0022))
        rawProgress.set(next)
        touchStartYRef.current = currentY
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [rawProgress])

  const heroScale = useTransform(rawProgress, [0, 0.3], [1, 1.35])
  const heroOpacity = useTransform(rawProgress, [0, 0.25], [1, 0])

  const outroOpacity = useTransform(rawProgress, [0.78, 0.94], [0, 1])
  const outroScale = useTransform(rawProgress, [0.78, 0.94], [0.88, 1])

  const pct = Math.min(100, Math.max(0, Math.round(scrollProgress * 100)))

  return (
    <div ref={containerRef} className="pth-root">
      <style>{`
        .pth-root {
          position: relative;
          width: 100%;
          height: 92vh;
          min-height: 620px;
          background: #040d09;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }
        .pth-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.14;
          pointer-events: none;
          background-image: radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.35) 1px, transparent 0);
          background-size: 38px 38px;
        }
        .pth-radial-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.16) 0%, rgba(4, 13, 9, 0.92) 70%);
        }
        .pth-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .pth-hero-center {
          position: relative;
          z-index: 20;
          text-align: center;
          max-width: 820px;
          padding: 0 24px;
          pointer-events: none;
        }
        .pth-eyebrow {
          display: inline-block;
          margin-bottom: 16px;
          padding: 6px 16px;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.35);
          background: rgba(16, 185, 129, 0.1);
          font-size: 11px;
          font-family: monospace;
          letter-spacing: 0.28em;
          color: #6ee7b7;
          text-transform: uppercase;
        }
        .pth-title {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: clamp(2.4rem, 6.5vw, 5.2rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #ffffff;
          line-height: 0.96;
          margin: 0 0 22px;
        }
        .pth-title-accent {
          background: linear-gradient(90deg, #6ee7b7, #34d399, #a7f3d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pth-subtitle {
          color: rgba(236, 253, 245, 0.72);
          font-size: clamp(0.95rem, 1.5vw, 1.12rem);
          max-width: 540px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }
        .pth-card-outer {
          cursor: pointer;
        }
        .pth-card-inner {
          position: relative;
          width: clamp(210px, 24vw, 320px);
          aspect-ratio: 4 / 5;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
          background: #071710;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .pth-card-outer:hover .pth-card-inner {
          border-color: rgba(52, 211, 153, 0.65);
        }
        .pth-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .pth-card-outer:hover .pth-card-img {
          transform: scale(1.08);
        }
        .pth-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(2, 12, 8, 0.92) 0%, rgba(2, 12, 8, 0.15) 55%, transparent 100%);
        }
        .pth-card-meta {
          position: absolute;
          bottom: 18px;
          left: 18px;
          right: 18px;
        }
        .pth-card-index {
          display: block;
          font-size: 10px;
          font-family: monospace;
          letter-spacing: 0.2em;
          color: #6ee7b7;
          margin-bottom: 4px;
        }
        .pth-card-title {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .pth-outro {
          position: absolute;
          z-index: 30;
          text-align: center;
          padding: 0 20px;
        }
        .pth-outro-title {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin: 0 0 18px;
        }
        .pth-cta-btn {
          padding: 14px 28px;
          border-radius: 999px;
          border: 1px solid rgba(52, 211, 153, 0.5);
          background: #10b981;
          color: #022c22;
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.35);
        }
        .pth-cta-btn:hover {
          background: #34d399;
          transform: translateY(-2px);
        }
        .pth-hud-bottom {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 24px;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pth-progress-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(6, 22, 15, 0.78);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .pth-progress-label {
          font-size: 11px;
          font-family: monospace;
          color: #a7f3d0;
          letter-spacing: 0.1em;
        }
        .pth-progress-track {
          width: 110px;
          height: 5px;
          background: rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          overflow: hidden;
        }
        .pth-progress-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.15s ease-out;
        }
        .pth-skip-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: #ecfdf5;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pth-skip-btn:hover {
          background: rgba(16, 185, 129, 0.25);
          border-color: rgba(52, 211, 153, 0.5);
        }
      `}</style>

      <div className="pth-grid-bg" />
      <div className="pth-radial-glow" />

      <div className="pth-viewport">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="pth-hero-center"
        >
          <span className="pth-eyebrow">{eyebrow}</span>
          <h1 className="pth-title">
            {titleLine1} <br />
            <span className="pth-title-accent">{titleLine2}</span>
          </h1>
          <p className="pth-subtitle">{subtitle}</p>
        </motion.div>

        {items.map((item, i) => (
          <TunnelCard
            key={`${item.src}-${i}`}
            item={item}
            index={i}
            total={items.length}
            progress={rawProgress}
            onClick={() => onSelectImage?.(i)}
          />
        ))}

        <motion.div
          style={{ opacity: outroOpacity, scale: outroScale }}
          className="pth-outro"
        >
          <h2 className="pth-outro-title">ARSIP LENGKAP</h2>
          <button
            type="button"
            onClick={onExploreClick}
            className="pth-cta-btn"
          >
            {ctaLabel}
          </button>
        </motion.div>
      </div>

      <div className="pth-hud-bottom">
        <div className="pth-progress-wrap">
          <span className="pth-progress-label">LORONG 3D: {pct}%</span>
          <div className="pth-progress-track">
            <div
              className="pth-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="pth-progress-label">
            {pct < 98 ? 'SCROLL UNTUK MAJU' : 'SCROLL KE BAWAH ↓'}
          </span>
        </div>

        {onExploreClick && (
          <button
            type="button"
            onClick={onExploreClick}
            className="pth-skip-btn"
          >
            Langsung ke Grid Foto ↓
          </button>
        )}
      </div>
    </div>
  )
}

export default PerspectiveTunnelHero
