'use client'

import { useState } from 'react'
import { m as motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useBoutique } from '@/components/BoutiqueProvider'
import BoutiqueFormModal from '@/components/BoutiqueFormModal'
import { useLangue } from '@/components/LangueProvider'
import { useBoutonImport } from '@/components/SauvegardePanel'
import ProjectVideo from '@/components/ProjectVideo'

export default function BoutiqueWelcome() {
  const { t, langue } = useLangue()
  const { ajouterBoutique } = useBoutique()
  const [showForm, setShowForm] = useState(false)
  const { ouvrir, input } = useBoutonImport()
  const videoLang = langue === 'en' ? 'en' : 'fr'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        background:
          'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(0,188,212,0.08), transparent 45%), #0A1628',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          style={{
            width: 88,
            height: 88,
            margin: '0 auto 1.5rem',
            boxShadow: '0 12px 32px rgba(212,175,55,0.35)',
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          <img src="/logo-sugu-icon.svg" alt="SUGU" width={88} height={88} style={{ display: 'block' }} />
        </motion.div>

        <h1 style={{ color: '#D4AF37', fontSize: '1.9rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '0.02em' }}>
          SUGU
        </h1>
        <p style={{ color: '#f5f0e8', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
          {t.bienvenueSugu}
        </p>
        <p style={{ color: '#9ba8c4', fontSize: '0.9rem', margin: '0 0 2rem', maxWidth: 340, lineHeight: 1.6 }}>
          {t.bienvenueSuguMessage}
        </p>

        <section aria-labelledby="sugu-video-titre" style={{ width: '100%', maxWidth: 560, margin: '0 auto 1.5rem' }}>
          <h2 id="sugu-video-titre" style={{ color: '#f5f0e8', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
            {t.videoTitre}
          </h2>
          <ProjectVideo slug="sugu" lang={videoLang} title={t.videoTitreIframe} />
        </section>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #D4AF37, #f7c060)',
            color: '#0A1628',
            border: 'none',
            borderRadius: 14,
            padding: '1rem 1.75rem',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 10px 28px rgba(212,175,55,0.3)',
          }}
        >
          <Plus size={20} /> {t.essayerSugu}
        </motion.button>

        <p style={{ color: '#f0a832', fontSize: '0.85rem', fontWeight: 600, margin: '1.75rem auto 0.5rem', maxWidth: 320, lineHeight: 1.5 }}>
          Vos données sont enregistrées sur ce téléphone seulement.
        </p>
        <button
          onClick={ouvrir}
          style={{ background: 'transparent', border: '1px solid #1f3054', color: '#f5f0e8', borderRadius: 12, minHeight: 52, padding: '0 1.25rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
        >
          J&apos;ai déjà une sauvegarde : l&apos;importer
        </button>
        {input}
      </motion.div>

      <BoutiqueFormModal open={showForm} onClose={() => setShowForm(false)} onSubmit={(data) => ajouterBoutique(data)} />
    </div>
  )
}
