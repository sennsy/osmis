"use client";

import { useLanguage } from './LanguageProvider';
import { organization } from '../data/organization';
import { toArabicNumerals } from '../utils/arabicNumerals';
import styles from './Hero.module.css';

export default function Hero() {
  const { t, language } = useLanguage();

  const scrollToNext = () => {
    const nextSection = document.getElementById('introduction');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
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
      <img src="/logo_utama.png" alt="Watermark OSMIS" className={styles.watermark} />
    </section>
  );
}
