"use client";

import React, { useEffect, useRef, useState } from 'react';
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
  green: '#2e5942',
  yellow: '#d69f30',
  darkGreen: '#00ff88',
  lightYellow: '#ffe600',
  dust: ['#e3dac9', '#b5b5b5', '#6b8e23', '#ffd700'] // krem, abu, olive, kuning
};

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();

  // We use refs for mutable state that doesn't need to trigger re-renders
  const mouse = useRef({ x: -100, y: -100, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: -100, y: -100 });
  const trail = useRef<Point[]>([]);
  const particles = useRef<Particle[]>([]);
  
  // Hexagon state (with inertia)
  const hexState = useRef({ x: -100, y: -100, rot1: 0, rot2: Math.PI/4, rot3: Math.PI/2 });
  
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Theme detection
  const isDark = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      lastMouse.current = { x: mouse.current.x, y: mouse.current.y };
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.vx = e.clientX - lastMouse.current.x;
      mouse.current.vy = e.clientY - lastMouse.current.y;
      
      const speed = Math.sqrt(mouse.current.vx ** 2 + mouse.current.vy ** 2);

      // Add to trail (pencil sketch)
      if (!isScrolling.current && speed > 1) {
        // Add slightly wavy effect
        const noiseX = (Math.random() - 0.5) * 4;
        const noiseY = (Math.random() - 0.5) * 4;
        trail.current.push({ x: e.clientX + noiseX, y: e.clientY + noiseY, age: 0 });
        
        // Spawn dust
        if (Math.random() < (isHovering ? 0.4 : 0.2)) {
          const color = COLORS.dust[Math.floor(Math.random() * COLORS.dust.length)];
          particles.current.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 + 0.5, // slight gravity
            life: 0,
            maxLife: 30 + Math.random() * 30,
            color,
            size: Math.random() * 2 + 1
          });
        }
      }
    };

    const handleScroll = () => {
      isScrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);

    // Check theme
    const checkTheme = () => {
      isDark.current = document.documentElement.getAttribute('data-theme') === 'dark';
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Animation Loop
    let animationFrame: number;
    const drawHexagon = (x: number, y: number, radius: number, rotation: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * Math.PI) / 3;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const strokeColor = isDark.current ? COLORS.darkGreen : COLORS.green;
      // Convert hex to rgb for rgba
      const r = parseInt(strokeColor.slice(1,3), 16);
      const g = parseInt(strokeColor.slice(3,5), 16);
      const b = parseInt(strokeColor.slice(5,7), 16);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = isHovering ? 1.5 : 1;
      ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Triple Hexagon (25%)
      // Smoothing/Inertia
      const targetX = mouse.current.x;
      const targetY = mouse.current.y;
      const easing = isHovering ? 0.2 : 0.1;
      hexState.current.x += (targetX - hexState.current.x) * easing;
      hexState.current.y += (targetY - hexState.current.y) * easing;
      
      const rotSpeed = isHovering ? 0.005 : 0.01;
      hexState.current.rot1 += rotSpeed;
      hexState.current.rot2 -= rotSpeed * 1.2;
      hexState.current.rot3 += rotSpeed * 0.8;

      const r = isHovering ? 25 : 35;
      drawHexagon(hexState.current.x, hexState.current.y, r, hexState.current.rot1, 0.3);
      drawHexagon(hexState.current.x, hexState.current.y, r * 0.65, hexState.current.rot2, 0.2);
      drawHexagon(hexState.current.x, hexState.current.y, r * 0.3, hexState.current.rot3, 0.1);

      // 2. Pencil Trail (45%)
      if (trail.current.length > 1) {
        ctx.beginPath();
        const trailColor = isDark.current ? 'rgba(230,237,243,' : 'rgba(43,43,43,';
        
        for (let i = 0; i < trail.current.length - 1; i++) {
          const p1 = trail.current[i];
          const p2 = trail.current[i+1];
          p1.age++;
          
          if (p1.age < 30) {
            const alpha = (1 - p1.age / 30) * 0.5;
            ctx.moveTo(p1.x, p1.y);
            // Slight curve/wave
            const cx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 2;
            const cy = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 2;
            ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
            ctx.strokeStyle = `${trailColor}${alpha})`;
            ctx.lineWidth = isHovering ? 2 : 1.2;
            ctx.stroke();
            ctx.beginPath(); // Start new path for next line segment to change alpha
          }
        }
      }
      // Remove old trail points
      trail.current = trail.current.filter(p => p.age < 30);

      // 3. Paper Dust (20%)
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity drift
        
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
      particles.current = particles.current.filter(p => p.life < p.maxLife);

      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mouseover', handleMouseOver);
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isHovering, pathname]); // Re-bind if pathname changes so hover works

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
        zIndex: 9999, // extremely high to be on top of everything
      }}
    />
  );
}
