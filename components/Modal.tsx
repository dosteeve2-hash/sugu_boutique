'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7,14,31,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0c1528',
          border: '1px solid #16233d',
          borderRadius: 12,
          padding: '1.5rem',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ background: 'transparent', border: 'none', color: '#4e5f82', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
