"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOsmisData } from '../lib/storage';
import styles from './MatraChat.module.css';
import MatrixEasterEgg from './MatrixEasterEgg';
import MorphOrb from './ui/ai-thiking-orb-and-input';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function MatraChat() {
  const pathname = usePathname();
  const { data: activeOsmisData } = useOsmisData();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ask' | 'history'>('ask');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya Matra AI. Ada yang bisa saya bantu terkait OSMIS?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeTab]);

  if (pathname?.startsWith('/backroom')) return null;

  // Easter Egg Check ("askaa" -> MatrixEasterEgg -> /backroom)
  const checkAskaaCode = (rawText: string): boolean => {
    if (rawText.trim().toLowerCase() === 'askaa') {
      setInput('');
      setIsOpen(false);
      setShowMatrix(true);
      return true;
    }
    return false;
  };

  // Shared API caller for both MorphOrb ("Ask") and Chat History
  const askMatraBackend = async (userMsg: string): Promise<string> => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();

    // Easter Egg Check (TANPA MENGHILANGKAN KODE ASKAA)
    if (checkAskaaCode(userMsg)) {
      return;
    }

    setInput('');
    await askMatraBackend(userMsg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {showMatrix && <MatrixEasterEgg onClose={() => setShowMatrix(false)} />}
      <div className={styles.floatingBtn} onClick={toggleChat} title="Tanya Matra AI">
        <img src="/matra_logo.jpg" alt="Matra AI" className={styles.logo} />
      </div>

      <div className={`${styles.chatPanel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <img src="/matra_logo.jpg" alt="Matra AI Logo" className={styles.headerLogo} />
            <span className={styles.headerTitle}>Matra AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('ask')}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  background: activeTab === 'ask' ? '#34d399' : 'transparent',
                  color: activeTab === 'ask' ? '#052e16' : 'var(--text-color)',
                  transition: 'all 0.2s ease',
                }}
              >
                ASK
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  background: activeTab === 'history' ? '#34d399' : 'transparent',
                  color: activeTab === 'history' ? '#052e16' : 'var(--text-color)',
                  transition: 'all 0.2s ease',
                }}
              >
                CHAT ({Math.max(0, messages.length - 1)})
              </button>
            </div>

            <button className={styles.closeBtn} onClick={toggleChat} aria-label="Tutup Matra AI">
              <svg
                width="24"
                height="24"
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
        </div>

        {activeTab === 'ask' ? (
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <MorphOrb
              placeholder="Tanyakan sesuatu pada Matra AI…"
              answerTitle="Matra AI"
              resetLabel="Tanya lagi"
              labels={["Memikirkan", "Mencari Data", "Menganalisis", "Menyusun Jawaban"]}
              minThinkMs={2200}
              onInterceptSubmit={(text) => checkAskaaCode(text)}
              onSubmit={async (text) => {
                if (checkAskaaCode(text)) return '';
                const reply = await askMatraBackend(text);
                return reply.replace(/\*\*/g, '');
              }}
            />
          </div>
        ) : (
          <>
            <div className={styles.messages}>
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
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageRole}>Matra AI</div>
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSubmit}>
                <textarea
                  className={styles.inputField}
                  placeholder="Tanyakan sesuatu pada Matra AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isLoading}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}

