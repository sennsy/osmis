"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import styles from './OrganizationChart.module.css';
import { getImageUrl } from '../utils/driveImages';
import { toArabicNumerals } from '../utils/arabicNumerals';
import PhotoModal from './PhotoModal';
import { CoffeePourMenu, type CoffeeItem } from './ui/coffee-pour-menu';

const DRINK_PRESETS: Array<
  Pick<CoffeeItem, 'vessel' | 'layers' | 'crema' | 'foam' | 'art' | 'blend'>
> = [
  {
    vessel: 'cup',
    layers: [
      { type: 'espresso', amount: 0.3 },
      { type: 'milk', amount: 0.44 },
    ],
    foam: 0.14,
    art: 'heart',
  },
  {
    vessel: 'glass-mug',
    layers: [
      { type: 'water', amount: 0.54 },
      { type: 'espresso', amount: 0.24 },
    ],
    crema: true,
    blend: 0.9,
  },
  {
    vessel: 'tall-glass',
    layers: [
      { type: 'espresso', amount: 0.25 },
      { type: 'milk', amount: 0.51 },
    ],
    foam: 0.11,
    blend: 0.15,
  },
  {
    vessel: 'demitasse',
    layers: [{ type: 'espresso', amount: 0.72 }],
    crema: true,
  },
];

export default function OrganizationChart() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const organization = data.organization;
  const [modalLeaderIdx, setModalLeaderIdx] = useState<number | null>(null);
  const [photoModalData, setPhotoModalData] = useState<{
    image: string;
    name: string;
    role: string;
  } | null>(null);

  const activeLeader =
    modalLeaderIdx !== null ? organization.leadership[modalLeaderIdx] : null;

  const coffeeItems: CoffeeItem[] = useMemo(() => {
    const list: CoffeeItem[] = [];
    let personIndex = 0;

    organization.leadership.forEach((leader: any, idx: number) => {
      const roleTitle = leader.titleKey
        ? (t as any)[leader.titleKey]
        : leader.title;
      const hasPrograms = leader.programs && leader.programs.length > 0;
      const actionLabel =
        (t as any).viewProgramsInti ||
        (language === 'ar'
          ? 'عرض برنامج العمل'
          : language === 'en'
            ? 'View Work Program'
            : 'Lihat Program Kerja');

      if (leader.members && Array.isArray(leader.members) && leader.members.length > 0) {
        leader.members.forEach((m: any, mIdx: number) => {
          const displayName =
            language === 'ar' && m.nameAr ? m.nameAr : m.name;
          const imgSrc = m.image
            ? getImageUrl(m.image)
            : '/logo_utama.png';
          const preset = DRINK_PRESETS[personIndex % DRINK_PRESETS.length];
          personIndex++;

          list.push({
            id: `leader-${idx}-${mIdx}`,
            name: displayName,
            subtitle: roleTitle,
            description: `${displayName} — ${roleTitle}`,
            image: imgSrc,
            actionLabel,
            onImageClick: () =>
              setPhotoModalData({
                image: m.image || '/logo_utama.png',
                name: displayName,
                role: roleTitle,
              }),
            onActionClick: hasPrograms
              ? () => setModalLeaderIdx(idx)
              : undefined,
            ...preset,
          });
        });
      } else if (leader.name) {
        const displayName =
          language === 'ar' && leader.nameAr ? leader.nameAr : leader.name;
        const imgSrc = leader.image
          ? getImageUrl(leader.image)
          : '/logo_utama.png';
        const preset = DRINK_PRESETS[personIndex % DRINK_PRESETS.length];
        personIndex++;

        list.push({
          id: `leader-${idx}`,
          name: displayName,
          subtitle: roleTitle,
          description: `${displayName} — ${roleTitle}`,
          image: imgSrc,
          actionLabel,
          onImageClick: () =>
            setPhotoModalData({
              image: leader.image || '/logo_utama.png',
              name: displayName,
              role: roleTitle,
            }),
          onActionClick: hasPrograms
            ? () => setModalLeaderIdx(idx)
            : undefined,
          ...preset,
        });
      }
    });
    return list;
  }, [organization.leadership, language, t]);

  return (
    <section id="organization" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className="mono-font">
              {language === 'ar' ? toArabicNumerals('26—27') : '26—27'}
            </span>
            <div className={styles.line}></div>
          </div>
          <h2 className="display-font">{t.currentPeriod}</h2>
          <h3 className="mono-font">{t.theCurrentGeneration}</h3>
          <p
            style={{
              marginTop: '0.85rem',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              opacity: 0.78,
              maxWidth: '640px',
            }}
          >
            {t.orgSubtitle}
          </p>
        </div>

        <CoffeePourMenu
          items={coffeeItems}
          defaultValue={coffeeItems[0]?.id}
        />
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
              <button
                className={styles.closeBtn}
                onClick={() => setModalLeaderIdx(null)}
              >
                <X size={24} />
              </button>
              <h3 className={`${styles.modalTitle} display-font`}>
                {activeLeader.titleKey
                  ? (t as any)[activeLeader.titleKey]
                  : activeLeader.title}
              </h3>
              <div className={styles.programList}>
                {(() => {
                  const progs =
                    language === 'ar' && activeLeader.programsAr
                      ? activeLeader.programsAr
                      : language === 'en' && activeLeader.programsEn
                        ? activeLeader.programsEn
                        : activeLeader.programs;

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
                              <div key={itemIdx} className={styles.programItem}>
                                <span className={styles.programDot}>▪</span>
                                <span className={styles.programText}>
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
