"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOsmisData } from '../lib/storage';
import styles from './MatraChat.module.css';
import MatrixEasterEgg from './MatrixEasterEgg';
import MorphOrb, { ThinkingOrb } from './ui/ai-thiking-orb-and-input';
import { GlowCard } from './ui/spotlight-card';
import { PromptInputBox } from './ui/ai-prompt-box';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function MatraChat() {
  const pathname = usePathname();
  const { data: activeOsmisData } = useOsmisData();
  const [isOpen, setIsOpen] = useState(false);
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya Matra AI. Ada yang bisa saya bantu terkait OSMIS?' }
  ]);
  const [showMatrix, setShowMatrix] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Navbar trigger listener: Opens the centered prompt box, or closes the active chat drawer
  useEffect(() => {
    const handleNavbarTrigger = () => {
      if (isOpen) {
        setIsOpen(false);
        setShowPromptBox(false);
      } else {
        setShowPromptBox((prev) => !prev);
      }
    };
    window.addEventListener('osmis:toggle-matra-ai', handleNavbarTrigger);
    return () => {
      window.removeEventListener('osmis:toggle-matra-ai', handleNavbarTrigger);
    };
  }, [isOpen]);

  // Close prompt box with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPromptBox) {
        setShowPromptBox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPromptBox]);

  if (pathname?.startsWith('/backroom')) return null;

  // Easter Egg Check ("askaa" -> MatrixEasterEgg -> /backroom)
  const checkAskaaCode = (rawText: string): boolean => {
    if (rawText.trim().toLowerCase() === 'askaa') {
      setIsOpen(false);
      setShowPromptBox(false);
      setShowMatrix(true);
      return true;
    }
    return false;
  };

  // Unified API caller for MorphOrb + Chat stream
  const askMatraBackend = async (userMsg: string): Promise<string> => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          localData: activeOsmisData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error ${res.status}`);
      }

      const data = await res.json();
      const assistantResponse =
        data.choices?.[0]?.message?.content || 'Maaf, saya tidak mengerti maksud Anda.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
      return assistantResponse;
    } catch (err: any) {
      const errorMsg = `Terjadi kesalahan: ${err.message}.`;
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg }]);
      return errorMsg;
    }
  };

  // When a query is sent from the centered PromptInputBox:
  // Smoothly exit prompt box -> Open left panel -> Stream response
  const handlePromptSend = async (message: string, _files?: File[]) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (checkAskaaCode(trimmed)) return;

    // Animate exit to the left, then open the left chat drawer
    setShowPromptBox(false);
    setTimeout(() => {
      setIsOpen(true);
    }, 160);

    setIsPromptLoading(true);
    try {
      await askMatraBackend(trimmed);
    } finally {
      setIsPromptLoading(false);
    }
  };

  return (
    <>
      {showMatrix && <MatrixEasterEgg onClose={() => setShowMatrix(false)} />}

      {/* Centered AI Prompt Box Modal (triggered first on Matra logo click) */}
      <AnimatePresence>
        {showPromptBox && (
          <motion.div
            key="prompt-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className={styles.promptModalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPromptBox(false);
              }
            }}
          >
            <motion.div
              key="prompt-card"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, x: -160, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className={styles.promptModalCard}
            >
              {/* Header Above Prompt Box */}
              <div className={styles.promptModalHeader}>
                <div className={styles.promptModalBrand}>
                  <div className={styles.promptModalLogoWrap}>
                    <img
                      src="/matra_logo.jpg"
                      alt="Matra AI"
                      className={styles.promptModalLogo}
                    />
                    <span className={styles.promptModalStatusDot} />
                  </div>
                  <div className={styles.promptModalTitleRow}>
                    <span className={styles.promptModalTitle}>Matra AI</span>
                    <span className={styles.promptModalBadge}>
                      Assistant
                    </span>
                  </div>
                </div>

                <div className={styles.promptModalActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPromptBox(false);
                      setIsOpen(true);
                    }}
                    className={styles.promptHistoryBtn}
                    title="Buka panel chat penuh"
                  >
                    <MessageSquare size={14} color="#00ff88" />
                    <span>Buka Riwayat Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPromptBox(false)}
                    className={styles.promptCloseBtn}
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* The PromptInputBox Component */}
              <PromptInputBox
                placeholder="Tanyakan apapun seputar OSMIS, divisi, program, atau ma'had..."
                isLoading={isPromptLoading}
                onSend={handlePromptSend}
              />

              {/* Quick suggestion chips */}
              <div className={styles.promptSuggestions}>
                <span className={styles.promptSuggestionLabel}>Coba tanya:</span>
                {[
                  "Siapa ketua OSMIS saat ini?",
                  "Program kerja divisi keamanan?",
                  "Sejarah berdirinya OSMIS",
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptSend(chip)}
                    className={styles.promptChip}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight Glow Chat Popup Panel (Slides in from the left) */}
      <div className={`${styles.chatPanelWrap} ${isOpen ? styles.open : ''}`}>
        <GlowCard
          customSize
          glowColor="green"
          className={styles.panelGlowCard}
          style={{
            '--radius': '24',
            '--border': '2.5',
            '--size': '340',
            '--bg-spot-opacity': '0.18',
          } as React.CSSProperties}
        >
          <div className={styles.panelInner}>
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <img src="/matra_logo.jpg" alt="Matra AI Logo" className={styles.headerLogo} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.headerTitle}>Matra AI</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.65, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--osmis-green, #2e5942)' }}>
                    Asisten Digital OSMIS
                  </span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={toggleChat} aria-label="Tutup Matra AI">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className={styles.messages} style={{ paddingBottom: '6.75rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                    <div className={styles.messageRole}>
                      {msg.role === 'user' ? 'Anda' : 'Matra AI'}
                    </div>
                    <div className={styles.messageContent}>
                      {msg.content.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
                {isPromptLoading && (
                  <div className={`${styles.message} ${styles.assistant}`} style={{ width: '100%', maxWidth: '100%' }}>
                    <div className={styles.messageRole}>Matra AI</div>
                    <ThinkingOrb
                      size={150}
                      labels={["Memikirkan...", "Mencari Data OSMIS...", "Menganalisis Konteks...", "Menyusun Jawaban..."]}
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <MorphOrb
                placeholder="Tanyakan sesuatu pada Matra AI…"
                answerTitle="Matra AI"
                resetLabel="Lanjut Chat"
                labels={["Memikirkan", "Mencari Data", "Menganalisis", "Menyusun Jawaban"]}
                minThinkMs={2100}
                onInterceptSubmit={(text) => checkAskaaCode(text)}
                onSubmit={async (text) => {
                  if (checkAskaaCode(text)) return '';
                  const reply = await askMatraBackend(text);
                  return reply.replace(/\*\*/g, '');
                }}
              />
            </div>
          </div>
        </GlowCard>
      </div>
    </>
  );
}
