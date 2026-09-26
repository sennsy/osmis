"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './MatrixEasterEgg.module.css';

interface MatrixEasterEggProps {
  onClose: () => void;
}

const ASCII_PHASE1 = `
 _       __     ____                           ____                   
| |     / /___ / / /________  ____ ___  ___   / __ )____ _____  ____ _
| | /| / / __ \\/ / / ___/ __ \\/ __ \`__ \\/ _ \\ / __  / __ \`/ __ \\/ __ \`/
| |/ |/ / /_/ / / / /__/ /_/ / / / / / /  __// /_/ / /_/ / / / / /_/ / 
|__/|__/\\____/_/_/\\___/\\____/_/ /_/ /_/\\___//_____/\\__,_/_/ /_/\\__, /  
                                                              /____/   
`;

const ASCII_PHASE2 = `
 _       __     ____                           ___       __          _     
| |     / /___ / / /________  ____ ___  ___   /   | ____/ /___ ___  (_)___ 
| | /| / / __ \\/ / / ___/ __ \\/ __ \`__ \\/ _ \\ / /| |/ __  / __ \`__ \\/ / __ \\
| |/ |/ / /_/ / / / /__/ /_/ / / / / / /  __// ___ / /_/ / / / / / / / / / /
|__/|__/\\____/_/_/\\___/\\____/_/ /_/ /_/\\___//_/  |_\\__,_/_/ /_/ /_/_/_/ /_/ 
`;

export default function MatrixEasterEgg({ onClose }: MatrixEasterEggProps) {
  const router = useRouter();
  
  const [phase, setPhase] = useState<1 | 2>(1);
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (phase === 1) {
      // Phase 1: just draw ASCII
      setDisplayedText("");
      setShowInput(false);
      let charIndex = 0;
      interval = setInterval(() => {
        setDisplayedText(ASCII_PHASE1.slice(0, charIndex));
        charIndex += 5;
        if (charIndex > ASCII_PHASE1.length) {
          clearInterval(interval);
          setDisplayedText(ASCII_PHASE1);
          setTimeout(() => setShowInput(true), 500);
        }
      }, 20);
    } else {
      // Phase 2: just draw ASCII
      setDisplayedText("");
      setShowInput(false);
      let charIndex = 0;
      interval = setInterval(() => {
        setDisplayedText(ASCII_PHASE2.slice(0, charIndex));
        charIndex += 5;
        if (charIndex > ASCII_PHASE2.length) {
          clearInterval(interval);
          setDisplayedText(ASCII_PHASE2);
          setTimeout(() => setShowInput(true), 500);
        }
      }, 20);
    }

    return () => clearInterval(interval);
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 1) {
      if (password === 'immszky') {
        setError(false);
        setPhase(2);
        setPassword("");
        setShowInput(false);
      } else {
        setError(true);
      }
    } else if (phase === 2) {
      if (password === 'immszkyy') {
        sessionStorage.setItem('backroom_auth', 'granted');
        router.push('/backroom');
        onClose();
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.uiContainer}>
        <pre className={`${styles.asciiText} ${phase === 2 ? styles.phase2Color : ''}`}>
          {displayedText}
        </pre>
        
        {showInput && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.prompt}>
              {phase === 1 ? 'Enter Initial Clearance:' : 'Enter Final Authorization:'}
            </p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`${styles.input} ${error ? styles.error : ''}`}
              autoFocus
              placeholder="_"
            />
          </form>
        )}
      </div>
      
      <button className={styles.closeBtn} onClick={onClose}>[ ABORT ]</button>
    </div>
  );
}
