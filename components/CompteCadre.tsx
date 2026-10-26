'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const champStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 56,
  background: '#1F3A2B',
  border: '1px solid #5B755F',
  borderRadius: 12,
  padding: '0.75rem 1rem',
  color: '#F2EBCF',
  fontSize: '1.05rem',
  outline: 'none',
  boxSizing: 'border-box',
}

export const boutonOrStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 58,
  background: 'linear-gradient(135deg, #E3A00F, #F2B01E)',
  color: '#1F3A2B',
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
          'radial-gradient(circle at 20% 10%, rgba(227,160,15,0.08), transparent 45%), radial-gradient(circle at 80% 90%, rgba(227,160,15,0.07), transparent 45%), #1F3A2B',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#D9DEC9', textDecoration: 'none', minHeight: 48, fontSize: '0.95rem' }}
        >
          <ArrowLeft size={18} /> Retour à SUGU
        </Link>
        <div style={{ textAlign: 'center', margin: '0.5rem 0 1.5rem' }}>
          <img src="/brand/mark.svg" alt="" width={64} height={64} />
          <h1 style={{ color: '#E3A00F', fontSize: '1.6rem', fontWeight: 900, margin: '0.75rem 0 0.35rem' }}>{titre}</h1>
          {sousTitre && <p style={{ color: '#D9DEC9', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{sousTitre}</p>}
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
