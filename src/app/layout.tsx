import React from 'react';
import { Metadata } from 'next';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../components/LanguageProvider';
import Navbar from '../components/Navbar';
import CustomCursor from '../components/CustomCursor';
import Footer from '../components/Footer';
import MatraChat from '../components/MatraChat';
import ImageProtection from '../components/ImageProtection';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'OSMIS - Official Website',
  description: 'Official digital identity and intelligent archive platform for OSMIS (Organisasi Ma\'had Imam Syafi\'i).',
  icons: {
    icon: '/logo_utama.png',
  },
};

import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  function isExtErr(str){
    if(!str)return false;
    var s=String(str);
    return s.indexOf('chrome-extension://')!==-1||s.indexOf('moz-extension://')!==-1||s.indexOf('safari-extension://')!==-1||s.indexOf('chrome: call method')!==-1;
  }
  window.addEventListener('error',function(e){
    if(isExtErr(e.message)||isExtErr(e.filename)||isExtErr(e.error&&e.error.stack)){
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  },true);
  window.addEventListener('unhandledrejection',function(e){
    var r=e.reason;
    if(isExtErr(r&&(r.message||r))||isExtErr(r&&r.stack)){
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  },true);
  var origErr=console.error;
  console.error=function(){
    for(var i=0;i<arguments.length;i++){
      var a=arguments[i];
      if(isExtErr(a&&(a.message||a))||isExtErr(a&&a.stack))return;
    }
    return origErr.apply(console,arguments);
  };
})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <ImageProtection />
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
