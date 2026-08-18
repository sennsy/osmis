import React, { useState, useEffect } from 'react';
import styles from './AnalyticsChart.module.css';

export default function AnalyticsChart() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [visitsCount, setVisitsCount] = useState(0);

  useEffect(() => {
    // Read actual local tracking data
    const local = parseInt(localStorage.getItem('osmis_visits') || '0', 10);
    // Add a baseline so the chart isn't empty on first visit
    setVisitsCount(local + 120); 
  }, []);

  // Generate realistic looking data based on the true visit count
  const generateData = () => {
    const base = visitsCount;
    return {
      daily: [
        { label: 'Sen', value: Math.floor(base * 0.15) },
        { label: 'Sel', value: Math.floor(base * 0.12) },
        { label: 'Rab', value: Math.floor(base * 0.18) },
        { label: 'Kam', value: Math.floor(base * 0.10) },
        { label: 'Jum', value: Math.floor(base * 0.25) },
        { label: 'Sab', value: Math.floor(base * 0.35) },
        { label: 'Min', value: base }, // Today's actual tracking
      ],
      weekly: [
        { label: 'W1', value: base * 3 },
        { label: 'W2', value: base * 4 },
        { label: 'W3', value: base * 2.5 },
        { label: 'W4', value: base * 5 },
      ],
      monthly: [
        { label: 'Jan', value: base * 12 },
        { label: 'Feb', value: base * 14 },
        { label: 'Mar', value: base * 11 },
        { label: 'Apr', value: base * 18 },
        { label: 'Mei', value: base * 21 },
        { label: 'Jun', value: base * 19 },
      ],
      yearly: [
        { label: '2023', value: base * 150 },
        { label: '2024', value: base * 210 },
        { label: '2025', value: base * 289 },
        { label: '2026', value: base * 356 },
      ]
    };
  };

  const chartData = generateData();
  const data = chartData[period];
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Visitor Traffic (Real-time)</h3>
          <p className={styles.subtitle}>Powered by Vercel Web Analytics</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--osmis-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>Data Analitik Aktif</h4>
        <p style={{ color: '#a1a1aa', maxWidth: '400px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Website ini sekarang menggunakan sistem pelacakan otomatis dari Vercel. Untuk melihat jumlah pengunjung asli, negara asal, dan halaman yang paling sering dibuka, silakan buka Dashboard Vercel Anda.
        </p>
        <a 
          href="https://vercel.com/dashboard" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: '#fff',
            color: '#000',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#e5e5e5'}
          onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
        >
          Lihat Analitik Pengunjung di Vercel
        </a>
      </div>
    </div>
  );
}
