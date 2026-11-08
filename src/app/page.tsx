"use client";

import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import HistoryTimeline from '../components/HistoryTimeline';
import OrganizationChart from '../components/OrganizationChart';
import DivisionCards from '../components/DivisionCards';
import { useLanguage } from '../components/LanguageProvider';
import styles from './page.module.css';

import Gallery from '../components/Gallery';
import { Camera, Sparkles, Gamepad2, Languages, Film } from 'lucide-react';
import { TiltStackScroll, type TiltStackCard } from '../components/ui/tilt-stack-scroll';
import { getImageUrl } from '../utils/driveImages';

export default function Home() {
  const { t } = useLanguage();
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  useEffect(() => {
    // Cache bust: 2026-09-19 14:55
    console.log("OSMIS V2 Loaded");
  }, []);

  const featureCards: TiltStackCard[] = [
    {
      kicker: 'RECAP VIDEO · DOKUMENTASI',
      badge: '🔥 HOT',
      title: t.recapTitle,
      description: t.recapDesc,
      image: getImageUrl('1-lv0dmzaG7-7oidrvrIJsd3ECkoDPGGq'),
      alt: t.recapTitle,
      icon: <Film size={24} strokeWidth={1.75} />,
      tags: ['Kilas Balik Kegiatan', 'Video Dokumenter', 'Momen Terbaik OSMIS'],
      price: '01',
      priceNote: 'FITUR UTAMA',
      cta: `[ ${t.watchRecap} ]`,
      href: '/recap',
      accent: '#e74c3c',
    },
    {
      kicker: 'PHOTOBOOTH · TWIBBON STUDIO',
      title: t.smisFrameTitle,
      description: t.smisFrameDesc,
      image: getImageUrl('10DrHWHIuYaneZ9MsQgglUu0T1YaDd3Ey'),
      alt: t.smisFrameTitle,
      icon: <Camera size={24} strokeWidth={1.75} />,
      tags: ['Filter & Frame Eksklusif', 'Kamera Instan', 'Unduh Langsung'],
      price: '02',
      priceNote: 'KREATIF',
      cta: `[ ${t.tryFrame} ]`,
      href: '/smisframe',
      accent: '#D4AF37',
    },
    {
      kicker: 'PERSONALITY · KARAKTER SANTRI',
      title: t.mbtiTitle,
      description: t.mbtiDesc,
      image: getImageUrl('11aCvpkui-1HAEiH38UHW475QZPj9RQkq'),
      alt: t.mbtiTitle,
      icon: <Sparkles size={24} strokeWidth={1.75} />,
      tags: ['16 Tipe Kepribadian', 'Cocokologi Divisi OSMIS', 'Analisis Karakter'],
      price: '03',
      priceNote: 'PSIKOTES',
      cta: '[ Buka Tes ]',
      href: '/mbti',
      accent: '#a855f7',
    },
    {
      kicker: 'ARCADE · HIBURAN INTERAKTIF',
      title: 'OSMIS Games',
      description: 'Kumpulan Mini Games Seru karya santri — mulai dari platformer 2D, endless runner klasik, hingga tantangan mengetik cepat.',
      image: getImageUrl('1-0FQsXGBb465MqYA3hAahWFgYvgV5B6Y'),
      alt: 'OSMIS Games',
      icon: <Gamepad2 size={24} strokeWidth={1.75} />,
      tags: ['Wong Tersakiti Bross', 'GMWST Endless Runner', 'Happy Ngetik Sayy'],
      price: '04',
      priceNote: 'MINI GAMES',
      cta: '[ Pilih Game ]',
      onClick: () => setIsGameModalOpen(true),
      accent: '#3b82f6',
    },
    {
      kicker: 'EDUKASI · TRILINGUAL',
      title: 'Linguista',
      description: 'Belajar Kosakata Arab, Inggris & Indo ala Duolingo untuk menunjang program kebahasaan santri sehari-hari.',
      image: getImageUrl('13ncpAoQYIItolDco7oucyksaLkK98w5b'),
      alt: 'Linguista',
      icon: <Languages size={24} strokeWidth={1.75} />,
      tags: ['Bahasa Arab', 'Bahasa Inggris', 'Kuis Kosakata Interaktif'],
      price: '05',
      priceNote: 'BAHASA',
      cta: '[ Belajar ]',
      href: '/learn',
      accent: '#10b981',
    },
  ];

  return (
    <div className={styles.page}>
      <Hero />
      
      {/* Vision & Mission Section */}
      <section id="introduction" className={styles.introSection}>
        <div className={styles.introContainer}>
          <h2 className="display-font">{t.osmisName}</h2>
          <h3 className="mono-font" style={{ letterSpacing: '0.1em' }}>{t.orgNameLong.toUpperCase()}</h3>
          <p className="editorial-divider"></p>

          <div className={styles.visiMisiGrid}>
            {/* VISI */}
            <div className={styles.visiCard}>
              <div className={styles.vmLabel}>
                <span className={`${styles.vmNumber} mono-font`}>١</span>
                <h4 className={`${styles.vmTitle} mono-font`}>{t.visiLabel}</h4>
              </div>
              <p className={`${styles.vmText} display-font`}>"{t.visiText}"</p>
            </div>

            {/* MISI */}
            <div className={styles.misiCard}>
              <div className={styles.vmLabel}>
                <span className={`${styles.vmNumber} mono-font`}>٢</span>
                <h4 className={`${styles.vmTitle} mono-font`}>{t.misiLabel}</h4>
              </div>
              <ol className={styles.misiList}>
                {t.misiItems.map((item: string, i: number) => (
                  <li key={i} className={styles.misiItem}>
                    <span className={`${styles.misiNum} mono-font`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* MOTTO EXPLAINER */}
          <div className={styles.mottoExplainer}>
            {t.mottoWords.map((m: { word: string; desc: string }, i: number) => (
              <div key={i} className={styles.mottoWordCard}>
                <span className={`${styles.mottoWordKw} display-font`}>{m.word}</span>
                <p className={styles.mottoWordDesc}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HistoryTimeline />
      
      <OrganizationChart />
      
      <DivisionCards />

      <Gallery />

      {/* Features Section — TiltStackScroll */}
      <section id="features">
        <TiltStackScroll
          eyebrow={t.featuresSubtitle}
          heading={t.featuresTitle}
          cards={featureCards}
          stepVh={95}
        />
      </section>

      {/* Game Selection Modal */}
      {isGameModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsGameModalOpen(false)}
        >
          <div 
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '1.5rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="display-font" style={{ fontSize: '1.5rem' }}>OSMIS Games</h2>
              <button 
                onClick={() => setIsGameModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', opacity: 0.7 }}
              >
                Tutup ✕
              </button>
            </div>
            
            {/* Game 1: Wong Tersakiti Bross */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => window.location.href = '/wong-tersakiti-bross.html'}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-color)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '0.75rem' }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Wong Tersakiti Bross</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>2D Side-scrolling Retro Platformer</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>Mainkan ↗</span>
            </div>

            {/* Game 2: GMWST (Dino) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => window.location.href = '/hts.html'}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-color)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>GMWST (gemme wong sing tulus)</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Endless Runner Klasik Santri</p>
              </div>
              <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Mainkan ↗</span>
            </div>

            {/* Game 3: Happy Ngetik Sayy (Moved to bottom, mobile restricted) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1
              }}
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  alert("Game ini khusus untuk pengguna Desktop/PC (membutuhkan keyboard fisik untuk mengetik).");
                } else {
                  window.location.href = '/happy-ngetik-sayy.html';
                }
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-color)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '0.75rem' }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Happy Ngetik Sayy (HTS)</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Game 2D Edukatif Mengetik Cepat</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Mainkan ↗</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
