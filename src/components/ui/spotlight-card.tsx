"use client";

import React, { useEffect, useRef, ReactNode } from 'react';

export interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
  onClick?: () => void;
  title?: string;
  style?: React.CSSProperties;
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  onClick,
  title,
  style: propStyle,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    let raf = 0;

    const updatePosition = (clientX: number, clientY: number) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      cardRef.current.style.setProperty('--x', localX.toFixed(2));
      cardRef.current.style.setProperty('--xp', (clientX / Math.max(1, window.innerWidth)).toFixed(2));
      cardRef.current.style.setProperty('--y', localY.toFixed(2));
      cardRef.current.style.setProperty('--yp', (clientY / Math.max(1, window.innerHeight)).toFixed(2));
    };

    // Initialize with a pleasant default glow position on mount
    const rect = el.getBoundingClientRect();
    updatePosition(rect.left + rect.width * 0.5, rect.top + rect.height * 0.25);

    const syncPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updatePosition(e.clientX, e.clientY));
    };

    el.addEventListener('pointermove', syncPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', syncPointer);
    };
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties => {
    const baseStyles: Record<string, any> = {
      '--base': base,
      '--spread': spread,
      '--radius': '20',
      '--border': '2.5',
      '--backdrop': 'hsl(0 0% 60% / 0.14)',
      '--backup-border': 'var(--backdrop)',
      '--size': '260',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 62) * 1%) / var(--bg-spot-opacity, 0.22)),
        transparent 100%
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'manipulation',
      ...propStyle,
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles as React.CSSProperties;
  };

  const beforeAfterStyles = `
    [data-glow] {
      border-radius: calc(var(--radius, 14) * 1px);
      box-shadow: 0 1rem 2rem -1rem rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    [data-glow].w-48.h-64 { width: 12rem; height: 16rem; }
    [data-glow].w-64.h-80 { width: 16rem; height: 20rem; }
    [data-glow].w-80.h-96 { width: 20rem; height: 24rem; }
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: inherit;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      -webkit-mask:
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0) border-box;
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0) border-box;
      mask-clip: padding-box, border-box;
      mask-composite: exclude;
      z-index: 2;
    }
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.85) calc(var(--spotlight-size) * 0.85) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
        transparent 100%
      );
      filter: brightness(1.85);
    }
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 0.95)),
        transparent 100%
      );
    }
    [data-glow] > [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: inherit;
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
      z-index: 0;
    }
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        onClick={onClick}
        title={title}
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-2xl
          relative
          grid
          grid-rows-[1fr_auto]
          shadow-[0_1rem_2rem_-1rem_black]
          p-4
          gap-4
          backdrop-blur-[5px]
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard };
export default GlowCard;
