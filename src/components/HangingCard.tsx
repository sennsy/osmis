"use client";

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HangingCardProps {
  imageSrc: string;
  title: string;
  tagText?: string;
  bgText?: string;
}

export default function HangingCard({ 
  imageSrc, 
  title, 
  tagText = "OSMIS",
  bgText = "OSMIS"
}: HangingCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for bouncy return
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 1 });

  // Rotate based on x movement to simulate swinging from far above
  const rotate = useTransform(springX, [-200, 200], [-25, 25]);

  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      minHeight: 450
    }}>
      {/* Container that acts as the draggable boundary */}
      <div style={{ position: 'relative', width: 280, height: 380, marginTop: 40 }}>
        
        {/* The Draggable Card + Lanyard */}
        <motion.div
          drag
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.6}
          style={{
            x: springX,
            y: springY,
            rotate,
            transformOrigin: '50% -300px', // Pivot point remains at 300px for tight arc
            zIndex: 10,
            cursor: 'grab',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Lanyard/Clip Area - Inside the moving div */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            top: -1000, // Make it very tall so the top is never seen when pulled down
            pointerEvents: 'none',
            zIndex: 0
          }}>
            {/* Lanyard Strap */}
            <div style={{ 
              width: 55, 
              height: 1000, // Super long strap
              background: '#1a1a1a', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              paddingBottom: 20,
              gap: 35,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
            }}>
               {Array.from({ length: 15 }).map((_, i) => (
                 <img 
                   key={i} 
                   src="/logo_utama.png" 
                   alt="Logo" 
                   style={{ width: 32, height: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9 }} 
                   draggable={false}
                 />
               ))}
            </div>
            {/* Metal Ring / Carabiner */}
            <div style={{ 
              width: 18, 
              height: 35, 
              border: '3px solid #b0b0b0', 
              borderRadius: '10px 10px 20px 20px', 
              marginTop: -8, 
              background: 'transparent',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.4)',
              zIndex: 1
            }}></div>
          </div>

          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f1f5f9',
            borderRadius: 20,
            padding: '24px 20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255,255,255,0.1) inset',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            position: 'relative',
            overflow: 'hidden',
            marginTop: 18 // Spacing so the clip overlaps nicely
          }}>
            {/* Background huge text */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '4.5rem',
              fontWeight: 900,
              color: 'rgba(0,0,0,0.04)',
              zIndex: 1,
              whiteSpace: 'nowrap',
              fontFamily: 'Impact, sans-serif',
              letterSpacing: 4
            }}>
              {bgText}
            </div>

            {/* Hole for clip */}
            <div style={{ 
              width: 50, 
              height: 10, 
              backgroundColor: '#cbd5e1', 
              borderRadius: 5, 
              marginBottom: 20, 
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4)',
              zIndex: 2
            }}></div>
            
            {/* Photo */}
            <div style={{
              width: '100%',
              height: '75%',
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#000',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 2,
              pointerEvents: 'none' // prevent dragging the image itself
            }}>
              <img 
                src={imageSrc} 
                alt="ID Card Photo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false} 
              />
            </div>

            {/* Title / Elegant Script */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
              <h3 style={{
                fontFamily: "'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive", 
                fontSize: '2.5rem',
                color: '#1e293b',
                margin: 0,
                transform: 'rotate(-5deg)',
                pointerEvents: 'none'
              }}>
                {title}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
