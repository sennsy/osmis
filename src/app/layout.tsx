import React from 'react';
import { Metadata } from 'next';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../components/LanguageProvider';
import Navbar from '../components/Navbar';
import CustomCursor from '../components/CustomCursor';
import Footer from '../components/Footer';
import MatraChat from '../components/MatraChat';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'OSMIS - Official Website',
  description: 'Official digital identity and intelligent archive platform for OSMIS (Organisasi Ma\'had Imam Syafi\'i).',
  icons: {
    icon: '/logo_utama.png',
  },
};

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <div className="paper-texture"></div>
            <CustomCursor />
            <Navbar />
            <main>
              {children}
            </main>
            <Footer />
            <MatraChat />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
