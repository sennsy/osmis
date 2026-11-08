"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./thinking-orb.module.css";

export interface ThinkingOrbProps {
  /** Size in pixels (default: 150) */
  size?: number;
  /** Status labels to cycle through while thinking */
  labels?: string[];
  /** Whether to show the status chip below the orb (default: true) */
  showLabels?: boolean;
  className?: string;
}

const DEFAULT_LABELS = [
  "Memikirkan...",
  "Mencari Data OSMIS...",
  "Menganalisis Konteks...",
  "Menyusun Jawaban...",
];

const N = 1200;
const CANVAS_BASE = 220;
const ORB_R = 68;
const TAU = Math.PI * 2;
const CP = Math.cos(0.35);
const SP = Math.sin(0.35);
const C0 = CANVAS_BASE / 2;

// Precompute Fibonacci sphere points
const DX = new Float32Array(N);
const DY = new Float32Array(N);
const DZ = new Float32Array(N);
const DU = new Float32Array(N);
const DS = new Float32Array(N);

for (let i = 0; i < N; i++) {
  const u = (i + 0.5) / N;
  const y = 1 - 2 * u;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = i * 2.399963229728653; // Golden angle
  DX[i] = r * Math.cos(theta);
  DY[i] = y;
  DZ[i] = r * Math.sin(theta);
  DU[i] = u;
  DS[i] = (i * 1.618033988749895) % TAU;
}

// Precompute color palette steps for high performance
const A_STEPS = 32;
const G_STEPS = 8;
const COLORS: string[] = (() => {
  const out: string[] = [];
  for (let gi = 0; gi <= G_STEPS; gi++) {
    const g = gi / G_STEPS;
    // Blend from Emerald (16, 185, 129) -> Mint (52, 211, 153) -> OSMIS Gold (214, 159, 48)
    const r = Math.round(52 + g * (214 - 52));
    const gg = Math.round(211 + g * (159 - 211));
    const b = Math.round(153 + g * (48 - 153));
    for (let ai = 0; ai <= A_STEPS; ai++) {
      out.push(`rgba(${r},${gg},${b},${(ai / A_STEPS).toFixed(3)})`);
    }
  }
  return out;
})();

