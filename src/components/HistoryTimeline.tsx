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

  // Pastikan hanya periode 2026–2027 (yang mengandung '2027') yang menjadi default & menampilkan foto
  const defaultIdx = useMemo(() => {
    const idx = periods.findIndex((p: any) => p.year?.includes('2027'));
    return idx >= 0 ? idx : Math.max(0, periods.length - 1);
  }, [periods]);

  const matchboxItems: MatchboxItem[] = useMemo(() => {
    return periods.map((period: any, pIndex: number) => {
      // Hanya 2026-2027 yang menampilkan foto (2025-2026 tidak boleh menampilkan foto)
      const periodIs2627 = Boolean(period.year?.includes('2027'));
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
              width: '100%',
              minHeight: '100%',
              padding: '16px 20px 22px 22px',
              boxSizing: 'border-box',
              gap: '16px',
              background: '#FAF6EE',
            }}
          >
            {/* Khusus 2026-2027: foto dibuat penuh (full width tanpa sisa ruang hijau di kiri/kanan) */}
            {periodIs2627 && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(22, 56, 40, 0.18)',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PHOTO_2026_2027}
                  alt={`Foto Pengurus OSMIS ${period.year}`}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    bottom: '12px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: 'rgba(22, 56, 40, 0.9)',
                    color: '#FAF6EE',
                    fontSize: 'clamp(10.5px, 0.9vw, 12.5px)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  FOTO PENGURUS {yearLabel}
                </div>
              </div>
            )}

            {/* Header Susunan Struktur — disusun ke bawah agar lega & tidak terpotong */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                width: '100%',
                boxSizing: 'border-box',
                borderBottom: '2px solid rgba(22, 56, 40, 0.2)',
                paddingBottom: '10px',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(14px, 1.25vw, 18px)',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#163828',
                  lineHeight: 1.3,
                }}
              >
                SUSUNAN STRUKTUR PENGURUS {yearLabel}
              </div>
              <div
                style={{
                  fontSize: 'clamp(13px, 1.1vw, 16px)',
                  fontWeight: 700,
                  color: '#8c5a18',
                  lineHeight: 1.35,
                }}
              >
                {language === 'ar' ? 'الرئيس' : language === 'en' ? 'President' : 'Ketua'}: {leaderName}
              </div>
            </div>

            {/* Daftar Susunan Pengurus — disusun 1 kolom penuh ke bawah (tidak memaksa berjejer sempit di samping) */}
            {periodStructure && periodStructure.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {periodStructure.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(22, 56, 40, 0.055)',
                      borderLeft: '4px solid #163828',
                      boxSizing: 'border-box',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'clamp(12px, 1.02vw, 14.5px)',
                        fontWeight: 800,
                        letterSpacing: '0.07em',
                        color: '#8c5a18',
                        textTransform: 'uppercase',
                        lineHeight: 1.3,
                      }}
                    >
                      {language === 'ar' && row.roleAr ? row.roleAr : row.role}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                      }}
                    >
                      {row.members.map((member, mIdx) => (
                        <div
                          key={mIdx}
                          style={{
                            fontSize: 'clamp(13.5px, 1.15vw, 16.5px)',
                            lineHeight: 1.42,
                            color: '#141e17',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                          }}
                        >
                          {row.members.length > 1 && (
                            <span
                              style={{
                                color: '#8c5a18',
                                fontSize: '0.85em',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              •
                            </span>
                          )}
                          <span>{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 'clamp(13.5px, 1.15vw, 16.5px)', opacity: 0.7 }}>{t.comingSoon}</div>
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
          width: 'min(96vw, 1720px)',
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
            minHeight: 'clamp(680px, 86vh, 960px)',
          }}
        />
      </div>
    </section>
  );
}
