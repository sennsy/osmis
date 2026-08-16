"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { toArabicNumerals } from '../utils/arabicNumerals';

export default function LiveClock() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div style={{ height: '100px' }}></div>; // Placeholder to prevent layout shift
  }

  // Format time (HH:mm:ss)
  const timeString = time.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  
  // Format Masehi date
  const masehiString = time.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format Hijri date
  let hijriString = '';
  try {
    hijriString = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-islamic' : 'id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(time);
  } catch (e) {
    hijriString = ''; // Fallback if browser doesn't support
  }

  const displayTime = language === 'ar' ? toArabicNumerals(timeString) : timeString;
  const displayMasehi = language === 'ar' && !masehiString.match(/[\u0600-\u06FF]/) ? toArabicNumerals(masehiString) : masehiString;
  const displayHijri = language === 'ar' && !hijriString.match(/[\u0600-\u06FF]/) ? toArabicNumerals(hijriString) : hijriString;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'inherit',
    }} className="mono-font">
      <div style={{ fontSize: '0.8rem', color: 'var(--osmis-yellow, #eab308)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
        {displayTime} {language === 'ar' ? 'توقيت إندونيسيا' : 'WIB'}
      </div>
      <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--ast-border-color, rgba(100,100,100,0.3))' }}></div>
      <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
        <span>{displayMasehi}</span>
        <span>{displayHijri}</span>
      </div>
    </div>
  );
}
