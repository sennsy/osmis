"use client";

import React, { useEffect, useState, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

export default function PointerHexagons() {
  const [position, setPosition] = useState<Point>({ x: -100, y: -100 });
  const [isMobile, setIsMobile] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const targetPos = useRef<Point>({ x: -100, y: -100 });

  useEffect(() => {
    // Check if mobile
    if (window.innerWidth <= 768) {
      setIsMobile(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      setPosition(prev => {
        // Smooth interpolation (lerp)
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        };
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden'
      }}
    >
      <svg 
        style={{
          position: 'absolute',
          top: position.y - 30,
          left: position.x - 30,
          width: '60px',
          height: '60px',
          opacity: 0.3,
          transition: 'opacity 0.2s',
          fill: 'none',
          stroke: 'var(--osmis-green)',
          strokeWidth: 1
        }}
        viewBox="0 0 100 100"
      >
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
      </svg>
      <svg 
        style={{
          position: 'absolute',
          top: position.y - 15,
          left: position.x - 15,
          width: '30px',
          height: '30px',
          opacity: 0.5,
          transition: 'opacity 0.2s',
          fill: 'none',
          stroke: 'var(--osmis-yellow)',
          strokeWidth: 0.5
        }}
        viewBox="0 0 100 100"
      >
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
      </svg>
    </div>
  );
}
