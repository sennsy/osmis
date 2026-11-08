"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { getImageUrl } from '../utils/driveImages';
import MorphGallery, { type MorphItem } from './ui/morph-gallery';

interface LightboxProps {
  ids: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  ids,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const activeIndexRef = useRef<number>(currentIndex);
  activeIndexRef.current = currentIndex;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const morphItems: MorphItem[] = useMemo(() => {
    return ids.map((id, idx) => {
      const fullUrl = getImageUrl(id);
      return {
        src: fullUrl,
        thumb: fullUrl,
        alt: `Galeri OSMIS ${idx + 1}`,
      };
    });
  }, [ids]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = activeIndexRef.current;
    const id = ids[idx];
    if (!id) return;

    const fullUrl = getImageUrl(id);
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Proxy download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `osmis-gallery-${idx + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      let downloadUrl = id;
      if (!id.startsWith('http') && !id.startsWith('/')) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `osmis-gallery-${idx + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10050,
            background: '#060908',
            width: '100vw',
            height: '100vh',
          }}
        >
          <style>{LIQUID_GLASS_ACTIONS_CSS}</style>

          {/* Fullscreen MorphGallery */}
          <MorphGallery
            items={morphItems}
            index={currentIndex}
            onIndexChange={(idx) => {
              activeIndexRef.current = idx;
              onNavigate(idx);
            }}
            height="100vh"
            duration={1350}
            noiseScale={3.5}
            edge={0.15}
            drift={0.5}
            loop={true}
            arrows={true}
            thumbnails={true}
          />

          {/* Top-Right Icon-Only Liquid Glass Buttons: Download & Close (X) */}
          <div className="lg-lightbox-actions">
            <button
              type="button"
              className="lg-icon-btn"
              onClick={handleDownload}
              aria-label="Unduh Foto"
              title="Unduh Foto"
            >
              <Download size={20} strokeWidth={2.1} />
            </button>

            <button
              type="button"
              className="lg-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Tutup"
              title="Tutup (Esc)"
            >
              <X size={21} strokeWidth={2.2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const LIQUID_GLASS_ACTIONS_CSS = `
.lg-lightbox-actions {
  position: fixed;
  top: clamp(18px, 2.5vw, 28px);
  right: clamp(18px, 2.5vw, 28px);
  z-index: 10070;
  display: flex;
  align-items: center;
  gap: 12px;
}

.lg-icon-btn {
  width: 46px;
  height: 46px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.24) 0%,
    rgba(255, 255, 255, 0.08) 55%,
    rgba(255, 255, 255, 0.16) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(22px) saturate(190%);
  -webkit-backdrop-filter: blur(22px) saturate(190%);
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.38),
    inset 0 1.5px 1px rgba(255, 255, 255, 0.45),
    inset 0 -1px 1px rgba(255, 255, 255, 0.12);
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
              background 0.22s ease,
              border-color 0.22s ease,
              box-shadow 0.22s ease;
}

.lg-icon-btn:hover {
  transform: scale(1.07) translateY(-1px);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.34) 0%,
    rgba(255, 255, 255, 0.14) 55%,
    rgba(255, 255, 255, 0.24) 100%
  );
  border-color: rgba(255, 255, 255, 0.55);
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.46),
    inset 0 1.5px 1.5px rgba(255, 255, 255, 0.6),
    inset 0 -1px 1px rgba(255, 255, 255, 0.2);
}

.lg-icon-btn:active {
  transform: scale(0.95);
}
`;
