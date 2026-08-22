"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { organization } from '../data/organization';
import { toArabicNumerals } from '../utils/arabicNumerals';
import styles from './Hero.module.css';

export default function Hero() {
  const { t, language } = useLanguage();
  const [showAnimation, setShowAnimation] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShowAnimation(true);
        clearTimeout(timer);
        timer = setTimeout(() => {
          setShowAnimation(false);
        }, 5000);
      }
    }, { threshold: 0.3 });

    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('introduction');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.content}>
        <h1 className={`${styles.title} display-font`}>{t.osmisName}</h1>
        <h2 className={`${styles.subtitle} mono-font`}>{t.orgNameLong.toUpperCase()}</h2>
        <p className={`${styles.est} mono-font`}>{t.est} {language === 'ar' ? '٢٠١٨' : '2018'}</p>
        
        <div className={styles.motto}>
          <p className={`${styles.typewriter} display-font`}>"{t.heroSubtitle}"</p>
        </div>

        <div className={styles.periodBadge} style={{ position: 'relative', display: 'inline-block' }}>
          <span className="mono-font">{language === 'ar' ? toArabicNumerals('26 - 27') : '26 — 27'}</span>
          <svg className={styles.curveLine} viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M 5,15 Q 50,0 95,15" />
          </svg>
        </div>
      </div>

      <div className={styles.divisionLogos}>
        {organization.divisions.map((div) => (
          <div key={div.id} className={styles.divLogoWrapper} title={(div as any).nameKey ? (t as any)[(div as any).nameKey] : div.name}>
            {(div as any).icon && (
              <img src={(div as any).icon} alt={(div as any).nameKey ? (t as any)[(div as any).nameKey] : div.name} className={styles.divLogo} />
            )}
          </div>
        ))}
      </div>
      
      <button className={styles.scrollBtn} onClick={scrollToNext}>
        <span className="mono-font">[ {t.heroScroll} ]</span>
      </button>
      
      {/* Decorative Elements */}
      <div className={styles.gridLines}></div>
      <div className={styles.hexDecoration}></div>
      
      <img
        src="/video_utama.gif"
        alt="Watermark OSMIS Animation"
        className={styles.videoWatermark}
        style={{ opacity: showAnimation ? 0.5 : 0 }}
        onError={() => setShowAnimation(false)}
      />
      <img 
        src="/logo_utama.png" 
        alt="Watermark OSMIS" 
        className={styles.imageWatermark}
        style={{ opacity: !showAnimation ? 0.5 : 0 }}
      />
    </section>
  );
}
