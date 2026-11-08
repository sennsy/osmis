"use client";

import { useEffect } from 'react';

function isBrowserExtensionError(message?: string, filename?: string, stack?: string): boolean {
  const combined = `${message || ''} ${filename || ''} ${stack || ''}`;
  return (
    combined.includes('chrome-extension://') ||
    combined.includes('moz-extension://') ||
    combined.includes('safari-extension://') ||
    combined.includes('Window message "chrome: call method" timed out')
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (e: ErrorEvent) => {
      if (isBrowserExtensionError(e.message, e.filename, e.error?.stack)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );
  window.addEventListener(
    'unhandledrejection',
    (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = reason?.stack || '';
      if (isBrowserExtensionError(msg, '', stack)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );
}

export default function ImageProtection() {
  useEffect(() => {
    // 1. Suppress third-party browser extension errors (e.g. chrome-extension:// content scripts timing out)
    const handleWindowError = (e: ErrorEvent) => {
      if (
        isBrowserExtensionError(
          e.message,
          e.filename,
          e.error?.stack
        )
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = reason?.stack || '';
      if (isBrowserExtensionError(msg, '', stack)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    // 2. Mencegah foto diseret (drag) ke tab baru atau jendela lain
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Mencegah klik kanan untuk "Open image in new tab" atau "Save image as"
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('img'))) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  return null;
}

