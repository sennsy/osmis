"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Point {
  x: number;
  y: number;
  age: number;
  vx?: number;
  vy?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const COLORS = {
  greenRgb: '46,89,66',
  darkGreenRgb: '0,255,136',
  dust: ['#e3dac9', '#b5b5b5', '#6b8e23', '#ffd700'], // krem, abu, olive, kuning
};

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveringRef = useRef(false);
  const pathname = usePathname();

  // Mutable refs that never trigger React re-renders
  const mouse = useRef({ x: -100, y: -100, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: -100, y: -100 });
  const trail = useRef<Point[]>([]);
  const particles = useRef<Particle[]>([]);

  // Hexagon state (with inertia)
  const hexState = useRef({
    x: -100,
    y: -100,
    rot1: 0,
    rot2: Math.PI / 4,
    rot3: Math.PI / 2,
  });

  const isScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = useRef(false);

  useEffect(() => {
    // Skip custom cursor canvas entirely on touch / coarse-pointer devices
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    let isRunning = false;
    let idleFrames = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const drawHexagon = (
      x: number,
      y: number,
      radius: number,
      rotation: number,
      alpha: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * Math.PI) / 3;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const rgb = isDark.current ? COLORS.darkGreenRgb : COLORS.greenRgb;
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth = isHoveringRef.current ? 1.5 : 1;
      ctx.stroke();
    };

    const render = () => {
      if (document.hidden) {
        isRunning = false;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hovering = isHoveringRef.current;
      const targetX = mouse.current.x;
      const targetY = mouse.current.y;
      const easing = hovering ? 0.2 : 0.1;
      const dx = targetX - hexState.current.x;
      const dy = targetY - hexState.current.y;
      hexState.current.x += dx * easing;
      hexState.current.y += dy * easing;

      const rotSpeed = hovering ? 0.005 : 0.01;
      hexState.current.rot1 += rotSpeed;
      hexState.current.rot2 -= rotSpeed * 1.2;
      hexState.current.rot3 += rotSpeed * 0.8;

      const r = hovering ? 25 : 35;
      drawHexagon(hexState.current.x, hexState.current.y, r, hexState.current.rot1, 0.3);
      drawHexagon(
        hexState.current.x,
        hexState.current.y,
        r * 0.65,
        hexState.current.rot2,
        0.2
      );
      drawHexagon(
        hexState.current.x,
        hexState.current.y,
        r * 0.3,
        hexState.current.rot3,
        0.1
      );

      // 2. Pencil Trail (45%)
      if (trail.current.length > 1) {
        ctx.beginPath();
        const trailColor = isDark.current
          ? 'rgba(230,237,243,'
          : 'rgba(43,43,43,';

        for (let i = 0; i < trail.current.length - 1; i++) {
          const p1 = trail.current[i];
          const p2 = trail.current[i + 1];
          p1.age++;

          if (p1.age < 30) {
            const alpha = (1 - p1.age / 30) * 0.5;
            ctx.moveTo(p1.x, p1.y);
            const cx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 2;
            const cy = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 2;
            ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
            ctx.strokeStyle = `${trailColor}${alpha})`;
            ctx.lineWidth = hovering ? 2 : 1.2;
            ctx.stroke();
            ctx.beginPath();
          }
        }
      }
      trail.current = trail.current.filter((p) => p.age < 30);

      // 3. Paper Dust (20%)
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;

        const alpha = 1 - p.life / p.maxLife;
        if (alpha > 0) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
      particles.current = particles.current.filter((p) => p.life < p.maxLife);

      // Pause loop after cursor has settled and trails/particles are empty
      if (
        Math.abs(dx) < 0.15 &&
        Math.abs(dy) < 0.15 &&
        trail.current.length === 0 &&
        particles.current.length === 0
      ) {
        idleFrames++;
      } else {
        idleFrames = 0;
      }

      if (idleFrames < 90) {
        animationFrame = requestAnimationFrame(render);
      } else {
        isRunning = false;
      }
    };

    const wakeLoop = () => {
      idleFrames = 0;
      if (!isRunning && !document.hidden) {
        isRunning = true;
        animationFrame = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMouse.current = { x: mouse.current.x, y: mouse.current.y };
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.vx = e.clientX - lastMouse.current.x;
      mouse.current.vy = e.clientY - lastMouse.current.y;

      const speed = Math.sqrt(mouse.current.vx ** 2 + mouse.current.vy ** 2);

      if (!isScrolling.current && speed > 1) {
        const noiseX = (Math.random() - 0.5) * 4;
        const noiseY = (Math.random() - 0.5) * 4;
        trail.current.push({
          x: e.clientX + noiseX,
          y: e.clientY + noiseY,
          age: 0,
        });

        if (Math.random() < (isHoveringRef.current ? 0.4 : 0.2)) {
          const color =
            COLORS.dust[Math.floor(Math.random() * COLORS.dust.length)];
          particles.current.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 + 0.5,
            life: 0,
            maxLife: 30 + Math.random() * 30,
            color,
            size: Math.random() * 2 + 1,
          });
        }
      }

      wakeLoop();
    };

    const handleScroll = () => {
      isScrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      isHoveringRef.current = Boolean(
        target?.closest?.('a, button, [role="button"]')
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    const checkTheme = () => {
      isDark.current =
        document.documentElement.getAttribute('data-theme') === 'dark';
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mouseover', handleMouseOver);
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

