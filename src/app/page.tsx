"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Hero from '../components/Hero';
import PricingSection4 from '../components/ui/pricing-section-3';
import { useLanguage } from '../components/LanguageProvider';
import styles from './page.module.css';

import { Camera, Sparkles, Gamepad2, Languages, Film } from 'lucide-react';
import { DotTiles, type DotTileData } from '../components/ui/dot-tiles';

const HistoryTimeline = dynamic(() => import('../components/HistoryTimeline'));
const OrganizationChart = dynamic(() => import('../components/OrganizationChart'));
const DivisionCards = dynamic(() => import('../components/DivisionCards'));
const Gallery = dynamic(() => import('../components/Gallery'));

export default function Home() {
  const { t } = useLanguage();
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [tileColumns, setTileColumns] = useState(3);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 360) setTileColumns(1);
      else if (window.innerWidth < 960) setTileColumns(2);
      else setTileColumns(3);
    };
    updateCols();
    window.addEventListener('resize', updateCols, { passive: true });
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const featureTiles: DotTileData[] = [
    {
      id: 'rewind',
      title: t.recapTitle,
      subtitle: t.recapDesc,
      value: '01',
      icon: <Film size="100%" strokeWidth={2} />,
      unit: 'VIDEO',
      badge: '🔥 HOT',
      href: '/recap',
      visual: {
        type: 'slider',
        value: 0.78,
        mode: 'glow',
        labels: ['Kilas Balik', '[ Tonton Rekap ↗ ]'],
      },
    },
    {
      id: 'smisframe',
      title: t.smisFrameTitle,
      subtitle: t.smisFrameDesc,
      value: '02',
      icon: <Camera size="100%" strokeWidth={2} />,
      unit: 'FRAME',
      href: '/smisframe',
      visual: {
        type: 'steps',
        from: 0.08,
        to: 0.92,
        data: [
          0.35, 0.45, 0.6, 0.85, 1, 1, 0.75, 0.55, 0.8, 0.95, 1, 0.7, 0.5,
          0.65, 0.9, 0.95, 0.8, 0.6, 0.45, 0.7, 0.85, 0.6, 0.4,
        ],
        labels: ['Photobooth', '[ Coba Frame ↗ ]'],
      },
    },
    {
      id: 'mbti',
      title: t.mbtiTitle,
      subtitle: t.mbtiDesc,
      value: '03',
      icon: <Sparkles size="100%" strokeWidth={2} />,
      unit: '16 TIPE',
      href: '/mbti',
      visual: {
        type: 'dots',
        data: [0.25, 0.45, 0.7, 0.35, 0.85, 1, 0.6, 0.4, 0.75, 0.9, 0.5, 0.3],
        labels: ['Kepribadian', '[ Buka Tes ↗ ]'],
      },
    },
    {
      id: 'games',
      title: 'OSMIS Games',
      subtitle: 'Kumpulan Mini Games Seru & Interaktif Santri',
      value: '04',
      icon: <Gamepad2 size="100%" strokeWidth={2} />,
      unit: 'ARCADE',
      onClick: () => setIsGameModalOpen(true),
      visual: {
        type: 'blocks',
        data: [
          [0.08, 0.28],
          [0.36, 0.62],
          [0.7, 0.92],
        ],
        labels: ['3 Mini Games', '[ Pilih Game ↗ ]'],
      },
    },
    {
      id: 'linguista',
      title: 'Linguista',
      subtitle: 'Belajar Kosakata Arab, Inggris & Indo ala Duolingo',
      value: '05',
      icon: <Languages size="100%" strokeWidth={2} />,
      unit: '3 BHS',
      href: '/learn',
      visual: {
        type: 'rise',
        value: 0.82,
        labels: ['AR · EN · ID', '[ Belajar ↗ ]'],
      },
    },
  ];

  return (
    <div className={styles.page}>
      <Hero />
      
      {/* Vision & Mission Section */}
      <section id="introduction">
        <PricingSection4 />
      </section>

      <HistoryTimeline />
      
      <OrganizationChart />
      
      <DivisionCards />

      <Gallery />

      {/* Features Section — DotTiles */} 
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresHeader}>
            <h2 className="display-font">{t.featuresTitle}</h2>
            <p className="mono-font">{t.featuresSubtitle}</p>
          </div>

          <div className={styles.featuresGridWrapper}>
            <DotTiles
              tiles={featureTiles}
              columns={tileColumns}
              tileColor="#0b1f16"
              dotColor="#f7f4eb"
              stagger={95}
            />
          </div>
        </div>
      </section>

      {/* Game Selection Modal */}
      {isGameModalOpen && (
        <div 
          className={styles.gameModalOverlay}
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
            className={styles.gameModalCard}
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
                style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', opacity: 0.7, minHeight: '44px', minWidth: '44px' }}
              >
                Tutup ✕
              </button>
            </div>
            
            {/* Game 1: Wong Tersakiti Bross */}
            <div 
              className={styles.gameModalItem}
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
              <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '0.75rem', flexShrink: 0 }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Wong Tersakiti Bross</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>2D Side-scrolling Retro Platformer</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, flexShrink: 0 }}>Mainkan ↗</span>
            </div>

            {/* Game 2: GMWST (Dino) */}
            <div 
              className={styles.gameModalItem}
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
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', flexShrink: 0 }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>GMWST (gemme wong sing tulus)</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Endless Runner Klasik Santri</p>
              </div>
              <span style={{ fontSize: '0.85rem', opacity: 0.6, flexShrink: 0 }}>Mainkan ↗</span>
            </div>

            {/* Game 3: Happy Ngetik Sayy (Moved to bottom, mobile restricted) */}
            <div 
              className={styles.gameModalItem}
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
                opacity: tileColumns === 1 ? 0.6 : 1
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
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '0.75rem', flexShrink: 0 }}>
                <Gamepad2 size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="display-font" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Happy Ngetik Sayy (HTS)</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Game 2D Edukatif Mengetik Cepat</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, flexShrink: 0 }}>Mainkan ↗</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

