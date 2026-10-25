'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'
import { Boutique, TypeBoutique } from '@/lib/types'
import { TYPES_BOUTIQUE, COULEURS_BOUTIQUE } from '@/components/BoutiqueProvider'
import { useLangue } from '@/components/LangueProvider'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: { nom: string; type: TypeBoutique; emoji: string; couleur: string }) => void
  edition?: Boutique | null
}

export default function BoutiqueFormModal({ open, onClose, onSubmit, edition }: Props) {
  const { t } = useLangue()
  const [nom, setNom] = useState('')
  const [type, setType] = useState<TypeBoutique>('Alimentation')
  const [emoji, setEmoji] = useState('🛒')
  const [couleur, setCouleur] = useState(COULEURS_BOUTIQUE[0])

  useEffect(() => {
    if (open) {
      setNom(edition?.nom ?? '')
      setType(edition?.type ?? 'Alimentation')
      setEmoji(edition?.emoji ?? '🛒')
      setCouleur(edition?.couleur ?? COULEURS_BOUTIQUE[0])
    }
  }, [open, edition])

  const choisirType = (tb: TypeBoutique, e: string) => {
    setType(tb)
    setEmoji(e)
  }

  const soumettre = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!nom.trim()) return
    onSubmit({ nom: nom.trim(), type, emoji, couleur })
  }

  return (
    <Modal open={open} onClose={onClose} title={edition ? t.modifierBoutique : t.ajouterBoutique}>
      <form onSubmit={soumettre}>
        <FormField label={t.nomBoutique}>
          <TextInput required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Boutique Fatima" autoFocus />
        </FormField>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#D9DEC9', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t.typeBoutique}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {TYPES_BOUTIQUE.map((tb) => {
              const selectionne = type === tb.type
              return (
                <button
                  type="button"
                  key={tb.type}
                  onClick={() => choisirType(tb.type, tb.emoji)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.75rem 0.4rem',
                    borderRadius: 10,
                    border: selectionne ? '2px solid #E3A00F' : '1px solid #496653',
                    background: selectionne ? 'rgba(227,160,15,0.1)' : '#1F3A2B',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{tb.emoji}</span>
                  <span style={{ fontSize: '0.75rem', color: selectionne ? '#E3A00F' : '#D9DEC9', fontWeight: 600, textAlign: 'center' }}>
                    {tb.type}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', color: '#D9DEC9', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            {t.couleurBoutique}
          </label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {COULEURS_BOUTIQUE.map((c, i) => (
              <button
                type="button"
                key={c}
                onClick={() => setCouleur(c)}
                aria-label={`Couleur ${i + 1}`}
                aria-pressed={couleur === c}
                style={{
                  width: 44,
                  height: 44,
                  minHeight: 44,
                  borderRadius: '50%',
                  background: c,
                  border: couleur === c ? '3px solid #F2EBCF' : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: couleur === c ? `0 0 0 2px ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <SubmitRow onCancel={onClose} submitLabel={edition ? t.enregistrer : t.ajouter} />
      </form>
    </Modal>
  )
}
