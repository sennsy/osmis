"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, MousePointerClick } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { getImageUrl } from '../utils/driveImages';
import PortalCarousel, { type PortalCarouselImage } from './ui/portal-carousel';

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
    const idx = activeIndexRef.current;
    const id = ids[idx];
    if (!id) return;

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
  };

  const cursorLabel =
    language === 'ar'
      ? 'انقر للصورة التالية'
      : language === 'en'
        ? 'CLICK FOR NEXT PHOTO'
        : 'KLIK LAYAR → FOTO BERIKUTNYA';

  const guideTitle =
    language === 'ar'
      ? 'دليل التصفح:'
      : language === 'en'
        ? 'How to Navigate:'
        : 'Cara Ganti Foto:';

  const guideText =
    language === 'ar'
      ? 'انقر في أي مكان على الشاشة أو على مربع المعاينة للانتقال إلى الصورة التالية (بدون أزرار جانبية).'
      : language === 'en'
        ? 'Click anywhere on the screen or the floating preview box to expand the next photo.'
        : 'Klik di mana saja pada layar atau kotak foto kecil untuk membuka foto berikutnya.';

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
            zIndex: 10050,
            background: '#000000',
            width: '100vw',
            height: '100vh',
          }}
        >
          <PortalCarousel
            images={portalImages}
            initialIndex={currentIndex}
            onIndexChange={(idx) => {
              activeIndexRef.current = idx;
              onNavigate(idx);
            }}
            label={cursorLabel}
            thumbWidth={200}
            followSpeed={0.14}
            duration={1.1}
          >
            {/* Top Bar: Beginner Guide on Left + Download & Keluar Buttons on Right */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 'clamp(14px, 2.5vw, 28px)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '14px',
                flexWrap: 'wrap',
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 68%, transparent 100%)',
                pointerEvents: 'none',
              }}
            >
              {/* Beginner-friendly Navigation Notice */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  maxWidth: 'min(520px, calc(100vw - 32px))',
                  background: 'rgba(6, 20, 14, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  color: '#ecfdf5',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
                }}
              >
                <MousePointerClick
                  size={19}
                  style={{ color: '#34d399', flexShrink: 0 }}
                />
                <span>
                  <strong style={{ color: '#fde68a', marginRight: '5px' }}>
                    {guideTitle}
                  </strong>
                  {guideText}
                </span>
              </div>

              {/* Action Buttons: Download & Keluar (Close) */}
              <div
                data-portal-ignore="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  pointerEvents: 'auto',
                  marginLeft: 'auto',
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
                    background: 'rgba(16, 185, 129, 0.94)',
                    color: '#022c22',
                    border: '1px solid rgba(167, 243, 208, 0.6)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <Download size={17} />
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
                    background: 'rgba(239, 68, 68, 0.92)',
                    color: '#ffffff',
                    border: '1px solid rgba(252, 165, 165, 0.5)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <X size={17} />
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
          </PortalCarousel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
