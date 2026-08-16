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
              galleryCategories.find(c => c.id === activeCategory) ? 
                (t as any)[`cat${galleryCategories.find(c => c.id === activeCategory)!.id.charAt(0).toUpperCase() + galleryCategories.find(c => c.id === activeCategory)!.id.slice(1)}`] || galleryCategories.find(c => c.id === activeCategory)?.name.toUpperCase() 
                : ''
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
              return (
                <button 
                  key={cat.id}
                  className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ''} mono-font`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {(t as any)[catKey] || cat.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.masonryGrid}>
          {visibleIds.map((id, index) => (
            <div 
              key={id} 
              className={styles.masonryItem}
              onClick={() => openLightbox(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.imageNumber}>
                <span className="mono-font">{language === 'ar' ? toArabicNumerals((index + 1).toString().padStart(2, '0')) : (index + 1).toString().padStart(2, '0')}</span>
              </div>
              <img 
                src={getImageUrl(id)} 
                alt={`OSMIS Gallery ${index + 1}`} 
                loading="lazy"
                className={styles.image}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          ))}
        </div>

        {visibleCount < displayedIds.length && (
          <div ref={observerRef} style={{ height: '20px', width: '100%', margin: '2rem 0' }}></div>
        )}

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
