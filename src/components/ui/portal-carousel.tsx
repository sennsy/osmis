'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import gsap from 'gsap'

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Parked preview inset from the bottom-right corner, px
const PARK_INSET = 28
// Preview top-left corner sits on the cursor (fraction of its size)
const CURSOR_ANCHOR_X = 0
const CURSOR_ANCHOR_Y = 0
// Tag offset from the cursor tip, px
const TAG_OFFSET_X = 14
const TAG_OFFSET_Y = 10

export interface PortalCarouselImage {
  src: string
  alt?: string
  /** Short title shown on the left while this image is up. */
  title?: string
}

export interface PortalCarouselProps {
  /** Images, shown in order and looping. Needs at least two. */
  images: PortalCarouselImage[]
  /** Initial index to display when opened. */
  initialIndex?: number
  /** Callback fired when the active image index changes. */
  onIndexChange?: (index: number) => void
  /** Text on the cursor tag. */
  label?: string
  /** Preview size, px (square, capped at 42vw). */
  thumbWidth?: number
  /** How quickly the preview chases the cursor, 0.02-1. */
  followSpeed?: number
  /** Preview-to-fullscreen expansion time, s. */
  duration?: number
  /** GSAP ease for the expansion. Fast start, slow finish by default. */
  ease?: string
  className?: string
  /** Overlay content (header, copy). Non-interactive unless elements opt in with pointer-events-auto. */
  children?: ReactNode
}