export default function ThinkingOrb({
  size = 150,
  labels = DEFAULT_LABELS,
  showLabels = true,
  className = "",
}: ThinkingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLabelIdx, setCurrentLabelIdx] = useState(0);
  const [isLabelFading, setIsLabelFading] = useState(false);

  // Cycle thinking labels smoothly
  useEffect(() => {
    if (!showLabels || labels.length <= 1) return;

    const interval = setInterval(() => {
      setIsLabelFading(true);
      setTimeout(() => {
        setCurrentLabelIdx((prev) => (prev + 1) % labels.length);
        setIsLabelFading(false);
      }, 220);
    }, 2200);

    return () => clearInterval(interval);
  }, [labels, showLabels]);

  // 3D Canvas Particle Sphere animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    canvas.width = Math.round(CANVAS_BASE * dpr);
    canvas.height = Math.round(CANVAS_BASE * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const lit = new Float32Array(N);
    const SX = new Float32Array(N);
    const SY = new Float32Array(N);
    const SR = new Float32Array(N);
    const SD = new Float32Array(N);
    const SC = new Int16Array(N);
    const pw = [1, 0, 0, 0];

    let time = 0;
    let last = performance.now();
    let rot = 0;
    let currentProg = 0;
    let progTimer = 0;
    let animId = 0;
    let isDisposed = false;

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, CANVAS_BASE, CANVAS_BASE);
      time += dt;
      rot += 0.85 * dt;

      // Cycle light programs (spotlight, beams, latitude ring, pulse)
      progTimer += dt;
      if (progTimer > 1.8) {
        progTimer = 0;
        currentProg = (currentProg + 1) % 4;
      }

      const cyw = Math.cos(rot);
      const syw = Math.sin(rot);
      const stepW = dt / 0.35;

      for (let q = 0; q < 4; q++) {
        const d = (q === currentProg ? 1 : 0) - pw[q];
        pw[q] += Math.abs(d) <= stepW ? d : d > 0 ? stepW : -stepW;
      }

      const decay = Math.exp(-dt / 0.5);
      const h0 = (time * 300) % N;
      const h3 = (time * 480) % N;
      const a1 = time * 0.8;
      const b1 = Math.sin(time * 0.5) * 0.9;
      const f1x = Math.cos(b1) * Math.cos(a1);
      const f1y = Math.sin(b1);
      const f1z = Math.cos(b1) * Math.sin(a1);

      const a2 = time * 0.55 + 2.1;
      const b2 = Math.cos(time * 0.42) * 0.9;
      const f2x = Math.cos(b2) * Math.cos(a2);
      const f2y = Math.sin(b2);
      const f2z = Math.cos(b2) * Math.sin(a2);
      const lat = Math.sin(time * 2.2);

      for (let n = 0; n < N; n++) {
        const dx = DX[n];
        const dy = DY[n];
        const dz = DZ[n];
        const u = DU[n];

        let pulse = 0;
        if (pw[0] > 0.001) {
          let dd = Math.abs(n - h0);
          if (dd > N - dd) dd = N - dd;
          const v = Math.max(0, 1 - dd / 16);
          pulse = Math.max(pulse, v * v * pw[0]);
        }
        if (pw[1] > 0.001) {
          const v1 = Math.max(0, (dx * f1x + dy * f1y + dz * f1z - 0.72) / 0.28);
          const v2 = Math.max(0, (dx * f2x + dy * f2y + dz * f2z - 0.72) / 0.28);
          pulse = Math.max(pulse, Math.max(v1, v2) * pw[1]);
        }
        if (pw[2] > 0.001) {
          const e = dy - lat;
          const v = Math.max(0, 1 - (e * e) / 0.02);
          pulse = Math.max(pulse, v * v * pw[2]);
        }
        if (pw[3] > 0.001) {
          let dd = Math.abs(n - h3);
          if (dd > N - dd) dd = N - dd;
          const v = Math.max(0, 1 - dd / 22);
          pulse = Math.max(pulse, v * v * pw[3]);
        }

        const l = Math.max(lit[n] * decay, pulse);
        lit[n] = l;

        // 3D Rotation projection
        const x1 = dx * cyw + dz * syw;
        const z1 = -dx * syw + dz * cyw;
        const y2 = dy * CP - z1 * SP;
        const z2 = dy * SP + z1 * CP;
        const f = 2.8 / (2.8 - z2);
        const depth = (z2 + 1) / 2;

        const ox = x1 * ORB_R * f;
        const oy = -y2 * ORB_R * f;

        const g = Math.max(0, Math.min(1, (0.5 - u) / 0.4));
        let a =
          0.12 +
          0.04 * Math.sin(DS[n] + time * 1.6) * (1 - g) +
          0.35 * depth * depth +
          0.75 * l * (1 - g) +
          g * (0.55 + 0.4 * depth);
        if (a > 1) a = 1;

        SX[n] = C0 + ox;
        SY[n] = C0 + oy;
        SD[n] = depth;
        SR[n] = (1.1 * (0.45 + 0.75 * depth) * f + 0.85 * l + g * 0.25);

        const ai = Math.round(a * A_STEPS);
        const gi = Math.round(g * G_STEPS);
        SC[n] = ai <= 0 ? -1 : gi * (A_STEPS + 1) + ai;
      }

      // Two-pass depth sort: back half first, then front half
      for (let pass = 0; pass < 2; pass++) {
        for (let n = 0; n < N; n++) {
          const c = SC[n];
          if (c < 0) continue;
          if (SD[n] >= 0.5 !== (pass === 1)) continue;
          ctx.fillStyle = COLORS[c];
          ctx.beginPath();
          ctx.arc(SX[n], SY[n], SR[n], 0, TAU);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      if (isDisposed) return;
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      draw(dt);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`${styles.orbContainer} ${className}`} aria-label="Matra AI sedang berpikir">
      <div className={styles.orbStage} style={{ width: size, height: size }}>
        <div className={styles.orbHalo} aria-hidden="true" />
        <canvas
          ref={canvasRef}
          className={styles.orbCanvas}
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      </div>

      {showLabels && (
        <div className={styles.orbStatus} aria-live="polite">
          <span className={styles.orbStatusDot} aria-hidden="true" />
          <span
            className={styles.orbStatusText}
            style={{ opacity: isLabelFading ? 0 : 1 }}
          >
            {labels[currentLabelIdx] || "Memikirkan..."}
          </span>
        </div>
      )}
    </div>
  );
}
