"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { useOsmisData } from '../lib/storage';
import Lightbox from './Lightbox';
import { toArabicNumerals } from '../utils/arabicNumerals';
import { getImageUrl } from '../utils/driveImages';
import GlassFolder, {
  type ArtPreset,
  type FolderFile,
} from './ui/glass-folder-cards';
import { ArrowUpRight, FolderOpen } from 'lucide-react';
import styles from './Gallery.module.css';

const ART_CYCLE: ArtPreset[] = ['verdant', 'aurora', 'dusk', 'ember', 'glacier'];

export default function Gallery() {
  const { t, language } = useLanguage();
  const { data } = useOsmisData();
  const router = useRouter();

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [folderWidth, setFolderWidth] = useState(320);

  // Lightbox state: holds the active list of Drive IDs and the selected index
  const [lightboxState, setLightboxState] = useState<{
    ids: string[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkTheme(theme === 'dark');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const handleResize = () => {
      if (window.innerWidth < 420) {
        setFolderWidth(Math.min(300, window.innerWidth - 40));
      } else if (window.innerWidth < 768) {
        setFolderWidth(310);
      } else {
        setFolderWidth(330);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const foldersData = useMemo(() => {
    return (data.gallery || []).map((cat, idx) => {
      const catKey = `cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`;
      let displayName = (t as any)[catKey] || cat.name;
      if (language === 'en' && (cat as any).customNameEn) {
        displayName = (cat as any).customNameEn;
      }
      if (language === 'ar' && (cat as any).customNameAr) {
        displayName = (cat as any).customNameAr;
      }

      const validIds = (cat.ids || []).filter(Boolean);
      // Pick up to 4 representative Drive images for the folder's fanned sheets
      const sampleIds = validIds.slice(0, 4);

      const files: FolderFile[] = sampleIds.map((driveId, fIdx) => {
        const numStr = (fIdx + 1).toString().padStart(2, '0');
        return {
          name: `${displayName} #${language === 'ar' ? toArabicNumerals(numStr) : numStr}`,
          meta: 'DRIVE · FOTO',
          image: getImageUrl(driveId),
        };
      });

      const countStr =
        language === 'ar'
          ? `${toArabicNumerals(validIds.length.toString())} صورة`
          : language === 'en'
            ? `${validIds.length} Photos`
            : `${validIds.length} Foto Dokumentasi`;

      const coverImage = validIds[0] ? getImageUrl(validIds[0]) : undefined;

      return {
        id: cat.id,
        displayName,
        countStr,
        coverImage,
        art: ART_CYCLE[idx % ART_CYCLE.length],
        seed: idx * 7 + 3,
        files,
        allIds: validIds,
      };
    });
  }, [data.gallery, language, t]);

  const hintText =
    language === 'ar'
      ? 'مرر المؤشر للإمالة · انقر لفتح المجلد · انقر على الصورة لعرضها بملء الشاشة'
      : language === 'en'
        ? 'Hover to lean · Click folder to open · Click any photo for fullscreen'
        : 'Arahkan kursor untuk mengintip · Klik folder untuk membuka · Klik foto untuk layar penuh';

  return (
    <section id="gallery" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className="display-font">{t.archiveTitle}</h2>
          <p
            className="mono-font"
            style={{
              marginTop: '0.75rem',
              color: 'var(--osmis-yellow)',
              letterSpacing: '0.12em',
            }}
          >
            {t.allCategories}
          </p>
          <p className={styles.helperHint}>{hintText}</p>
        </div>

        {/* Glass Folder Cards Grid populated with Google Drive photos */}
        <div className={styles.foldersGrid}>
          {foldersData.map((folder, idx) => (
            <div key={folder.id} className={styles.folderCell}>
              <GlassFolder
                label={folder.displayName}
                meta={folder.countStr}
                tone={isDarkTheme ? 'dark' : idx % 2 === 1 ? 'dark' : 'light'}
                art={folder.art}
                seed={folder.seed}
                image={folder.coverImage}
                files={folder.files}
                action="more"
                labelPlacement="bottom-left"
                defaultOpen={idx === 0}
                width={folderWidth}
                appear={true}
                appearDelay={idx * 110}
                onFileSelect={(_file, fileIndex) => {
                  if (folder.allIds.length > 0) {
                    setLightboxState({
                      ids: folder.allIds,
                      index: Math.min(fileIndex, folder.allIds.length - 1),
                    });
                  }
                }}
                menu={[
                  {
                    label:
                      language === 'en'
                        ? 'View Category Fullscreen'
                        : 'Lihat Fullscreen Kategori Ini',
                    onSelect: () => {
                      if (folder.allIds.length > 0) {
                        setLightboxState({
                          ids: folder.allIds,
                          index: 0,
                        });
                      }
                    },
                  },
                  {
                    label:
                      language === 'en'
                        ? 'Explore Full Gallery'
                        : 'Lihat Galeri Selengkapnya',
                    onSelect: () => {
                      router.push('/gallery');
                    },
                  },
                ]}
              />
            </div>
          ))}
        </div>

        {/* Preserved "Lihat Galeri Selengkapnya / Jelajahi Semua Galeri" Button */}
        <div className={styles.loadMoreContainer}>
          <Link href="/gallery" className={styles.loadMoreBtn}>
            <FolderOpen size={17} />
            <span className="mono-font">[ {t.exploreGallery} ]</span>
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>

      <Lightbox
        ids={lightboxState?.ids ?? []}
        currentIndex={lightboxState?.index ?? 0}
        isOpen={lightboxState !== null}
        onClose={() => setLightboxState(null)}
        onNavigate={(nextIdx) =>
          setLightboxState((prev) =>
            prev ? { ...prev, index: nextIdx } : null
          )
        }
      />
    </section>
  );
}
