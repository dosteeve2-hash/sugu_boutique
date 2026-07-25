'use client'

import { LucideIcon } from 'lucide-react'

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
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1.5rem',
        color: '#4e5f82',
        background: '#0c1528',
        borderRadius: 12,
        border: '1px solid #16233d',
      }}
    >
      <Icon size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
      <h3 style={{ color: '#9ba8c4', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '1.25rem',
            background: '#D4AF37',
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
        </button>
      )}
    </div>
  )
}
