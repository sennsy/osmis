"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import { useOsmisData } from '../../lib/storage';
import { ArrowLeft } from 'lucide-react';
import { toArabicNumerals } from '../../utils/arabicNumerals';
import { getImageUrl } from '../../utils/driveImages';
import {
  Gallery,
  GalleryGrid,
  GalleryImage,
} from '@/components/ui/shared-element-gallery';
import styles from './page.module.css';

export default function FullGalleryPage() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const galleryCategories = data.gallery;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(28);
  const [showAllFilters, setShowAllFilters] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Prevent horizontal scrolling as in GalleryDemo
  React.useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  const displayedIds = useMemo(() => {
    const rawIds =
      activeCategory === 'all'
        ? galleryCategories.flatMap((c) => c.ids)
        : galleryCategories.find((c) => c.id === activeCategory)?.ids || [];
    // Deduplicate IDs so layoutId is always unique in the shared-element gallery
    return Array.from(new Set(rawIds.filter(Boolean)));
  }, [activeCategory, galleryCategories]);

  const visibleIds = displayedIds.slice(0, visibleCount);

  React.useEffect(() => {
    setVisibleCount(28);
  }, [activeCategory]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < displayedIds.length) {
          setVisibleCount((prev) => prev + 24);
        }
      },
      { rootMargin: '180px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, displayedIds.length]);

  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === 'all') return t.allCategories;
    const cat = galleryCategories.find((c) => c.id === activeCategory);
    if (!cat) return '';
    if (language === 'en' && (cat as any).customNameEn)
      return (cat as any).customNameEn;
    if (language === 'ar' && (cat as any).customNameAr)
      return (cat as any).customNameAr;
    return (
      (t as any)[`cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`] ||
      cat.name.toUpperCase()
    );
  }, [activeCategory, galleryCategories, language, t]);

  const subtitleText =
    language === 'ar'
      ? 'تجربة معرض صور متميزة مع انتقالات سلسة. انقر على أي صورة للتكبير، واسحب عمودياً للإغلاق.'
      : language === 'en'
        ? 'A curated photo archive with seamless shared-element transitions. Tap any image to expand, drag vertically to dismiss.'
        : 'Pengalaman dokumentasi foto dengan transisi shared-element yang mulus. Klik foto untuk memperbesar, geser vertikal untuk menutup.';

  return (
    <div className={styles.page} style={{ paddingTop: '6.5rem' }}>
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

      <div className={styles.container}>
        {/* Header following GalleryDemo aesthetic */}
        <header
          style={{
            marginBottom: '3.25rem',
            textAlign: 'left',
            maxWidth: '100%',
          }}
        >
          <p
            className="mono-font"
            style={{
              fontSize: '0.78rem',
              color: 'var(--osmis-yellow)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            {activeCategoryLabel}
          </p>
          <h1
            className="display-font"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--osmis-green)',
              lineHeight: 1.08,
              marginBottom: '0.85rem',
            }}
          >
            {t.archiveTitle}
          </h1>
          <p
            style={{
              fontSize: '1.08rem',
              lineHeight: 1.6,
              color: 'var(--text-color)',
              opacity: 0.78,
              maxWidth: '42rem',
            }}
          >
            {subtitleText}
          </p>

          {/* Category Filter Tabs */}
          <div
            className={`${styles.filterTabs} ${
              !showAllFilters ? styles.collapsed : ''
            }`}
            style={{ justifyContent: 'flex-start', marginTop: '1.75rem' }}
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
        </header>

        {/* Shared-Element Gallery */}
        <Gallery>
          <GalleryGrid>
            {visibleIds.map((driveId, idx) => {
              const numLabel =
                language === 'ar'
                  ? toArabicNumerals((idx + 1).toString().padStart(2, '0'))
                  : (idx + 1).toString().padStart(2, '0');
              return (
                <GalleryImage
                  key={`${activeCategory}-${driveId}`}
                  id={`${activeCategory}-${driveId}`}
                  src={getImageUrl(driveId)}
                  downloadUrl={getImageUrl(driveId)}
                  badge={numLabel}
                  alt={`OSMIS Gallery ${idx + 1}`}
                />
              );
            })}
          </GalleryGrid>
        </Gallery>

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

        {/* Back to Top Button */}
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
      </div>
    </div>
  );
}
