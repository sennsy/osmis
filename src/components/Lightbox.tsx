"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, MousePointerClick } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { getImageUrl } from '../utils/driveImages';
import { PortalCarousel, type PortalCarouselImage } from './ui/portal-carousel';

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
  const { language } = useLanguage();

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

  const portalImages: PortalCarouselImage[] = useMemo(() => {
    return ids.map((id, idx) => ({
      src: getImageUrl(id),
      alt: `Galeri OSMIS ${idx + 1}`,
      title:
        language === 'ar'
          ? `صورة المعرض #${toArabicNumerals((idx + 1).toString().padStart(2, '0'))}`
          : language === 'en'
            ? `Gallery Archive #${(idx + 1).toString().padStart(2, '0')}`
            : `Dokumentasi OSMIS #${(idx + 1).toString().padStart(2, '0')}`,
    }));
  }, [ids, language]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = ids[currentIndex];
    if (!id) return;

    let downloadUrl = id;
    if (!id.startsWith('http') && !id.startsWith('/')) {
      downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `osmis-gallery-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cursorLabel =
    language === 'ar'
      ? 'انقر للصورة التالية'
      : language === 'en'
        ? 'CLICK FOR NEXT PHOTO'
        : 'KLIK LAYAR → FOTO BERIKUTNYA';

  const guideText =
    language === 'ar'
      ? '💡 نصيحة: انقر في أي مكان على الشاشة للانتقال إلى الصورة التالية'
      : language === 'en'
        ? '💡 Tip: Click anywhere on the screen or preview box to view the next photo'
        : '💡 Petunjuk: Klik di mana saja pada layar atau kotak preview untuk melihat foto selanjutnya';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#060b08',
            width: '100vw',
            height: '100vh',
          }}
        >
          <PortalCarousel
            images={portalImages}
            initialIndex={currentIndex}
            onIndexChange={onNavigate}
            label={cursorLabel}
          >
            {/* Top Bar: Counter + Beginner Guide + Download & Keluar Buttons */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 'clamp(14px, 2.5vw, 28px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 65%, transparent 100%)',
                pointerEvents: 'none',
              }}
            >
              {/* Photo Counter */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(6, 20, 14, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  color: '#ecfdf5',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                <span className="mono-font">
                  {language === 'ar'
                    ? toArabicNumerals(`${currentIndex + 1} / ${ids.length}`)
                    : `${currentIndex + 1} / ${ids.length}`}
                </span>
              </div>

              {/* Action Buttons: Download & Keluar (Close) */}
              <div
                data-portal-ignore="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  pointerEvents: 'auto',
                }}
              >
                <button
                  type="button"
                  data-portal-ignore="true"
                  onClick={handleDownload}
                  aria-label="Download"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.92)',
                    color: '#022c22',
                    border: '1px solid rgba(167, 243, 208, 0.5)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                  }}
                >
                  <Download size={18} />
                  <span>
                    {language === 'ar'
                      ? 'تحميل'
                      : language === 'en'
                        ? 'Download'
                        : 'Unduh Foto'}
                  </span>
                </button>

                <button
                  type="button"
                  data-portal-ignore="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  aria-label="Keluar"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                    border: '1px solid rgba(252, 165, 165, 0.45)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                  }}
                >
                  <X size={18} />
                  <span>
                    {language === 'ar'
                      ? 'خروج'
                      : language === 'en'
                        ? 'Exit'
                        : 'Keluar'}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Guide Banner for Beginners */}
            <div
              style={{
                position: 'absolute',
                bottom: '22px',
                left: 'clamp(16px, 4vw, 48px)',
                maxWidth: 'min(560px, calc(100vw - 32px))',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(6, 20, 14, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '10px 16px',
                borderRadius: '14px',
                color: '#d1fae5',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
                pointerEvents: 'none',
              }}
            >
              <MousePointerClick
                size={18}
                style={{ color: '#34d399', flexShrink: 0 }}
              />
              <span>{guideText}</span>
            </div>
          </PortalCarousel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
