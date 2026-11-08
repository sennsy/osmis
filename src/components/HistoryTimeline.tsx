"use client";

import React, { useMemo } from 'react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './HistoryTimeline.module.css';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { MatchboxCarousel, type MatchboxItem } from './ui/matchbox-carousel';

type StructureRow = { role: string; roleAr?: string; members: string[] };

const PHOTO_2026_2027 = '/assets/aistudio/MVIMG_20260725_212959_1_b6359f91.jpg';

const SLEEVE_TINTS = [
  '#163828', // Deep OSMIS Green
  '#2F4B7C', // Archive Slate Blue
  '#C8553D', // Terracotta
  '#5A7D5A', // Sage Green
  '#8C5A18', // Warm Ochre
  '#1F1D1B', // Charcoal Ink
  '#3E8A95', // Teal Archive
  '#6E473B', // Umber
  '#224434', // Forest Green
  '#163828', // 2026-2027 Deep OSMIS Green
];

export default function HistoryTimeline() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const periods = data.periods;

  const defaultIdx = useMemo(() => {
    const idx = periods.findIndex((p: any) => p.year?.includes('2026'));
    return idx >= 0 ? idx : Math.max(0, periods.length - 1);
  }, [periods]);

  const matchboxItems: MatchboxItem[] = useMemo(() => {
    return periods.map((period: any, pIndex: number) => {
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
        detail: `${language === 'ar' ? 'الرئيس' : language === 'en' ? 'President' : 'Ketua'}: ${leaderName}`,
        alt: `Kepengurusan OSMIS ${period.year}`,
        tint: SLEEVE_TINTS[pIndex % SLEEVE_TINTS.length],
        src: periodIs2627 ? PHOTO_2026_2027 : undefined,
        content: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
              padding: periodIs2627 ? '10px 14px 14px' : '14px 16px',
              boxSizing: 'border-box',
              gap: '10px',
              background: '#FAF6EE',
            }}
          >
            {/* Khusus 2026-2027: tampilkan foto di atas di dalam tray */}
            {periodIs2627 && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 'clamp(155px, 24vh, 230px)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(22, 56, 40, 0.22)',
                  flexShrink: 0,
                  background: '#163828',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PHOTO_2026_2027}
                  alt={`Foto Pengurus OSMIS ${period.year}`}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 38%',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    bottom: '8px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(22, 56, 40, 0.88)',
                    color: '#FAF6EE',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  FOTO PENGURUS {yearLabel}
                </div>
              </div>
            )}

            {/* Header Susunan Struktur */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px',
                borderBottom: '1.5px solid rgba(22, 56, 40, 0.22)',
                paddingBottom: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#163828',
                }}
              >
                SUSUNAN STRUKTUR PENGURUS {yearLabel}
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#8c5a18',
                }}
              >
                {language === 'ar' ? 'الرئيس' : language === 'en' ? 'President' : 'Ketua'}: {leaderName}
              </div>
            </div>

            {/* Grid Susunan Pengurus yang jelas & mudah dibaca */}
            {periodStructure && periodStructure.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
                  gap: '7px 10px',
                }}
              >
                {periodStructure.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '6px 9px',
                      borderRadius: '6px',
                      background: 'rgba(22, 56, 40, 0.045)',
                      borderLeft: '2.5px solid #163828',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: '#8c5a18',
                        textTransform: 'uppercase',
                      }}
                    >
                      {language === 'ar' && row.roleAr ? row.roleAr : row.role}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        lineHeight: 1.38,
                        color: '#18221b',
                        fontWeight: 600,
                      }}
                    >
                      {row.members.join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{t.comingSoon}</div>
            )}
          </div>
        ),
      };
    });
  }, [periods, language, t]);

  return (
    <section id="history" className={styles.section} style={{ padding: '4rem 0 5rem' }}>
      <div
        style={{
          width: 'min(96vw, 1680px)',
          margin: '0 auto',
          padding: '0 0.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div className={styles.header} style={{ marginBottom: '2rem' }}>
          <h2 className="display-font">{t.historyJourney}</h2>
          <p className="mono-font">{t.archiveSubtitle}</p>
        </div>

        {/* FULL-SCREEN MATCHBOX CAROUSEL */}
        <MatchboxCarousel
          items={matchboxItems}
          defaultIndex={defaultIdx}
          autoplay={false}
          label={t.historyJourney || 'Perjalanan OSMIS'}
          style={{
            minHeight: 'clamp(640px, 84vh, 920px)',
          }}
        />
      </div>
    </section>
  );
}
