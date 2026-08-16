"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useOsmisData } from '../lib/storage';
import styles from './Footer.module.css';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data } = useOsmisData();

  // Quotes data
  const quotes = [
    { text: "“Tidak semua yang dicintai harus berakhir dengan memiliki.”", isArabic: false },
    { text: "“Mungkin aku datang hanya untuk mengenalkanmu pada rasa, lalu pergi untuk belajar merelakan.”", isArabic: false },
    { text: "“Kita pernah sedekat itu, sebelum akhirnya menjadi dua orang asing.”", isArabic: false },
    { text: "“Aku memilih melepaskanmu, bukan karena berhenti mencintai.”", isArabic: false },
    { text: "“Ada rasa yang cukup disimpan, tanpa harus diperjuangkan.”", isArabic: false },
    { text: "“Barangkali kita memang ditakdirkan bertemu, bukan untuk bersama.”", isArabic: false },
    { text: "“Aku pernah menunggumu, sampai akhirnya sadar bahwa kamu tidak sedang menuju ke arahku.”", isArabic: false },
    { text: "“Mencintaimu adalah bahagiaku; merelakanmu adalah caraku mencintaimu untuk terakhir kali.”", isArabic: false },
    { text: "“Tidak semua cerita yang indah harus memiliki akhir berupa ‘kita’.”", isArabic: false },
    { text: "“Pergilah menemukan bahagiamu, sementara aku belajar berdamai dengan kehilanganmu.”", isArabic: false },
    { text: "مَنْ أَحَبَّ شَيْئًا أَكْثَرَ مِنْ ذِكْرِهِ\nMan ahabba syai’an aktsara min dzikrihi\n“Barang siapa mencintai sesuatu, ia akan banyak menyebutnya.”", isArabic: true },
    { text: "الْحُبُّ أَعْمَى\nAl-hubbu a‘mā\n“Cinta itu buta.”", isArabic: true },
    { text: "مَنِ اسْتَرَاحَ إِلَى حُبِّهِ اسْتَرَاحَ قَلْبُهُ\nMan istarāha ilā hubbihi istarāha qalbuhu\n“Siapa yang menemukan ketenangan dalam cintanya, hatinya pun akan tenang.”", isArabic: true },
    { text: "الْقُلُوبُ جُنُودٌ مُجَنَّدَةٌ\nAl-qulūbu junūdun mujannadah\n“Hati-hati itu seperti pasukan yang telah dipertemukan.”", isArabic: true },
    { text: "مَنْ أَحَبَّكَ أَكْرَمَكَ\nMan ahabbaka akramaka\n“Siapa yang mencintaimu, akan memuliakanmu.”", isArabic: true },
    { text: "الْمَرْءُ مَعَ مَنْ أَحَبَّ\nAl-mar’u ma‘a man ahabb\n“Seseorang akan bersama dengan siapa yang ia cintai.”", isArabic: true },
    { text: "الحُبُّ لَا يُخْفَى\nAl-hubbu lā yukhfā\n“Cinta tidak dapat disembunyikan.”", isArabic: true },
    { text: "إِذَا أَحْبَبْتَ شَيْئًا فَاتْرُكْهُ\nIdzā ahbabta syai’an fatrukhu\n“Jika engkau mencintai sesuatu, lepaskanlah.”", isArabic: true },
    { text: "مَا أَجْمَلَ الْحُبَّ إِذَا كَانَ فِي اللَّهِ\nMā ajmala al-hubba idzā kāna fillāh\n“Betapa indah cinta jika ia karena Allah.”", isArabic: true },
    { text: "لَيْسَ الْحُبُّ بِالْكَلَامِ، وَلَكِنْ بِالْأَفْعَالِ\nLaisal-hubbu bil-kalām, walākin bil-af‘āl\n“Cinta bukan sekadar kata-kata, melainkan perbuatan.”", isArabic: true }
  ];

  const [quoteIndex, setQuoteIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<'typing' | 'idle' | 'lineOut' | 'textOut'>('typing');
  const [textOpacity, setTextOpacity] = React.useState(1);
  const [isLineVisible, setIsLineVisible] = React.useState(false);
  const [lineActive, setLineActive] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const currentQuote = quotes[quoteIndex];

  React.useEffect(() => {
    if (phase === 'typing') {
      setTextOpacity(1);
      setLineActive(false);
      setIsLineVisible(false);
      if (charIndex < currentQuote.text.length) {
        const timeout = setTimeout(() => {
          setCharIndex(prev => prev + 1);
        }, 40); // Kecepatan mengetik
        return () => clearTimeout(timeout);
      } else {
        setPhase('idle');
      }
    }
  }, [charIndex, phase, currentQuote]);

  React.useEffect(() => {
    if (phase === 'idle') {
      setIsLineVisible(true);
      // Animasi garis melebar
      const lineAnimTimeout = setTimeout(() => {
        setLineActive(true);
      }, 50);
      
      // Diam selama 3 detik
      const idleTimeout = setTimeout(() => {
        setPhase('lineOut');
      }, 3000);
      
      return () => {
        clearTimeout(lineAnimTimeout);
        clearTimeout(idleTimeout);
      };
    }
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'lineOut') {
      setLineActive(false); // Animasi garis menyusut
      const lineOutTimeout = setTimeout(() => {
        setPhase('textOut');
      }, 500); // Tunggu sampai garis benar-benar hilang (0.5s)
      return () => clearTimeout(lineOutTimeout);
    }
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'textOut') {
      setTextOpacity(0); // Teks memudar
      const textOutTimeout = setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % quotes.length);
        setCharIndex(0);
        setPhase('typing');
      }, 500); // Tunggu sampai teks memudar sempurna (0.5s)
      return () => clearTimeout(textOutTimeout);
    }
  }, [phase]);

  if (pathname === '/gallery' || pathname?.startsWith('/backroom')) {
    return null;
  }

  return (
    <>
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img src="/logo_utama.png" alt="OSMIS Logo" width={48} height={48} />
              <h2 className="display-font" style={{ margin: 0 }}>{t.osmisName}</h2>
            </div>
            <p className="mono-font">{t.orgNameLong}</p>
            <p className={`${styles.est} mono-font`}>{t.est} {language === 'ar' ? '٢٠١٨' : '2018'}</p>
          </div>

          {/* EFEK KETIK KATA-KATA */}
          <div className={styles.quoteBox}>
            <div className={styles.quoteWrapper}>
              <p 
                className={`${styles.quoteText} mono-font`}
                style={{ 
                  opacity: textOpacity,
                  textAlign: 'center',
                  unicodeBidi: 'plaintext'
                }}
              >
                {currentQuote.text.slice(0, charIndex)}
              </p>
              <div 
                className={`${styles.underline} ${lineActive ? styles.lineActive : ''}`}
                style={{ visibility: isLineVisible ? 'visible' : 'hidden' }}
              />
            </div>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <ul style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1rem', listStyle: 'none', padding: 0 }}>
                <li>
                  <button onClick={() => setIsDetailOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="Detail Website">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </button>
                </li>
                <li>
                  <a href={`https://instagram.com/${data.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="mailto:imamsyafiiosmis@gmail.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="Email">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className="mono-font">© {language === 'ar' ? '٢٠٢٦' : '2026'} {t.osmisName} - {t.orgNameLong}</p>
          <p className="mono-font" style={{ opacity: 0.5, marginTop: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {t.craftedBy}{' '}
            <a href="https://instagram.com/izmedtzz" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>
              IMMSZKYY
            </a>{' '}
            ({t.sekben} {language === 'ar' ? '٢٦-٢٧' : '26-27'})
          </p>
        </div>
      </div>
    </footer>

      {isDetailOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }} onClick={() => setIsDetailOpen(false)}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%',
            textAlign: 'center', color: 'var(--text-color)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }} className="mono-font">Detail Website</h3>
            <p style={{ marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Website ini dikembangkan sebagai wadah informasi dan dokumentasi resmi angkatan.
            </p>
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>DEVELOPED BY</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.1em' }}>IMMSZKYY</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>Sekretaris OSMIS 26-27</p>
            </div>
            <button 
              onClick={() => setIsDetailOpen(false)}
              style={{
                padding: '0.75rem 2rem', background: 'var(--text-color)', color: 'var(--bg-color)',
                border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 'bold',
                fontFamily: 'inherit', letterSpacing: '0.05em', transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
