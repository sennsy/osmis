"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';
import LiveClock from './LiveClock';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Visit Tracking Simulator
    const lastVisit = sessionStorage.getItem('session_visited');
    if (!lastVisit) {
      sessionStorage.setItem('session_visited', 'true');
      const currentVisits = parseInt(localStorage.getItem('osmis_visits') || '0', 10);
      localStorage.setItem('osmis_visits', (currentVisits + 1).toString());
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.history, href: '/#history' },
    { name: t.organization, href: '/#organization' },
    { name: t.divisions, href: '/#divisions' },
    { name: t.archive, href: '/#gallery' },
    { name: t.features, href: '/#features' }
  ];

  const handleLanguageChange = () => {
    const langs: ('id' | 'en' | 'ar')[] = ['id', 'en', 'ar'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  if (pathname === '/gallery' || pathname?.startsWith('/backroom')) {
    return null;
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/">
            <img src="/logo_utama.png" alt="OSMIS Logo" width={32} height={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            OSMIS
          </a>
        </div>
        
        <div className={styles.centerNav}>
          <LiveClock />
        </div>
        
        <div className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} className="mono-font">{link.name.toUpperCase()}</Link>
              </li>
            ))}
          </ul>
          
          <div className={styles.actions}>
            <button onClick={handleLanguageChange} className={styles.iconBtn} aria-label="Change Language">
              <span className="mono-font">{t.langName}</span>
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className={styles.iconBtn}
              aria-label="Toggle Theme"
            >
              {mounted && (theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />)}
            </button>
          </div>
        </div>

        <div className={styles.mobileToggle}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.iconBtn}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNavLinks}>
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} onClick={() => setMobileMenuOpen(false)} className="mono-font">
                  {link.name.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <button onClick={handleLanguageChange} className={styles.iconBtn}>
              <Globe size={18} /> <span className="mono-font">{t.langName}</span>
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={styles.iconBtn}>
              {mounted && (theme === 'dark' ? <><Moon size={18} /> Dark</> : <><Sun size={18} /> Light</>)}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
