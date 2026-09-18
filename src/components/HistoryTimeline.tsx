"use client";

import React, { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './HistoryTimeline.module.css';
import { toArabicNumerals } from '../utils/arabicNumerals';
import HangingCard from './HangingCard';

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

        {/* DESKTOP TIMELINE (LOCKED) */}
        <div className={styles.desktopTimeline}>
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
                <div 
                  className={styles.cardVisual} 
                  style={activePeriod?.image 
                    ? { minHeight: '450px', overflow: 'visible', background: 'transparent', border: 'none' } 
                    : {}
                  }
                >
                  {activePeriod?.image ? (
                    <div className={styles.cardVisualWrapper}>
                      <HangingCard 
                        imageSrc={activePeriod.image} 
                        title="Pengurus Aktif" 
                      />
                    </div>
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

        {/* MOBILE TIMELINE COMPACT INDEX */}
        <div className={styles.mobileTimeline}>
          {periods.map((period) => {
            const isActive = activeYear === period.year;
            return (
              <div key={period.year} className={`${styles.mobilePeriodRow} ${isActive ? styles.mobileActive : ''}`}>
                <div className={styles.mobilePeriodHeader} onClick={() => setActiveYear(isActive ? '' : period.year)}>
                  <div className={styles.mobilePeriodYear}>
                    <div className={styles.mobileNodeDot}></div>
                    <span className="mono-font">{getYearDisplay(period.year)}</span>
                  </div>
                  <div className={styles.mobilePeriodTitle}>
                    {period.leader ? (language === 'ar' && period.leaderAr ? period.leaderAr : period.leader) : t.comingSoon}
                  </div>
                  <div className={styles.mobileExpandIcon}>
                    {isActive ? '−' : '+'}
                  </div>
                </div>
                {isActive && (
                  <div className={styles.mobilePeriodDetail}>
                    <p style={{ marginBottom: period.image || period.structure ? '1.5rem' : '0' }}>
                      {period.descriptionKey ? (t as any)[period.descriptionKey] : period.description}
                    </p>

                    {period.image ? (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', overflow: 'hidden', paddingTop: '0.5rem' }}>
                        <div style={{ zoom: 0.75, width: '100%', display: 'flex', justifyContent: 'center' }}>
                          <HangingCard 
                            imageSrc={period.image} 
                            title="Pengurus Aktif" 
                          />
                        </div>
                      </div>
                    ) : period.structure ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--osmis-green)', paddingLeft: '1rem' }}>
                        {period.structure.map((row: any, i: number) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span className="mono-font" style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '0.05em' }}>
                              {language === 'ar' && row.roleAr ? row.roleAr : row.role}
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {row.members.map((m: string, j: number) => (
                                <span key={j} style={{ fontSize: '0.85rem' }}>
                                  {m}{j < row.members.length - 1 ? <span style={{opacity: 0.3}}>,</span> : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.8rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                        <span className="mono-font">{t.noVisualRecord}</span>
                      </div>
                    )}

                    {period.year.includes('2026') && (
                      <button 
                        style={{ 
                          marginTop: '1.5rem', 
                          background: 'none', 
                          border: '1px solid var(--border-color)', 
                          color: 'var(--text-color)', 
                          cursor: 'pointer', 
                          fontSize: '0.8rem', 
                          display: 'block',
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          transition: 'background 0.3s'
                        }}
                        onClick={() => document.getElementById('organization')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        <span className="mono-font">{t.viewPeriod} →</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
