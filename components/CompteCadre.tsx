'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const champStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 56,
  background: '#070e1f',
  border: '1px solid #1f3054',
  borderRadius: 12,
  padding: '0.75rem 1rem',
  color: '#f5f0e8',
  fontSize: '1.05rem',
  outline: 'none',
  boxSizing: 'border-box',
}

export const boutonOrStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 58,
  background: 'linear-gradient(135deg, #D4AF37, #f7c060)',
  color: '#0A1628',
  border: 'none',
  borderRadius: 14,
  fontWeight: 800,
  fontSize: '1.05rem',
  cursor: 'pointer',
}

export function CompteCadre({ titre, sousTitre, children }: { titre: string; sousTitre?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '1.25rem 1rem 3rem',
        background:
          'radial-gradient(circle at 20% 10%, rgba(212,175,55,0.08), transparent 45%), radial-gradient(circle at 80% 90%, rgba(0,188,212,0.07), transparent 45%), #0A1628',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#9ba8c4', textDecoration: 'none', minHeight: 48, fontSize: '0.95rem' }}
        >
          <ArrowLeft size={18} /> Retour à SUGU
        </Link>
        <div style={{ textAlign: 'center', margin: '0.5rem 0 1.5rem' }}>
          <img src="/logo-sugu-icon.svg" alt="" width={64} height={64} style={{ borderRadius: 18 }} />
          <h1 style={{ color: '#D4AF37', fontSize: '1.6rem', fontWeight: 900, margin: '0.75rem 0 0.35rem' }}>{titre}</h1>
          {sousTitre && <p style={{ color: '#9ba8c4', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{sousTitre}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export function Erreur({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" style={{ color: '#ef4444', fontSize: '0.92rem', fontWeight: 600, margin: '0.35rem 0 0' }}>
      {message}
    </p>
  )
}
