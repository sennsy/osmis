"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "../TikTok.module.css";

export default function TikTokFeed({ videos, initialIndex, onClose }: { videos: any[], initialIndex: number, onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  const handleLike = (videoId: string) => {
    setLikedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Determine which video is currently most visible
    const newIndex = Math.round(scrollPosition / windowHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    // Scroll to initial video on mount
    const container = document.getElementById("tiktok-feed-container");
    if (container) {
      container.scrollTop = initialIndex * window.innerHeight;
    }
  }, [initialIndex]);

  return (
    <div className={styles.feedOverlay}>
      <button className={styles.feedCloseBtn} onClick={onClose}>✕</button>
      
      <div 
        id="tiktok-feed-container"
        className={styles.feedContainer} 
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <div key={video.id} className={styles.feedItem}>
            {/* We try to use HTML5 video for autoplay and seamless loop. 
                Using the uc?export=download hack for Drive videos. */}
            <div className={styles.videoWrapper} style={{ position: 'relative', width: '100%', height: '100%' }}>
              <iframe
                src={`https://drive.google.com/file/d/${video.id}/preview?autoplay=1`}
                width="100%"
                height="100%"
                allow="autoplay"
                frameBorder="0"
                className={styles.feedVideo}
                style={{ border: 'none' }}
              />
            </div>
            
            {/* TikTok Overlay UI */}
            <div className={styles.feedUi}>
              <div className={styles.feedInfo}>
                <h3 className={styles.feedUsername}>@osmis_official</h3>
                <p className={styles.feedCaption}>{video.name.replace(".mp4", "")} #osmis #angkatan11</p>
                <div className={styles.feedMusic}>
                  🎵 Suara asli - OSMIS Official
                </div>
              </div>
              
              <div className={styles.feedActions}>
                <div className={styles.actionBtn} onClick={() => handleLike(video.id)}>
                  <div className={styles.iconCircle} style={{ color: likedVideos[video.id] ? '#ff2b54' : 'white' }}>
                    {likedVideos[video.id] ? '❤️' : '🤍'}
                  </div>
                  <span>{Math.floor(Math.random() * 500) + 100 + (likedVideos[video.id] ? 1 : 0)}</span>
                </div>
                <div className={styles.actionBtn}>
                  <div className={styles.iconCircle}>💬</div>
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className={styles.actionBtn} onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Video OSMIS Official',
                      text: `Tonton video "${video.name.replace(".mp4", "")}" dari OSMIS Official!`,
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Tautan disalin ke papan klip!");
                  }
                }}>
                  <div className={styles.iconCircle}>↗️</div>
                  <span>Bagikan</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
