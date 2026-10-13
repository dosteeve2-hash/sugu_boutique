'use client'

import { LucideIcon } from 'lucide-react'
import { m as motion } from 'framer-motion'

function IllustrationMarche() {
  return (
    <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 1rem', display: 'block' }}>
      {/* auvent */}
      <path d="M15 30 L70 12 L125 30 Z" fill="#D4AF37" opacity="0.18" />
      <path d="M15 30 L20 40 L30 30 L40 40 L50 30 L60 40 L70 30 L80 40 L90 30 L100 40 L110 30 L120 40 L125 30" stroke="#D4AF37" strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* montants */}
      <line x1="25" y1="34" x2="22" y2="70" stroke="#7b89a8" strokeWidth="2" />
      <line x1="115" y1="34" x2="118" y2="70" stroke="#7b89a8" strokeWidth="2" />
      {/* table */}
      <rect x="18" y="70" width="104" height="6" rx="2" fill="#16233d" />
      {/* paniers */}
      <path d="M32 70 L36 54 Q70 46 104 54 L108 70 Z" fill="none" stroke="#00BCD4" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="52" cy="60" r="4" fill="#00BCD4" opacity="0.5" />
      <circle cx="70" cy="57" r="4" fill="#D4AF37" opacity="0.6" />
      <circle cx="88" cy="60" r="4" fill="#00BCD4" opacity="0.5" />
      <circle cx="60" cy="63" r="3.5" fill="#22d98a" opacity="0.5" />
      <circle cx="79" cy="63" r="3.5" fill="#D4AF37" opacity="0.4" />
    </svg>
  )
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sugu-kente-bg"
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        color: '#7b89a8',
        background: '#0c1528',
        borderRadius: 12,
        border: '1px solid #16233d',
      }}
    >
      <IllustrationMarche />
      <Icon size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
      <h3 style={{ color: '#9ba8c4', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>{message}</p>
      {actionLabel && onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="sugu-gold-fab"
          style={{
            marginTop: '1.25rem',
            color: '#0A1628',
            border: 'none',
            borderRadius: 8,
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          + {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
