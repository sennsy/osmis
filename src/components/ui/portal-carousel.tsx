// Built using Hyperiux Vault: https://vault.hyperiux.com
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
  /** Initial image index when opening the carousel. */
  initialIndex?: number
  /** Callback fired whenever the active/incoming image index changes. */
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
  /** Overlay content (header, copy). Non-interactive unless it opts in with pointer-events-auto. */
  children?: ReactNode
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface Layer {
  id: number
  index: number
  origin: Rect
}

// Old value slides up and out while the new one rises in, through a mask
function RollingText({
  value,
  className = '',
}: {
  value: string
  className?: string
}) {
  const [state, setState] = useState<{
    current: string
    previous: string | null
  }>({
    current: value,
    previous: null,
  })

  if (state.current !== value) {
    setState({ current: value, previous: state.current })
  }

  const currentRef = useRef<HTMLSpanElement>(null)
  const previousRef = useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (state.previous === null) return
    const incoming = currentRef.current
    const outgoing = previousRef.current
    const reduced = prefersReducedMotion()

    const tweens = [
      reduced
        ? gsap.fromTo(
            incoming,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power1.out' }
          )
        : gsap.fromTo(
            incoming,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8, ease: 'expo.out' }
          ),
      reduced
        ? gsap.to(outgoing, { opacity: 0, duration: 0.2, ease: 'power1.out' })
        : gsap.fromTo(
            outgoing,
            { yPercent: 0 },
            { yPercent: -110, duration: 0.8, ease: 'expo.out' }
          ),
    ]

    return () => {
      tweens.forEach((tween) => tween.kill())
    }
  }, [state])

  return (
    <span
      className={`pc-rolling-root relative -mb-[0.2em] inline-block overflow-y-clip whitespace-nowrap pb-[0.2em] align-bottom ${className}`}
    >
      <span ref={currentRef} className="pc-rolling-current block">
        {state.current}
      </span>
      {state.previous !== null && (
        <span
          ref={previousRef}
          aria-hidden="true"
          className="pc-rolling-prev absolute inset-x-0 top-0 block"
        >
          {state.previous}
        </span>
      )}
    </span>
  )
}

