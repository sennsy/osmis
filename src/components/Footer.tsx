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
  const [isWebLinksOpen, setIsWebLinksOpen] = React.useState(false);

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
                  <a href="https://wa.me/6281586917099" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </a>
                </li>
                <li>
                  <Link href="/tiktok" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', color: 'inherit' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="TikTok Profile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                    </svg>
                  </Link>
                </li>
                <li>
                  <button onClick={() => setIsWebLinksOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'} title="Tautan Web">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </button>
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

      {isWebLinksOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }} onClick={() => setIsWebLinksOpen(false)}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '100%',
            textAlign: 'center', color: 'var(--text-color)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }} className="mono-font">Tautan Web Terkait</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <a 
                href="https://harmatra.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)', color: 'inherit', textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <span style={{ fontWeight: 'bold' }}>Web Angkatan</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>

              <a 
                href="https://isb.ponpes.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)', color: 'inherit', textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <span style={{ fontWeight: 'bold' }}>Web Pondok</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>

            <button 
              onClick={() => setIsWebLinksOpen(false)}
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
