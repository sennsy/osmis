"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getImageUrl } from '../utils/driveImages';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  name: string;
  role?: string;
}

export default function PhotoModal({ isOpen, onClose, image, name, role }: PhotoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
          }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.5rem',
              zIndex: 10
            }}
          >
            <X size={32} />
          </button>
          
          <motion.img 
            src={getImageUrl(image)} 
            alt={name}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 10px 50px rgba(0,0,0,0.5)'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          
          <motion.div 
            style={{ marginTop: '2rem', textAlign: 'center', color: '#fff' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <h2 className="display-font" style={{ fontSize: '2rem', margin: 0, color: 'var(--osmis-yellow)' }}>{name}</h2>
            {role && <p className="mono-font" style={{ marginTop: '0.5rem', opacity: 0.8, letterSpacing: '0.1em' }}>{role}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