function ExpandingLayer({
  layer,
  image,
  duration,
  ease,
  onDone,
}: {
  layer: Layer
  image: PortalCarouselImage
  duration: number
  ease: string
  onDone: (id: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    const parent = element?.parentElement
    if (!element || !parent) return

    const { width, height } = parent.getBoundingClientRect()
    const done = () => onDoneRef.current(layer.id)

    const tween = prefersReducedMotion()
      ? gsap.fromTo(
          element,
          { left: 0, top: 0, width, height, opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power1.out', onComplete: done }
        )
      : gsap.to(element, {
          left: 0,
          top: 0,
          width,
          height,
          borderRadius: 0,
          duration,
          ease,
          onComplete: done,
        })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pc-expanding-layer absolute overflow-hidden"
      style={{ ...layer.origin, zIndex: 10 + layer.id }}
    >
      <img
        src={image.src}
        alt=""
        draggable={false}
        referrerPolicy="no-referrer"
        className="pc-layer-img h-full w-full object-cover"
      />
    </div>
  )
}

export function PortalCarousel({
  images,
  initialIndex = 0,
  onIndexChange,
  label = 'Next',
  thumbWidth = 200,
  followSpeed = 0.14,
  duration = 1.2,
  ease = 'expo.out',
  className = '',
  children,
}: PortalCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLButtonElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const layerIdRef = useRef(0)
  const followSpeedRef = useRef(followSpeed)
  followSpeedRef.current = followSpeed

  const count = images.length
  const wrap = (index: number) => (count > 0 ? ((index % count) + count) % count : 0)

  const [current, setCurrent] = useState(() => wrap(initialIndex))
  const [layers, setLayers] = useState<Layer[]>([])

  // Newest image on its way in, or the one on screen
  const head = layers.length ? layers[layers.length - 1].index : current
  const thumbIndex = wrap(head + 1)
  const headTitle = count ? images[wrap(head)]?.title : undefined

  // Notify parent when active head index changes (e.g. so Download button gets current photo)
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange
  useEffect(() => {
    if (count > 0) {
      onIndexChangeRef.current?.(wrap(head))
    }
  }, [head, count])

  // Warm the cache so swaps never flash
  useEffect(() => {
    images.forEach(({ src }) => {
      const image = new Image()
      image.src = src
    })
  }, [images])

  // Tag sticks to the cursor; the preview trails it, or parks bottom-right
  useEffect(() => {
    const root = rootRef.current
    const follower = followerRef.current
    const tag = tagRef.current
    if (!root || !follower || !tag) return

    const pointer = { x: 0, y: 0, active: false }
    const position = { x: 0, y: 0 }
    let frame = 0
    let placed = false

    const tick = () => {
      frame = requestAnimationFrame(tick)
      const { width, height } = root.getBoundingClientRect()
      const thumbW = follower.offsetWidth
      const thumbH = follower.offsetHeight

      const goal = pointer.active
        ? {
            x: pointer.x - thumbW * CURSOR_ANCHOR_X,
            y: pointer.y - thumbH * CURSOR_ANCHOR_Y,
          }
        : {
            x: width - thumbW - PARK_INSET,
            y: height - thumbH - PARK_INSET,
          }

      const stepEase = prefersReducedMotion()
        ? 1
        : Math.min(Math.max(followSpeedRef.current, 0.02), 1)

      if (!placed) {
        position.x = goal.x
        position.y = goal.y
        placed = true
      } else {
        position.x += (goal.x - position.x) * stepEase
        position.y += (goal.y - position.y) * stepEase
      }

      follower.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`

      // No lag on the tag: it is the cursor
      const tagX = pointer.active ? pointer.x + TAG_OFFSET_X : position.x + 8
      const tagY = pointer.active ? pointer.y + TAG_OFFSET_Y : position.y + 8
      tag.style.transform = `translate3d(${tagX}px, ${tagY}px, 0)`
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = root.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }

    const onLeave = () => {
      pointer.active = false
    }

    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Every click launches its own layer, so rapid clicks stack frames
  const advance = () => {
    const root = rootRef.current
    const thumb = thumbRef.current
    if (!root || !thumb || count < 2) return

    const rootRect = root.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()

    layerIdRef.current += 1
    setLayers((previous) => [
      ...previous,
      {
        id: layerIdRef.current,
        index: thumbIndex,
        origin: {
          left: thumbRect.left - rootRect.left,
          top: thumbRect.top - rootRect.top,
          width: thumbRect.width,
          height: thumbRect.height,
        },
      },
    ])

    // The following preview grows in at the cursor
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        thumb,
        { scale: 0.2 },
        { scale: 1, duration: 0.45, ease: 'expo.out', overwrite: true }
      )
    }
  }

  // A finished layer becomes the background; anything beneath it goes
  const onLayerDone = (id: number) => {
    setLayers((previous) => {
      const finished = previous.find((layer) => layer.id === id)
      if (finished) setCurrent(finished.index)
      return previous.filter((layer) => layer.id > id)
    })
  }

  // Clicks on overlay links/buttons stay theirs
  const onRootClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const interactive = target.closest(
      'a, button, input, select, textarea, [role="button"], [data-portal-ignore="true"]'
    )
    if (interactive && interactive !== thumbRef.current) return
    advance()
  }

  if (count === 0) return null

  const currentImage = images[wrap(current)]
  const thumbImage = images[thumbIndex]

  return (
    <div
      ref={rootRef}
      onClick={onRootClick}
      aria-roledescription="carousel"
      className={`pc-root relative h-screen w-full cursor-pointer select-none overflow-hidden bg-black ${className}`}
    >
      <style>{`
        .pc-root {
          position: relative;
          height: 100vh;
          width: 100%;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
          background: #000000;
        }
        .pc-bg-img {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
        }
        .pc-layers-wrap {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .pc-expanding-layer {
          position: absolute;
          overflow: hidden;
          border-radius: 10px;
          will-change: left, top, width, height;
        }
        .pc-layer-img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
        }
        .pc-children-overlay {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 1000;
        }
        .pc-follower {
          pointer-events: none;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 1001;
          aspect-ratio: 1 / 1;
          will-change: transform;
        }
        .pc-thumb-btn {
          pointer-events: auto;
          position: relative;
          display: block;
          height: 100%;
          width: 100%;
          overflow: hidden;
          outline: none;
          border: 2px solid rgba(255, 255, 255, 0.55);
          border-radius: 12px;
          padding: 0;
          background: #0b1410;
          cursor: pointer;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
        }
        .pc-thumb-img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          display: block;
        }
        .pc-thumb-hint {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 8px;
          padding: 5px 8px;
          border-radius: 7px;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(6px);
          color: #ecfdf5;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
          border: 1px solid rgba(52, 211, 153, 0.4);
          pointer-events: none;
        }
        .pc-tag {
          pointer-events: none;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 1002;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(52, 211, 153, 0.55);
          padding: 0.38rem 0.65rem;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1;
          letter-spacing: 0.18em;
          color: #ecfdf5;
          border-radius: 6px;
          will-change: transform;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
        }
        .pc-meta-left {
          pointer-events: none;
          position: absolute;
          left: clamp(20px, 6vw, 80px);
          top: 50%;
          z-index: 999;
          display: flex;
          transform: translateY(-50%);
          flex-direction: column;
          gap: 0.75rem;
          color: #ffffff;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.85);
        }
        .pc-counter-row {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          font-size: 0.95rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
           align-self: flex-start;
        }
        .pc-title-rolling {
          font-family: var(--font-display, serif);
          font-size: clamp(1.5rem, 2.6vw, 2.75rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .pc-rolling-root {
          position: relative;
          margin-bottom: -0.2em;
          display: inline-block;
          overflow-y: clip;
          white-space: nowrap;
          padding-bottom: 0.2em;
          vertical-align: bottom;
        }
        .pc-rolling-current {
          display: block;
        }
        .pc-rolling-prev {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          display: block;
        }
        .pc-sr-only {
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
      `}</style>

      <img
        src={currentImage.src}
        alt={currentImage.alt ?? ''}
        draggable={false}
        referrerPolicy="no-referrer"
        className="pc-bg-img absolute inset-0 h-full w-full object-cover"
      />

      {/* Own stacking context: layer z-order never climbs over the overlays */}
      <div className="pc-layers-wrap absolute inset-0 z-[1]">
        {layers.map((layer) => (
          <ExpandingLayer
            key={layer.id}
            layer={layer}
            image={images[layer.index]}
            duration={duration}
            ease={ease}
            onDone={onLayerDone}
          />
        ))}
      </div>

      <div className="pc-children-overlay pointer-events-none absolute inset-0 z-[1000]">
        {children}
      </div>

      {count > 1 && (
        <>
          <div
            ref={followerRef}
            className="pc-follower pointer-events-none absolute left-0 top-0 z-[1001] aspect-square will-change-transform"
            style={{ width: `min(${thumbWidth}px, 42vw)` }}
          >
            <button
              ref={thumbRef}
              type="button"
              aria-label={`Show next image${thumbImage.alt ? `: ${thumbImage.alt}` : ''}`}
              className="pc-thumb-btn pointer-events-auto relative block h-full w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <img
                src={thumbImage.src}
                alt=""
                draggable={false}
                referrerPolicy="no-referrer"
                className="pc-thumb-img h-full w-full object-cover"
              />
              <span className="pc-thumb-hint">
                Selanjutnya ({thumbIndex + 1}/{count}) • Klik
              </span>
            </button>
          </div>

          <span
            ref={tagRef}
            aria-hidden="true"
            className="pc-tag pointer-events-none absolute left-0 top-0 z-[1002] bg-black px-2 py-1 text-[0.625rem] font-medium uppercase leading-none tracking-[0.2em] text-white will-change-transform"
          >
            {label}
          </span>
        </>
      )}

      <div className="pc-meta-left pointer-events-none absolute left-[10%] top-1/2 z-[999] flex -translate-y-1/2 flex-col gap-3 text-white">
        <span className="pc-counter-row flex items-baseline gap-1 text-sm font-medium tabular-nums tracking-wide text-white/70">
          <RollingText value={String(wrap(head) + 1)} />
          <span>/ {count}</span>
        </span>
        {headTitle && (
          <RollingText
            value={headTitle}
            className="pc-title-rolling text-[clamp(1.5rem,2.6vw,2.75rem)] font-medium leading-[1.1] tracking-tight"
          />
        )}
      </div>

      <p className="pc-sr-only sr-only" aria-live="polite">
        {`Image ${wrap(current) + 1} of ${count}${currentImage.alt ? `: ${currentImage.alt}` : ''}`}
      </p>
    </div>
  )
}

export default PortalCarousel
