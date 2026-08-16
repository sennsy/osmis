"use client";

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './HistoryTimeline.module.css';
import { toArabicNumerals } from '../utils/arabicNumerals';

type StructureRow = { role: string; roleAr?: string; members: string[] };

export default function HistoryTimeline() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const periods = data.periods;
  
  const [activeYear, setActiveYear] = useState('2026–2027');

  const activePeriod = periods.find(p => p.year === activeYear) as any;
  const structure: StructureRow[] | undefined = activePeriod?.structure;

  const getYearDisplay = (year: string) => language === 'ar' ? toArabicNumerals(year) : year;

  return (
    <section id="history" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className="display-font">{t.historyJourney}</h2>
          <p className="mono-font">{t.archiveSubtitle}</p>
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineLine}></div>
          <div className={styles.timelineScroller}>
            {periods.map((period) => (
              <div 
                key={period.year} 
                className={`${styles.timelineNode} ${activeYear === period.year ? styles.active : ''}`}
                onClick={() => setActiveYear(period.year)}
              >
                <div className={styles.nodeDot}></div>
                <div className={`${styles.nodeYear} mono-font`}>{getYearDisplay(period.year)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.periodCard}>
          <div className={styles.cardInner}>
            <div className={styles.cardHeader}>
              <span className="mono-font">{t.galleryNo} {getYearDisplay(activeYear.replace('–', ''))}</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardInfo}>
                <h3 className="display-font">{getYearDisplay(activeYear)}</h3>
                {activePeriod?.leader ? (
                  <>
                    <h4 className="mono-font">{t.leaderTitle}: {language === 'ar' && activePeriod.leaderAr ? activePeriod.leaderAr : activePeriod.leader}</h4>
                    <p>{activePeriod.descriptionKey ? (t as any)[activePeriod.descriptionKey] : activePeriod.description}</p>
                  </>
                ) : (
                  <p className={styles.placeholder}>{t.comingSoon}</p>
                )}
              </div>

              {/* Visual: image OR structure OR placeholder */}
              <div className={styles.cardVisual}>
                {activePeriod?.image ? (
                  <img src={activePeriod.image} alt={activeYear} className={styles.visualImg} />
                ) : structure ? (
                  <div className={styles.structureGrid}>
                    {structure.map((row, i) => (
                      <div key={i} className={styles.structureRow}>
                        <span className={`${styles.structureRole} mono-font`}>
                          {language === 'ar' && row.roleAr ? row.roleAr : row.role}
                        </span>
                        <div className={styles.structureMembers}>
                          {row.members.map((m, j) => (
                            <span key={j} className={styles.structureMember}>{m}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className="mono-font">{t.noVisualRecord}</span>
                  </div>
                )}
              </div>
            </div>
            {activeYear === '2026–2027' && (
              <button 
                className={styles.viewBtn} 
                onClick={() => document.getElementById('organization')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="mono-font">[ {t.viewPeriod} ]</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

