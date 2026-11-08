"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { useTheme } from 'next-themes';
import { organization } from '../data/organization';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { HalftoneWordmarkFooter } from './ui/halftone-wordmark-footer';
import styles from './Hero.module.css';

interface DivisionItem {
  id: string;
  nameKey?: string;
  name: string;
  icon?: string;
}

export default function Hero() {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    if (isDark) {
      setShowAnimation(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowAnimation(true);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
          clearTimeout(timer);
          timer = setTimeout(() => {
            setShowAnimation(false);
          }, 5000);
        }
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [isDark]);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const estYear = language === 'ar' ? '٢٠١٨' : '2018';
  const periodLabel = language === 'ar' ? toArabicNumerals('26 — 27') : '26 — 27';
  const divisions = organization.divisions as DivisionItem[];

  return (
    <section id="hero" ref={heroRef} className={styles.hero}>
      {/* Background Watermark Layer (Original behavior: 5s video intro -> static logo watermark) */}
      {!isDark && (
        <video
          ref={videoRef}
          src="/video_utama.webm"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className={styles.videoWatermark}
          style={{ opacity: showAnimation ? 0.16 : 0 }}
          onContextMenu={(e) => e.preventDefault()}
          onError={() => setShowAnimation(false)}
        />
      )}
      <img
        src="/logo_utama.png"
        alt="Watermark OSMIS"
        aria-hidden="true"
        className={styles.watermark}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ opacity: isDark ? 0.08 : showAnimation ? 0 : 0.12 }}
      />

      {/* Monumental Arch / Dome Gateway Portal */}
      <div className={styles.archWrapper}>
        <div className={styles.archDome} aria-hidden="true">
          {/* Architectural 1px SVG Arch Frame (Outer & Inner Gateway Lines) */}
          <svg
            className={styles.archSvg}
            viewBox="0 0 640 760"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Outer Arch Line */}
            <path
              d="M 1 760 L 1 320 A 319 319 0 0 1 639 320 L 639 760"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className={styles.archStrokeOuter}
            />
            {/* Inner Architectural Inset Arch Line */}
            <path
              d="M 22 760 L 22 322 A 298 298 0 0 1 618 322 L 618 760"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className={styles.archStrokeInner}
            />
            {/* Keystone / Crown Axis Tick at Top of Dome */}
            <line
              x1="320"
              y1="1"
              x2="320"
              y2="22"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className={styles.archKeystone}
            />
            {/* Base Threshold Line */}
            <line
              x1="0"
              y1="759"
              x2="640"
              y2="759"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className={styles.archStrokeInner}
            />
          </svg>
        </div>

        {/* Centered Hero Identity Zone inside the Arch */}
        <div className={styles.identityCard}>
          <h1 className={styles.srOnly}>
            {t.osmisName} — {t.orgNameLong}
          </h1>

          {/* Stabilized Halftone Wordmark "OSMIS" */}
          <div
            className={styles.halftoneContainer}
            title="Sentuh atau klik tulisan OSMIS"
          >
            <HalftoneWordmarkFooter
              heroMode={true}
              wordmark={t.osmisName || 'OSMIS'}
              dotGap={5}
              radius={85}
              crop={0.92}
              grain={0}
              interactive={true}
              height="clamp(110px, 15vw, 180px)"
            />
          </div>

          {/* Architectural Divider Rule */}
          <div className={styles.archRule} aria-hidden="true" />

          {/* Solid Dark/Contrast Badge Pill: ORGANISASI MA'HAD IMAM SYAFI'I */}
          <div className={`${styles.orgBadge} mono-font`}>
            {t.orgNameLong.toUpperCase()}
          </div>

          {/* Period Label: EST. 2018 · 26 — 27 */}
          <p className={`${styles.periodMeta} mono-font`}>
            <span>
              {t.est} {estYear}
            </span>
            <span className={styles.metaDot} aria-hidden="true">
              ·
            </span>
            <span className={styles.periodYears}>{periodLabel}</span>
          </p>
        </div>
      </div>

      {/* Division Icons Row (Kufic Calligraphy) below the Arch */}
      <nav
        className={styles.divisionLogos}
        aria-label="Divisi OSMIS"
      >
        {divisions.map((div) => {
          const translationKey = div.nameKey as keyof typeof t | undefined;
          const label =
            translationKey && typeof t[translationKey] === 'string'
              ? (t[translationKey] as string)
              : div.name;
          return (
            <button
              key={div.id}
              type="button"
              className={styles.divLogoButton}
              title={label}
              aria-label={label}
              onClick={() => scrollToSection('divisions')}
            >
              {div.icon && (
                <img
                  src={div.icon}
                  alt={label}
                  className={styles.divLogo}
                  draggable={false}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Scroll CTA: + [ GULIR KE BAWAH ] + */}
      <button
        type="button"
        className={`${styles.scrollBtn} mono-font`}
        onClick={() => scrollToSection('introduction')}
      >
        <span className={styles.scrollCross} aria-hidden="true">
          +
        </span>
        <span>[ {t.heroScroll} ]</span>
        <span className={styles.scrollCross} aria-hidden="true">
          +
        </span>
      </button>
    </section>
  );
}
