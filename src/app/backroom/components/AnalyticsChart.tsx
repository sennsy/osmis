"use client";

import React, { useState, useEffect } from 'react';
import { Users, Eye, Activity, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './AnalyticsChart.module.css';

interface DailyStat {
  date: string;
  label: string;
  requests: number;
  pageViews: number;
  uniques: number;
  bytes: number;
  cachedBytes: number;
}

interface AnalyticsData {
  success: boolean;
  hasData: boolean;
  totals: {
    requests: number;
    pageViews: number;
    uniques: number;
    bandwidthBytes: number;
    cachedBytes: number;
    cacheRate: string;
  };
  daily: DailyStat[];
}

export default function AnalyticsChart() {
  const [metric, setMetric] = useState<'uniques' | 'pageViews' | 'requests'>('uniques');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal memuat analitik');
      }
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat analitik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const dailyList = data?.daily || [];
  const currentValues = dailyList.map(d => d[metric]);
  const maxValue = Math.max(...currentValues, 1);

  return (
    <div className={styles.chartContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Statistik Pengunjung (Live Cloudflare)</span>
            {loading && <RefreshCw size={14} className="animate-spin" style={{ opacity: 0.7 }} />}
          </h3>
          <p className={styles.subtitle}>
            Data lalu lintas web real-time yang tersaring melalui jaringan Cloudflare.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${metric === 'uniques' ? styles.active : ''}`}
              onClick={() => setMetric('uniques')}
            >
              Pengunjung
            </button>
            <button 
              className={`${styles.tabBtn} ${metric === 'pageViews' ? styles.active : ''}`}
              onClick={() => setMetric('pageViews')}
            >
              Tampilan
            </button>
            <button 
              className={`${styles.tabBtn} ${metric === 'requests' ? styles.active : ''}`}
              onClick={() => setMetric('requests')}
            >
              Requests
            </button>
          </div>
          <button 
            onClick={fetchAnalytics}
            title="Muat Ulang Data"
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fafafa',
              borderRadius: '6px',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Users size={14} color="var(--osmis-green, #4ade80)" /> Pengunjung Unik
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.uniques?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Eye size={14} color="#38bdf8" /> Tampilan Halaman
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.pageViews?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Activity size={14} color="#facc15" /> Total Requests
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.requests?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={14} color="#a855f7" /> Hemat Bandwidth
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.cacheRate || '0%'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '0.2rem' }}>
            {formatBytes(data?.totals.cachedBytes || 0)} di-cache
          </div>
        </div>
      </div>

      {/* Chart or Status */}
      {error ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px', 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px dashed rgba(239, 68, 68, 0.2)', 
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <AlertCircle size={24} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>{error}</p>
          <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Pastikan variabel CLOUDFLARE_API_TOKEN sudah dipasang di Vercel.
          </p>
        </div>
      ) : !data?.hasData ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <ShieldCheck size={32} color="var(--osmis-green, #4ade80)" style={{ marginBottom: '0.75rem' }} />
          <h4 style={{ color: '#fafafa', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Domain Sukses Terhubung ke Cloudflare!
          </h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.8rem', maxWidth: '440px', lineHeight: 1.5 }}>
            Data grafik harian sedang menunggu lalu lintas pengunjung masuk melalui DNS baru. Grafik akan otomatis terisi dan terupdate secara berkala.
          </p>
        </div>
      ) : (
        <div className={styles.chartArea}>
          {dailyList.map((day, idx) => {
            const val = day[metric];
            const heightPercent = Math.max(Math.round((val / maxValue) * 100), 4);

            return (
              <div key={idx} className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div 
                    className={styles.bar} 
                    style={{ 
                      height: `${heightPercent}%`,
                      backgroundColor: metric === 'uniques' ? 'var(--osmis-green, #4ade80)' : metric === 'pageViews' ? '#38bdf8' : '#fafafa'
                    }}
                  >
                    <div className={styles.tooltip}>
                      <strong>{val.toLocaleString('id-ID')}</strong> {metric}
                      <br />
                      <span style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>{day.date}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.label}>{day.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
