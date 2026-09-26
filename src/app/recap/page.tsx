"use client";

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import Link from 'next/link';
import { ArrowLeft, Play, X, Maximize, ArrowRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import styles from './Recap.module.css';
import { useLanguage } from '../../components/LanguageProvider';

const categories = ['Semua', 'Agustusan 26 (1)', 'Agustusan 26 (2)'];

const videos = [
  {
    id: 1,
    title: "Agustusan 26 (1)",
    url: "https://res.cloudinary.com/ioptiq1r/video/upload/v1790170709/AGUSTUSAN_2026.mp4",
    category: "Agustusan 26 (1)"
  },
  {
    id: 2,
    title: "Agustusan 26 (2)",
    url: "https://res.cloudinary.com/ioptiq1r/video/upload/v1790170704/AGUSTUSAN_2026_2.mp4",
    category: "Agustusan 26 (2)"
  }
];

export default function RecapPage() {
  const { t } = useLanguage();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredVideos = activeCategory === 'Semua' ? videos : videos.filter(v => v.category === activeCategory);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backBtn}>
        <ArrowLeft size={20} />
        {t.backToHome}
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{t.recapTitle}</h1>
        <p className={styles.subtitle}>
          {t.recapDesc}
        </p>
      </div>

      <div className={styles.categoryContainer}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${styles.categoryChip} ${activeCategory === cat ? styles.active : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.swiperContainer}>
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          slideToClickedSlide={true}
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 250,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="recap-swiper"
        >
          {filteredVideos.map((vid) => (
            <SwiperSlide key={vid.id} style={{ width: 'auto' }}>
              <div className={styles.slideInner}>
                <video 
                  src={vid.url} 
                  className={styles.videoPreview}
                  muted
                  loop
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div 
                  className={`${styles.fullscreenBtn} swiper-no-swiping`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlayingVideo(vid.url);
                  }}
                  title="Full Screen"
                >
                  <Maximize size={20} />
                </div>
                <div className={styles.videoTitle}>{vid.title}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.moreBtnContainer}>
        <Link href="/tiktok" className={styles.moreTiktokBtn}>
          Lihat semua di TikTok kami
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Fullscreen Video Modal */}
      {playingVideo && (
        <div className={styles.modalOverlay} onClick={() => setPlayingVideo(null)}>
          <button className={styles.closeBtn} onClick={() => setPlayingVideo(null)}>
            <X size={24} />
          </button>
          <video 
            src={playingVideo} 
            className={styles.videoPlayer}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
