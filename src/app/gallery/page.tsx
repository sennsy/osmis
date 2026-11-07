"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../components/LanguageProvider';
import { useOsmisData } from '../../lib/storage';
import { ArrowLeft } from 'lucide-react';
import Lightbox from '../../components/Lightbox';
import { toArabicNumerals } from '../../utils/arabicNumerals';
import { getImageUrl } from '../../utils/driveImages';
import {
  PerspectiveTunnelHero,
  type TunnelImageItem,
} from '../../components/ui/perspective-tunnel-hero';
import styles from './page.module.css';

export default function FullGalleryPage() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const galleryCategories = data.gallery;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [showAllFilters, setShowAllFilters] = useState<boolean>(false);
  const [isGalleryUnlocked, setIsGalleryUnlocked] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fullGallerySectionRef = useRef<HTMLDivElement | null>(null);

  const displayedIds = useMemo(() => {
    if (activeCategory === 'all') {
      return galleryCategories.flatMap((c) => c.ids);
    }
    const cat = galleryCategories.find((c) => c.id === activeCategory);
    return cat ? cat.ids : [];
  }, [activeCategory, galleryCategories]);

  // Build 3D Tunnel images from the website's Google Drive gallery IDs
  const tunnelData = useMemo(() => {
    const items: (TunnelImageItem & { driveId: string })[] = [];
    galleryCategories.forEach((cat) => {
      const catKey = `cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`;
      let catDisplayName = (t as any)[catKey] || cat.name.toUpperCase();
      if (language === 'en' && (cat as any).customNameEn)
        catDisplayName = (cat as any).customNameEn;
      if (language === 'ar' && (cat as any).customNameAr)
        catDisplayName = (cat as any).customNameAr;

      (cat.ids || []).slice(0, 2).forEach((id: string) => {
        if (id && !items.some((existing) => existing.driveId === id)) {
          items.push({
            driveId: id,
            src: getImageUrl(id),
            title: catDisplayName,
          });
        }
      });
    });

    // Ensure at least 10-12 tunnel cards from Drive gallery
    const allIds = galleryCategories.flatMap((c) => c.ids || []);
    for (const id of allIds) {
      if (items.length >= 12) break;
      if (id && !items.some((existing) => existing.driveId === id)) {
        items.push({
          driveId: id,
          src: getImageUrl(id),
          title: t.archiveTitle || 'ARSIP OSMIS',
        });
      }
    }

    return items.slice(0, 12);
  }, [galleryCategories, language, t]);

  const visibleIds = displayedIds.slice(0, visibleCount);

  const [cols, setCols] = useState<number>(4);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCols(2);
      else if (window.innerWidth < 1024) setCols(2);
      else if (window.innerWidth < 1280) setCols(3);
      else setCols(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = React.useMemo(() => {
    const colsArray = Array.from(
      { length: cols },
      () => [] as { id: string; index: number }[]
    );
    visibleIds.forEach((id, index) => {
      colsArray[index % cols].push({ id, index });
    });
    return colsArray;
  }, [visibleIds, cols]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory]);

  React.useEffect(() => {
    if (!isGalleryUnlocked) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < displayedIds.length) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isGalleryUnlocked, visibleCount, displayedIds.length]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const handleUnlockAndScrollToGallery = useCallback(() => {
    setIsGalleryUnlocked(true);
    setTimeout(() => {
      fullGallerySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, []);

  return (
    <div className={styles.page}>
      {/* Floating Back to Home Button */}
      <div
        style={{
          position: 'fixed',
          top: '88px',
          left: '24px',
          zIndex: 80,
        }}
      >
        <button
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : (window.location.href = '/')
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            padding: '9px 16px',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <ArrowLeft size={15} />
          <span className="mono-font">{t.backToHome}</span>
        </button>
      </div>

      {/* 3D Perspective Tunnel Hero using Website / Google Drive Images */}
      <PerspectiveTunnelHero
        images={tunnelData}
        eyebrow="ARSIP DOKUMENTASI // OSMIS MA’HAD AL-FARUQ"
        titleLine1={
          language === 'ar'
            ? 'استكشف'
            : language === 'en'
              ? 'INTO THE'
              : 'LORONG'
        }
        titleLine2={
          language === 'ar'
            ? 'المعرض الكامل'
            : language === 'en'
              ? 'ARCHIVE.'
              : 'ARSIP OSMIS.'
        }
        subtitle={
          language === 'ar'
            ? 'قم بالتمرير عبر نفق الصور ثلاثي الأبعاد لفتح المعرض الكامل أدناه.'
            : language === 'en'
              ? 'Scroll your trackpad or mouse wheel through the 3D photo corridor to unlock the full gallery below.'
              : 'Scroll mouse atau usap layar menembus lorong foto 3D hingga selesai untuk membuka seluruh galeri di bawah.'
        }
        scrollPromptLabel={
          language === 'ar'
            ? 'مرر للاستكشاف'
            : language === 'en'
              ? 'Scroll to Explore'
              : 'Scroll untuk Menjelajah'
        }
        ctaLabel={
          language === 'ar'
            ? 'انتقل إلى المعرض الكامل ↓'
            : language === 'en'
              ? 'ENTER FULL GALLERY ↓'
              : 'MENUJU GALERI LENGKAP ↓'
        }
        onTunnelComplete={handleUnlockAndScrollToGallery}
        onExploreClick={handleUnlockAndScrollToGallery}
        onSelectImage={(idx) => {
          const item = tunnelData[idx];
          if (!item) return;
          const allIndex = displayedIds.indexOf(item.driveId);
          openLightbox(allIndex >= 0 ? allIndex : 0);
        }}
      />

      {/* Full Gallery Grid Section — Unlocked & Connected after scrolling the 3D Tunnel */}
      {isGalleryUnlocked && (
        <motion.div
          ref={fullGallerySectionRef}
          className={styles.container}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.header}>
            <h1 className="display-font">{t.archiveTitle}</h1>
            <p
              className="mono-font"
              style={{
                marginTop: '1rem',
                color: 'var(--osmis-yellow)',
                letterSpacing: '0.1em',
              }}
            >
              {activeCategory === 'all'
                ? t.allCategories
                : (() => {
                    const cat = galleryCategories.find(
                      (c) => c.id === activeCategory
                    );
                    if (!cat) return '';
                    if (language === 'en' && (cat as any).customNameEn)
                      return (cat as any).customNameEn;
                    if (language === 'ar' && (cat as any).customNameAr)
                      return (cat as any).customNameAr;
                    return (
                      (t as any)[
                        `cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`
                      ] || cat.name.toUpperCase()
                    );
                  })()}
            </p>

            <div
              className={`${styles.filterTabs} ${
                !showAllFilters ? styles.collapsed : ''
              }`}
            >
              <button
                className={`${styles.tabBtn} ${
                  activeCategory === 'all' ? styles.activeTab : ''
                } mono-font`}
                onClick={() => setActiveCategory('all')}
              >
                {t.all}
              </button>
              {galleryCategories.map((cat) => {
                const catKey = `cat${
                  cat.id.charAt(0).toUpperCase() + cat.id.slice(1)
                }`;
                let displayName = (t as any)[catKey] || cat.name.toUpperCase();
                if (language === 'en' && (cat as any).customNameEn)
                  displayName = (cat as any).customNameEn;
                if (language === 'ar' && (cat as any).customNameAr)
                  displayName = (cat as any).customNameAr;
                return (
                  <button
                    key={cat.id}
                    className={`${styles.tabBtn} ${
                      activeCategory === cat.id ? styles.activeTab : ''
                    } mono-font`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {displayName}
                  </button>
                );
              })}

              <button
                className={`${styles.tabBtn} ${styles.moreBtn} mono-font`}
                onClick={() => setShowAllFilters(!showAllFilters)}
              >
                {showAllFilters
                  ? t.showLess || '- Lebih Sedikit'
                  : t.showMore || '+ Lainnya'}
              </button>
            </div>
          </div>

          <div className={styles.masonryGridWrapper}>
            {columns.map((col, colIndex) => (
              <div key={colIndex} className={styles.masonryCol}>
                {col.map((item) => (
                  <div
                    key={item.id}
                    className={styles.masonryItem}
                    onClick={() => openLightbox(item.index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.imageNumber}>
                      <span className="mono-font">
                        {language === 'ar'
                          ? toArabicNumerals(
                              (item.index + 1).toString().padStart(2, '0')
                            )
                          : (item.index + 1).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <img
                      src={getImageUrl(item.id)}
                      alt={`OSMIS Gallery ${item.index + 1}`}
                      loading="lazy"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className={styles.image}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {visibleCount < displayedIds.length && (
            <div
              ref={observerRef}
              style={{
                height: '50px',
                margin: '2rem 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div className={styles.loader}></div>
            </div>
          )}

          {/* PANDUAN DOWNLOAD */}
          <div
            style={{
              marginTop: '4rem',
              padding: '2rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              opacity: 0.8,
            }}
          >
            <h3
              className="mono-font"
              style={{
                fontSize: '1rem',
                marginBottom: '1rem',
                color: 'var(--osmis-yellow)',
              }}
            >
              Panduan Menyimpan & Melihat Gambar
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              1. Klik gambar yang ingin dilihat dalam mode layar penuh.<br />
              2. Klik di mana saja pada layar untuk berpindah ke foto berikutnya.<br />
              3. Klik tombol <strong>Unduh Foto</strong> di pojok kanan atas untuk menyimpan foto, atau <strong>Keluar</strong> untuk menutup.
            </p>
          </div>

          {/* Tombol Kembali Ke Atas */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: 'var(--text-color)',
              color: 'var(--bg-color)',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 90,
            }}
            title="Kembali ke atas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </motion.div>
      )}

      <Lightbox
        ids={displayedIds}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
