"use client"

import * as React from "react"

/**
 * Morph Gallery — a photo gallery whose slides dissolve into each other
 * through noise instead of cutting or cross-fading.
 *
 * The transition is one full-screen shader pass over two textures. An fbm
 * noise field gives every pixel a threshold, and the progress value sweeps
 * past those thresholds, so the outgoing frame tears away in drifting tatters
 * rather than fading uniformly. The threshold is biased by the luminance of
 * the *incoming* frame, which makes its bright areas burn through first — the
 * detail that stops it reading as a generic dissolve filter.
 *
 * Self-contained: raw WebGL, React is the only import. No gallery library, no
 * animation library, no CSS file. The canvas sizes itself from its own box.
 *
 * Textures need CORS. An image served without `Access-Control-Allow-Origin`
 * cannot be uploaded to WebGL at all, so the component detects that and falls
 * back to a plain DOM cross-fade — the gallery still works, it just stops
 * morphing. That is the difference between "no shader" and "black rectangle".
 */

export type MorphItem = {
  /** Full-size image. Must be served with CORS headers to be morphed. */
  src: string
  /** Thumbnail for the strip. Falls back to `src`, which is wasteful. */
  thumb?: string
  alt?: string
}

export type MorphGalleryProps = {
  items: MorphItem[]
  /** **Must be a definite length.** The canvas fills this box. */
  height?: string
  /** Milliseconds of dissolve. */
  duration?: number
  /** fbm frequency. Higher tears into finer shreds. */
  noiseScale?: number
  /** Width of the dissolve front, in threshold units. 0 is a hard edge. */
  edge?: number
  /** How far the frames slide against each other while dissolving. */
  drift?: number
  /** Wrap past the ends. */
  loop?: boolean
  /** Milliseconds between automatic advances. 0 (default) is off. */
  autoplay?: number
  arrows?: boolean
  thumbnails?: boolean
  /** Controlled index. Omit for uncontrolled. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  className?: string
}

// #region gallery
/** Wrap past the ends when looping, clamp at them when not. */
export const wrapIndex = (i: number, n: number, loop: boolean): number => {
  if (n <= 0) return 0
  return loop ? ((i % n) + n) % n : Math.min(Math.max(i, 0), n - 1)
}

/** Quintic in-out: the dissolve starts and ends still, and hurries the middle. */
export const easeInOutQuint = (t: number): number => {
  const x = Math.min(Math.max(t, 0), 1)
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2
}

/**
 * `object-fit: cover` expressed as a UV scale about the centre. Both factors
 * are <= 1: the sampled window shrinks, so the image crops rather than
 * stretching, whichever way the box is out of proportion.
 */
export const coverScale = (
  canvasAspect: number,
  imgAspect: number,
): [number, number] =>
  canvasAspect > imgAspect
    ? [1, imgAspect / canvasAspect]
    : [canvasAspect / imgAspect, 1]
// #endregion

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  vec2 fromUV = coverUV(
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction),
    u_fromAspect
  );
  vec2 toUV = coverUV(
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction),
    u_toAspect
  );

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}
`

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("could not create shader")
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error("shader compile failed: " + log)
  }
  return shader
}

const link = (gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) => {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()
  if (!program) throw new Error("could not create program")
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error("program link failed: " + log)
  }
  return program
}

const loadRawImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.referrerPolicy = "no-referrer"
    img.decoding = "async"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("could not load " + src))
    img.src = src
  })

const loadImage = (src: string) =>
  loadRawImage(src).catch(() => {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return loadRawImage(`/api/image-proxy?url=${encodeURIComponent(src)}`)
    }
    return Promise.reject(new Error("could not load " + src))
  })

export function MorphGallery({
  items,
  height = "100svh",
  duration = 1500,
  noiseScale = 3.5,
  edge = 0.15,
  drift = 0.5,
  loop = true,
  autoplay = 0,
  arrows = true,
  thumbnails = true,
  index,
  defaultIndex = 0,
  onIndexChange,
  className = "",
}: MorphGalleryProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const thumbListRef = React.useRef<HTMLUListElement | null>(null)
  const [uncontrolled, setUncontrolled] = React.useState(() =>
    wrapIndex(defaultIndex, items.length, loop),
  )
  const active = index === undefined ? uncontrolled : wrapIndex(index, items.length, loop)

  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const go = React.useCallback(
    (next: number) => {
      const wrapped = wrapIndex(next, items.length, loop)
      if (index === undefined) setUncontrolled(wrapped)
      onIndexChange?.(wrapped)
    },
    [index, items.length, loop, onIndexChange],
  )

  // Scroll active thumbnail into view smoothly
  React.useEffect(() => {
    const list = thumbListRef.current
    if (!list) return
    const activeEl = list.children[active] as HTMLElement | undefined
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }, [active])

  const tuning = React.useRef({ duration, noiseScale, edge, drift, reduced })
  tuning.current = { duration, noiseScale, edge, drift, reduced }

  const request = React.useRef<{ from: number; to: number } | null>(null)
  const previous = React.useRef(active)
  React.useEffect(() => {
    if (previous.current === active) return
    request.current = { from: previous.current, to: active }
    previous.current = active
  }, [active])

  const sources = items.map((i) => i.src).join("\n")

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: false }) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
    if (!gl) {
      setFailed(true)
      return
    }

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    const textures: (WebGLTexture | null)[] = items.map(() => null)
    const aspects: number[] = items.map(() => 1)
    let raf = 0
    let disposed = false

    let from = active
    let to = active
    let progress = 1
    let startedAt = 0
    let direction = 1

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
    }
    const onRestored = () => setGeneration((g) => g + 1)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (w === 0 || h === 0 || (canvas.width === w && canvas.height === h)) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const uniforms: Record<string, WebGLUniformLocation | null> = {}

    const pick = (i: number) => textures[i] ?? textures.find((t) => t) ?? null

    const inFlight: boolean[] = items.map(() => false)
    let running = false
    let refused = 0

    const ensureTexture = (i: number): Promise<void> => {
      if (disposed || i < 0 || i >= items.length) return Promise.resolve()
      if (textures[i] || inFlight[i]) return Promise.resolve()
      inFlight[i] = true
      const item = items[i]
      return loadImage(item.src).then(
        (img) => {
          if (disposed) return
          const tex = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          textures[i] = tex
          aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1)
          if (!running) {
            running = true
            resize()
            setReady(true)
            raf = requestAnimationFrame(frame)
          }
        },
        () => {
          refused += 1
          if ((i === active && !running) || refused === items.length) {
            if (!disposed) setFailed(true)
          }
        },
      )
    }

    const ensureWindow = (center: number) => {
      const n = items.length
      if (n === 0) return
      void ensureTexture(center)
      for (const offset of [1, -1, 2, -2, 3, -3]) {
        const idx = wrapIndex(center + offset, n, loop)
        void ensureTexture(idx)
      }
    }

    const draw = () => {
      if (disposed) return
      const t = tuning.current

      const pending = request.current
      if (pending) {
        request.current = null
        if (pending.from !== pending.to) {
          from = pending.from
          to = pending.to
          progress = 0
          startedAt = performance.now()
          const n = items.length
          const forward = loop
            ? ((pending.to - pending.from + n) % n) * 2 <= n
            : pending.to > pending.from
          direction = forward ? 1 : -1
          ensureWindow(to)
        }
      }

      if (progress < 1) {
        const span = t.reduced ? 0 : Math.max(t.duration, 1)
        const elapsed = performance.now() - startedAt
        progress = span === 0 ? 1 : easeInOutQuint(Math.min(elapsed / span, 1))
      }

      const fromTex = pick(from)
      const toTex = pick(to)
      if (!fromTex || !toTex) return

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, fromTex)
      gl.uniform1i(uniforms.from, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, toTex)
      gl.uniform1i(uniforms.to, 1)

      gl.uniform1f(uniforms.progress, progress)
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.fromAspect, aspects[from] ?? 1)
      gl.uniform1f(uniforms.toAspect, aspects[to] ?? 1)
      gl.uniform1f(uniforms.scale, t.noiseScale)
      gl.uniform1f(uniforms.direction, direction)
      gl.uniform1f(uniforms.edge, Math.max(t.edge, 0.001))
      gl.uniform1f(uniforms.drift, t.drift)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const frame = () => {
      draw()
      raf = requestAnimationFrame(frame)
    }

    const start = async () => {
      try {
        program = link(gl, VERT, FRAG)
        gl.useProgram(program)

        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        )
        const loc = gl.getAttribLocation(program, "a_position")
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        for (const name of [
          "from", "to", "progress", "resolution",
          "fromAspect", "toAspect", "scale", "direction", "edge", "drift",
        ]) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name)
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

        await ensureTexture(active)
        ensureWindow(active)
      } catch {
        if (!disposed) setFailed(true)
      }
    }
    void start()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      for (const tex of textures) if (tex) gl.deleteTexture(tex)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      textures.fill(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, generation, items.length, loop])

  // ---- autoplay ------------------------------------------------------------
  React.useEffect(() => {
    if (!autoplay || reduced || paused || items.length < 2) return
    const id = window.setInterval(() => go(active + 1), Math.max(autoplay, 600))
    return () => window.clearInterval(id)
  }, [autoplay, reduced, paused, active, go, items.length])

  React.useEffect(() => {
    const sync = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])

  // ---- pointer and keyboard ------------------------------------------------
  const swipe = React.useRef<number | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const startX = swipe.current
    swipe.current = null
    if (startX === null) return
    const dx = e.clientX - startX
    if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1))
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      go(active - 1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      go(active + 1)
    }
  }

  const atStart = !loop && active === 0
  const atEnd = !loop && active === items.length - 1
  const current = items[active]

  // Only render nearby DOM fallback images so large galleries stay fast and smooth
  const isNearby = (i: number) => {
    if (i === active) return true
    const n = items.length
    if (n <= 6) return true
    const prevIdx = wrapIndex(active - 1, n, loop)
    const nextIdx = wrapIndex(active + 1, n, loop)
    return i === prevIdx || i === nextIdx
  }

  return (
    <section
      className={"mg-root relative w-full overflow-hidden bg-black " + className}
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image gallery"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style>{MORPH_GALLERY_CSS}</style>

      {failed ? (
        items.map((item, i) =>
          isNearby(i) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${item.src}-${i}`}
              src={item.src}
              alt={item.alt ?? ""}
              referrerPolicy="no-referrer"
              draggable={false}
              className="mg-fallback-img"
              style={{
                maxWidth: "none",
                opacity: i === active ? 1 : 0,
                transform: i === active ? "scale(1)" : "scale(1.03)",
              }}
              aria-hidden={i !== active}
            />
          ) : null,
        )
      ) : (
        <canvas
          ref={canvasRef}
          className="mg-canvas"
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 400ms ease",
          }}
          aria-hidden="true"
        />
      )}

      <div className="mg-bottom-grad" aria-hidden="true" />

      {arrows && items.length > 1 && (
        <>
          <button
            type="button"
            className="mg-arrow mg-arrow-left"
            onClick={(e) => {
              e.stopPropagation()
              go(active - 1)
            }}
            disabled={atStart}
            aria-label="Previous image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="mg-arrow mg-arrow-right"
            onClick={(e) => {
              e.stopPropagation()
              go(active + 1)
            }}
            disabled={atEnd}
            aria-label="Next image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {thumbnails && items.length > 1 && (
        <ul ref={thumbListRef} className="mg-thumbs">
          {items.map((item, i) => (
            <li key={`${item.src}-${i}`} className="mg-thumb-item">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  go(i)
                }}
                aria-current={i === active}
                aria-label={item.alt ? "Show " + item.alt : "Show image " + (i + 1)}
                className={
                  "mg-thumb-btn " + (i === active ? "mg-thumb-active" : "mg-thumb-inactive")
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumb ?? item.src}
                  alt=""
                  width={80}
                  height={50}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="mg-thumb-img"
                  style={{ maxWidth: "none", width: 80, height: 50 }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <span className="mg-sr-only" aria-live="polite">
        {current ? current.alt ?? "Image " + (active + 1) : ""}
        {" — "}
        {active + 1} of {items.length}
      </span>
    </section>
  )
}

export default MorphGallery

const MORPH_GALLERY_CSS = `
.mg-root {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #060908;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}

.mg-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.mg-fallback-img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #060908;
  transition: opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 750ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.mg-bottom-grad {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  height: 14rem;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.72));
}

.mg-arrow {
  position: absolute;
  top: 50%;
  z-index: 10;
  display: flex;
  width: 46px;
  height: 46px;
  transform: translateY(-50%);
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%);
  color: #ffffff;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.mg-arrow:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.14) 100%);
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-50%) scale(1.06);
}

.mg-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.mg-arrow:disabled {
  pointer-events: none;
  opacity: 0.25;
}

.mg-arrow-left {
  left: 1.25rem;
}

.mg-arrow-right {
  right: 1.25rem;
}

@media (min-width: 640px) {
  .mg-arrow-left {
    left: 2rem;
  }
  .mg-arrow-right {
    right: 2rem;
  }
}

.mg-thumbs {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.75rem;
  z-index: 10;
  margin: 0 auto;
  display: flex;
  width: max-content;
  max-width: calc(100% - 2rem);
  gap: 0.5rem;
  list-style: none;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.35rem 0.5rem 0.6rem;
}

.mg-thumbs::-webkit-scrollbar {
  height: 5px;
}

.mg-thumbs::-webkit-scrollbar-track {
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.mg-thumbs::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.32);
}

.mg-thumb-item {
  flex-shrink: 0;
  list-style: none;
}

.mg-thumb-btn {
  display: block;
  cursor: pointer;
  overflow: hidden;
  border-radius: 6px;
  border: 2px solid transparent;
  background: transparent;
  padding: 0;
  transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.mg-thumb-active {
  border-color: #ffffff;
  opacity: 1;
  transform: scale(1.04);
}

.mg-thumb-inactive {
  border-color: transparent;
  opacity: 0.52;
}

.mg-thumb-inactive:hover {
  opacity: 0.85;
}

.mg-thumb-img {
  display: block;
  object-fit: cover;
}

.mg-sr-only {
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
`
