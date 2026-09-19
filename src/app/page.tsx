"use client";

import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import HistoryTimeline from '../components/HistoryTimeline';
import OrganizationChart from '../components/OrganizationChart';
import DivisionCards from '../components/DivisionCards';
import { useLanguage } from '../components/LanguageProvider';
import styles from './page.module.css';

import Gallery from '../components/Gallery';
import { Camera, Sparkles, Gamepad2, Languages, Clock } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsGameModalOpen(window.location.hash === '#games');
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const safeCloseGameModal = () => {
    // If they used the hardware back button, this is already handled by hashchange.
    // If they click the "Tutup" button, we remove the hash without navigating back 
    // to avoid crashing Instagram/TikTok WebViews when history is empty.
    if (window.location.hash === '#games') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsGameModalOpen(false);
    }
  };

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

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2 className="display-font">{t.featuresTitle}</h2>
          <p className="mono-font">{t.featuresSubtitle}</p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Card 1: SMISFrame */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon}>
                <Camera size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName">{t.smisFrameTitle}</h3>
              <p className={styles.featureDesc}>{t.smisFrameDesc}</p>
            </div>
            <button 
              className={styles.featureBtn}
              onClick={() => window.location.href = '/smisframe'}
            >
              [ {t.tryFrame} ]
            </button>
          </div>

          {/* Card 2: MBTI Test */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon}>
                <Sparkles size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName">{t.mbtiTitle}</h3>
              <p className={styles.featureDesc}>{t.mbtiDesc}</p>
            </div>
            <button 
              className={styles.featureBtn}
              onClick={() => window.location.href = '/mbti'}
            >
              [ Buka Tes ]
            </button>
          </div>

          {/* Card 3: Games Arcade */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon}>
                <Gamepad2 size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName">OSMIS Games</h3>
              <p className={styles.featureDesc}>Kumpulan Mini Games Seru</p>
            </div>
            <button 
              className={styles.featureBtn}
              onClick={() => { window.location.hash = 'games'; }}
            >
              [ Pilih Game ]
            </button>
          </div>

          {/* Card 5: Belajar Bahasa */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon}>
                <Languages size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName">Linguista</h3>
              <p className={styles.featureDesc}>Belajar Kosakata Arab, Inggris & Indo ala Duolingo</p>
            </div>
            <button 
              className={styles.featureBtn}
              onClick={() => window.location.href = '/learn'}
            >
              [ Belajar ]
            </button>
          </div>
        </div>
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
          onClick={safeCloseGameModal}
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
                onClick={safeCloseGameModal}
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
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  alert("Game ini khusus untuk pengguna Desktop/PC (membutuhkan keyboard fisik).");
                } else {
                  window.location.href = '/wong-tersakiti-bross.html';
                }
              }}
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
