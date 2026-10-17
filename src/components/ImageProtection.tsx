"use client";

import { useEffect } from 'react';

export default function ImageProtection() {
  useEffect(() => {
    // 1. Mencegah foto diseret (drag) ke tab baru atau jendela lain
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Mencegah klik kanan untuk "Open image in new tab" atau "Save image as"
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  return null;
}
