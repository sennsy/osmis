"use client";

import React, { useState, useEffect } from 'react';
import { Users, Eye, Activity, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#18181b', // Zinc-900
        border: '1px solid #27272a',
        padding: '12px',
        borderRadius: '8px',
        color: '#fafafa',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 600, color: '#a1a1aa' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ fontSize: '0.8rem', color: '#e4e4e7' }}>{entry.name}:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: 'auto' }}>
              {entry.value.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
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

  return (
    <div className={styles.chartContainer}>
      {/* Header */}
      <div className={styles.header} style={{ marginBottom: '1.5rem' }}>
        <div>
          <h3 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Statistik Pengunjung (Live Cloudflare)</span>
            {loading && <RefreshCw size={14} className="animate-spin" style={{ opacity: 0.7 }} />}
          </h3>
          <p className={styles.subtitle}>
            Data lalu lintas web real-time yang tersaring melalui jaringan Cloudflare.
          </p>
        </div>
        <button 
          onClick={fetchAnalytics}
          title="Muat Ulang Data"
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#fafafa',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 500
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <Users size={16} color="#4ade80" /> Pengunjung Unik
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.uniques?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <Eye size={16} color="#38bdf8" /> Tampilan Halaman
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.pageViews?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <Activity size={16} color="#facc15" /> Total Requests
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.requests?.toLocaleString('id-ID') || 0}
          </div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} color="#a855f7" /> Hemat Bandwidth
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa' }}>
            {data?.totals.cacheRate || '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.2rem' }}>
            {formatBytes(data?.totals.cachedBytes || 0)} di-cache
          </div>
        </div>
      </div>

      {/* Chart */}
      {error ? (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          height: '250px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.2)', 
          borderRadius: '10px', padding: '1rem', textAlign: 'center'
        }}>
          <AlertCircle size={28} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
          <p style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>{error}</p>
          <p style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Pastikan variabel CLOUDFLARE_API_TOKEN sudah dipasang di Vercel.
          </p>
        </div>
      ) : !data?.hasData ? (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          height: '250px', background: '#18181b', border: '1px dashed #27272a', 
          borderRadius: '10px', padding: '1.5rem', textAlign: 'center'
        }}>
          <ShieldCheck size={36} color="#4ade80" style={{ marginBottom: '1rem' }} />
          <h4 style={{ color: '#fafafa', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Domain Sukses Terhubung ke Cloudflare!
          </h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', maxWidth: '440px', lineHeight: 1.5 }}>
            Menunggu data lalu lintas terkumpul. Grafik akan otomatis terisi dan terupdate saat ada pengunjung masuk.
          </p>
        </div>
      ) : (
        <div style={{ height: '350px', width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dailyList}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '0.85rem', color: '#a1a1aa' }} 
                iconType="circle"
              />
              
              <Area 
                type="monotone" 
                dataKey="requests" 
                name="Total Requests" 
                stroke="#facc15" 
                fillOpacity={1} 
                fill="url(#colorReq)" 
                strokeWidth={2}
              />
              <Bar 
                dataKey="pageViews" 
                name="Tampilan Halaman" 
                fill="#38bdf8" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
              <Line 
                type="monotone" 
                dataKey="uniques" 
                name="Pengunjung Unik" 
                stroke="#4ade80" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#09090b', strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
