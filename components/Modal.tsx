'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { X } from 'lucide-react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

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
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7,14,31,0.75)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: isMobile ? 0 : '1rem',
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={isMobile ? { y: '100%' } : { y: 24, opacity: 0, scale: 0.97 }}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { y: 24, opacity: 0, scale: 0.97 }}
            transition={isMobile ? { type: 'spring', stiffness: 320, damping: 32 } : { duration: 0.2 }}
            style={{
              background: '#0c1528',
              border: '1px solid #16233d',
              borderRadius: isMobile ? '16px 16px 0 0' : 12,
              padding: '1.5rem',
              width: '100%',
              maxWidth: isMobile ? '100%' : 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              paddingBottom: isMobile ? 'calc(1.5rem + env(safe-area-inset-bottom, 0))' : '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '0.75rem' : 0 }}>
              {isMobile && <div style={{ width: 36, height: 4, borderRadius: 99, background: '#16233d' }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{title}</h3>
              <button
                onClick={onClose}
                aria-label="Fermer"
                style={{ background: 'transparent', border: 'none', color: '#9ba8c4', cursor: 'pointer', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
