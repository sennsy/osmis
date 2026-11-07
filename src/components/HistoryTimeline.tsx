"use client";

import React, { useState, useMemo } from 'react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './HistoryTimeline.module.css';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { MatchboxCarousel, type MatchboxItem } from './ui/matchbox-carousel';

type StructureRow = { role: string; roleAr?: string; members: string[] };

const PHOTO_2026_2027 = '/assets/aistudio/MVIMG_20260725_212959_1_b6359f91.jpg';

export default function HistoryTimeline() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const periods = data.periods;

  const [activeYear, setActiveYear] = useState('2026–2027');

  const getYearDisplay = (year: string) => (language === 'ar' ? toArabicNumerals(year) : year);

  const activeIndex = useMemo(() => {
    const idx = periods.findIndex((p) => p.year === activeYear);
    return idx >= 0 ? idx : Math.max(0, periods.length - 1);
  }, [periods, activeYear]);

  const matchboxItems: MatchboxItem[] = useMemo(() => {
    return periods.map((period: any) => {
      const periodIs2627 = Boolean(period.year?.includes('2026'));
      const yearLabel = language === 'ar' ? toArabicNumerals(period.year) : period.year;
      const leaderName = period.leader
        ? language === 'ar' && period.leaderAr
          ? period.leaderAr
          : period.leader
        : t.comingSoon;
      const periodStructure: StructureRow[] | undefined = period.structure;

      return {
        title: yearLabel,
        detail: leaderName,
        alt: `Kepengurusan OSMIS ${period.year}`,
        // Hanya 2026-2027 yang menampilkan foto di tempatnya (di dalam tray matchbox)
        src: periodIs2627 ? PHOTO_2026_2027 : undefined,
        // Selain 2026-2027 hanya menampilkan teks susunan pengurus di tempatnya (di dalam tray matchbox)
        content: !periodIs2627 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#163828',
                borderBottom: '1px solid rgba(22, 56, 40, 0.2)',
                paddingBottom: '4px',
                marginBottom: '2px',
              }}
            >
              SUSUNAN PENGURUS {yearLabel}
            </div>
            {periodStructure && periodStructure.length > 0 ? (
              periodStructure.map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    paddingBottom: '4px',
                    borderBottom:
                      idx < periodStructure.length - 1
                        ? '1px dashed rgba(22, 56, 40, 0.14)'
                        : 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8c5a18',
                      textTransform: 'uppercase',
                    }}
                  >
                    {language === 'ar' && row.roleAr ? row.roleAr : row.role}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      lineHeight: 1.35,
                      color: '#1b241e',
                      fontWeight: 500,
                    }}
                  >
                    {row.members.join(', ')}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '10.5px', opacity: 0.7 }}>{t.comingSoon}</div>
            )}
          </div>
        ) : undefined,
      };
    });
  }, [periods, language, t]);

  return (
    <section id="history" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className="display-font">{t.historyJourney}</h2>
          <p className="mono-font">{t.archiveSubtitle}</p>
        </div>

        {/* MATCHBOX CAROUSEL (TAMPIL LANGSUNG DI TEMPATNYA) */}
        <MatchboxCarousel
          items={matchboxItems}
          index={activeIndex}
          onIndexChange={(nextIdx) => {
            const targetPeriod = periods[nextIdx];
            if (targetPeriod) {
              setActiveYear(targetPeriod.year);
            }
          }}
          ariaLabel={t.historyJourney || 'Perjalanan OSMIS'}
        />
      </div>
    </section>
  );
}
