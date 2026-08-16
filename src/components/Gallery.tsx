"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import Lightbox from './Lightbox';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { getImageUrl } from '../utils/driveImages';
import styles from './Gallery.module.css';

export default function Gallery() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const previewIds = React.useMemo(() => {
    const selected: string[] = [];
    // Pick 1-2 highlight action shots from each of the 5 categories
    data.gallery.forEach(cat => {
      if (cat.ids && cat.ids.length > 0) {
        // Pick an offset item (index 3) rather than index 0 for better action/event shots
        const idx1 = Math.min(3, cat.ids.length - 1);
        if (cat.ids[idx1] && !selected.includes(cat.ids[idx1])) {
          selected.push(cat.ids[idx1]);
        }
        // Pick a second highlight further in (40% into the folder)
        if (cat.ids.length > 5 && selected.length < 8) {
          const idx2 = Math.floor(cat.ids.length * 0.4);
          if (cat.ids[idx2] && !selected.includes(cat.ids[idx2])) {
            selected.push(cat.ids[idx2]);
          }
        }
      }
    });
    // Fill up to 8 if needed
    const all = data.gallery.flatMap(c => c.ids);
    for (const id of all) {
      if (selected.length >= 8) break;
      if (!selected.includes(id)) selected.push(id);
    }
    return selected.slice(0, 8);
  }, [data.gallery]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className="display-font">{t.archiveTitle}</h2>
          <p className="mono-font" style={{ marginTop: '1rem', color: 'var(--osmis-yellow)', letterSpacing: '0.1em' }}>
            {t.allCategories}
          </p>
        </div>

        <div className={styles.masonry}>
          {previewIds.map((id, index) => (
            <div 
              key={id} 
              className={styles.imageItem}
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

        <div className={styles.loadMoreContainer}>
          <Link href="/gallery" className={styles.loadMoreBtn}>
            <span className="mono-font">[ {t.exploreGallery} ]</span>
          </Link>
        </div>
      </div>

      <Lightbox 
        ids={previewIds} 
        currentIndex={lightboxIndex ?? 0} 
        isOpen={lightboxIndex !== null} 
        onClose={closeLightbox} 
        onNavigate={setLightboxIndex} 
      />
    </section>
  );
}
