'use client';

import { useState, useEffect } from 'react';
import { searchMatraAI } from '../lib/matra-ai';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SearchOverlay.module.css';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length > 1) {
      setResults(searchMatraAI(query));
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.container}>
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
            <div className={styles.searchHeader}>
              <h2 className={styles.matraTitle}>Matra AI</h2>
              <p className={styles.matraSubtitle}>Intelligent Organizational Search Engine</p>
            </div>
            
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Search history, leaders, divisions, or documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />

            <div className={styles.resultsContainer}>
              {results.length > 0 ? (
                results.map((res, i) => (
                  <motion.a 
                    href={res.link}
                    key={res.id + i} 
                    className={styles.resultCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={onClose}
                  >
                    <div className={styles.resultMeta}>
                      <span className={styles.resultType}>{res.type}</span>
                    </div>
                    <h3 className={styles.resultTitle}>{res.title}</h3>
                    <p className={styles.resultContent}>{res.content}</p>
                    <div className={styles.resultKeywords}>{res.keywords}</div>
                  </motion.a>
                ))
              ) : query.length > 1 ? (
                <p className={styles.noResults}>No archives found for "{query}".</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
