"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useLanguage } from '../../components/LanguageProvider';

type Question = {
  id: number;
  wordId: string; // Indonesian word
  options: {
    ar: string;
    en: string;
  }[];
  correctIndex: number;
  questionType: 'ar_to_id' | 'en_to_id' | 'id_to_ar' | 'id_to_en';
};

const VOCAB = [
  { id: 'Buku', ar: 'كِتَابٌ (Kitaabun)', en: 'Book' },
  { id: 'Sekolah', ar: 'مَدْرَسَةٌ (Madrasatun)', en: 'School' },
  { id: 'Pena', ar: 'قَلَمٌ (Qalamun)', en: 'Pen' },
  { id: 'Meja', ar: 'مَكْتَبٌ (Maktabun)', en: 'Table / Desk' },
  { id: 'Kursi', ar: 'كُرْسِيٌّ (Kursiyyun)', en: 'Chair' },
  { id: 'Guru', ar: 'مُدَرِّسٌ (Mudarrisun)', en: 'Teacher' },
  { id: 'Murid', ar: 'طَالِبٌ (Thaalibun)', en: 'Student' },
  { id: 'Pintu', ar: 'بَابٌ (Baabun)', en: 'Door' }
];

export default function LearnPage() {
  const { t } = useLanguage();
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate Questions dynamically
  const questions = React.useMemo(() => {
    return VOCAB.map((v, i) => {
      // Pick 3 random wrong options
      const wrongOptions = VOCAB.filter(x => x.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [v, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.findIndex(x => x.id === v.id);
      
      const type = Math.random() > 0.5 ? 'id_to_ar' : 'id_to_en';
      
      return {
        id: i,
        wordId: v.id,
        wordEn: v.en,
        wordAr: v.ar,
        options: allOptions,
        correctIndex,
        type
      };
    });
  }, []);

  const currentQ = questions[currentQIndex];

  const handleSelect = (idx: number) => {
    if (isChecked) return;
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, color: 'inherit', textDecoration: 'none' }}>
          <ArrowLeft size={20} /> <span className="mono-font">{t.backToHome}</span>
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isFinished ? (
          <>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '12px', background: 'var(--border-color)', borderRadius: '10px', marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{ width: `${(currentQIndex / questions.length) * 100}%`, height: '100%', background: '#58cc02', transition: 'width 0.3s' }}></div>
            </div>

            <h1 className="display-font" style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
              {currentQ.type === 'id_to_ar' ? `Apa bahasa Arab dari "${currentQ.wordId}"?` : `Apa bahasa Inggris dari "${currentQ.wordId}"?`}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const isWrong = isSelected && !isCorrect;

                let borderStyle = '2px solid var(--border-color)';
                let bgStyle = 'transparent';
                let colorStyle = 'var(--text-color)';

                if (isChecked) {
                  if (isCorrect) {
                    borderStyle = '2px solid #58cc02';
                    bgStyle = 'rgba(88, 204, 2, 0.1)';
                    colorStyle = '#58cc02';
                  } else if (isWrong) {
                    borderStyle = '2px solid #ff4b4b';
                    bgStyle = 'rgba(255, 75, 75, 0.1)';
                    colorStyle = '#ff4b4b';
                  }
                } else if (isSelected) {
                  borderStyle = '2px solid #1cb0f6';
                  bgStyle = 'rgba(28, 176, 246, 0.1)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: borderStyle,
                      background: bgStyle,
                      color: colorStyle,
                      fontSize: '1.2rem',
                      cursor: isChecked ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      fontFamily: currentQ.type === 'id_to_ar' ? 'var(--font-display)' : 'inherit',
                      direction: currentQ.type === 'id_to_ar' ? 'rtl' : 'ltr'
                    }}
                  >
                    {currentQ.type === 'id_to_ar' ? opt.ar : opt.en}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {isChecked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedOption === currentQ.correctIndex ? '#58cc02' : '#ff4b4b', fontWeight: 'bold' }}>
                    {selectedOption === currentQ.correctIndex ? (
                      <><CheckCircle2 size={24} /> Benar!</>
                    ) : (
                      <><XCircle size={24} /> Salah. Yang benar: {currentQ.type === 'id_to_ar' ? currentQ.wordAr : currentQ.wordEn}</>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={isChecked ? handleNext : handleCheck}
                disabled={selectedOption === null}
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedOption === null ? 'var(--border-color)' : (isChecked ? (selectedOption === currentQ.correctIndex ? '#58cc02' : '#ff4b4b') : '#1cb0f6'),
                  color: selectedOption === null ? 'var(--bg-color)' : '#fff',
                  cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                  opacity: selectedOption === null ? 0.5 : 1
                }}
              >
                {isChecked ? 'Lanjutkan' : 'Periksa'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Trophy size={80} color="#ffc800" style={{ marginBottom: '1.5rem' }} />
            <h1 className="display-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pelajaran Selesai!</h1>
            <p className="mono-font" style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
              Skor Anda: {score} dari {questions.length}
            </p>
            <button
              onClick={handleRestart}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                background: '#1cb0f6',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Ulangi Latihan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
