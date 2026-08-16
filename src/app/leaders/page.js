'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import leaders from '../../data/leaders.json';
import styles from './page.module.css';

export default function HallOfLeaders() {
  const [selectedLeader, setSelectedLeader] = useState(leaders[0]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hall of Leaders</h1>
        <p className={styles.subtitle}>The visionaries of OSMIS</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.timelineSidebar}>
          {leaders.map((leader) => (
            <button 
              key={leader.id}
              className={`${styles.timelineBtn} ${selectedLeader.id === leader.id ? styles.activeBtn : ''}`}
              onClick={() => setSelectedLeader(leader)}
            >
              <span className={styles.periodLabel}>{leader.periodId}</span>
              <span className={styles.nameLabel}>{leader.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLeader.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className={styles.leaderCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.photoPlaceholder}>
                  {/* Real image would go here */}
                  <span>{selectedLeader.name.charAt(0)}</span>
                </div>
                <div className={styles.headerInfo}>
                  <h2 className={styles.leaderName}>{selectedLeader.name}</h2>
                  <p className={styles.leaderPeriod}>Chairman, {selectedLeader.periodId}</p>
                </div>
              </div>

              <div className={styles.bioSection}>
                <h3>Biography</h3>
                <p>{selectedLeader.biography}</p>
              </div>

              <div className={styles.achievementsSection}>
                <h3>Key Achievements</h3>
                <ul>
                  {selectedLeader.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
