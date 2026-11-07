"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './DivisionCards.module.css';
import { getImageUrl } from '../utils/driveImages';
import { toArabicNumerals } from '../utils/arabicNumerals';
import PhotoModal from './PhotoModal';
import { DishOrbitCarousel, type Dish } from './ui/dish-orbit-carousel';
import { TeamLanyardRail, type LanyardMember } from './ui/team-lanyard-rail';

const ACCENT_PALETTE = [
  '#34d399', // 01 Keamanan - Emerald
  '#60a5fa', // 02 Ta'mir Masjid & Ibadah - Blue
  '#fbbf24', // 03 Kebersihan & Olahraga - Amber
  '#f87171', // 04 Kesehatan & Dapur - Rose
  '#a78bfa', // 05 Bahasa - Violet
  '#2dd4bf', // 06 Sarana & Prasarana - Teal
];

function formatKetuaTitle(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 3) {
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${parts.slice(0, -1).join(' ')} ${lastInitial}.`;
  }
  return name;
}

export default function DivisionCards() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const organization = data.organization;

  // Modal state for Program Kerja / Peraturan
  const [modalDivId, setModalDivId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'rules'>('programs');

  // Modal state for Lihat Anggota (TeamLanyardRail)
  const [membersModalDivId, setMembersModalDivId] = useState<string | null>(null);

  // Modal state for zooming member/leader photo
  const [photoModalData, setPhotoModalData] = useState<{
    image: string;
    name: string;
    role: string;
  } | null>(null);

  const activeDivForModal = organization.divisions.find(
    (d: any) => d.id === modalDivId
  );
  const activeDivForMembers = organization.divisions.find(
    (d: any) => d.id === membersModalDivId
  );

  // Build LanyardMember list dynamically matching exact number of people in the selected Qism
  const activeLanyardMembers: LanyardMember[] = useMemo(() => {
    if (!activeDivForMembers) return [];
    const divIdx = organization.divisions.findIndex(
      (d: any) => d.id === activeDivForMembers.id
    );
    const divAccent =
      ACCENT_PALETTE[(divIdx >= 0 ? divIdx : 0) % ACCENT_PALETTE.length];
    const divName =
      activeDivForMembers.nameKey && (t as any)[activeDivForMembers.nameKey]
        ? (t as any)[activeDivForMembers.nameKey]
        : activeDivForMembers.name;
    const fallbackAvatar =
      (activeDivForMembers as any).icon || '/logo_utama.png';

    const list: LanyardMember[] = [];

    // 1. Add Ketua(s) of the Qism
    (activeDivForMembers.heads || []).forEach((h: any, i: number) => {
      const memberName =
        language === 'ar' && h.nameAr ? h.nameAr : h.name;
      list.push({
        id: `head-${activeDivForMembers.id}-${i}`,
        name: memberName,
        role: 'KETUA-ne',
        avatar: h.image ? getImageUrl(h.image) : fallbackAvatar,
        accent: divAccent,
        meta: `QISM #${activeDivForMembers.id} • ${divName}`,
        bio: `Ketua Bagian ${divName} OSMIS Masa Bakti 2026–2027.`,
        handle: `KETUA #0${i + 1}`,
      });
    });

    // 2. Add Anggota(s) of the Qism
    (activeDivForMembers.members || []).forEach((m: any, i: number) => {
      const memberName =
        language === 'ar' && m.nameAr ? m.nameAr : m.name;
      list.push({
        id: `member-${activeDivForMembers.id}-${i}`,
        name: memberName,
        role:
          language === 'ar'
            ? 'عضو القسم'
            : language === 'en'
              ? 'DIVISION MEMBER'
              : 'ANGGOTA QISM',
        avatar: m.image ? getImageUrl(m.image) : fallbackAvatar,
        accent: divAccent,
        meta: `QISM #${activeDivForMembers.id} • ${divName}`,
        bio: `Anggota aktif bagian ${divName} OSMIS Masa Bakti 2026–2027.`,
        handle: `ANGGOTA #${String(i + 1).padStart(2, '0')}`,
      });
    });

    return list;
  }, [activeDivForMembers, organization.divisions, language, t]);

  const dishes: Dish[] = useMemo(() => {
    return organization.divisions.map((div: any, idx: number) => {
      const divName =
        div.nameKey && (t as any)[div.nameKey]
          ? (t as any)[div.nameKey]
          : div.name;
      const primaryHead = div.heads?.[0];
      const rawHeadName =
        language === 'ar' && primaryHead?.nameAr
          ? primaryHead.nameAr
          : primaryHead?.name || 'Ketua Bagian';

      const shortHeadName =
        language === 'ar' ? rawHeadName : formatKetuaTitle(rawHeadName);
      const allHeadsNames = (div.heads || [])
        .map((h: any) => (language === 'ar' && h.nameAr ? h.nameAr : h.name))
        .join(' & ');

      const progsGroup =
        language === 'ar' && div.programsAr
          ? div.programsAr
          : language === 'en' && div.programsEn
            ? div.programsEn
            : div.programs || [];

      const flatPrograms: string[] = progsGroup.flatMap((group: any) =>
        (group.items || []).map((item: string) =>
          progsGroup.length > 1 && group.category
            ? `[${group.category}] ${item}`
            : item
        )
      );

      const rulesList: string[] = div.rules || [];
      const totalMembers =
        (div.heads?.length || 0) + (div.members?.length || 0);
      const badgeStr =
        language === 'ar' ? toArabicNumerals(div.id) : div.id;

      return {
        eyebrow: `#${badgeStr} ${divName}`,
        title: shortHeadName,
        subtitle: 'KETUA-ne',
        image:
          div.icon ||
          (primaryHead?.image
            ? getImageUrl(primaryHead.image)
            : '/logo_utama.png'),
        alt: `${divName} - ${allHeadsNames}`,
        label: divName,
        rating: idx + 1,
        badgeLabel: badgeStr,
        chef: allHeadsNames || shortHeadName,
        kitchen: `${
          language === 'ar' ? toArabicNumerals(totalMembers) : totalMembers
        } ${t.members || 'Anggota'} • ${divName}`,
        description:
          flatPrograms[0] ||
          (language === 'ar'
            ? 'قسم في منظمة طلاب معهددار السنة الإسلامي'
            : language === 'en'
              ? `Division of ${divName}`
              : `Bagian ${divName} OSMIS`),
        programsList: flatPrograms,
        likes: 20 + totalMembers * 3,
        ingredients: rulesList,
        accent: ACCENT_PALETTE[idx % ACCENT_PALETTE.length],
      };
    });
  }, [organization.divisions, language, t]);

  return (
    <section id="divisions" className={styles.section} style={{ padding: 0 }}>
      <DishOrbitCarousel
        dishes={dishes}
        height="100svh"
        loop={false}
        playLabel={
          language === 'ar'
            ? 'عرض الأعضاء'
            : language === 'en'
              ? 'View Members'
              : 'Lihat Anggota'
        }
        overviewLabel={
          language === 'ar'
            ? 'برنامج العمل'
            : language === 'en'
              ? 'Work Programs'
              : 'Program Kerja'
        }
        ingredientsLabel={
          language === 'ar'
            ? 'اللوائح'
            : language === 'en'
              ? 'Regulations'
              : 'Peraturan'
        }
        detailButtonLabel={
          language === 'ar'
            ? 'عرض التفاصيل الكاملة'
            : language === 'en'
              ? 'View Full Details'
              : 'Lihat Detail Lengkap'
        }
        onPlay={(_dish, index) => {
          const targetDiv = organization.divisions[index];
          if (targetDiv) {
            setMembersModalDivId(targetDiv.id);
          }
        }}
        onOpenDetail={(_dish, index, tab) => {
          const targetDiv = organization.divisions[index];
          if (targetDiv) {
            setModalDivId(targetDiv.id);
            setActiveTab(tab === 'ingredients' ? 'rules' : 'programs');
          }
        }}
      />

      {/* MODAL LIHAT ANGGOTA — Powered by TeamLanyardRail */}
      <AnimatePresence>
        {membersModalDivId && activeDivForMembers && (
          <motion.div
            className={styles.modalOverlay}
            onClick={() => setMembersModalDivId(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: 'clamp(12px, 2.5vw, 32px)' }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1280px',
                maxHeight: '92vh',
                overflowY: 'auto',
                borderRadius: '24px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.75)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: '#05130d',
              }}
            >
              {/* Top Action Bar inside Lanyard Modal */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: 'rgba(5, 19, 13, 0.88)',
                  backdropFilter: 'blur(12px)',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    const id = activeDivForMembers.id;
                    setMembersModalDivId(null);
                    setModalDivId(id);
                    setActiveTab('programs');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.16)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#a7f3d0',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ClipboardList size={15} />
                  <span>
                    {(t as any).viewPrograms ||
                      'LIHAT PROGRAM KERJA & PERATURAN'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMembersModalDivId(null)}
                  aria-label="Tutup"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                  <span>TUTUP</span>
                </button>
              </div>

              <TeamLanyardRail
                eyebrow={`QISM #${
                  language === 'ar'
                    ? toArabicNumerals(activeDivForMembers.id)
                    : activeDivForMembers.id
                } // ${activeLanyardMembers.length} ANGGOTA`}
                heading={
                  activeDivForMembers.nameKey &&
                  (t as any)[activeDivForMembers.nameKey]
                    ? (t as any)[activeDivForMembers.nameKey]
                    : activeDivForMembers.name
                }
                subheading="Tarik kartu ke bawah lalu lepaskan untuk mengayunkan tali gantungan, atau klik kartu untuk membalik ID Card pengurus."
                members={activeLanyardMembers}
                mainLogo="/logo_utama.png"
                qismLogo={
                  (activeDivForMembers as any).icon || '/logo_utama.png'
                }
                onMemberClick={(member) => {
                  setPhotoModalData({
                    image: member.avatar,
                    name: member.name,
                    role: member.role,
                  });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PROGRAM KERJA & PERATURAN */}
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
              <button
                className={styles.closeBtn}
                onClick={() => setModalDivId(null)}
              >
                <X size={24} />
              </button>
              <h3 className={`${styles.modalTitle} display-font`}>
                {activeDivForModal.nameKey
                  ? (t as any)[activeDivForModal.nameKey]
                  : activeDivForModal.name}
              </h3>
              <div className={styles.modalTabs}>
                <button
                  className={`${styles.tabBtn} ${
                    activeTab === 'programs' ? styles.activeTab : ''
                  }`}
                  onClick={() => setActiveTab('programs')}
                >
                  {(t as any).workPrograms || 'PROGRAM KERJA'}
                </button>
                {activeDivForModal.rules &&
                  activeDivForModal.rules.length > 0 && (
                    <button
                      className={`${styles.tabBtn} ${
                        activeTab === 'rules' ? styles.activeTab : ''
                      }`}
                      onClick={() => setActiveTab('rules')}
                    >
                      {(t as any).rules || 'PERATURAN'}
                    </button>
                  )}
              </div>
              <div className={styles.programList}>
                {activeTab === 'programs' ? (
                  (() => {
                    const progs =
                      language === 'ar' && activeDivForModal.programsAr
                        ? activeDivForModal.programsAr
                        : language === 'en' && activeDivForModal.programsEn
                          ? activeDivForModal.programsEn
                          : activeDivForModal.programs;

                    return progs && progs.length > 0 ? (
                      progs.map((progGroup: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '1.5rem' }}>
                          <h4
                            className="mono-font"
                            style={{
                              color: 'var(--osmis-yellow)',
                              marginBottom: '0.75rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            {progGroup.category}
                          </h4>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                            }}
                          >
                            {progGroup.items.map(
                              (item: string, itemIdx: number) => (
                                <div
                                  key={itemIdx}
                                  className={styles.programItem}
                                >
                                  <span className={styles.programDot}>▪</span>
                                  <span
                                    className={styles.programText}
                                    style={{
                                      textAlign:
                                        language === 'ar' ? 'right' : 'left',
                                    }}
                                  >
                                    {item}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.programItem}>
                        <span className={styles.programText}>
                          {language === 'ar'
                            ? 'لم يتم توفير بيانات برنامج العمل بعد.'
                            : language === 'en'
                              ? 'No work program data available yet.'
                              : 'Belum ada data program kerja.'}
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {(activeDivForModal.rules || []).map(
                      (rule: string, idx: number) => (
                        <div key={idx} className={styles.programItem}>
                          <span className={styles.programDot}>▪</span>
                          <span
                            className={styles.programText}
                            style={{
                              textAlign: language === 'ar' ? 'right' : 'left',
                            }}
                          >
                            {rule}
                          </span>
                        </div>
                      )
                    )}
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
