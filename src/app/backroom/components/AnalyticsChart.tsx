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
          <h3 className={styles.title}>Visitor Traffic</h3>
          <p className={styles.subtitle}>Mock analytics data overview</p>
        </div>
        <div className={styles.tabs}>
          <button className={`${styles.tabBtn} ${period === 'daily' ? styles.active : ''}`} onClick={() => setPeriod('daily')}>Daily</button>
          <button className={`${styles.tabBtn} ${period === 'weekly' ? styles.active : ''}`} onClick={() => setPeriod('weekly')}>Weekly</button>
          <button className={`${styles.tabBtn} ${period === 'monthly' ? styles.active : ''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
          <button className={`${styles.tabBtn} ${period === 'yearly' ? styles.active : ''}`} onClick={() => setPeriod('yearly')}>Yearly</button>
        </div>
      </div>

      <div className={styles.chartArea}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} className={styles.barGroup}>
              <div className={styles.barWrapper}>
                <div 
                  className={styles.bar} 
                  style={{ height: `${heightPercent}%` }}
                  title={`${item.value} visitors`}
                >
                  <span className={styles.tooltip}>{item.value}</span>
                </div>
              </div>
              <span className={styles.label}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
