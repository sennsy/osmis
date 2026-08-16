"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../components/LanguageProvider';
import styles from './page.module.css';

type Campaign = 'kemerdekaan' | 'semester' | 'mpls' | 'classmeet_peserta' | 'classmeet_panitia';

const PRESET_QUOTES = [
  // Indonesia Quotes
  "“Tidak semua yang dicintai harus berakhir dengan memiliki.”",
  "“Mungkin aku datang hanya untuk mengenalkanmu pada rasa, lalu pergi untuk belajar merelakan.”",
  "“Kita pernah sedekat itu, sebelum akhirnya menjadi dua orang asing.”",
  "“Aku memilih melepaskanmu, bukan karena berhenti mencintai.”",
  "“Ada rasa yang cukup disimpan, tanpa harus diperjuangkan.”",
  "“Barangkali kita memang ditakdirkan bertemu, bukan untuk bersama.”",
  "“Aku pernah menunggumu, sampai akhirnya sadar bahwa kamu tidak sedang menuju ke arahku.”",
  "“Mencintaimu adalah bahagiaku; merelakanmu adalah caraku mencintaimu untuk terakhir kali.”",
  "“Tidak semua cerita yang indah harus memiliki akhir berupa ‘kita’.”",
  "“Pergilah menemukan bahagiamu, sementara aku belajar berdamai dengan kehilanganmu.”",
  
  // Arabic Quotes (Arabic + Transliteration + Translation in single text blocks)
  "مَنْ أَحَبَّ شَيْئًا أَكْثَرَ مِنْ ذِكْرِهِ\nMan ahabba syai’an aktsara min dzikrihi\n“Barang siapa mencintai sesuatu, ia akan banyak menyebutnya.”",
  "الْحُبُّ أَعْمَى\nAl-hubbu a‘mā\n“Cinta itu buta.”",
  "مَنِ اسْتَرَاحَ إِلَى حُبِّهِ اسْتَرَاحَ قَلْبُهُ\nMan istarāha ilā hubbihi istarāha qalbuhu\n“Siapa yang menemukan ketenangan dalam cintanya, hatinya pun akan tenang.”",
  "الْقُلُوبُ جُنُودٌ مُجَنَّدَةٌ\nAl-qulūbu junūdun mujannadah\n“Hati-hati itu seperti pasukan yang telah dipertemukan.”",
  "مَنْ أَحَبَّكَ أَكْرَمَكَ\nMan ahabbaka akramaka\n“Siapa yang mencintaimu, akan memuliakanmu.”",
  "الْمَرْءُ مَعَ مَنْ أَحَبَّ\nAl-mar’u ma‘a man ahabb\n“Seseorang akan bersama dengan siapa yang ia cintai.”",
  "الحُبُّ لَا يُخْفَى\nAl-hubbu lā yukhfā\n“Cinta tidak dapat disembunyikan.”",
  "إِذَا أَحْبَبْتَ شَيْئًا فَاتْرُكْهُ\nIdzā ahbabta syai’an fatrukhu\n“Jika engkau mencintai sesuatu, lepaskanlah.”",
  "مَا أَجْمَلَ الْحُبَّ إِذَا كَانَ فِي اللَّهِ\nMā ajmala al-hubba idzā kāna fillāh\n“Betapa indah cinta jika ia karena Allah.”",
  "لَيْسَ الْحُبُّ بِالْكَلَامِ، وَلَكِنْ بِالْأَفْعَالِ\nLaisal-hubbu bil-kalām, walākin bil-af‘āl\n“Cinta bukan sekadar kata-kata, melainkan perbuatan.”"
];

