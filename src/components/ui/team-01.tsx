'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export interface Team01Member {
  id: string
  image: string
  name: string
  role: string
  badgeText?: string
  actionLabel?: string
  onImageClick?: () => void
  onActionClick?: () => void
}

export interface Team01Props {
  badgeText?: string
  title?: string
  subtitle?: string
  teamMembers?: Team01Member[]
}

export function Team01({
  badgeText = 'BPH INTI OSMIS',
  title = 'Struktur Bagian Inti',
  subtitle = 'Pengurus Harian Inti OSMIS yang mengemban amanah kepemimpinan, koordinasi, kesekretariatan, dan kebendaharaan.',
  teamMembers = [],
}: Team01Props) {
  return (
    <div className="team01-wrapper">
      <style>{`
        .team01-wrapper {
          width: 100%;
          padding: 16px 0 32px;
        }
        .team01-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 44px;
        }
        .team01-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          max-width: 680px;
        }
        .team01-title {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: clamp(1.85rem, 3.5vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          color: var(--color-text-primary, #0f291e);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .team01-subtitle {
          font-size: clamp(0.95rem, 1.4vw, 1.08rem);
          line-height: 1.6;
          color: var(--color-text-secondary, #476356);
          margin: 0;
        }
        .team01-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 28px;
        }
        @media (min-width: 640px) {
          .team01-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .team01-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        .team01-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(16, 185, 129, 0.16);
          border-radius: 22px;
          padding: 20px 18px 22px;
          box-shadow: 0 12px 32px -12px rgba(6, 78, 59, 0.1);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
          position: relative;
        }
        .team01-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 44px -14px rgba(6, 78, 59, 0.18);
          border-color: rgba(16, 185, 129, 0.4);
        }
        .team01-img-box {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 4.4;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(145deg, #064e3b, #022c22);
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);
        }
        .team01-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease;
        }
        .team01-card:hover .team01-img {
          transform: scale(1.05);
        }
        .team01-zoom-pill {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(6, 20, 14, 0.72);
          backdrop-filter: blur(6px);
          color: #ecfdf5;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.25s ease;
          pointer-events: none;
        }
        .team01-img-box:hover .team01-zoom-pill {
          opacity: 1;
          transform: translateY(0);
        }
        .team01-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          width: 100%;
          flex: 1;
        }
        .team01-role-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #047857;
          background: rgba(16, 185, 129, 0.12);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .team01-name {
          font-family: var(--font-heading, system-ui, sans-serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary, #0f291e);
          margin: 4px 0 0;
          line-height: 1.3;
        }
        .team01-role {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #476356);
          margin: 0;
        }
        .team01-action-btn {
          margin-top: 8px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          color: #065f46;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .team01-action-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
          box-shadow: 0 8px 20px -6px rgba(5, 150, 105, 0.45);
        }
      `}</style>

      <div className="team01-container">
        <div className="team01-header">
          {badgeText && <Badge variant="outline">{badgeText}</Badge>}
          <h2 className="team01-title">{title}</h2>
          {subtitle && <p className="team01-subtitle">{subtitle}</p>}
        </div>

        <div className="team01-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team01-card">
              <div
                className="team01-img-box"
                onClick={member.onImageClick}
                title={`Klik untuk memperbesar foto ${member.name}`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="team01-img"
                />
                <span className="team01-zoom-pill">🔍 Perbesar Foto</span>
              </div>

              <div className="team01-info">
                <span className="team01-role-badge">{member.role}</span>
                <h3 className="team01-name">{member.name}</h3>
                {member.badgeText && (
                  <p className="team01-role">{member.badgeText}</p>
                )}
              </div>

              {member.onActionClick && (
                <button
                  type="button"
                  onClick={member.onActionClick}
                  className="team01-action-btn"
                >
                  <span>📋</span>
                  <span>{member.actionLabel || 'Lihat Program Kerja'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Team01
