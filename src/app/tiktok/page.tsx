"use client";

import React, { useState, useEffect } from 'react';
import { useOsmisData } from '../../lib/storage';
import styles from './TikTok.module.css';

export default function TikTokPage() {
  const { data, isLoaded } = useOsmisData();
  const [activeTab, setActiveTab] = useState<string>('1');
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  const activeFolder = data.tiktokFolders?.find(f => f.id === activeTab);

  useEffect(() => {
    if (!activeFolder) {
      setVideos([]);
      return;
    }
    if ((activeFolder as any).videos && Array.isArray((activeFolder as any).videos)) {
      setVideos((activeFolder as any).videos);
    } else {
      setVideos([]);
    }
  }, [activeFolder]);

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.tiktokContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <img src="/logo_utama.png" alt="Profile" className={styles.avatar} />
        </div>
        <h1 className={styles.username}>@{data.socialMedia?.tiktok || 'osmis_official'}</h1>
        <h2 className={styles.displayName}>OSMIS Official</h2>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <strong>124</strong>
            <span>Mengikuti</span>
          </div>
          <div className={styles.statItem}>
            <strong>10.5K</strong>
            <span>Pengikut</span>
          </div>
          <div className={styles.statItem}>
            <strong>250K</strong>
            <span>Suka</span>
          </div>
        </div>

        <p className={styles.bio}>
          Akun resmi OSMIS (Organisasi Santri Ma'had Imam Syafi'i)<br/>
          Angkatan 11
        </p>

        <div className={styles.actionButtons}>
          <a href={`https://instagram.com/${data.socialMedia?.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.followBtn}>Ikuti di Instagram</a>
        </div>
      </div>

      <div className={styles.tabs}>
        {data.tiktokFolders?.map(folder => (
          <button 
            key={folder.id} 
            className={`${styles.tabBtn} ${activeTab === folder.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(folder.id)}
          >
            {folder.name}
          </button>
        ))}
      </div>

      <div className={styles.videoGrid}>
        {isLoading ? (
          <div className={styles.loading}>Memuat video...</div>
        ) : !activeFolder?.folderId ? (
          <div className={styles.emptyState}>Folder ID belum diatur di Backroom.</div>
        ) : videos.length === 0 ? (
          <div className={styles.emptyState}>Tidak ada video di folder ini.</div>
        ) : (
          videos.map(video => (
            <div key={video.id} className={styles.videoCard} onClick={() => setPlayingVideo(video)}>
              {video.thumbnailLink ? (
                <img src={video.thumbnailLink.replace('=s220', '=s600')} alt={video.name} className={styles.thumbnail} />
              ) : (
                <div className={styles.noThumbnail}>Video</div>
              )}
              <div className={styles.playIcon}>
                <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className={styles.views}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {Math.floor(Math.random() * 5000) + 100}
              </div>
            </div>
          ))
        )}
      </div>

      {playingVideo && (
        <div className={styles.playerModal} onClick={() => setPlayingVideo(null)}>
          <div className={styles.modalActions}>
            <a 
              href={`https://drive.google.com/uc?export=download&id=${playingVideo.id}`}
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.downloadBtn}
              onClick={e => e.stopPropagation()}
              title="Download Video"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </a>
            <button className={styles.closeBtn} onClick={() => setPlayingVideo(null)}>✕</button>
          </div>
          <div className={styles.iframeWrapper} onClick={e => e.stopPropagation()}>
            <iframe 
              src={playingVideo.webViewLink.replace('/view', '/preview')} 
              className={styles.iframe}
              allow="autoplay"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
