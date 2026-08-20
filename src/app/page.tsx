"use client";

import React from 'react';
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

          {/* Card 3: Game GMWST */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon}>
                <Gamepad2 size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName">GMWST</h3>
              <p className={styles.featureDesc}>Gemme Wong Sing Tulus (Game Interaktif)</p>
            </div>
            <button 
              className={styles.featureBtn}
              onClick={() => window.location.href = '/hts.html'}
            >
              [ Mainkan ]
            </button>
          </div>

          {/* Card 4: Game MGB */}
          <div className={styles.featureCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={styles.featureIcon} style={{ opacity: 0.5 }}>
                <Clock size={40} strokeWidth={1.5} />
              </div>
              <h3 className="display-font styles.featureName" style={{ opacity: 0.5 }}>MGB</h3>
              <p className={styles.featureDesc} style={{ opacity: 0.5 }}>Mas Gagian Bali (Game Mendatang)</p>
            </div>
            <button 
              className={styles.featureBtn}
              style={{ cursor: 'not-allowed', opacity: 0.5 }}
              disabled
            >
              [ Coming Soon ]
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
    </div>
  );
}