// Helper to wrap text on canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = text.split('\n');
  let currentY = y;

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export default function SMISFramePage() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [campaign, setCampaign] = useState<Campaign>('kemerdekaan');
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Quotes selection state
  const [quoteSelection, setQuoteSelection] = useState<string>(PRESET_QUOTES[0]);
  const [customQuote, setCustomQuote] = useState<string>('');

  const activeQuoteText = quoteSelection === 'custom' ? customQuote : quoteSelection;
  
  // Load Logo on mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoImage(img);
    img.src = '/logo_utama.png';
  }, []);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Constants for 3:4 aspect ratio (Classic Portrait)
    const C_WIDTH = 1080;
    const C_HEIGHT = 1440;
    canvas.width = C_WIDTH;
    canvas.height = C_HEIGHT;

    // Clear
    ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);
    
    // Draw Background
    ctx.fillStyle = '#E5E5E5';
    ctx.fillRect(0, 0, C_WIDTH, C_HEIGHT);

    // --- 3:4 FRAME DESIGN WITH HEADER ---
    const bgColor = '#F4F4F0';
    const textColor = '#2B3B31';
    const borderWidth = 50;
    const topBorderHeight = 140; // Thicker top border for header (logo, title)
    const bottomHeight = 340; 
    
    const visibleWidth = C_WIDTH - borderWidth * 2;
    const visibleHeight = C_HEIGHT - bottomHeight - topBorderHeight;

    // Draw User Image centered in the visible frame area
    if (userImage) {
      const imgRatio = userImage.width / userImage.height;
      const canvasRatio = visibleWidth / visibleHeight;
      let drawWidth, drawHeight;

      if (imgRatio > canvasRatio) {
        drawHeight = visibleHeight * scale;
        drawWidth = userImage.width * (drawHeight / userImage.height);
      } else {
        drawWidth = visibleWidth * scale;
        drawHeight = userImage.height * (drawWidth / userImage.width);
      }

      // Draw photo pushed down by topBorderHeight
      const drawX = borderWidth + (visibleWidth - drawWidth) / 2 + offsetX;
      const drawY = topBorderHeight + (visibleHeight - drawHeight) / 2 + offsetY;

      ctx.drawImage(userImage, drawX, drawY, drawWidth, drawHeight);
    } else {
      ctx.fillStyle = '#A0A0A0';
      ctx.font = '40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.noVisualRecord || 'UPLOAD PHOTO', C_WIDTH/2, topBorderHeight + visibleHeight/2);
    }

    // Draw frame borders
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, C_WIDTH, topBorderHeight); // Top header area
    ctx.fillRect(0, 0, borderWidth, C_HEIGHT); // Left
    ctx.fillRect(C_WIDTH - borderWidth, 0, borderWidth, C_HEIGHT); // Right
    ctx.fillRect(0, C_HEIGHT - bottomHeight, C_WIDTH, bottomHeight); // Bottom

    // Inner subtle stroke
    ctx.strokeStyle = '#DCDCD8';
    ctx.lineWidth = 2;
    ctx.strokeRect(borderWidth, topBorderHeight, C_WIDTH - borderWidth*2, C_HEIGHT - bottomHeight - topBorderHeight);

    // --- HEADER ELEMENTS (TOP LEFT: LOGO + SMISFrame TEXT) ---
    const headerY = topBorderHeight / 2;

    // Logo Image on the Left
    if (logoImage) {
      const logoSize = 64;
      const logoX = borderWidth + 10;
      const logoY = headerY - logoSize / 2;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

      // Text beside logo (SMISFrame)
      ctx.fillStyle = textColor;
      ctx.font = 'bold 32px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText("SMISFrame", logoX + logoSize + 15, headerY + 10);
    }

    // --- DRAW INDONESIAN FLAG OR SEMESTER II BADGE (Top Right) ---
    if (campaign === 'kemerdekaan') {
      const flagWidth = 90;
      const flagHeight = 54;
      const flagX = C_WIDTH - borderWidth - flagWidth - 20;
      const flagY = headerY - flagHeight / 2;

      // Draw flagpole
      ctx.fillStyle = '#4A4A4A';
      ctx.fillRect(flagX - 6, flagY - 5, 4, flagHeight + 35); // pole
      ctx.beginPath();
      ctx.arc(flagX - 4, flagY - 7, 5, 0, Math.PI * 2); // knob
      ctx.fill();

      // Red banner
      ctx.fillStyle = '#E61C1C';
      ctx.fillRect(flagX, flagY, flagWidth, flagHeight / 2);
      // White banner
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(flagX, flagY + flagHeight / 2, flagWidth, flagHeight / 2);

      // Flag outline
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(flagX, flagY, flagWidth, flagHeight);
    } else if (campaign === 'semester') {
      const badgeSize = 80;
      const badgeX = C_WIDTH - borderWidth - badgeSize - 20;
      const badgeY = headerY - badgeSize / 2;

      // Draw circle badge
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2 - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Inner decorative ring
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2 - 10, 0, Math.PI * 2);
      ctx.stroke();

      // Text "S II"
      ctx.fillStyle = textColor;
      ctx.font = 'bold 30px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText("S II", badgeX + badgeSize/2, badgeY + badgeSize/2 + 10);
    } else if (campaign === 'mpls') {
      const badgeSize = 80;
      const badgeX = C_WIDTH - borderWidth - badgeSize - 20;
      const badgeY = headerY - badgeSize / 2;

      // Draw square stamp rotated 15 deg
      ctx.save();
      ctx.translate(badgeX + badgeSize/2, badgeY + badgeSize/2);
      ctx.rotate(15 * Math.PI / 180);
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-badgeSize/2 + 8, -badgeSize/2 + 8, badgeSize - 16, badgeSize - 16);
      
      ctx.fillStyle = textColor;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText("MPLS", 0, -2);
      ctx.font = 'bold 16px monospace';
      ctx.fillText("2027", 0, 18);
      ctx.restore();
    } else if (campaign === 'classmeet_peserta' || campaign === 'classmeet_panitia') {
      const badgeSize = 80;
      const badgeX = C_WIDTH - borderWidth - badgeSize - 20;
      const badgeY = headerY - badgeSize / 2;

      // Draw Trophy-like badge outline or circular star stamp
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2 - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Text "S I"
      ctx.fillStyle = textColor;
      ctx.font = 'bold 26px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText("S I", badgeX + badgeSize/2, badgeY + badgeSize/2 + 2);
      ctx.font = '12px monospace';
      ctx.fillText(campaign === 'classmeet_peserta' ? "PESERTA" : "PANITIA", badgeX + badgeSize/2, badgeY + badgeSize/2 + 20);
    }

    // --- TYPOGRAPHY (BOTTOM) ---
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;

    let mainTitle = "CAMPAIGN";
    if (campaign === 'kemerdekaan') mainTitle = "SEMARAK KEMERDEKAAN";
    else if (campaign === 'semester') mainTitle = "SEMESTER GENAP";
    else if (campaign === 'mpls') mainTitle = "MPLS 2027";
    else if (campaign === 'classmeet_peserta') mainTitle = "PESERTA CLASSMEETING";
    else if (campaign === 'classmeet_panitia') mainTitle = "PANITIA CLASSMEETING";
    
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(mainTitle, C_WIDTH / 2, C_HEIGHT - bottomHeight + 100);

    // Dynamic Quote (Centered with wrap text)
    ctx.font = 'italic 30px Georgia, serif';
    const quoteY = C_HEIGHT - bottomHeight + 170;
    
    let defaultQuote = "Sematkan harapan dan dukunganmu.";
    if (campaign === 'kemerdekaan') defaultQuote = "Menyambut 17 Agustus dengan semangat baru.";
    else if (campaign === 'semester') defaultQuote = "Siap menjalani semester genap dengan tekad kuat.";
    else if (campaign === 'mpls') defaultQuote = "Siap beradaptasi, berakhlak mulia, dan berprestasi di MPLS 2027.";
    else if (campaign === 'classmeet_peserta') defaultQuote = "Siap berpartisipasi dan berkompetisi secara sportif di Classmeeting Semester 1.";
    else if (campaign === 'classmeet_panitia') defaultQuote = "Sukseskan Classmeeting Semester 1 dengan kolaborasi dan kerja keras.";

    wrapText(ctx, activeQuoteText || defaultQuote, C_WIDTH / 2, quoteY, C_WIDTH - borderWidth * 4, 42);

    // Separator line
    ctx.beginPath();
    ctx.moveTo(C_WIDTH / 2 - 150, C_HEIGHT - 85);
    ctx.lineTo(C_WIDTH / 2 + 150, C_HEIGHT - 85);
    ctx.strokeStyle = '#DCDCD8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Watermark
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("WWW.OSMIS.COM", C_WIDTH / 2, C_HEIGHT - 40);

  }, [userImage, logoImage, scale, offsetX, offsetY, campaign, activeQuoteText, t.noVisualRecord]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `SMISFrame-${campaign}-2026.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> <span className="mono-font">{t.backToHome || 'KEMBALI'}</span>
          </Link>
          <h1 className="display-font" style={{ fontSize: '2.5rem' }}>{t.smisFrameTitle || 'SMISFrame'}</h1>
          <p className="mono-font" style={{ opacity: 0.7 }}>{t.smisFrameDesc || 'Kampanye visual OSMIS.'}</p>
        </div>

        {/* Canvas Area */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        {/* Controls Area */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className="mono-font">{t.chooseCampaign || 'PILIH KAMPANYE'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                className={`${styles.campaignBtn} mono-font ${campaign === 'kemerdekaan' ? styles.active : ''}`}
                onClick={() => setCampaign('kemerdekaan')}
              >
                1. Semarak Kemerdekaan (17 Agustus)
              </button>
              <button 
                className={`${styles.campaignBtn} mono-font ${campaign === 'semester' ? styles.active : ''}`}
                onClick={() => setCampaign('semester')}
              >
                2. Semangat Semester Genap
              </button>
              <button 
                className={`${styles.campaignBtn} mono-font ${campaign === 'mpls' ? styles.active : ''}`}
                onClick={() => setCampaign('mpls')}
              >
                3. MPLS 2027
              </button>
              <button 
                className={`${styles.campaignBtn} mono-font ${campaign === 'classmeet_peserta' ? styles.active : ''}`}
                onClick={() => setCampaign('classmeet_peserta')}
              >
                4. Classmeeting S1 (Peserta)
              </button>
              <button 
                className={`${styles.campaignBtn} mono-font ${campaign === 'classmeet_panitia' ? styles.active : ''}`}
                onClick={() => setCampaign('classmeet_panitia')}
              >
                5. Classmeeting S1 (Panitia)
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className="mono-font">KATA-KATA BINGKAI</label>
            <select 
              value={quoteSelection} 
              onChange={(e) => setQuoteSelection(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                padding: '1rem',
                color: 'var(--text-color)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {PRESET_QUOTES.map((q, idx) => (
                <option key={idx} value={q}>
                  {q.length > 50 ? q.slice(0, 50) + "..." : q}
                </option>
              ))}
              <option value="custom">-- Tulis Sendiri... --</option>
            </select>
          </div>

          {quoteSelection === 'custom' && (
            <div className={styles.controlGroup}>
              <label className="mono-font">TULIS KATA-KATA SENDIRI</label>
              <textarea 
                rows={3}
                placeholder="Tulis kutipan kreasimu di sini..."
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  padding: '1rem',
                  color: 'var(--text-color)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          <div className={styles.controlGroup}>
            <input 
              type="file" 
              accept="image/*" 
              id="photo-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="photo-upload" 
              className={`${styles.uploadBtn} mono-font`}
            >
              + {t.uploadPhoto || 'UNGGAH FOTO'}
            </label>
          </div>

          {userImage && (
            <>
              <div className={styles.controlGroup}>
                <label className="mono-font">{t.zoom || 'Perbesar'} ({Math.round(scale * 100)}%)</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.01" 
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                />
              </div>
              
              <div className={styles.controlGroup}>
                <label className="mono-font">{t.moveX || 'Geser Kanan/Kiri'}</label>
                <input 
                  type="range" 
                  min="-1000" 
                  max="1000" 
                  step="10" 
                  value={offsetX} 
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                />
              </div>

              <div className={styles.controlGroup}>
                <label className="mono-font">{t.moveY || 'Geser Atas/Bawah'}</label>
                <input 
                  type="range" 
                  min="-1000" 
                  max="1000" 
                  step="10" 
                  value={offsetY} 
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                />
              </div>

              <button 
                className={`${styles.downloadBtn} mono-font`}
                onClick={downloadImage}
              >
                {t.downloadFrame || 'UNDUH HASIL'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
