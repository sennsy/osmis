'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Brain, Users, Clock, Compass, History, Zap, ArrowRight, BookOpen, Lightbulb, Heart, ShieldCheck } from 'lucide-react';
import { MBTI_DATABASE, QUESTIONS, MBTIProfile, Question } from '../../data/mbtiData';
import styles from './page.module.css';

type TabType = 'home' | 'test' | 'types' | 'history' | 'compatibility';

interface TestHistory {
  date: string;
  type: string;
}

export default function MBTIPage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [result, setResult] = useState<MBTIProfile | null>(null);
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [selectedType, setSelectedType] = useState<MBTIProfile | null>(null);
  const [compatType1, setCompatType1] = useState<string>('INTJ');
  const [compatType2, setCompatType2] = useState<string>('ENFP');

  useEffect(() => {
    // Load history from local storage
    const savedHistory = localStorage.getItem('mbtiHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveHistory = (mbtiType: string) => {
    const newEntry = {
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      type: mbtiType
    };
    const newHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('mbtiHistory', JSON.stringify(newHistory));
  };

  const startTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setActiveTab('test');
  };

  const handleAnswer = (choice: 'A' | 'B') => {
    setAnswers((prev) => ({
      ...prev,
      [QUESTIONS[currentQuestionIndex].id]: choice
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateResult({ ...answers, [QUESTIONS[currentQuestionIndex].id]: choice });
    }
  };

  const calculateResult = (finalAnswers: Record<number, 'A' | 'B'>) => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    QUESTIONS.forEach((q) => {
      const answer = finalAnswers[q.id];
      if (!answer) return;

      // In this simple implementation:
      // A (Setuju) aligns with the primary direction of the question.
      // B (Tidak Setuju) aligns with the opposite.
      
      let trait = '';
      if (answer === 'A') {
        trait = q.direction;
      } else {
        // Find opposite trait
        if (q.type === 'EI') trait = q.direction === 'E' ? 'I' : 'E';
        if (q.type === 'SN') trait = q.direction === 'S' ? 'N' : 'S';
        if (q.type === 'TF') trait = q.direction === 'T' ? 'F' : 'T';
        if (q.type === 'JP') trait = q.direction === 'J' ? 'P' : 'J';
      }
      
      scores[trait as keyof typeof scores]++;
    });

    const mbtiType = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    const profile = MBTI_DATABASE[mbtiType];
    setResult(profile);
    saveHistory(mbtiType);
  };

  const showTypeDetails = (typeCode: string) => {
    setSelectedType(MBTI_DATABASE[typeCode]);
  };

  const calculateCompatibility = (type1: string, type2: string) => {
    if (type1 === type2) return { score: 90, desc: "Sangat mirip! Kalian saling memahami dengan sangat baik, namun mungkin menghadapi titik buta (blind spots) yang sama." };
    
    let sharedTraits = 0;
    for (let i = 0; i < 4; i++) {
      if (type1[i] === type2[i]) sharedTraits++;
    }

    if (sharedTraits === 3) return { score: 75, desc: "Sangat kompatibel! Banyak kesamaan yang membuat komunikasi lancar, dengan sedikit perbedaan yang saling melengkapi." };
    if (sharedTraits === 2) return { score: 50, desc: "Hubungan yang seimbang. Ada cukup kesamaan untuk terhubung, namun perbedaan yang ada membutuhkan kompromi dan pengertian." };
    if (sharedTraits === 1) return { score: 25, desc: "Banyak perbedaan. Menarik untuk saling belajar hal baru, namun rentan terhadap kesalahpahaman jika tidak ada komunikasi yang baik." };
    
    return { score: 10, desc: "Sangat berbeda! Bisa menjadi hubungan saling melengkapi yang luar biasa jika ada kedewasaan, atau penuh tantangan jika memaksakan kehendak." };
  };

  const compatResult = calculateCompatibility(compatType1, compatType2);

  return (
    <div className={styles.mbtiContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <h1 className={styles.title}>The SMIS MBTI</h1>
          <p className={styles.subtitle}>Temukan tipe kepribadian Anda dan pahami potensi diri dengan tes berbasis teori Myers-Briggs.</p>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'home' || activeTab === 'test' ? styles.active : ''}`}
            onClick={() => setActiveTab(result ? 'test' : 'home')}
          >
            <Brain size={18} className="inline mr-2" /> Tes Kepribadian
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'types' ? styles.active : ''}`}
            onClick={() => { setActiveTab('types'); setSelectedType(null); }}
          >
            <Users size={18} className="inline mr-2" /> 16 Tipe
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'compatibility' ? styles.active : ''}`}
            onClick={() => setActiveTab('compatibility')}
          >
            <Users size={18} className="inline mr-2" /> Kompatibilitas
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={18} className="inline mr-2" /> Riwayat
          </button>
        </div>

        <div className={styles.glassCard}>
          {activeTab === 'home' && (
            <div className="text-center py-8">
              <div className={styles.heroBadge}>
                <Zap size={14} className="mr-1" /> Tes Akurat & Cepat (~3 Menit)
              </div>
              
              <h2 className={styles.heroTitle}>
                Kenali Diri Anda Lebih Dalam Melalui <br/>
                <span className={styles.heroGradientText}>Tes MBTI</span>
              </h2>
              
              <p className={styles.heroDesc}>
                Pahami bagaimana Anda memproses informasi, mengambil keputusan, berinteraksi dengan orang lain, dan mengelola pola kerja Anda secara psikologis.
              </p>

              <div className={styles.heroActions}>
                <button onClick={startTest} className={styles.primaryBtn}>
                  Mulai Tes Sekarang <ArrowRight size={18} />
                </button>
                <button onClick={() => { setActiveTab('types'); setSelectedType(null); }} className={styles.secondaryBtn}>
                  <BookOpen size={18} /> Jelajahi 16 Tipe
                </button>
              </div>

              {/* 4 MBTI Group Highlights */}
              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6'}}>
                    <Lightbulb size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Analis (Analysts)</h3>
                  <p className="text-xs font-semibold mb-2" style={{color: '#8b5cf6'}}>INTJ, INTP, ENTJ, ENTP</p>
                  <p className="text-sm opacity-70">Rasional, rasionalitas tinggi, pemikir strategis, dan menyukai inovasi intelektual.</p>
                </div>

                <div className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
                    <Heart size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Diplomat (Diplomats)</h3>
                  <p className="text-xs font-semibold mb-2" style={{color: '#10b981'}}>INFJ, INFP, ENFJ, ENFP</p>
                  <p className="text-sm opacity-70">Empati tinggi, idealis, peduli dengan hubungan antarmanusia dan kedamaian sosial.</p>
                </div>

                <div className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Pengawal (Sentinels)</h3>
                  <p className="text-xs font-semibold mb-2" style={{color: '#3b82f6'}}>ISTJ, ISFJ, ESTJ, ESFJ</p>
                  <p className="text-sm opacity-70">Praktis, terstruktur, menghargai tradisi, ketertiban, dan tanggung jawab penuh.</p>
                </div>

                <div className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
                    <Compass size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Penjelajah (Explorers)</h3>
                  <p className="text-xs font-semibold mb-2" style={{color: '#f59e0b'}}>ISTP, ISFP, ESTP, ESFP</p>
                  <p className="text-sm opacity-70">Spontan, fleksibel, terampil secara praktis, dan menyukai aksi nyata di lapangan.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && !result && (
            <div>
              <div className={styles.quizHeader}>
                <span>Pertanyaan {currentQuestionIndex + 1} dari {QUESTIONS.length}</span>
                <span className="mono-font">{Math.round(((currentQuestionIndex) / QUESTIONS.length) * 100)}%</span>
              </div>
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${((currentQuestionIndex) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className={styles.questionText}>
                {QUESTIONS[currentQuestionIndex].text}
              </div>

              <div className={styles.optionsGrid}>
                <button className={styles.optionBtn} onClick={() => handleAnswer('A')}>
                  Sangat Setuju
                </button>
                <button className={styles.optionBtn} onClick={() => handleAnswer('B')}>
                  Tidak Setuju
                </button>
              </div>
            </div>
          )}

          {activeTab === 'test' && result && (
            <div>
              <div className={styles.resultHeader}>
                <h3>Tipe Kepribadian Anda adalah:</h3>
                <div className={styles.mbtiType}>{result.name}</div>
                <div className={styles.mbtiTitle}>{result.title} - {result.group}</div>
                <p className="mt-4">{result.desc}</p>
              </div>

              <div className={styles.resultGrid}>
                <div className={styles.detailCard}>
                  <h4>Kekuatan</h4>
                  <ul>
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className={styles.detailCard}>
                  <h4>Kelemahan</h4>
                  <ul>
                    {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                <div className={styles.detailCard}>
                  <h4>Karir Ideal</h4>
                  <ul>
                    {result.careers.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div className={styles.detailCard}>
                  <h4>Tokoh Terkenal</h4>
                  <ul>
                    {result.famous.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>

              <div className="text-center mt-8">
                <button className={styles.startBtn} onClick={startTest}>
                  <RotateCcw size={18} className="mr-2" /> Ulangi Tes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'types' && !selectedType && (
            <div>
              <h2 className="text-center mb-6 font-display text-2xl">16 Tipe Kepribadian</h2>
              <div className={styles.typesGrid}>
                {Object.values(MBTI_DATABASE).map((profile) => (
                  <div 
                    key={profile.name} 
                    className={styles.typeCard}
                    onClick={() => showTypeDetails(profile.name)}
                  >
                    <h3>{profile.name}</h3>
                    <p className="opacity-80">{profile.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'types' && selectedType && (
            <div>
              <button 
                className={styles.backBtn}
                onClick={() => setSelectedType(null)}
              >
                <ArrowLeft size={16} /> Kembali ke Daftar
              </button>
              
              <div className={styles.resultHeader}>
                <div className={styles.mbtiType}>{selectedType.name}</div>
                <div className={styles.mbtiTitle}>{selectedType.title} - {selectedType.group}</div>
                <p className="mt-4">{selectedType.desc}</p>
              </div>

              <div className={styles.resultGrid}>
                <div className={styles.detailCard}>
                  <h4>Kekuatan</h4>
                  <ul>
                    {selectedType.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className={styles.detailCard}>
                  <h4>Kelemahan</h4>
                  <ul>
                    {selectedType.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className={styles.compatContainer}>
              <div className={styles.compatIcon}>
                <Heart size={32} />
              </div>
              <h2 className={styles.compatTitle}>Kalkulator Kompatibilitas</h2>
              <p className={styles.compatDesc}>
                Pilih dua tipe kepribadian untuk menganalisis tingkat kecocokan, potensi sinergi, dan tantangan hubungan mereka berdasarkan teori kognitif.
              </p>
              
              <div className={styles.compatSelectors}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Pribadi Pertama</label>
                  <select 
                    className={styles.styledSelect}
                    value={compatType1}
                    onChange={(e) => setCompatType1(e.target.value)}
                  >
                    {Object.keys(MBTI_DATABASE).map(type => (
                      <option key={type} value={type} className="text-black">{type} - {MBTI_DATABASE[type].title}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.plusIcon}>+</div>

                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Pribadi Kedua</label>
                  <select 
                    className={styles.styledSelect}
                    value={compatType2}
                    onChange={(e) => setCompatType2(e.target.value)}
                  >
                    {Object.keys(MBTI_DATABASE).map(type => (
                      <option key={type} value={type} className="text-black">{type} - {MBTI_DATABASE[type].title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.compatResultCard}>
                <div className={styles.resultHeader}>
                  <div>
                    <span className={styles.scoreLabel}>Skor Kecocokan</span>
                    <div className={styles.scoreValue}>
                      {compatResult.score}% - {compatResult.score >= 75 ? 'Sangat Tinggi' : compatResult.score >= 50 ? 'Sedang' : 'Rendah'}
                    </div>
                  </div>
                  <div className={styles.scoreEmoji}>
                    {compatResult.score >= 75 ? '💖' : compatResult.score >= 50 ? '💕' : '✨'}
                  </div>
                </div>
                <div className={styles.resultDescBox}>
                  <p className={styles.resultDesc}>{compatResult.desc}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-center mb-6 font-display text-2xl">Riwayat Tes Anda</h2>
              {history.length === 0 ? (
                <p className="text-center opacity-70">Belum ada riwayat tes yang tersimpan.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((entry, idx) => (
                    <div key={idx} className={styles.historyItem}>
                      <span className={styles.historyDate}>{entry.date}</span>
                      <span className={styles.historyType}>{entry.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
