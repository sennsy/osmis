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

  // Modal state for Lihat Anggota
  const [membersModalDivId, setMembersModalDivId] = useState<string | null>(null);

  // Modal state for zooming member/leader photo
  const [photoModalData, setPhotoModalData] = useState<{ image: string; name: string; role: string } | null>(null);

  const activeDivForModal = organization.divisions.find((d: any) => d.id === modalDivId);
  const activeDivForMembers = organization.divisions.find((d: any) => d.id === membersModalDivId);

  const lanyardMembers: LanyardMember[] = useMemo(() => {
    if (!activeDivForMembers) return [];
    const divName =
      activeDivForMembers.nameKey && (t as any)[activeDivForMembers.nameKey]
        ? (t as any)[activeDivForMembers.nameKey]
        : activeDivForMembers.name;
    const qismLogo = (activeDivForMembers as any).icon || '/logo_utama.png';
    const mainLogo = '/logo_utama.png';

    const headsList: LanyardMember[] = (activeDivForMembers.heads || []).map((h: any, idx: number) => {
      const displayName = language === 'ar' && h.nameAr ? h.nameAr : h.name;
      const roleStr =
        language === 'ar'
          ? `رئيس قسم ${divName}`
          : language === 'en'
            ? `HEAD OF ${divName}`
            : `KETUA ${divName}`;
      return {
        id: `${activeDivForMembers.id}-head-${idx}`,
        name: displayName,
        role: 'KETUA-ne',
        team: `OSMIS · ${divName}`,
        image: h.image ? getImageUrl(h.image) : qismLogo,
        bio:
          language === 'ar'
            ? `رئيس قسم ${divName} في منظمة طلاب معهد دار السنة الإسلامي (OSMIS) ٢٠٢٦-٢٠٢٧.`
            : language === 'en'
              ? `Head of ${divName} Division — OSMIS Cabinet 2026/2027.`
              : `Ketua Bagian ${divName} — Pengurus OSMIS Masa Bakti 2026/2027.`,
        tags: ['KETUA-ne', divName, 'OSMIS 26/27'],
        tone: 1,
        mainLogo,
        qismLogo,
        links: h.image
          ? [
              {
                label: language === 'ar' ? 'تكبير الصورة' : language === 'en' ? 'Zoom Photo' : 'Perbesar Foto',
                onClick: () =>
                  setPhotoModalData({
                    image: h.image,
                    name: displayName,
                    role: roleStr,
                  }),
              },
            ]
          : undefined,
      };
    });

    const membersList: LanyardMember[] = (activeDivForMembers.members || []).map((m: any, idx: number) => {
      const displayName = language === 'ar' && m.nameAr ? m.nameAr : m.name;
      const tones: Array<1 | 2 | 3 | 4 | 5> = [2, 3, 4, 5];
      const roleLabel = language === 'ar' ? 'عضو القسم' : language === 'en' ? 'MEMBER' : 'ANGGOTA';
      const roleStr =
        language === 'ar'
          ? `عضو ${divName}`
          : language === 'en'
            ? `MEMBER OF ${divName}`
            : `ANGGOTA ${divName}`;
      return {
        id: `${activeDivForMembers.id}-member-${idx}`,
        name: displayName,
        role: roleLabel,
        team: `OSMIS · ${divName}`,
        image: m.image ? getImageUrl(m.image) : qismLogo,
        bio:
          language === 'ar'
            ? `عضو قسم ${divName} في منظمة طلاب معهد دار السنة الإسلامي (OSMIS) ٢٠٢٦-٢٠٢٧.`
            : language === 'en'
              ? `Member of ${divName} Division — OSMIS Cabinet 2026/2027.`
              : `Anggota Bagian ${divName} — Pengurus OSMIS Masa Bakti 2026/2027.`,
        tags: [roleLabel, divName, 'OSMIS 26/27'],
        tone: tones[idx % tones.length],
        mainLogo,
        qismLogo,
        links: m.image
          ? [
              {
                label: language === 'ar' ? 'تكبير الصورة' : language === 'en' ? 'Zoom Photo' : 'Perbesar Foto',
                onClick: () =>
                  setPhotoModalData({
                    image: m.image,
                    name: displayName,
                    role: roleStr,
                  }),
              },
            ]
          : undefined,
      };
    });

    return [...headsList, ...membersList];
  }, [activeDivForMembers, language, t]);

  const dishes: Dish[] = useMemo(() => {
    return organization.divisions.map((div: any, idx: number) => {
      const divName = div.nameKey && (t as any)[div.nameKey] ? (t as any)[div.nameKey] : div.name;
      const primaryHead = div.heads?.[0];
      const rawHeadName =
        language === 'ar' && primaryHead?.nameAr
          ? primaryHead.nameAr
          : primaryHead?.name || 'Ketua Bagian';

      const shortHeadName = language === 'ar' ? rawHeadName : formatKetuaTitle(rawHeadName);
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
          progsGroup.length > 1 && group.category ? `[${group.category}] ${item}` : item
        )
      );

      const rulesList: string[] = div.rules || [];
      const totalMembers = (div.heads?.length || 0) + (div.members?.length || 0);
      const badgeStr = language === 'ar' ? toArabicNumerals(div.id) : div.id;

      return {
        // 1. #most loved dish -> diganti jadi nama qism (misal kebersihan)
        eyebrow: `#${badgeStr} ${divName}`,
        // 2. Char grill -> diganti nama ketua (misal raykhan dwi f.)
        title: shortHeadName,
        // 3. Ribeye -> diganti "KETUA-ne"
        subtitle: 'KETUA-ne',
        image:
          div.icon ||
          (primaryHead?.image ? getImageUrl(primaryHead.image) : '/logo_utama.png'),
        alt: `${divName} - ${allHeadsNames}`,
        label: divName,
        rating: idx + 1,
        badgeLabel: badgeStr,
        chef: allHeadsNames || shortHeadName,
        kitchen: `${language === 'ar' ? toArabicNumerals(totalMembers) : totalMembers} ${t.members || 'Anggota'} • ${divName}`,
        description:
          flatPrograms[0] ||
          (language === 'ar'
            ? 'قسم في منظمة طلاب معهددار السنة الإسلامي'
            : language === 'en'
              ? `Division of ${divName}`
              : `Bagian ${divName} OSMIS`),
        // 6. Overview -> diganti program kerja
        programsList: flatPrograms,
        likes: 20 + totalMembers * 3,
        // 7. Ingredients -> diganti peraturan masing-masing bagian
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
        playLabel={language === 'ar' ? 'عرض الأعضاء' : language === 'en' ? 'View Members' : 'Lihat Anggota'}
        overviewLabel={language === 'ar' ? 'برنامج العمل' : language === 'en' ? 'Work Programs' : 'Program Kerja'}
        ingredientsLabel={language === 'ar' ? 'اللوائح' : language === 'en' ? 'Regulations' : 'Peraturan'}
        detailButtonLabel={
          language === 'ar' ? 'عرض التفاصيل الكاملة' : language === 'en' ? 'View Full Details' : 'Lihat Detail Lengkap'
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

      {/* MODAL LIHAT ANGGOTA — TeamLanyardRail (Triggered by "Lihat Anggota" button) */}
      <AnimatePresence>
        {membersModalDivId && activeDivForMembers && (
          <motion.div
            className={styles.modalOverlay}
            onClick={() => setMembersModalDivId(null)}
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
              style={{
                maxWidth: '1080px',
                width: '95vw',
                padding: '0.5rem 0 1.5rem',
                overflowX: 'hidden',
              }}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setMembersModalDivId(null)}
                style={{ zIndex: 30 }}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <TeamLanyardRail
                items={lanyardMembers}
                mainLogo="/logo_utama.png"
                qismLogo={(activeDivForMembers as any).icon}
                eyebrow={`#${language === 'ar' ? toArabicNumerals(activeDivForMembers.id) : activeDivForMembers.id} • ${
                  language === 'ar' ? toArabicNumerals(lanyardMembers.length) : lanyardMembers.length
                } ${t.members || 'Anggota'} OSMIS`}
                heading={
                  activeDivForMembers.nameKey && (t as any)[activeDivForMembers.nameKey]
                    ? (t as any)[activeDivForMembers.nameKey]
                    : activeDivForMembers.name
                }
                caption={
                  language === 'ar'
                    ? 'اسحب البطاقة للأسفل أو اضغط عليها لقلب البطاقة ورؤية التفاصيل'
                    : language === 'en'
                      ? 'Pull a badge down to swing it, or click any card to flip & zoom photo'
                      : 'Tarik kartu ke bawah untuk mengayunkan, atau klik kartu untuk membalik & memperbesar foto'
                }
              />

              <div style={{ display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
                <button
                  className={styles.viewProgramsBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = activeDivForMembers.id;
                    setMembersModalDivId(null);
                    setModalDivId(id);
                    setActiveTab('programs');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    maxWidth: '380px',
                    marginTop: '0.25rem',
                  }}
                >
                  <ClipboardList size={16} />
                  {(t as any).viewPrograms || 'LIHAT PROGRAM KERJA & PERATURAN'}
                </button>
              </div>
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
                  {(t as any).workPrograms || 'PROGRAM KERJA'}
                </button>
                {activeDivForModal.rules && activeDivForModal.rules.length > 0 && (
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'rules' ? styles.activeTab : ''}`}
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
                            style={{ color: 'var(--osmis-yellow)', marginBottom: '0.75rem', fontSize: '0.85rem' }}
                          >
                            {progGroup.category}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {progGroup.items.map((item: string, itemIdx: number) => (
                              <div key={itemIdx} className={styles.programItem}>
                                <span className={styles.programDot}>▪</span>
                                <span
                                  className={styles.programText}
                                  style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
                                >
                                  {item}
                                </span>
                              </div>
                            ))}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(activeDivForModal.rules || []).map((rule: string, idx: number) => (
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

