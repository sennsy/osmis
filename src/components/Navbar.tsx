"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';
import LiveClock from './LiveClock';
import { LiquidNavbar, NimbusIcons, type LiquidNavItem } from './ui/liquid-glass-navbar';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavIdx, setActiveNavIdx] = useState(0);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section indicator based on scroll position on homepage
      const sectionIds = ['history', 'organization', 'divisions', 'gallery', 'features'];
      const scrollPos = window.scrollY + 240;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveNavIdx(i);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Visit Tracking Simulator
    const lastVisit = sessionStorage.getItem('session_visited');
    if (!lastVisit) {
      sessionStorage.setItem('session_visited', 'true');
      const currentVisits = parseInt(localStorage.getItem('osmis_visits') || '0', 10);
      localStorage.setItem('osmis_visits', (currentVisits + 1).toString());
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: t.history, href: '/#history', id: 'history', icon: NimbusIcons.globe, fx: 'spin' as const },
    { name: t.organization, href: '/#organization', id: 'organization', icon: NimbusIcons.user, fx: 'glow' as const },
    { name: t.divisions, href: '/#divisions', id: 'divisions', icon: NimbusIcons.home, fx: 'pop' as const },
    { name: t.archive, href: '/#gallery', id: 'gallery', icon: NimbusIcons.drop, fx: 'drop' as const },
    { name: t.features, href: '/#features', id: 'features', icon: NimbusIcons.plane, fx: 'wave' as const }
  ], [t.history, t.organization, t.divisions, t.archive, t.features]);

  const liquidItems: LiquidNavItem[] = useMemo(() => navLinks.map((link) => ({
    label: link.name.toUpperCase(),
    href: link.href,
    icon: link.icon,
    fx: link.fx,
  })), [navLinks]);

  const handleLiquidSelect = (index: number, item: LiquidNavItem) => {
    setActiveNavIdx(index);
    const targetSection = navLinks[index]?.id;
    if (pathname === '/' && targetSection) {
      const el = document.getElementById(targetSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleLanguageChange = () => {
    const langs: ('id' | 'en' | 'ar')[] = ['id', 'en', 'ar'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const handleMatraTrigger = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('osmis:toggle-matra-ai'));
    }
  };

  if (pathname === '/gallery' || pathname?.startsWith('/backroom')) {
    return null;
  }

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'light';
  const liquidTone = currentTheme === 'dark' ? 'dark' : 'light';

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <img
              src="/logo_utama.png"
              alt="OSMIS Logo"
              width={34}
              height={34}
              style={{ verticalAlign: 'middle', marginRight: '10px' }}
            />
            <span>OSMIS</span>
          </Link>
        </div>
        
        <div className={styles.centerNav}>
          <LiveClock />
        </div>
        
        <div className={styles.desktopNav}>
          <LiquidNavbar
            items={liquidItems}
            active={activeNavIdx}
            onChange={handleLiquidSelect}
            tone={liquidTone}
            sound={true}
          />
          
          <div className={styles.actions}>
            <button onClick={handleLanguageChange} className={styles.iconBtn} aria-label="Change Language" title="Ganti Bahasa (ID / EN / AR)">
              <Globe size={15} style={{ marginRight: 5, opacity: 0.8 }} />
              <span className="mono-font">{t.langName}</span>
            </button>
            <button 
              onClick={() => {
                const current = theme === 'system' ? resolvedTheme : theme;
                setTheme(current === 'dark' ? 'light' : 'dark');
              }} 
              className={styles.iconBtn}
              aria-label="Toggle Theme"
              title="Ubah Tema Terang / Gelap"
            >
              {mounted && (currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />)}
            </button>
            <button
              type="button"
              onClick={handleMatraTrigger}
              className={styles.matraTriggerBtn}
              aria-label="Matra AI — AI Assistant"
              title="Matra AI — AI Assistant"
              data-tooltip="Matra AI — AI Assistant"
            >
              <img
                src="/matra_logo.jpg"
                alt="Matra AI"
                width={26}
                height={26}
                className={styles.matraNavLogo}
                draggable={false}
              />
            </button>
          </div>
        </div>

        <div className={styles.mobileToggle}>
          <button
            type="button"
            onClick={() => {
              const current = theme === 'system' ? resolvedTheme : theme;
              setTheme(current === 'dark' ? 'light' : 'dark');
            }}
            className={styles.iconBtn}
            aria-label="Toggle Theme"
            title="Ubah Tema Terang / Gelap"
          >
            {mounted && (currentTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />)}
          </button>
          <button
            type="button"
            onClick={handleMatraTrigger}
            className={styles.matraTriggerBtn}
            aria-label="Matra AI — AI Assistant"
            title="Matra AI — AI Assistant"
          >
            <img
              src="/matra_logo.jpg"
              alt="Matra AI"
              width={24}
              height={24}
              className={styles.matraNavLogo}
              draggable={false}
            />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.iconBtn}
            aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <LiquidNavbar
              items={liquidItems}
              active={activeNavIdx}
              onChange={(i, item) => {
                setMobileMenuOpen(false);
                handleLiquidSelect(i, item);
              }}
              tone={liquidTone}
              compact={true}
              sound={true}
            />
          </div>
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
              <Globe size={18} /> <span className="mono-font" style={{ marginLeft: 6 }}>{t.langName}</span>
            </button>
            <button onClick={() => {
              const current = theme === 'system' ? resolvedTheme : theme;
              setTheme(current === 'dark' ? 'light' : 'dark');
            }} className={styles.iconBtn}>
              {mounted && (currentTheme === 'dark' ? <><Moon size={18} /> <span style={{ marginLeft: 6 }}>Dark</span></> : <><Sun size={18} /> <span style={{ marginLeft: 6 }}>Light</span></>)}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleMatraTrigger();
              }}
              className={styles.matraTriggerBtn}
              aria-label="Matra AI — AI Assistant"
              title="Matra AI — AI Assistant"
            >
              <img
                src="/matra_logo.jpg"
                alt="Matra AI"
                width={24}
                height={24}
                className={styles.matraNavLogo}
                draggable={false}
              />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
