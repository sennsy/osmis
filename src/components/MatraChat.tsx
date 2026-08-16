"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOsmisData } from '../lib/storage';
import styles from './MatraChat.module.css';
import MatrixEasterEgg from './MatrixEasterEgg';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function MatraChat() {
  const pathname = usePathname();
  const { data: activeOsmisData } = useOsmisData();
  const [isOpen, setIsOpen] = useState(false);
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
  }, [messages, isLoading]);

  if (pathname?.startsWith('/backroom')) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    
    // Easter Egg Check
    if (userMsg.toLowerCase() === 'askaa') {
      setInput('');
      setIsOpen(false);
      setShowMatrix(true);
      return;
    }

    setInput('');
    
    // Add user message to UI
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get current local data from the hook (which handles fallbacks and overrides)
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          localData: activeOsmisData
        })
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi API');
      }

      const data = await res.json();
      const assistantResponse = data.choices?.[0]?.message?.content || "Maaf, saya tidak mengerti maksud Anda.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Terjadi kesalahan pada sistem. Mohon coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
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
          <button className={styles.closeBtn} onClick={toggleChat}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.messageRole}>
                {msg.role === 'user' ? 'Anda' : 'Matra AI'}
              </div>
              <div className={styles.messageContent}>
                {/* A proper markdown parser would go here, but for now we'll do basic rendering */}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