export function PortalCarousel({
  images,
  initialIndex = 0,
  onIndexChange,
  label = 'KLIK → FOTO BERIKUTNYA',
  thumbWidth = 240,
  followSpeed = 0.09,
  duration = 0.9,
  ease = 'expo.out',
  className = '',
  children,
}: PortalCarouselProps) {
  const safeInitial =
    images.length > 0
      ? ((initialIndex % images.length) + images.length) % images.length
      : 0

  const [currentIndex, setCurrentIndex] = useState(safeInitial)

  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewImgRef = useRef<HTMLImageElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLHeadingElement>(null)

  const currentIndexRef = useRef(safeInitial)
  const isAnimatingRef = useRef(false)
  const isHoveringRef = useRef(false)

  // Sync when initialIndex prop changes externally
  useEffect(() => {
    const nextIdx =
      images.length > 0
        ? ((initialIndex % images.length) + images.length) % images.length
        : 0
    currentIndexRef.current = nextIdx
    setCurrentIndex(nextIdx)
  }, [initialIndex, images.length])

  // Smoothed vs target coordinates for the preview and the cursor tag
  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const tagPosRef = useRef({ x: 0, y: 0 })
  const tagTargetRef = useRef({ x: 0, y: 0 })

  const nextIndex = images.length > 0 ? (currentIndex + 1) % images.length : 0
  const currentImage = images[currentIndex]
  const nextImage = images[nextIndex]
  const activeTitle = currentImage?.title
  const hasAnyTitle = images.some((i) => i.title)

  // Preload so the swap at the end of the expansion doesn't flash blank
  useEffect(() => {
    images.forEach(({ src }) => {
      const img = new Image()
      img.src = src
    })
  }, [images])

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current
    const preview = previewRef.current
    const tag = tagRef.current
    if (!container || !preview) return

    const getThumbSize = () => {
      const rect = container.getBoundingClientRect()
      const side = Math.min(thumbWidth, rect.width * 0.36, rect.height * 0.36)
      return { w: side, h: side }
    }

    const getRestPosition = () => {
      const rect = container.getBoundingClientRect()
      const { w, h } = getThumbSize()
      return {
        x: rect.width - w - PARK_INSET,
        y: rect.height - h - PARK_INSET,
      }
    }

    // Start parked in the bottom-right corner
    const initial = getRestPosition()
    posRef.current = { ...initial }
    targetRef.current = { ...initial }

    const { w, h } = getThumbSize()
    gsap.set(preview, {
      x: initial.x,
      y: initial.y,
      width: w,
      height: h,
    })

    if (tag) {
      gsap.set(tag, { opacity: 0, scale: 0.85 })
    }

    // Per-frame lerp via GSAP's ticker so it stays in lockstep with tweens
    const tick = () => {
      if (!isAnimatingRef.current) {
        posRef.current.x +=
          (targetRef.current.x - posRef.current.x) * followSpeed
        posRef.current.y +=
          (targetRef.current.y - posRef.current.y) * followSpeed

        gsap.set(preview, {
          x: posRef.current.x,
          y: posRef.current.y,
        })
      }

      if (tag) {
        tagPosRef.current.x +=
          (tagTargetRef.current.x - tagPosRef.current.x) * 0.22
        tagPosRef.current.y +=
          (tagTargetRef.current.y - tagPosRef.current.y) * 0.22

        gsap.set(tag, {
          x: tagPosRef.current.x,
          y: tagPosRef.current.y,
        })
      }
    }

    gsap.ticker.add(tick)

    const onResize = () => {
      if (isAnimatingRef.current) return
      const size = getThumbSize()
      gsap.set(preview, { width: size.w, height: size.h })
      if (!isHoveringRef.current) {
        const rest = getRestPosition()
        targetRef.current = { ...rest }
        posRef.current = { ...rest }
      }
    }

    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
    }
  }, [thumbWidth, followSpeed])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const side = Math.min(thumbWidth, rect.width * 0.36, rect.height * 0.36)

    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    targetRef.current.x = cursorX - side * CURSOR_ANCHOR_X
    targetRef.current.y = cursorY - side * CURSOR_ANCHOR_Y

    tagTargetRef.current.x = cursorX + TAG_OFFSET_X
    tagTargetRef.current.y = cursorY + TAG_OFFSET_Y

    if (!isHoveringRef.current) {
      isHoveringRef.current = true
      tagPosRef.current = { ...tagTargetRef.current }

      if (tagRef.current && !isAnimatingRef.current) {
        gsap.to(tagRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
    }
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const side = Math.min(thumbWidth, rect.width * 0.36, rect.height * 0.36)

    targetRef.current = {
      x: rect.width - side - PARK_INSET,
      y: rect.height - side - PARK_INSET,
    }

    if (tagRef.current) {
      gsap.to(tagRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on interactive overlay buttons (Download, Close, etc.)
    const targetEl = e.target as HTMLElement
    if (targetEl.closest('[data-portal-ignore="true"]')) {
      return
    }

    if (isAnimatingRef.current || images.length < 2) return

    const container = containerRef.current
    const preview = previewRef.current
    const previewImg = previewImgRef.current
    if (!container || !preview || !previewImg) return

    const rect = container.getBoundingClientRect()
    const side = Math.min(thumbWidth, rect.width * 0.36, rect.height * 0.36)

    const spawnAt = () => {
      if (isHoveringRef.current) {
        const cursorX = e.clientX - rect.left
        const cursorY = e.clientY - rect.top
        return {
          x: cursorX - side * CURSOR_ANCHOR_X,
          y: cursorY - side * CURSOR_ANCHOR_Y,
        }
      }
      return {
        x: rect.width - side - PARK_INSET,
        y: rect.height - side - PARK_INSET,
      }
    }

    const upcoming = (currentIndexRef.current + 1) % images.length

    if (prefersReducedMotion()) {
      currentIndexRef.current = upcoming
      setCurrentIndex(upcoming)
      onIndexChange?.(upcoming)
      return
    }

    isAnimatingRef.current = true
    const titleEl = titleTextRef.current

    if (tagRef.current) {
      gsap.to(tagRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    if (titleEl) {
      gsap.to(titleEl, {
        yPercent: -110,
        duration: Math.min(0.45, duration * 0.45),
        ease: 'power3.in',
        overwrite: 'auto',
      })
    }

    gsap.to(previewImg, {
      scale: 1,
      duration,
      ease,
    })

    gsap.to(preview, {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
      duration,
      ease,
      onComplete: () => {
        currentIndexRef.current = upcoming
        setCurrentIndex(upcoming)
        onIndexChange?.(upcoming)

        const spawn = spawnAt()
        posRef.current = { ...spawn }
        targetRef.current = { ...spawn }

        // Hide at fullscreen, then pop back in from the cursor on the next frame
        gsap.set(preview, {
          opacity: 0,
          x: spawn.x,
          y: spawn.y,
          width: side,
          height: side,
          scale: 0.75,
        })
        gsap.set(previewImg, { scale: 1.12 })

        if (titleEl) {
          gsap.set(titleEl, { yPercent: 110 })
        }

        requestAnimationFrame(() => {
          if (titleEl) {
            gsap.to(titleEl, {
              yPercent: 0,
              duration: 0.65,
              ease: 'power3.out',
            })
          }

          gsap.to(preview, {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: 'power3.out',
            onComplete: () => {
              isAnimatingRef.current = false

              if (isHoveringRef.current && tagRef.current) {
                gsap.to(tagRef.current, {
                  opacity: 1,
                  scale: 1,
                  duration: 0.25,
                  ease: 'power2.out',
                })
              }
            },
          })
        })
      },
    })
  }

  // Keyboard support: ArrowRight / Space advances to next photo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (images.length >= 2 && !isAnimatingRef.current) {
          const upcoming = (currentIndexRef.current + 1) % images.length
          currentIndexRef.current = upcoming
          setCurrentIndex(upcoming)
          onIndexChange?.(upcoming)
        }
      } else if (e.key === 'ArrowLeft') {
        if (images.length >= 2 && !isAnimatingRef.current) {
          const prev =
            (currentIndexRef.current - 1 + images.length) % images.length
          currentIndexRef.current = prev
          setCurrentIndex(prev)
          onIndexChange?.(prev)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onIndexChange])

  if (images.length === 0) return null

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`portal-carousel-root ${className}`}
    >
      <style>{`
        .portal-carousel-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #060b08;
          user-select: none;
          cursor: pointer;
        }
        .portal-carousel-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          z-index: 1;
        }
        .portal-carousel-bg-blur {
          position: absolute;
          inset: -20px;
          width: calc(100% + 40px);
          height: calc(100% + 40px);
          object-fit: cover;
          filter: blur(28px) brightness(0.32);
          pointer-events: none;
          z-index: 0;
        }
        .portal-carousel-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .portal-carousel-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
        }
        .portal-carousel-title-wrap {
          position: absolute;
          left: clamp(20px, 5vw, 56px);
          bottom: clamp(72px, 10vh, 110px);
          z-index: 10;
          overflow: hidden;
          pointer-events: none;
          max-width: min(560px, 65vw);
        }
        .portal-carousel-title {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: clamp(1.35rem, 3.2vw, 2.75rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-shadow: 0 4px 24px rgba(0,0,0,0.65);
          margin: 0;
          will-change: transform;
        }
        .portal-carousel-preview {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 20;
          overflow: hidden;
          border-radius: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.78);
          pointer-events: none;
          will-change: transform, width, height, opacity;
          background: #0d1612;
        }
        .portal-carousel-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
          transform: scale(1.12);
          display: block;
        }
        .portal-carousel-preview-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          background: rgba(6, 15, 11, 0.78);
          backdrop-filter: blur(8px);
          color: #ecfdf5;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.35);
          text-align: center;
        }
        .portal-carousel-tag {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 30;
          background: #10b981;
          color: #042f2e;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 999px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          pointer-events: none;
          will-change: transform, opacity;
          white-space: nowrap;
        }
      `}</style>

      {/* Subtle blurred backdrop so portrait/landscape photos look rich in fullscreen */}
      <img
        src={currentImage.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        referrerPolicy="no-referrer"
        className="portal-carousel-bg-blur"
      />

      {/* Fullscreen active image */}
      <img
        src={currentImage.src}
        alt={currentImage.alt ?? ''}
        draggable={false}
        referrerPolicy="no-referrer"
        className="portal-carousel-bg-img"
      />

      <div className="portal-carousel-vignette" />

      {children && <div className="portal-carousel-overlay">{children}</div>}

      {hasAnyTitle && (
        <div className="portal-carousel-title-wrap">
          <h2 ref={titleTextRef} className="portal-carousel-title">
            {activeTitle ?? '\u00A0'}
          </h2>
        </div>
      )}

      {/* Floating preview portal of the next image */}
      {images.length > 1 && nextImage && (
        <div ref={previewRef} className="portal-carousel-preview">
          <img
            ref={previewImgRef}
            src={nextImage.src}
            alt={nextImage.alt ?? ''}
            draggable={false}
            referrerPolicy="no-referrer"
            className="portal-carousel-preview-img"
          />
          <div className="portal-carousel-preview-badge">
            Selanjutnya ({nextIndex + 1}/{images.length}) • Klik Layar
          </div>
        </div>
      )}

      {/* Cursor tag */}
      {label && images.length > 1 && (
        <div ref={tagRef} className="portal-carousel-tag">
          {label}
        </div>
      )}
    </div>
  )
}

export default PortalCarousel
