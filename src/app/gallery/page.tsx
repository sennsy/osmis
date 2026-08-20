"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageProvider';
import { useOsmisData } from '../../lib/storage';
import { ArrowLeft } from 'lucide-react';
import Lightbox from '../../components/Lightbox';
import { toArabicNumerals } from '../../utils/arabicNumerals';
import { getImageUrl } from '../../utils/driveImages';
import styles from './page.module.css';

export default function FullGalleryPage() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const galleryCategories = data.gallery;
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  const displayedIds = useMemo(() => {
    if (activeCategory === 'all') {
      return galleryCategories.flatMap(c => c.ids);
    }
    const cat = galleryCategories.find(c => c.id === activeCategory);
    return cat ? cat.ids : [];
  }, [activeCategory, galleryCategories]);

  const visibleIds = displayedIds.slice(0, visibleCount);

  const [cols, setCols] = useState<number>(4);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else if (window.innerWidth < 1280) setCols(3);
      else setCols(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = React.useMemo(() => {
    const colsArray = Array.from({ length: cols }, () => [] as {id: string, index: number}[]);
    visibleIds.forEach((id, index) => {
      colsArray[index % cols].push({ id, index });
    });
    return colsArray;
  }, [visibleIds, cols]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < displayedIds.length) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: "100px" }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [visibleCount, displayedIds.length]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> <span className="mono-font">{t.backToHome}</span>
          </Link>
          <h1 className="display-font">{t.archiveTitle}</h1>
          <p className="mono-font" style={{ marginTop: '1rem', color: 'var(--osmis-yellow)', letterSpacing: '0.1em' }}>
            {activeCategory === 'all' ? t.allCategories : (
              (() => {
                const cat = galleryCategories.find(c => c.id === activeCategory);
                if (!cat) return '';
                if (language === 'en' && (cat as any).customNameEn) return (cat as any).customNameEn;
                if (language === 'ar' && (cat as any).customNameAr) return (cat as any).customNameAr;
                return (t as any)[`cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`] || cat.name.toUpperCase();
              })()
            )}
          </p>
          
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.tabBtn} ${activeCategory === 'all' ? styles.activeTab : ''} mono-font`}
              onClick={() => setActiveCategory('all')}
            >
              {t.all}
            </button>
            {galleryCategories.map(cat => {
              const catKey = `cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`;
              let displayName = (t as any)[catKey] || cat.name.toUpperCase();
              if (language === 'en' && (cat as any).customNameEn) displayName = (cat as any).customNameEn;
              if (language === 'ar' && (cat as any).customNameAr) displayName = (cat as any).customNameAr;
              return (
                <button 
                  key={cat.id}
                  className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ''} mono-font`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.masonryGridWrapper}>
          {columns.map((col, colIndex) => (
            <div key={colIndex} className={styles.masonryCol}>
              {col.map(item => (
                <div 
                  key={item.id} 
                  className={styles.masonryItem}
                  onClick={() => openLightbox(item.index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.imageNumber}>
                    <span className="mono-font">{language === 'ar' ? toArabicNumerals((item.index + 1).toString().padStart(2, '0')) : (item.index + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <img 
                    src={getImageUrl(item.id)} 
                    alt={`OSMIS Gallery ${item.index + 1}`} 
                    loading="lazy"
                    className={styles.image}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {visibleCount < displayedIds.length && (
          <div ref={observerRef} style={{ height: '50px', margin: '2rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className={styles.loader}></div>
          </div>
        )}

        {/* PANDUAN DOWNLOAD */}
        <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', opacity: 0.8 }}>
          <h3 className="mono-font" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--osmis-yellow)' }}>Panduan Menyimpan Gambar</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            1. Klik gambar yang ingin disimpan.<br/>
            2. Pada tampilan penuh, klik ikon <strong>"Buka Resolusi Penuh"</strong> di kanan atas.<br/>
            3. Setelah terbuka di tab baru, tekan & tahan gambar (di HP) atau klik kanan (di PC), lalu pilih <strong>"Simpan Gambar" / "Save Image"</strong>.
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
            zIndex: 90
          }}
          title="Kembali ke atas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
      
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
