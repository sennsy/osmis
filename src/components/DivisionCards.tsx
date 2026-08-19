"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './DivisionCards.module.css';
import { getImageUrl } from '../utils/driveImages';
import { toArabicNumerals } from '../utils/arabicNumerals';
import PhotoModal from './PhotoModal';

export default function DivisionCards() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const organization = data.organization;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalDivId, setModalDivId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'rules'>('programs');
  const [photoModalData, setPhotoModalData] = useState<{image: string, name: string, role: string} | null>(null);

  const activeDivForModal = organization.divisions.find((d: any) => d.id === modalDivId);

  const toggleDivision = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <section id="divisions" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {organization.divisions.map((div) => {
            const isExpanded = expandedId === div.id;
            return (
              <motion.div 
                key={div.id}
                className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => toggleDivision(div.id)}
                layout
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {(div as any).icon && (
                      <img src={(div as any).icon} alt={`${div.name} Icon`} width={32} height={32} />
                    )}
                    <div className={`${styles.divId} mono-font`}>{language === 'ar' ? toArabicNumerals(div.id) : div.id}</div>
                  </div>
                  <h3 className={`${styles.divName} display-font`}>{div.nameKey ? (t as any)[div.nameKey] : div.name}</h3>
                  <div className={`${styles.memberCount} mono-font`}>
                    {language === 'ar' ? toArabicNumerals(div.heads.length + div.members.length) : (div.heads.length + div.members.length)} {t.members}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      className={styles.expandedContent}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.contentInner}>
                        <div className={styles.heads}>
                          <h4 className="mono-font">{(t as any).divLeader || "KETUA DIVISI"}</h4>
                          <ul style={{ listStyle: 'none', padding: 0 }}>
                            {div.heads.map((h, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                {h.image && (
                                  <div 
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const divName = div.nameKey ? (t as any)[div.nameKey] : div.name;
                                      const roleStr = language === 'ar' ? `رئيس قسم ${divName}` : language === 'en' ? `HEAD OF ${divName}` : `KETUA ${divName}`;
                                      setPhotoModalData({ image: h.image, name: language === 'ar' && h.nameAr ? h.nameAr : h.name, role: roleStr }); 
                                    }}
                                  >
                                    <img src={getImageUrl(h.image)} alt={h.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid var(--border-color)' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                      <Maximize2 size={16} color="#fff" />
                                    </div>
                                  </div>
                                )}
                                <span>{language === 'ar' && h.nameAr ? h.nameAr : h.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.members}>
                          <h4 className="mono-font">{t.members}</h4>
                          <ul style={{ listStyle: 'none', padding: 0 }}>
                            {div.members.map((m, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span className="mono-font opacity-50">{language === 'ar' ? toArabicNumerals((i + 1).toString().padStart(2, '0')) : (i + 1).toString().padStart(2, '0')}</span> 
                                {m.image && (
                                  <div 
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const divName = div.nameKey ? (t as any)[div.nameKey] : div.name;
                                      const roleStr = language === 'ar' ? `عضو ${divName}` : language === 'en' ? `MEMBER OF ${divName}` : `ANGGOTA ${divName}`;
                                      setPhotoModalData({ image: m.image, name: language === 'ar' && m.nameAr ? m.nameAr : m.name, role: roleStr }); 
                                    }}
                                  >
                                    <img src={getImageUrl(m.image)} alt={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid var(--border-color)' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                      <Maximize2 size={14} color="#fff" />
                                    </div>
                                  </div>
                                )}
                                <span>{language === 'ar' && m.nameAr ? m.nameAr : m.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button 
                          className={styles.viewProgramsBtn}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setModalDivId(div.id); 
                            setActiveTab('programs');
                          }}
                        >
                          {(t as any).viewPrograms || "LIHAT PROGRAM KERJA & PERATURAN"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Sketch decor */}
                <div className={styles.sketchLine}></div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODAL PROGRAM KERJA */}
      <AnimatePresence>
        {modalDivId && activeDivForModal && (
          <motion.div 
            className={styles.modalOverlay}
            onClick={() => setModalDivId(null)}
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
              <button className={styles.closeBtn} onClick={() => setModalDivId(null)}>
                <X size={24} />
              </button>
              <h3 className={`${styles.modalTitle} display-font`}>
                {activeDivForModal.nameKey ? (t as any)[activeDivForModal.nameKey] : activeDivForModal.name}
              </h3>
              <div className={styles.modalTabs}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'programs' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('programs')}
                >
                  {(t as any).workPrograms || "PROGRAM KERJA"}
                </button>
                {activeDivForModal.rules && activeDivForModal.rules.length > 0 && (
                  <button 
                    className={`${styles.tabBtn} ${activeTab === 'rules' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('rules')}
                  >
                    {(t as any).rules || "PERATURAN"}
                  </button>
                )}
              </div>
              <div className={styles.programList}>
                {activeTab === 'programs' ? (
                  (() => {
                    const progs = language === 'ar' && activeDivForModal.programsAr 
                      ? activeDivForModal.programsAr 
                      : language === 'en' && activeDivForModal.programsEn 
                        ? activeDivForModal.programsEn 
                        : activeDivForModal.programs;
                    
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
                                <span className={styles.programText} style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>{item}</span>
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
                  })()
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeDivForModal.rules.map((rule: string, idx: number) => (
                      <div key={idx} className={styles.programItem}>
                        <span className={styles.programDot}>▪</span>
                        <span className={styles.programText} style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                          {rule}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
