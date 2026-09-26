const fs = require('fs');

// Patch page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace('<h3 className={`display-font ${styles.featureName}`}>OSMIS Rewind</h3>', '<h3 className={`display-font ${styles.featureName}`}>{t.recapTitle}</h3>');
page = page.replace('<p className={styles.featureDesc}>Jelajahi kembali keseruan dan memori tak terlupakan dari kegiatan santri.</p>', '<p className={styles.featureDesc}>{t.recapDesc}</p>');
page = page.replace('[ Mulai Nonton ]', '[ {t.watchRecap} ]');
fs.writeFileSync('src/app/page.tsx', page);

// Patch recap/page.tsx
let recap = fs.readFileSync('src/app/recap/page.tsx', 'utf8');
if (!recap.includes('useLanguage')) {
  recap = recap.replace("import styles from './Recap.module.css';", "import styles from './Recap.module.css';\nimport { useLanguage } from '../../components/LanguageProvider';");
}
recap = recap.replace('export default function RecapPage() {\n  const [playingVideo', 'export default function RecapPage() {\n  const { t } = useLanguage();\n  const [playingVideo');
recap = recap.replace('<h1 className={styles.title}>OSMIS Rewind</h1>', '<h1 className={styles.title}>{t.recapTitle}</h1>');
recap = recap.replace('<p className={styles.subtitle}>\n          Putar kembali memori indah dan momen-momen paling berkesan dari setiap kegiatan santri di ma\'had.\n        </p>', '<p className={styles.subtitle}>\n          {t.recapDesc}\n        </p>');
recap = recap.replace('<Link href="/" className={styles.backBtn}>\n        <ArrowLeft size={20} />\n        Kembali\n      </Link>', '<Link href="/" className={styles.backBtn}>\n        <ArrowLeft size={20} />\n        {t.backToHome}\n      </Link>');
recap = recap.replace("const categories = ['Semua', 'Agustusan', 'Event', 'Keseharian'];", "const categories = ['Semua', 'Agustusan 26 (1)', 'Agustusan 26 (2)'];");
recap = recap.replace('category: "Agustusan"\n  },\n  {\n    id: 2,\n    title: "Agustusan 26 (2)",\n    url: "https://res.cloudinary.com/ioptiq1r/video/upload/v1790170704/AGUSTUSAN_2026_2.mp4",\n    category: "Agustusan"', 'category: "Agustusan 26 (1)"\n  },\n  {\n    id: 2,\n    title: "Agustusan 26 (2)",\n    url: "https://res.cloudinary.com/ioptiq1r/video/upload/v1790170704/AGUSTUSAN_2026_2.mp4",\n    category: "Agustusan 26 (2)"');
fs.writeFileSync('src/app/recap/page.tsx', recap);
