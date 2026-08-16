'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import periods from '../../data/periods.json';
import styles from './page.module.css';

export default function Timeline() {
  const containerRef = useRef(null);
  
  // This achieves the "premium scrolling" effect requested, similar to ROG/Stripe
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className={styles.timelineContainer} ref={containerRef}>
      <header className={styles.header}>
        <h1 className={styles.title}>Living Timeline</h1>
        <p className={styles.subtitle}>The Evolution of OSMIS</p>
      </header>

      <div className={styles.scrollTracker}>
        <motion.div 
          className={styles.scrollProgress}
          style={{ scaleY: scrollYProgress }}
        />
      </div>

      <div className={styles.periodsWrapper}>
        {periods.map((period, index) => (
          <PeriodSection key={period.id} period={period} index={index} />
        ))}
      </div>
    </div>
  );
}

function PeriodSection({ period, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  return (
    <motion.section 
      ref={ref}
      className={`${styles.periodSection} ${period.theme === 'vintage' ? styles.themeVintage : styles.themeModern}`}
      style={{ opacity, y }}
    >
      <div className={styles.contentBox}>
        <div className={styles.yearTag}>{period.year}</div>
        <h2 className={styles.periodSummary}>{period.summary}</h2>
        
        <div className={styles.programsGrid}>
          <h3>Key Programs</h3>
          <ul>
            {period.programs.map((prog, i) => (
              <li key={i}>{prog}</li>
            ))}
          </ul>
        </div>

        <div className={styles.structureGrid}>
          <h3>Structure</h3>
          <div className={styles.roles}>
            {period.structure.slice(0, 4).map((role, i) => (
              <div key={i} className={styles.roleCard}>
                <span className={styles.roleTitle}>{role.role}</span>
              </div>
            ))}
            {period.structure.length > 4 && (
              <div className={styles.roleCard}>
                <span className={styles.roleTitle}>+{period.structure.length - 4} more</span>
              </div>
            )}
          </div>
        </div>

        <a href={`/periods/${period.id}`} className={styles.exploreBtn}>
          Explore Archive
        </a>
      </div>
    </motion.section>
  );
}
