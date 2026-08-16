"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Download, AlertTriangle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { getImageUrl } from '../utils/driveImages';
import styles from './Lightbox.module.css';

interface LightboxProps {
  ids: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ ids, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const [imgError, setImgError] = useState(false);
  const { language } = useLanguage();

  // Reset error state when image changes
  useEffect(() => {
    setImgError(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % ids.length);
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + ids.length) % ids.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, ids.length, onClose, onNavigate]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = ids[currentIndex];
    if (!id) return;
    
    let downloadUrl = id;
    if (!id.startsWith('http') && !id.startsWith('/')) {
      // Use native Google Drive download endpoint
      downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    }
    
    // Open in new tab so browser handles the download directly
    window.open(downloadUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className={styles.controls}>
            <span className="mono-font">
              {language === 'ar' ? toArabicNumerals(`${currentIndex + 1} / ${ids.length}`) : `${currentIndex + 1} / ${ids.length}`}
            </span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className={styles.closeBtn} onClick={handleDownload} aria-label="Download" disabled={imgError}>
                <Download size={24} style={{ opacity: imgError ? 0.3 : 1 }} />
              </button>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <X size={24} />
              </button>
            </div>
          </div>

          <button 
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + ids.length) % ids.length); }}
          >
            <ChevronLeft size={36} />
          </button>
          
          <button 
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % ids.length); }}
          >
            <ChevronRight size={36} />
          </button>

          <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              {!imgError ? (
                <motion.img
                  key={currentIndex}
                  src={getImageUrl(ids[currentIndex])}
                  alt={`Gallery ${currentIndex + 1}`}
                  className={styles.image}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a1a1aa', gap: '1rem' }}
                >
                  <AlertTriangle size={48} color="#ef4444" />
                  <p className="mono-font">IMAGE_NOT_FOUND_OR_BROKEN</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7, maxWidth: '300px', textAlign: 'center' }}>
                    Tautan/ID yang dimasukkan pada menu Admin tidak valid (contoh: "image3"). Silakan hapus ID yang salah di Backroom dan ganti dengan ID Google Drive yang benar.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
