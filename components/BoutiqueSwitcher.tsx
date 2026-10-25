'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { useBoutique } from '@/components/BoutiqueProvider'
import BoutiqueFormModal from '@/components/BoutiqueFormModal'
import { useLangue } from '@/components/LangueProvider'

export default function BoutiqueSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useLangue()
  const { boutiques, boutiqueActive, changerBoutique, ajouterBoutique } = useBoutique()
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!boutiqueActive) return null

  return (
    <div ref={ref} style={{ position: 'relative', width: compact ? 'auto' : '100%' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: compact ? 'auto' : '100%',
          background: compact ? 'rgba(227,160,15,0.08)' : '#263F30',
          border: `1px solid ${compact ? 'rgba(227,160,15,0.25)' : '#496653'}`,
          borderRadius: 10,
          padding: compact ? '0.4rem 0.7rem' : '0.6rem 0.75rem',
          cursor: 'pointer',
          minHeight: 48,
        }}
      >
        <span style={{ fontSize: compact ? '1.1rem' : '1.3rem' }}>{boutiqueActive.emoji}</span>
        <span
          style={{
            color: '#F2EBCF',
            fontWeight: 700,
            fontSize: compact ? '0.85rem' : '0.9rem',
            flex: compact ? 'none' : 1,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: compact ? 120 : undefined,
          }}
        >
          {boutiqueActive.nom}
        </span>
        <ChevronDown size={16} color="#D9DEC9" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              left: compact ? 'auto' : 0,
              right: compact ? 0 : 'auto',
              width: 260,
              background: '#263F30',
              border: '1px solid #496653',
              borderRadius: 12,
              padding: '0.5rem',
              zIndex: 300,
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            }}
          >
            <p style={{ color: '#B7C5AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.35rem 0.6rem', margin: 0 }}>
              {t.mesBoutiques}
            </p>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {boutiques.map((b) => {
                const active = b.id === boutiqueActive.id
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      changerBoutique(b.id)
                      setOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      width: '100%',
                      background: active ? 'rgba(227,160,15,0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.55rem 0.6rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{b.emoji}</span>
                    <span style={{ flex: 1, color: active ? '#E3A00F' : '#F2EBCF', fontWeight: active ? 700 : 500, fontSize: '0.85rem' }}>
                      {b.nom}
                    </span>
                    {active && <Check size={15} color="#E3A00F" />}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => {
                setOpen(false)
                setShowForm(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                background: 'transparent',
                border: '1px dashed #496653',
                borderRadius: 8,
                padding: '0.55rem 0.6rem',
                marginTop: '0.4rem',
                color: '#E3A00F',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> {t.ajouterBoutique}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BoutiqueFormModal open={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => { ajouterBoutique(data); setShowForm(false) }} />
    </div>
  )
}
