"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './OrganizationChart.module.css';
import { getImageUrl } from '../utils/driveImages';
import { toArabicNumerals } from '../utils/arabicNumerals';
import PhotoModal from './PhotoModal';

export default function OrganizationChart() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const organization = data.organization;
  const [modalLeaderIdx, setModalLeaderIdx] = useState<number | null>(null);
  const [photoModalData, setPhotoModalData] = useState<{image: string, name: string, role: string} | null>(null);

  const activeLeader = modalLeaderIdx !== null ? organization.leadership[modalLeaderIdx] : null;

  return (
    <section id="organization" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className="mono-font">{language === 'ar' ? toArabicNumerals("26—27") : "26—27"}</span>
            <div className={styles.line}></div>
          </div>
          <h2 className="display-font">{t.currentPeriod}</h2>
          <h3 className="mono-font">{t.theCurrentGeneration}</h3>
        </div>

        <div className={styles.orgHeader}>
          <h4 className="display-font">{t.orgStructure}</h4>
          <p className="mono-font">{t.orgSubtitle}</p>
        </div>

        <div className={styles.chartWrapper}>
          <div className={styles.blueprintGrid}></div>
          
          <div className={styles.leadersBox}>
            {organization.leadership.map((leader: any, idx: number) => (
              <div key={idx} className={styles.leaderCard}>
                <div className={styles.leaderNumber}>{language === 'ar' ? toArabicNumerals(`0${idx + 1}`) : `0${idx + 1}`}</div>
                <div className={styles.leaderInfo}>
                  <p className={`${styles.leaderTitle} mono-font`}>{leader.titleKey ? (t as any)[leader.titleKey] : leader.title}</p>
                  {leader.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                      {leader.image && (
                        <div 
                          style={{ position: 'relative', cursor: 'pointer' }}
                          onClick={() => setPhotoModalData({ image: leader.image, name: language === 'ar' && leader.nameAr ? leader.nameAr : leader.name, role: leader.titleKey ? (t as any)[leader.titleKey] : leader.title })}
                        >
                          <img src={getImageUrl(leader.image)} alt={leader.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid var(--border-color)' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                            <Maximize2 size={20} color="#fff" />
                          </div>
                        </div>
                      )}
                      <h5 className={`${styles.leaderName} display-font`} style={{ margin: 0 }}>{language === 'ar' && leader.nameAr ? leader.nameAr : leader.name}</h5>
                    </div>
                  )}
                  {leader.members && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      {leader.members.map((m: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {m.image && (
                            <div 
                              style={{ position: 'relative', cursor: 'pointer' }}
                              onClick={() => setPhotoModalData({ image: m.image, name: language === 'ar' && m.nameAr ? m.nameAr : m.name, role: leader.titleKey ? (t as any)[leader.titleKey] : leader.title })}
                            >
                              <img src={getImageUrl(m.image)} alt={m.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid var(--border-color)' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                <Maximize2 size={16} color="#fff" />
                              </div>
                            </div>
                          )}
                          <h5 className={`${styles.leaderName} display-font`} style={{ margin: 0, fontSize: '1.2rem' }}>{language === 'ar' && m.nameAr ? m.nameAr : m.name}</h5>
                        </div>
                      ))}
                    </div>
                  )}
                  {leader.programs && leader.programs.length > 0 && (
                    <button 
                      className={styles.viewProgramsBtn}
                      onClick={() => setModalLeaderIdx(idx)}
                      style={{ marginTop: '1.5rem' }}
                    >
                      {(t as any).viewProgramsInti || "LIHAT PROGRAM KERJA"}
                    </button>
                  )}
                </div>
                <div className={styles.leaderLine}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL PROGRAM KERJA */}
      <AnimatePresence>
        {modalLeaderIdx !== null && activeLeader && (
          <motion.div 
            className={styles.modalOverlay}
            onClick={() => setModalLeaderIdx(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <button className={styles.closeBtn} onClick={() => setModalLeaderIdx(null)}>
                <X size={24} />
              </button>
              <h3 className={`${styles.modalTitle} display-font`}>
                {activeLeader.titleKey ? (t as any)[activeLeader.titleKey] : activeLeader.title}
              </h3>
              <div className={styles.programList}>
                {(() => {
                  const progs = language === 'ar' && activeLeader.programsAr 
                    ? activeLeader.programsAr 
                    : language === 'en' && activeLeader.programsEn 
                      ? activeLeader.programsEn 
                      : activeLeader.programs;
                  
                  return progs && progs.length > 0 ? (
                    progs.map((progGroup: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '1.5rem' }}>
                        <h4 className="mono-font" style={{ color: 'var(--osmis-yellow)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                          {progGroup.category}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {progGroup.items.map((item: string, itemIdx: number) => (
                            <div key={itemIdx} className={styles.programItem}>
                              <span className={styles.programDot}>▪</span>
                              <span className={styles.programText}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.programItem}>
                      <span className={styles.programText}>
                        {language === 'ar' ? "لم يتم توفير بيانات برنامج العمل بعد." : language === 'en' ? "No work program data available yet." : "Belum ada data program kerja."}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhotoModal 
        isOpen={!!photoModalData} 
        onClose={() => setPhotoModalData(null)} 
        image={photoModalData?.image || ''} 
        name={photoModalData?.name || ''} 
        role={photoModalData?.role} 
      />
    </section>
  );
}
